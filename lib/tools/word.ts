export const MAX_WORD_BYTES = 20 * 1024 * 1024;
export const MAX_WORD_PAGES = 100;

export type WordFormat = "doc" | "docx";

type WordFileDescriptor = Pick<File, "name" | "type">;

const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const DOC_MIME = "application/msword";

export function getWordFormat(file: WordFileDescriptor): WordFormat | null {
  const name = file.name.trim().toLowerCase();
  if (name.endsWith(".docx") || file.type === DOCX_MIME) return "docx";
  if (name.endsWith(".doc") || file.type === DOC_MIME) return "doc";
  return null;
}

export function isWordFile(file: WordFileDescriptor) {
  return getWordFormat(file) !== null;
}

export function wordBaseName(fileName: string) {
  return (
    fileName
      .trim()
      .replace(/\.docx?$/i, "")
      .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-")
      .replace(/\s+/g, " ")
      .replace(/[. ]+$/g, "") || "document"
  );
}

export function normalizeLegacyParagraphs(text: string) {
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/\u000b/g, "\n")
    .split(/\n+/)
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

export function legacyMarkdownToParagraphs(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, (block) => block.replace(/```\w*|```/g, ""))
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !/^\|?\s*:?-{3,}/.test(line))
    .map((line) => {
      const tableCells = line.startsWith("|")
        ? line
            .replace(/^\||\|$/g, "")
            .split("|")
            .map((cell) => cell.trim())
            .filter(Boolean)
        : [];
      const normalized = tableCells.length ? tableCells.join(" · ") : line;
      return normalized
        .replace(/^#{1,6}\s+/, "")
        .replace(/^[-*+]\s+/, "• ")
        .replace(/^>\s?/, "")
        .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
        .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
        .replace(/[*_~`]/g, "")
        .replace(/\\([\\`*{}\[\]()#+\-.!_>])/g, "$1")
        .replace(/\s+/g, " ")
        .trim();
    })
    .filter(Boolean);
}

export function paginateLegacyParagraphs(
  paragraphs: readonly string[],
  linesPerPage = 44,
  charactersPerLine = 88,
) {
  const pages: string[][] = [];
  let page: string[] = [];
  let usedLines = 0;

  const pushPage = () => {
    if (page.length) pages.push(page);
    page = [];
    usedLines = 0;
  };

  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/);
    const chunks: string[] = [];
    let chunk = "";
    const maximumChunkLength = linesPerPage * charactersPerLine;

    for (const word of words) {
      const candidate = chunk ? `${chunk} ${word}` : word;
      if (chunk && candidate.length > maximumChunkLength) {
        chunks.push(chunk);
        chunk = word;
      } else {
        chunk = candidate;
      }
    }
    if (chunk) chunks.push(chunk);

    for (const part of chunks) {
      const requiredLines = Math.max(
        2,
        Math.ceil(part.length / charactersPerLine) + 1,
      );
      if (page.length && usedLines + requiredLines > linesPerPage) pushPage();
      page.push(part);
      usedLines += requiredLines;
      if (usedLines >= linesPerPage) pushPage();
    }
  }

  pushPage();
  return pages;
}

export function calculatePageSlices(totalHeight: number, pageHeight: number) {
  if (totalHeight <= 0 || pageHeight <= 0) return [];
  const slices: Array<{ offset: number; height: number }> = [];
  for (let offset = 0; offset < totalHeight; offset += pageHeight) {
    slices.push({
      offset,
      height: Math.min(pageHeight, totalHeight - offset),
    });
  }
  return slices;
}

function hasOleSignature(data: ArrayBuffer) {
  const signature = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
  const bytes = new Uint8Array(data, 0, Math.min(data.byteLength, signature.length));
  return signature.every((value, index) => bytes[index] === value);
}

export async function extractLegacyWordPages(data: ArrayBuffer) {
  if (!hasOleSignature(data)) throw new Error("INVALID_LEGACY_WORD");
  const { toMarkdown } = await import("@mdgate/doc");
  const markdown = await toMarkdown(new Uint8Array(data));
  const paragraphs = legacyMarkdownToParagraphs(markdown);
  if (!paragraphs.length) throw new Error("EMPTY_LEGACY_WORD");
  return paginateLegacyParagraphs(paragraphs);
}

export async function renderDocxPreview(file: Blob, container: HTMLElement) {
  const { renderAsync } = await import("docx-preview");
  await renderAsync(file, container, container, {
    breakPages: true,
    debug: false,
    experimental: false,
    hideWrapperOnPrint: false,
    ignoreFonts: false,
    ignoreHeight: false,
    ignoreLastRenderedPageBreak: false,
    ignoreWidth: false,
    inWrapper: true,
    renderAltChunks: false,
    renderChanges: false,
    renderComments: false,
    renderEndnotes: true,
    renderFooters: true,
    renderFootnotes: true,
    renderHeaders: true,
    useBase64URL: true,
  });

  const pages = Array.from(
    container.querySelectorAll<HTMLElement>("section.docx"),
  );
  if (!pages.length) throw new Error("EMPTY_DOCX");
  return pages;
}

function inferredPageHeight(element: HTMLElement, width: number, height: number) {
  const minimumHeight = Number.parseFloat(getComputedStyle(element).minHeight);
  if (Number.isFinite(minimumHeight) && minimumHeight > width) {
    return minimumHeight;
  }
  return height > width * 1.6 ? width * Math.SQRT2 : height;
}

export async function createPdfFromWordPages(
  elements: readonly HTMLElement[],
  title: string,
) {
  if (!elements.length) throw new Error("EMPTY_WORD_PREVIEW");
  await document.fonts.ready;

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);
  const renderScale = Math.min(1.75, Math.max(1.35, window.devicePixelRatio));
  let pdf: InstanceType<typeof jsPDF> | null = null;
  let pageCount = 0;

  for (const element of elements) {
    const scaledPreview = element.closest<HTMLElement>(
      ".docx-wrapper, .word-legacy-preview",
    );
    const previousInlineZoom = scaledPreview?.style.zoom ?? "";
    if (scaledPreview) scaledPreview.style.zoom = "1";
    const bounds = element.getBoundingClientRect();
    if (!bounds.width || !bounds.height) {
      if (scaledPreview) scaledPreview.style.zoom = previousInlineZoom;
      continue;
    }

    let canvas: HTMLCanvasElement;
    try {
      canvas = await html2canvas(element, {
        backgroundColor: "#ffffff",
        imageTimeout: 15_000,
        logging: false,
        scale: renderScale,
        useCORS: true,
      });
    } finally {
      if (scaledPreview) scaledPreview.style.zoom = previousInlineZoom;
    }
    const actualScale = canvas.width / bounds.width;
    const basePageHeight = inferredPageHeight(
      element,
      bounds.width,
      bounds.height,
    );
    const targetSliceHeight = Math.max(
      1,
      Math.round(basePageHeight * actualScale),
    );
    const effectiveSliceHeight =
      canvas.height <= targetSliceHeight * 1.08
        ? canvas.height
        : targetSliceHeight;
    const slices = calculatePageSlices(canvas.height, effectiveSliceHeight);

    for (const slice of slices) {
      pageCount += 1;
      if (pageCount > MAX_WORD_PAGES) throw new Error("TOO_MANY_WORD_PAGES");

      const outputHeight = slices.length > 1 ? effectiveSliceHeight : slice.height;
      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = outputHeight;
      const context = pageCanvas.getContext("2d");
      if (!context) throw new Error("CANVAS_UNAVAILABLE");
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      context.drawImage(
        canvas,
        0,
        slice.offset,
        canvas.width,
        slice.height,
        0,
        0,
        canvas.width,
        slice.height,
      );

      const widthPoints = (pageCanvas.width / actualScale) * 0.75;
      const heightPoints = (pageCanvas.height / actualScale) * 0.75;
      const orientation = widthPoints > heightPoints ? "landscape" : "portrait";
      if (!pdf) {
        pdf = new jsPDF({
          compress: true,
          format: [widthPoints, heightPoints],
          orientation,
          unit: "pt",
        });
        pdf.setProperties({ title });
      } else {
        pdf.addPage([widthPoints, heightPoints], orientation);
      }
      pdf.addImage(
        pageCanvas.toDataURL("image/jpeg", 0.94),
        "JPEG",
        0,
        0,
        widthPoints,
        heightPoints,
        undefined,
        "FAST",
      );
      pageCanvas.width = 1;
      pageCanvas.height = 1;
    }

    canvas.width = 1;
    canvas.height = 1;
  }

  if (!pdf || !pageCount) throw new Error("EMPTY_WORD_PREVIEW");
  return {
    blob: new Blob([pdf.output("arraybuffer")], { type: "application/pdf" }),
    pageCount,
  };
}

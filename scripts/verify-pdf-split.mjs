import assert from "node:assert/strict";
import { chromium } from "playwright";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import JSZip from "jszip";

const origin = process.env.CAPTURE_ORIGIN ?? "http://127.0.0.1:3000";
const reviewDirectory = ".impeccable/review";

async function createSourcePdf() {
  const document = await PDFDocument.create();
  const font = await document.embedFont(StandardFonts.HelveticaBold);
  const colors = [rgb(0.91, 0.29, 0.24), rgb(0.24, 0.59, 0.35), rgb(0.23, 0.46, 0.74)];

  for (let pageNumber = 1; pageNumber <= 10; pageNumber += 1) {
    const page = document.addPage([420, 594]);
    const color = colors[(pageNumber - 1) % colors.length];
    page.drawRectangle({ x: 34, y: 512, width: 352, height: 50, color });
    page.drawText(`Document page ${pageNumber}`, {
      x: 48,
      y: 530,
      size: 18,
      font,
      color: rgb(1, 1, 1),
    });
    page.drawText(`Section ${Math.ceil(pageNumber / 3)}`, {
      x: 48,
      y: 474,
      size: 11,
      font,
      color: rgb(0.15, 0.16, 0.2),
    });
    for (let line = 0; line < 7; line += 1) {
      page.drawRectangle({
        x: 48,
        y: 440 - line * 31,
        width: 205 + ((pageNumber + line) % 3) * 38,
        height: 5,
        color: rgb(0.77, 0.8, 0.85),
      });
    }
  }

  return Buffer.from(await document.save());
}

async function configureSplit(page, source, locale) {
  await page.goto(`${origin}/${locale}/tools/pdf-split`, {
    waitUntil: "networkidle",
  });
  await page.locator('input[type="file"]').first().setInputFiles({
    name: "pdf-split-visual-source.pdf",
    mimeType: "application/pdf",
    buffer: source,
  });
  await page.locator(".pdf-page-card").nth(9).waitFor();
  await page.locator(".pdf-page-card canvas.is-ready").first().waitFor();

  const splitAfter = locale === "de" ? "Nach Seite" : "Split after page";
  await page.getByRole("button", { name: `${splitAfter} 3` }).click();
  await page.getByRole("button", { name: `${splitAfter} 7` }).click();
  await page
    .locator(".pdf-page-card")
    .nth(7)
    .locator("canvas.is-ready")
    .waitFor();

  assert.equal(
    await page.locator('.pdf-split-marker[aria-pressed="true"]').count(),
    2,
  );
  assert.match(
    (await page.locator(".pdf-workspace__footer p").textContent()) ?? "",
    /3 (output files|Ausgabedateien)/,
  );
  const dimensions = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
  }));
  assert.equal(dimensions.width, dimensions.viewport);
  await page.evaluate(() => window.scrollTo(0, 0));
}

async function readDownload(download) {
  const stream = await download.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

const source = await createSourcePdf();
const browser = await chromium.launch({ headless: true });

const desktop = await browser.newPage({ viewport: { width: 1504, height: 1046 } });
await desktop.emulateMedia({ reducedMotion: "reduce" });
await configureSplit(desktop, source, "en");
await desktop.evaluate(() => {
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
});
await desktop.screenshot({
  path: `${reviewDirectory}/desktop.png`,
  fullPage: true,
});

await desktop.getByRole("button", { name: "Split PDF" }).click();
const downloadPromise = desktop.waitForEvent("download");
await desktop.getByRole("link", { name: "Download ZIP" }).click();
const archive = await JSZip.loadAsync(await readDownload(await downloadPromise));
const fileNames = Object.keys(archive.files);
assert.deepEqual(fileNames, [
  "pdf-split-visual-source-part-01-pages-1-3.pdf",
  "pdf-split-visual-source-part-02-pages-4-7.pdf",
  "pdf-split-visual-source-part-03-pages-8-10.pdf",
]);

const pageCounts = await Promise.all(
  fileNames.map(async (fileName) => {
    const bytes = await archive.file(fileName).async("uint8array");
    return (await PDFDocument.load(bytes)).getPageCount();
  }),
);
assert.deepEqual(pageCounts, [3, 4, 3]);
await desktop.close();

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.emulateMedia({ reducedMotion: "reduce" });
await configureSplit(mobile, source, "de");
await mobile.evaluate(() => {
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
});
await mobile.screenshot({
  path: `${reviewDirectory}/mobile.png`,
  fullPage: true,
});
await mobile.close();

const home = await browser.newPage({ viewport: { width: 1504, height: 1046 } });
await home.goto(`${origin}/de`, { waitUntil: "networkidle" });
await home.screenshot({
  path: `${reviewDirectory}/home-pdf-tools.png`,
  fullPage: true,
});
await home.close();

await browser.close();

console.log(
  "PDF Split verification passed for visual selection, responsive layout, ZIP output, page ranges, and homepage grouping.",
);

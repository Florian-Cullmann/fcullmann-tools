import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const origin = process.env.CAPTURE_ORIGIN ?? "http://127.0.0.1:3000";
const reviewDirectory = ".impeccable/review";

async function createSourcePdf() {
  const document = await PDFDocument.create();
  const font = await document.embedFont(StandardFonts.HelveticaBold);
  const widths = [300, 320, 340];

  for (let index = 0; index < widths.length; index += 1) {
    const page = document.addPage([widths[index], 460]);
    page.drawRectangle({
      x: 24,
      y: 372,
      width: widths[index] - 48,
      height: 56,
      color: [rgb(0.91, 0.29, 0.24), rgb(0.24, 0.59, 0.35), rgb(0.23, 0.46, 0.74)][index],
    });
    page.drawText(`Editing test page ${index + 1}`, {
      x: 38,
      y: 394,
      size: 16,
      font,
      color: rgb(1, 1, 1),
    });
  }

  return Buffer.from(await document.save());
}

async function uploadPdf(page, source) {
  await page.locator('input[type="file"]').first().setInputFiles({
    name: "editing-source.pdf",
    mimeType: "application/pdf",
    buffer: source,
  });
  await page.locator(".pdf-editor-card").nth(2).waitFor();
  await page.locator(".pdf-page-card canvas.is-ready").first().waitFor();
}

async function readDownload(download) {
  const stream = await download.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

async function downloadPdf(page) {
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: "Download PDF" }).click();
  return PDFDocument.load(await readDownload(await downloadPromise));
}

function contentStreamCount(page) {
  const contents = page.node.Contents();
  if (!contents) return 0;
  return typeof contents.size === "function" ? contents.size() : 1;
}

const source = await createSourcePdf();
await mkdir(reviewDirectory, { recursive: true });
const browser = await chromium.launch({ headless: true });

const rotate = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await rotate.emulateMedia({ reducedMotion: "reduce" });
await rotate.goto(`${origin}/en/tools/pdf-rotate`, { waitUntil: "networkidle" });
await uploadPdf(rotate, source);
await rotate.getByRole("button", { name: "Rotate page 2 right" }).click();
assert.equal(
  await rotate.locator(".pdf-editor-pages > .sr-only").textContent(),
  "Page 2 was rotated right.",
);
await rotate.getByRole("button", { name: "Apply rotations" }).click();
const rotated = await downloadPdf(rotate);
assert.deepEqual(
  rotated.getPages().map((page) => page.getRotation().angle),
  [0, 90, 0],
);
await rotate.close();

const organizer = await browser.newPage({ viewport: { width: 1504, height: 1046 } });
await organizer.emulateMedia({ reducedMotion: "reduce" });
await organizer.goto(`${origin}/en/tools/pdf-organize`, { waitUntil: "networkidle" });
await uploadPdf(organizer, source);
await organizer
  .getByRole("button", { name: /Move page 3\./ })
  .dragTo(organizer.locator(".pdf-editor-card").nth(1), {
    targetPosition: { x: 12, y: 80 },
  });
assert.equal(
  await organizer.locator(".pdf-editor-pages > .sr-only").textContent(),
  "Page 3 is now at output position 2.",
);
await organizer
  .getByRole("button", { name: /Move page 3\./ })
  .dragTo(organizer.locator(".pdf-editor-card").first(), {
    targetPosition: { x: 12, y: 80 },
  });
assert.equal(await organizer.getByRole("button", { name: /Move page .* left/ }).count(), 0);
await organizer.getByRole("button", { name: "Rotate page 1 right" }).click();
await organizer.getByRole("button", { name: "Remove page 2" }).click();
assert.equal(
  await organizer.locator(".pdf-editor-pages > .sr-only").textContent(),
  "Page 2 was removed.",
);
await organizer.evaluate(() => {
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  window.scrollTo(0, 0);
});
await organizer.screenshot({
  path: `${reviewDirectory}/desktop.png`,
  fullPage: true,
});
await organizer.setViewportSize({ width: 390, height: 844 });
const organizerDimensions = await organizer.evaluate(() => ({
  width: document.documentElement.scrollWidth,
  viewport: window.innerWidth,
}));
assert.equal(organizerDimensions.width, organizerDimensions.viewport);
await organizer.screenshot({
  path: `${reviewDirectory}/organize-mobile.png`,
  fullPage: true,
});
await organizer.getByRole("button", { name: "Create new PDF" }).click();
const organized = await downloadPdf(organizer);
assert.deepEqual(
  organized.getPages().map((page) => page.getWidth()),
  [340, 300],
);
assert.deepEqual(
  organized.getPages().map((page) => page.getRotation().angle),
  [0, 90],
);
await organizer.close();

const numbering = await browser.newPage({ viewport: { width: 390, height: 844 } });
await numbering.emulateMedia({ reducedMotion: "reduce" });
await numbering.goto(`${origin}/en/tools/pdf-page-numbers`, { waitUntil: "networkidle" });
await uploadPdf(numbering, source);
await numbering.getByLabel("Position").selectOption("top-right");
await numbering.getByLabel("Format").selectOption("page-total");
await numbering.getByLabel("First number").fill("5");
await numbering.getByLabel("From PDF page").fill("2");
assert.deepEqual(
  await numbering.locator(".pdf-page-card__number").allTextContents(),
  ["Page 5 of 6", "Page 6 of 6"],
);
const dimensions = await numbering.evaluate(() => ({
  width: document.documentElement.scrollWidth,
  viewport: window.innerWidth,
}));
assert.equal(dimensions.width, dimensions.viewport);
await numbering.evaluate(() => {
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  window.scrollTo(0, 0);
});
await numbering.screenshot({
  path: `${reviewDirectory}/mobile.png`,
  fullPage: true,
});
await numbering.getByRole("button", { name: "Add page numbers" }).click();
const numbered = await downloadPdf(numbering);
assert.equal(numbered.getPageCount(), 3);
assert.equal(contentStreamCount(numbered.getPage(0)), 1);
assert.ok(contentStreamCount(numbered.getPage(1)) > 1);
assert.ok(contentStreamCount(numbered.getPage(2)) > 1);
await numbering.close();

await browser.close();

console.log(
  "PDF editing verification passed for rotation, organization, numbering, downloads, and responsive layout.",
);

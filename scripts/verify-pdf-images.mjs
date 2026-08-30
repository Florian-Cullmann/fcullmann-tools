import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import JSZip from "jszip";

const origin = process.env.CAPTURE_ORIGIN ?? "http://127.0.0.1:3000";
const reviewDirectory = ".impeccable/review";
const jpg = Buffer.from(
  "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCAACAAMDAREAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDra/Jz+iz/2Q==",
  "base64",
);

async function createSourcePdf() {
  const document = await PDFDocument.create();
  const image = await document.embedJpg(Uint8Array.from(jpg));
  const font = await document.embedFont(StandardFonts.HelveticaBold);

  for (let pageNumber = 1; pageNumber <= 2; pageNumber += 1) {
    const page = document.addPage([420, 594]);
    page.drawRectangle({
      x: 28,
      y: 500,
      width: 364,
      height: 64,
      color: pageNumber === 1 ? rgb(0.91, 0.29, 0.24) : rgb(0.23, 0.46, 0.74),
    });
    page.drawText(`PDF to JPG page ${pageNumber}`, {
      x: 48,
      y: 526,
      size: 18,
      font,
      color: rgb(1, 1, 1),
    });
    page.drawImage(image, { x: 48, y: 340, width: 210, height: 140 });
  }

  return Buffer.from(await document.save());
}

async function readDownload(download) {
  const stream = await download.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

function assertJpeg(bytes) {
  assert.equal(bytes[0], 0xff);
  assert.equal(bytes[1], 0xd8);
}

const sourcePdf = await createSourcePdf();
await mkdir(reviewDirectory, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.emulateMedia({ reducedMotion: "reduce" });

await page.goto(`${origin}/en/tools/pdf-to-jpg`, { waitUntil: "networkidle" });
await page.locator('input[type="file"]').first().setInputFiles({
  name: "source.pdf",
  mimeType: "application/pdf",
  buffer: sourcePdf,
});
await page.screenshot({
  path: `${reviewDirectory}/desktop.png`,
  fullPage: true,
});
await page.getByRole("button", { name: "Create JPGs" }).click();
const pagesDownloadPromise = page.waitForEvent("download");
await page.getByRole("link", { name: "Download ZIP" }).click();
const pagesArchive = await JSZip.loadAsync(
  await readDownload(await pagesDownloadPromise),
);
assert.deepEqual(Object.keys(pagesArchive.files), [
  "source-page-001.jpg",
  "source-page-002.jpg",
]);
for (const fileName of Object.keys(pagesArchive.files)) {
  assertJpeg(await pagesArchive.file(fileName).async("uint8array"));
}

await page.getByRole("radio", { name: /Extract images/ }).check();
await page.getByRole("button", { name: "Create JPGs" }).click();
const imageDownloadPromise = page.waitForEvent("download");
const imageDownloadLink = page.getByRole("link", {
  name: /Download (JPG|ZIP)/,
});
await imageDownloadLink.click();
const imageDownload = await readDownload(await imageDownloadPromise);
if ((await imageDownloadLink.textContent()).includes("ZIP")) {
  const imageArchive = await JSZip.loadAsync(imageDownload);
  assert.ok(Object.keys(imageArchive.files).length >= 1);
  assertJpeg(
    await imageArchive.file(Object.keys(imageArchive.files)[0]).async("uint8array"),
  );
} else {
  assertJpeg(imageDownload);
}

await page.goto(`${origin}/en/tools/jpg-to-pdf`, { waitUntil: "networkidle" });
await page.locator('input[type="file"]').first().setInputFiles([
  { name: "first.jpg", mimeType: "image/jpeg", buffer: jpg },
  { name: "second.jpeg", mimeType: "image/jpeg", buffer: jpg },
]);
await page.getByLabel("Orientation").selectOption("portrait");
await page.getByRole("button", { name: "Create PDF" }).click();
const pdfDownloadPromise = page.waitForEvent("download");
await page.getByRole("link", { name: "Download PDF" }).click();
const outputPdf = await PDFDocument.load(
  await readDownload(await pdfDownloadPromise),
);
assert.equal(outputPdf.getPageCount(), 2);
for (const pdfPage of outputPdf.getPages()) {
  assert.ok(pdfPage.getHeight() > pdfPage.getWidth());
}

const dimensions = await page.evaluate(() => ({
  width: document.documentElement.scrollWidth,
  viewport: window.innerWidth,
}));
assert.equal(dimensions.width, dimensions.viewport);

await page.close();

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.emulateMedia({ reducedMotion: "reduce" });
await mobile.goto(`${origin}/de/tools/jpg-to-pdf`, { waitUntil: "networkidle" });
await mobile.locator('input[type="file"]').first().setInputFiles([
  { name: "urlaub-01.jpg", mimeType: "image/jpeg", buffer: jpg },
  { name: "urlaub-02.jpg", mimeType: "image/jpeg", buffer: jpg },
]);
const mobileDimensions = await mobile.evaluate(() => ({
  width: document.documentElement.scrollWidth,
  viewport: window.innerWidth,
}));
assert.equal(mobileDimensions.width, mobileDimensions.viewport);
await mobile.screenshot({
  path: `${reviewDirectory}/mobile.png`,
  fullPage: true,
});
await mobile.close();

const home = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await home.emulateMedia({ reducedMotion: "reduce" });
await home.goto(`${origin}/de`, { waitUntil: "networkidle" });
assert.deepEqual(
  await home.locator(".pdf-tools-grid .utility-card strong").allTextContents(),
  ["PDFs zusammenführen", "PDF teilen", "PDF in JPG", "JPG in PDF"],
);
await home.screenshot({
  path: `${reviewDirectory}/home-pdf-tools.png`,
  fullPage: true,
});
await home.close();
await browser.close();

console.log(
  "PDF/JPG verification passed for rendered pages, embedded image extraction, ordered JPG input, and portrait PDF output.",
);

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
const nameInputs = desktop.locator('.pdf-split__outputs input');
await nameInputs.first().waitFor();
assert.deepEqual(await nameInputs.evaluateAll((inputs) => inputs.map((input) => input.value)), [
  "Page 1 - Page 3.pdf",
  "Page 4 - Page 7.pdf",
  "Page 8 - Page 10.pdf",
]);
await nameInputs.nth(0).fill("Introduction.pdf");
await nameInputs.nth(1).fill("Vertrag – Müller");
await nameInputs.nth(1).blur();
assert.equal(await nameInputs.nth(1).inputValue(), "Vertrag – Müller.pdf");

const individualPromise = desktop.waitForEvent("download");
await desktop.getByRole("link", { name: "Download PDF: Vertrag – Müller.pdf", exact: true }).click();
const individual = await individualPromise;
assert.equal(individual.suggestedFilename(), "Vertrag – Müller.pdf");
const individualBytes = await readDownload(individual);
assert.equal((await PDFDocument.load(individualBytes)).getPageCount(), 4);

const downloadPromise = desktop.waitForEvent("download");
await desktop.getByRole("button", { name: "Download ZIP" }).click();
const archive = await JSZip.loadAsync(await readDownload(await downloadPromise));
const fileNames = Object.keys(archive.files);
assert.deepEqual(fileNames, [
  "Introduction.pdf",
  "Vertrag – Müller.pdf",
  "Page 8 - Page 10.pdf",
]);
assert.deepEqual(await archive.file("Vertrag – Müller.pdf").async("nodebuffer"), individualBytes);

const pageCounts = await Promise.all(
  fileNames.map(async (fileName) => {
    const bytes = await archive.file(fileName).async("uint8array");
    return (await PDFDocument.load(bytes)).getPageCount();
  }),
);
assert.deepEqual(pageCounts, [3, 4, 3]);
await nameInputs.nth(0).fill("introduction.PDF");
await nameInputs.nth(2).fill("Introduction.pdf");
assert.equal(await desktop.getByRole("button", { name: "Download ZIP" }).isDisabled(), true);
assert.equal(await desktop.locator('.pdf-split__outputs input[aria-invalid="true"]').count(), 2);
await nameInputs.nth(2).fill("");
assert.equal(await desktop.getByRole("button", { name: "Download ZIP" }).isDisabled(), true);
await nameInputs.nth(2).fill("folder/file.pdf");
assert.equal(await nameInputs.nth(2).getAttribute("aria-invalid"), "true");
await nameInputs.nth(2).fill("Conclusion.pdf");
const secondDownloadPromise = desktop.waitForEvent("download");
await desktop.getByRole("button", { name: "Download ZIP" }).click();
const secondArchive = await JSZip.loadAsync(await readDownload(await secondDownloadPromise));
assert.deepEqual(Object.keys(secondArchive.files), ["introduction.PDF", "Vertrag – Müller.pdf", "Conclusion.pdf"]);
const zipBounds = await desktop.getByRole("button", { name: "Download ZIP" }).boundingBox();
const partBounds = await desktop.locator('.pdf-split__download').first().boundingBox();
assert.equal(partBounds.x + partBounds.width, zipBounds.x + zipBounds.width);
await desktop.screenshot({ path: `${reviewDirectory}/desktop-split-results.png`, fullPage: true });
await desktop.getByRole("button", { name: "Remove split after page 3", exact: true }).click();
assert.equal(await nameInputs.count(), 0);
await desktop.close();

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.emulateMedia({ reducedMotion: "reduce" });
await configureSplit(mobile, source, "de");
await mobile.getByRole("button", { name: "PDF teilen", exact: true }).click();
await mobile.locator('.pdf-split__outputs input').first().waitFor();
assert.deepEqual(await mobile.locator('.pdf-split__outputs input').evaluateAll((inputs) => inputs.map((input) => input.value)), [
  "Seite 1 - Seite 3.pdf", "Seite 4 - Seite 7.pdf", "Seite 8 - Seite 10.pdf",
]);
assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth), 390);
const mobileDownloadPromise = mobile.waitForEvent("download");
await mobile.getByRole("link", { name: "PDF herunterladen: Seite 1 - Seite 3.pdf", exact: true }).click();
assert.equal((await mobileDownloadPromise).suggestedFilename(), "Seite 1 - Seite 3.pdf");
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
  "PDF Split verification passed for editable names, individual and ZIP downloads, name validation, page ranges, responsive layout, and result reset.",
);

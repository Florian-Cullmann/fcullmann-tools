import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { PDFDocument } from "pdf-lib";

const origin = process.env.CAPTURE_ORIGIN ?? "http://127.0.0.1:3000";
const reviewDirectory = ".impeccable/review";

async function createImageHeavyPdf(browser) {
  const imagePage = await browser.newPage({ viewport: { width: 900, height: 1200 } });
  await imagePage.setContent('<canvas width="900" height="1200"></canvas>');
  await imagePage.locator("canvas").evaluate((canvas) => {
    const context = canvas.getContext("2d");
    const pixels = context.createImageData(canvas.width, canvas.height);
    let state = 123456789;

    for (let index = 0; index < pixels.data.length; index += 4) {
      state = (state * 1664525 + 1013904223) >>> 0;
      const noise = state & 63;
      const x = (index / 4) % canvas.width;
      const y = Math.floor(index / 4 / canvas.width);
      pixels.data[index] = Math.min(255, 54 + x / 5 + noise);
      pixels.data[index + 1] = Math.min(255, 72 + y / 7 + noise);
      pixels.data[index + 2] = Math.min(255, 116 + noise * 2);
      pixels.data[index + 3] = 255;
    }

    context.putImageData(pixels, 0, 0);
    context.fillStyle = "rgba(255, 255, 255, 0.9)";
    context.fillRect(70, 76, 760, 170);
    context.fillStyle = "#252832";
    context.font = "700 48px sans-serif";
    context.fillText("Image-heavy PDF", 112, 160);
    context.font = "26px sans-serif";
    context.fillText("Compression verification", 112, 207);
  });
  const png = await imagePage.locator("canvas").screenshot({ type: "png" });
  await imagePage.close();

  const document = await PDFDocument.create();
  const image = await document.embedPng(png);
  const page = document.addPage([450, 600]);
  page.drawImage(image, { x: 0, y: 0, width: 450, height: 600 });
  return Buffer.from(await document.save());
}

async function uploadSource(page, source, locale) {
  await page.goto(`${origin}/${locale}/tools/pdf-compress`, {
    waitUntil: "networkidle",
  });
  await page.locator('input[type="file"]').first().setInputFiles({
    name: "image-heavy-source.pdf",
    mimeType: "application/pdf",
    buffer: source,
  });
  await page.locator(".pdf-compress__settings").waitFor();
  await page
    .getByRole("radiogroup", { name: /Compression level|Komprimierungsstufe/ })
    .waitFor();
  await page.getByRole("radio", { name: /Balanced|Ausgewogen/ }).waitFor();

  const dimensions = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
  }));
  assert.equal(dimensions.width, dimensions.viewport);
}

async function readDownload(download) {
  const stream = await download.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

await mkdir(reviewDirectory, { recursive: true });
const browser = await chromium.launch({ headless: true });
const source = await createImageHeavyPdf(browser);

const desktop = await browser.newPage({ viewport: { width: 1504, height: 1046 } });
await desktop.emulateMedia({ reducedMotion: "reduce" });
await uploadSource(desktop, source, "en");
assert.equal(
  await desktop.getByRole("radio", { name: /Balanced/ }).isChecked(),
  true,
);
await desktop.screenshot({
  path: `${reviewDirectory}/desktop.png`,
  fullPage: true,
});
await desktop.screenshot({
  path: `${reviewDirectory}/pdf-compress-desktop.png`,
  fullPage: true,
});

await desktop.getByRole("button", { name: "Compress PDF" }).click();
await desktop.getByRole("link", { name: "Download PDF" }).waitFor({
  timeout: 60_000,
});
await desktop.screenshot({
  path: `${reviewDirectory}/pdf-compress-result.png`,
  fullPage: true,
});
const resultText =
  (await desktop.locator(".pdf-workspace__result strong").textContent()) ?? "";
assert.match(resultText, /% smaller file/);

const downloadPromise = desktop.waitForEvent("download");
await desktop.getByRole("link", { name: "Download PDF" }).click();
const compressed = await readDownload(await downloadPromise);
const compressedDocument = await PDFDocument.load(compressed);
assert.equal(compressedDocument.getPageCount(), 1);
assert.ok(compressed.byteLength < source.byteLength);
await desktop.close();

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.emulateMedia({ reducedMotion: "reduce" });
await uploadSource(mobile, source, "de");
await mobile.getByRole("radio", { name: /Kleine Datei/ }).check();
await mobile.evaluate(() => window.scrollTo(0, 0));
await mobile.screenshot({
  path: `${reviewDirectory}/mobile.png`,
  fullPage: true,
});
await mobile.screenshot({
  path: `${reviewDirectory}/pdf-compress-mobile.png`,
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
  "PDF compression verification passed for local image compression, page preservation, responsive layout, and download output.",
);

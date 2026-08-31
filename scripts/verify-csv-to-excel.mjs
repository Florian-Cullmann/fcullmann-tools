import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import ExcelJS from "exceljs";

const { Workbook } = ExcelJS;
const origin = process.env.CAPTURE_ORIGIN ?? "http://localhost:3000";
const reviewDirectory = ".impeccable/review";
const source = Buffer.from(
  "\uFEFFRegion;Owner;Article number;Revenue\r\nNorth;Ada Lovelace;00123;128500,50\r\nWest;Grace Hopper;00456;94750,00\r\nSouth;Margaret Hamilton;00789;111200,25",
  "utf8",
);

async function uploadCsv(page, locale) {
  await page.goto(`${origin}/${locale}/tools/csv-to-excel`, {
    waitUntil: "networkidle",
  });
  await page.locator('input[type="file"]').setInputFiles({
    name: "quarterly-report.csv",
    mimeType: "text/csv",
    buffer: source,
  });
  await page.locator(".office-file-summary").waitFor();
  assert.equal(await page.locator(".office-preview tbody tr").count(), 4);
  assert.equal(
    await page.locator(".office-options select").first().inputValue(),
    ";",
  );
  assert.equal(
    await page.locator(".office-preview tbody tr").nth(1).locator("td").nth(2).textContent(),
    "00123",
  );
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

const desktop = await browser.newPage({ viewport: { width: 1504, height: 1046 } });
await desktop.emulateMedia({ reducedMotion: "reduce" });
await uploadCsv(desktop, "de");
await desktop.evaluate(() => window.scrollTo(0, 0));
await desktop.screenshot({
  path: `${reviewDirectory}/desktop-full.png`,
  fullPage: true,
});
await desktop.screenshot({
  path: `${reviewDirectory}/desktop.png`,
});

const downloadPromise = desktop.waitForEvent("download");
await desktop.getByRole("button", { name: "Excel herunterladen" }).click();
const download = await downloadPromise;
assert.equal(download.suggestedFilename(), "quarterly-report.xlsx");
const workbook = new Workbook();
await workbook.xlsx.load(await readDownload(download));
const sheet = workbook.getWorksheet("quarterly-report");
assert.ok(sheet);
assert.equal(sheet.getCell("C2").value, "00123");
assert.equal(sheet.getRow(1).font.bold, true);
assert.equal(sheet.views[0].state, "frozen");
assert.equal(sheet.autoFilter, "A1:D1");
await desktop.close();

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.emulateMedia({ reducedMotion: "reduce" });
await uploadCsv(mobile, "en");
await mobile.evaluate(() => window.scrollTo(0, 0));
await mobile.screenshot({
  path: `${reviewDirectory}/mobile-full.png`,
  fullPage: true,
});
await mobile.screenshot({
  path: `${reviewDirectory}/mobile.png`,
});
await mobile.close();

const home = await browser.newPage({ viewport: { width: 1504, height: 1046 } });
await home.goto(`${origin}/en`, { waitUntil: "networkidle" });
assert.deepEqual(
  await home.locator(".office-tools-grid strong").allTextContents(),
  ["Excel to CSV", "CSV to Excel", "Word to PDF"],
);
await home.close();

const emptyFile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await emptyFile.goto(`${origin}/de/tools/csv-to-excel`, {
  waitUntil: "networkidle",
});
await emptyFile.locator('input[type="file"]').setInputFiles({
  name: "empty.csv",
  mimeType: "text/csv",
  buffer: Buffer.from(""),
});
const emptyError = emptyFile.locator(".office-workspace__error");
await emptyError.waitFor();
assert.equal(
  await emptyError.textContent(),
  "Die Datei ist leer. Wähle eine CSV- oder TSV-Datei mit Daten aus.",
);
assert.equal(await emptyFile.locator(".office-dropzone").isVisible(), true);
await emptyFile.close();

await browser.close();

console.log(
  "CSV to Excel verification passed for delimiter detection, responsive preview, XLSX download, value preservation, header styling, and homepage grouping.",
);

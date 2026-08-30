import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import ExcelJS from "exceljs";

const { Workbook } = ExcelJS;

const origin = process.env.CAPTURE_ORIGIN ?? "http://127.0.0.1:3000";
const reviewDirectory = ".impeccable/review";

async function createSourceWorkbook() {
  const workbook = new Workbook();
  const summary = workbook.addWorksheet("Quarterly summary");
  summary.columns = [
    { header: "Region", key: "region", width: 22 },
    { header: "Owner", key: "owner", width: 22 },
    { header: "Revenue", key: "revenue", width: 14 },
    { header: "Status", key: "status", width: 16 },
  ];
  summary.addRows([
    { region: "North", owner: "Ada Lovelace", revenue: 128500, status: "On track" },
    { region: "West", owner: "Grace Hopper", revenue: 94750, status: "Review" },
    { region: "South", owner: "Margaret Hamilton", revenue: 111200, status: "On track" },
    { region: "East", owner: "Katherine Johnson", revenue: 103900, status: "Closed" },
  ]);
  const notes = workbook.addWorksheet("Notes");
  notes.addRows([
    ["Topic", "Detail"],
    ["Currency", "EUR"],
  ]);
  return Buffer.from(await workbook.xlsx.writeBuffer());
}

async function uploadWorkbook(page, source, locale) {
  await page.goto(`${origin}/${locale}/tools/excel-to-csv`, {
    waitUntil: "networkidle",
  });
  await page.locator('input[type="file"]').setInputFiles({
    name: "quarterly-report.xlsx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    buffer: source,
  });
  await page.locator(".office-file-summary").waitFor();
  assert.equal(await page.locator(".office-preview tbody tr").count(), 5);
  assert.equal(await page.locator(".office-options select").first().inputValue(), "1");
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

await mkdir(reviewDirectory, { recursive: true });
const source = await createSourceWorkbook();
const browser = await chromium.launch({ headless: true });

const desktop = await browser.newPage({ viewport: { width: 1504, height: 1046 } });
await desktop.emulateMedia({ reducedMotion: "reduce" });
await uploadWorkbook(desktop, source, "en");
await desktop.evaluate(() => {
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
});
await desktop.screenshot({
  path: `${reviewDirectory}/excel-desktop.png`,
  fullPage: true,
});

const downloadPromise = desktop.waitForEvent("download");
await desktop.getByRole("button", { name: "Download CSV" }).click();
const download = await downloadPromise;
assert.equal(download.suggestedFilename(), "quarterly-report-Quarterly summary.csv");
const csv = (await readDownload(download)).toString("utf8");
assert.equal(
  csv,
  "﻿Region,Owner,Revenue,Status\r\nNorth,Ada Lovelace,128500,On track\r\nWest,Grace Hopper,94750,Review\r\nSouth,Margaret Hamilton,111200,On track\r\nEast,Katherine Johnson,103900,Closed",
);
await desktop.close();

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.emulateMedia({ reducedMotion: "reduce" });
await uploadWorkbook(mobile, source, "de");
await mobile.evaluate(() => {
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
});
await mobile.screenshot({
  path: `${reviewDirectory}/excel-mobile.png`,
  fullPage: true,
});
await mobile.close();

const home = await browser.newPage({ viewport: { width: 1504, height: 1046 } });
await home.goto(`${origin}/de`, { waitUntil: "networkidle" });
assert.equal(
  await home.locator("#office-tools-title").textContent(),
  "Office Tools",
);
assert.equal(
  await home.locator(".office-tools-grid strong").textContent(),
  "Excel zu CSV",
);
const sectionOrder = await home.locator(".utility-section h2").allTextContents();
assert.ok(sectionOrder.indexOf("Office Tools") > sectionOrder.indexOf("PDF Tools"));
await home.screenshot({
  path: `${reviewDirectory}/excel-home.png`,
  fullPage: true,
});
await home.close();

await browser.close();

console.log(
  "Excel to CSV verification passed for XLSX import, worksheet preview, CSV download, responsive layout, and homepage grouping.",
);

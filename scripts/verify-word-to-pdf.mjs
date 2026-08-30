import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { chromium } from "playwright";
import JSZip from "jszip";
import { PDFDocument } from "pdf-lib";

const origin = process.env.CAPTURE_ORIGIN ?? "http://127.0.0.1:3000";

async function createSampleDocx() {
  const zip = new JSZip();
  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
        <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
        <Default Extension="xml" ContentType="application/xml"/>
        <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
        <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
      </Types>`,
  );
  zip.file(
    "_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
        <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
      </Relationships>`,
  );
  zip.file(
    "word/_rels/document.xml.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
        <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
      </Relationships>`,
  );
  zip.file(
    "word/styles.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>
      </w:styles>`,
  );
  zip.file(
    "word/document.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:body>
          <w:p><w:r><w:rPr><w:b/><w:sz w:val="32"/></w:rPr><w:t>Word to PDF verification</w:t></w:r></w:p>
          <w:p><w:r><w:t>This document stays in the browser and becomes a PDF.</w:t></w:r></w:p>
          <w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr>
        </w:body>
      </w:document>`,
  );
  return zip.generateAsync({ type: "nodebuffer" });
}

const browser = await chromium.launch({ headless: true });
const sample = await createSampleDocx();
for (const viewport of [
  { width: 1280, height: 900 },
  { width: 390, height: 844 },
]) {
  const page = await browser.newPage({ viewport });
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  await page.goto(`${origin}/en/tools/word-to-pdf`, {
    waitUntil: "networkidle",
  });
  assert.equal(await page.locator("h1").textContent(), "Word to PDF");

  await page.locator('input[type="file"]').setInputFiles({
    name: "verification.docx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    buffer: sample,
  });
  try {
    await page
      .locator(".word-docx-preview section.docx")
      .waitFor({ timeout: 10_000 });
  } catch (error) {
    console.error(await page.locator("body").innerText());
    console.error(consoleErrors.join("\n"));
    throw error;
  }
  assert.match(
    await page.locator(".office-file-summary small").textContent(),
    /DOCX · 1 page/,
  );
  const previewViewport = page.locator(".word-preview__viewport");
  assert.equal(await previewViewport.getAttribute("role"), "region");
  assert.equal(
    await previewViewport.getAttribute("aria-labelledby"),
    "word-preview-title",
  );
  const dimensions = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
  }));
  assert.equal(dimensions.width, dimensions.viewport);

  await page.getByRole("button", { name: "Create PDF" }).click();
  const downloadLink = page.getByRole("link", { name: "Download PDF" });
  await downloadLink.waitFor();
  const downloadPromise = page.waitForEvent("download");
  await downloadLink.click();
  const download = await downloadPromise;
  const outputPath = await download.path();
  assert.ok(outputPath);
  const output = await fs.readFile(outputPath);
  const pdf = await PDFDocument.load(output);
  assert.equal(pdf.getPageCount(), 1);
  assert.equal(output.subarray(0, 4).toString(), "%PDF");
  await page.close();
}

await browser.close();
console.log(
  "Word-to-PDF verification passed for responsive DOCX preview and PDF download.",
);

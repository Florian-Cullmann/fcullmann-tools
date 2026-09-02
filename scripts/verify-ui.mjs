import { chromium } from "playwright";
import assert from "node:assert/strict";

const origin = process.env.CAPTURE_ORIGIN ?? "http://localhost:3000";
const browser = await chromium.launch({ headless: true });

for (const viewport of [
  { width: 1504, height: 1046 },
  { width: 390, height: 844 },
]) {
  const page = await browser.newPage({ viewport });
  await page.goto(`${origin}/en`, { waitUntil: "networkidle" });
  assert.equal(
    await page.locator("h1").first().textContent(),
    "Hi, I'm Florian. I build useful software for everyday work.",
  );
  assert.equal(
    (await page.locator(".locale-switch").textContent())?.trim(),
    "EN",
  );
  assert.equal(
    await page.locator('.site-header nav a[href="/en/articles"]').count(),
    0,
  );
  assert.equal(
    await page.locator('.site-header nav [aria-disabled="true"]').textContent(),
    "Blog",
  );
  assert.equal(await page.locator(".featured-grid .utility-card").count(), 6);
  assert.equal(await page.locator(".pdf-tools-grid .utility-card").count(), 5);
  assert.deepEqual(
    await page
      .locator(".pdf-tools-grid .utility-card strong")
      .allTextContents(),
    ["PDF Merge", "PDF Split", "Compress PDF", "PDF to JPG", "JPG to PDF"],
  );
  assert.equal(await page.locator(".office-tools-grid .utility-card").count(), 3);
  assert.deepEqual(
    await page.locator(".office-tools-grid .utility-card strong").allTextContents(),
    ["Excel to CSV", "CSV to Excel", "Word to PDF"],
  );
  assert.equal(await page.locator(".image-tools-grid .utility-card").count(), 3);
  assert.deepEqual(
    await page.locator(".image-tools-grid .utility-card strong").allTextContents(),
    ["Image to JPG", "Image to PNG", "Image to WebP"],
  );
  await page.locator(".utility-search input").fill("Base64");
  await page.waitForFunction(
    () =>
      document.querySelectorAll(".all-tools-grid .utility-card").length === 1,
  );
  assert.equal(await page.locator(".all-tools-grid .utility-card").count(), 1);
  assert.match(
    await page.locator(".all-tools-grid .utility-card strong").textContent(),
    /Base64/,
  );
  const dimensions = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
  }));
  assert.equal(
    dimensions.width,
    dimensions.viewport,
    `Horizontal overflow at ${viewport.width}px`,
  );
  assert.equal(await page.locator(".site-footer nav a").count(), 2);
  await page.goto(`${origin}/en/about`, { waitUntil: "networkidle" });
  assert.equal(await page.locator("h1").textContent(), "Hi, I'm Florian.");
  assert.equal(await page.locator(".about-portrait img").count(), 1);
  assert.equal(await page.locator(".about-paths a").count(), 3);
  await page.goto(`${origin}/en/articles`, { waitUntil: "networkidle" });
  assert.equal(await page.locator("h1").textContent(), "Field notes");
  await page.goto(`${origin}/de/datenschutz`, { waitUntil: "networkidle" });
  assert.equal(
    await page.locator("h1").textContent(),
    "Datenschutzerklärung",
  );
  assert.match(
    await page.locator("#cookies").textContent(),
    /keine Cookies oder vergleichbaren Speichertechnologien/,
  );
  await page.goto(`${origin}/de/impressum`, { waitUntil: "networkidle" });
  assert.match(await page.locator("#anbieter").textContent(), /Stücks 32/);
  await page.close();
}

const context = await browser.newContext({ locale: "de-DE" });
const page = await context.newPage();
await page.goto(origin, { waitUntil: "networkidle" });
assert.equal(new URL(page.url()).pathname, "/de");
assert.equal((await context.cookies()).length, 0);
assert.equal(
  (await page.locator(".locale-switch").textContent())?.trim(),
  "DE",
);
await page.locator(".locale-switch").click();
await page.waitForURL(`${origin}/en`);
assert.equal((await context.cookies()).length, 0);
await page.goto(`${origin}/admin`, { waitUntil: "networkidle" });
assert.equal(new URL(page.url()).pathname, "/login");
await context.close();

const priorityContext = await browser.newContext({
  extraHTTPHeaders: { "Accept-Language": "en-US,en;q=0.9,de;q=0.8" },
});
const priorityPage = await priorityContext.newPage();
await priorityPage.goto(origin, { waitUntil: "networkidle" });
assert.equal(new URL(priorityPage.url()).pathname, "/en");
await priorityPage.goto(`${origin}/en/tools`, { waitUntil: "networkidle" });
assert.equal(
  await priorityPage.locator("#roadmap-title").textContent(),
  "More PDF tools",
);
await priorityPage.goto(`${origin}/en/tools/json-formatter`, {
  waitUntil: "networkidle",
});
await priorityPage.locator(".code-field textarea").fill('{"changed":true}');
assert.equal(
  await priorityPage
    .locator(".formatter .status")
    .textContent()
    .then((value) => value.trim()),
  "Ready to format",
);
const machineIndex = await priorityPage.request.get(`${origin}/llms.txt`);
assert.equal(machineIndex.ok(), true);
assert.match(await machineIndex.text(), /JSON Formatter/);
await priorityContext.close();
await browser.close();

console.log(
  "UI verification passed for responsive catalogue sections and search, formatter state, locale priority, roadmap, machine index, and admin protection.",
);

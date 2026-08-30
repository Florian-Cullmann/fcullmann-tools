import { chromium } from "playwright";
import assert from "node:assert/strict";

const origin = process.env.CAPTURE_ORIGIN ?? "http://127.0.0.1:3000";
const browser = await chromium.launch({ headless: true });

for (const viewport of [{ width: 1504, height: 1046 }, { width: 390, height: 844 }]) {
  const page = await browser.newPage({ viewport });
  await page.goto(`${origin}/en`, { waitUntil: "networkidle" });
  assert.equal(await page.locator("h1").first().textContent(), "Florian Ullmann");
  assert.equal(await page.locator("#formatter-title").textContent(), "JSON Formatter");
  await page.locator(".code-field textarea").fill('{"changed":true}');
  assert.equal(await page.locator(".formatter .status").textContent().then((value) => value.trim()), "Ready to format");
  const dimensions = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, viewport: window.innerWidth }));
  assert.equal(dimensions.width, dimensions.viewport, `Horizontal overflow at ${viewport.width}px`);
  await page.close();
}

const context = await browser.newContext({ locale: "de-DE" });
const page = await context.newPage();
await page.goto(origin, { waitUntil: "networkidle" });
assert.equal(new URL(page.url()).pathname, "/de");
await page.goto(`${origin}/admin`, { waitUntil: "networkidle" });
assert.equal(new URL(page.url()).pathname, "/login");
await context.close();

const priorityContext = await browser.newContext({ extraHTTPHeaders: { "Accept-Language": "en-US,en;q=0.9,de;q=0.8" } });
const priorityPage = await priorityContext.newPage();
await priorityPage.goto(origin, { waitUntil: "networkidle" });
assert.equal(new URL(priorityPage.url()).pathname, "/en");
await priorityPage.goto(`${origin}/en/tools`, { waitUntil: "networkidle" });
assert.equal(await priorityPage.locator("#roadmap-title").textContent(), "PDF Converter");
const machineIndex = await priorityPage.request.get(`${origin}/llms.txt`);
assert.equal(machineIndex.ok(), true);
assert.match(await machineIndex.text(), /JSON Formatter/);
await priorityContext.close();
await browser.close();

console.log("UI verification passed for responsive layout, formatter state, locale priority, roadmap, machine index, and admin protection.");

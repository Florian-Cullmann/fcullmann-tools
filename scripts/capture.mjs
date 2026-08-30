import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const baseUrl = process.env.CAPTURE_URL ?? "http://127.0.0.1:3000/en";
await mkdir(".impeccable/review", { recursive: true });
const browser = await chromium.launch({ headless: true });

for (const capture of [
  { name: "desktop", width: 1504, height: 1046, fullPage: true },
  { name: "hero-repro", width: 1504, height: 1046, fullPage: false },
  { name: "mobile", width: 390, height: 844, fullPage: true }
]) {
  const page = await browser.newPage({ viewport: { width: capture.width, height: capture.height }, deviceScaleFactor: 1 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.screenshot({ path: `.impeccable/review/${capture.name}.png`, fullPage: capture.fullPage });
  await page.close();
}

await browser.close();

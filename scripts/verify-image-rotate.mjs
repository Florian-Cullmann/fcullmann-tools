import assert from "node:assert/strict";
import { chromium } from "playwright";
import { GifReader, GifWriter } from "omggif";
import JSZip from "jszip";

const origin = process.env.CAPTURE_ORIGIN ?? "http://127.0.0.1:3000";
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${origin}/en/tools/image-rotate`, {
    waitUntil: "networkidle",
  });
  const images = await page.evaluate(() => {
    return [
      [6, 4, "image/png"],
      [4, 6, "image/jpeg"],
      [4, 4, "image/png"],
    ].map(([width, height, type]) => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      context.fillStyle = "red";
      context.fillRect(0, 0, width / 2, height);
      context.fillStyle = "blue";
      context.fillRect(width / 2, 0, width / 2, height / 2);
      return canvas.toDataURL(type).split(",")[1];
    });
  });
  const gif = [];
  const writer = new GifWriter(gif, 3, 2, {
    palette: [0xff0000, 0x0000ff],
    loop: 0,
  });
  writer.addFrame(0, 0, 3, 2, [0, 0, 1, 0, 1, 1], { delay: 10 });
  writer.addFrame(0, 0, 3, 2, [1, 1, 0, 1, 0, 0], { delay: 20 });
  writer.end();
  const files = [
    {
      name: "same.png",
      mimeType: "image/png",
      buffer: Buffer.from(images[0], "base64"),
    },
    {
      name: "portrait.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from(images[1], "base64"),
    },
    {
      name: "same.png",
      mimeType: "image/png",
      buffer: Buffer.from(images[2], "base64"),
    },
    { name: "animated.gif", mimeType: "image/gif", buffer: Buffer.from(gif) },
    {
      name: "broken.png",
      mimeType: "image/png",
      buffer: Buffer.from("not an image"),
    },
  ];
  await page.locator('input[type="file"]').setInputFiles(files);
  await page.getByRole("alert").filter({ hasText: "broken.png" }).waitFor();
  assert.equal(await page.locator(".rotation-card").count(), 4);
  await page.getByLabel("Which images to rotate?").selectOption("landscape");
  assert.equal(await page.locator(".rotation-card--excluded").count(), 2);
  await page
    .getByRole("button", { name: "Rotate images", exact: true })
    .click();
  const zipLink = page.getByRole("link", { name: "Download all as ZIP" });
  await zipLink.waitFor();
  const zipBytes = await page.evaluate(
    async (url) =>
      Array.from(new Uint8Array(await (await fetch(url)).arrayBuffer())),
    await zipLink.getAttribute("href"),
  );
  const zip = await JSZip.loadAsync(new Uint8Array(zipBytes));
  assert.deepEqual(Object.keys(zip.files), [
    "01-same-90.png",
    "02-animated-90.gif",
  ]);
  const rotatedGif = new GifReader(
    await zip.file("02-animated-90.gif").async("uint8array"),
  );
  assert.deepEqual(
    [
      rotatedGif.width,
      rotatedGif.height,
      rotatedGif.numFrames(),
      rotatedGif.loopCount(),
    ],
    [2, 3, 2, 0],
  );
  assert.equal(rotatedGif.frameInfo(1).delay, 20);
  const png = await zip.file("01-same-90.png").async("base64");
  const decoded = await page.evaluate(async (base64) => {
    const bitmap = await createImageBitmap(
      await (await fetch(`data:image/png;base64,${base64}`)).blob(),
    );
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext("2d");
    context.drawImage(bitmap, 0, 0);
    return {
      width: bitmap.width,
      height: bitmap.height,
      topLeft: [...context.getImageData(0, 0, 1, 1).data],
      bottomLeft: [...context.getImageData(0, 5, 1, 1).data],
    };
  }, png);
  assert.deepEqual(decoded, {
    width: 4,
    height: 6,
    topLeft: [255, 0, 0, 255],
    bottomLeft: [0, 0, 0, 0],
  });
  await page.getByLabel("Which images to rotate?").selectOption("portrait");
  assert.equal(await page.locator(".rotation-results").count(), 0);
  await page.getByLabel("Rotation").selectOption("270");
  await page
    .getByRole("button", { name: "Rotate images", exact: true })
    .click();
  const jpgLink = page.getByRole("link", { name: "01-portrait-270.jpg" });
  await jpgLink.waitFor();
  const jpgDimensions = await page.evaluate(
    async (url) => {
      const blob = await (await fetch(url)).blob();
      const bitmap = await createImageBitmap(blob);
      return [blob.type, bitmap.width, bitmap.height];
    },
    await jpgLink.getAttribute("href"),
  );
  assert.deepEqual(jpgDimensions, ["image/jpeg", 6, 4]);
  await page.getByLabel("Which images to rotate?").selectOption("all");
  await page
    .getByRole("button", { name: "Rotate images", exact: true })
    .click();
  await zipLink.waitFor();
  assert.equal(await page.locator(".rotation-results a[download]").count(), 5);
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
  await page.goto(`${origin}/de/tools/image-rotate`, {
    waitUntil: "networkidle",
  });
  await page.locator('input[type="file"]').setInputFiles(files.slice(0, 1));
  await page
    .getByRole("button", { name: "Bilder drehen", exact: true })
    .click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: "01-same-90.png" }).click();
  assert.equal((await downloadPromise).suggestedFilename(), "01-same-90.png");
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
  assert.deepEqual(errors, []);
  console.log(
    "Image rotation verified: filters, pixel direction, PNG transparency, JPG/GIF formats, animation, ZIP, duplicate names, invalid input, downloads, German UI, and mobile layout.",
  );
} finally {
  await browser.close();
}

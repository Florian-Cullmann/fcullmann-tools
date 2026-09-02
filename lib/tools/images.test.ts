import { describe, expect, it } from "vitest";
import {
  detectImageType,
  hasSafeImageDimensions,
  imageOutputFileName,
  validateImageFile,
} from "@/lib/tools/images";

describe("image tools", () => {
  it("recognizes supported raster signatures", () => {
    expect(detectImageType(new Uint8Array([0xff, 0xd8, 0xff]))).toBe("jpeg");
    expect(
      detectImageType(
        new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      ),
    ).toBe("png");
    expect(
      detectImageType(
        new Uint8Array([
          0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50,
        ]),
      ),
    ).toBe("webp");
  });

  it("rejects unrelated image and document signatures", () => {
    expect(detectImageType(new Uint8Array([0x47, 0x49, 0x46, 0x38]))).toBeNull();
    expect(detectImageType(new Uint8Array([0x25, 0x50, 0x44, 0x46]))).toBeNull();
  });

  it("accepts only files whose name, MIME type, and signature agree", async () => {
    const pngHeader = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ]);

    await expect(
      validateImageFile(
        new File([pngHeader], "image.png", { type: "image/png" }),
      ),
    ).resolves.toEqual({ ok: true, type: "png" });
    await expect(
      validateImageFile(
        new File([pngHeader], "image.svg", { type: "image/svg+xml" }),
      ),
    ).resolves.toEqual({ ok: false, reason: "unsupported" });
  });

  it("creates predictable output names", () => {
    expect(imageOutputFileName("holiday.photo.png", "jpeg")).toBe(
      "holiday.photo.jpg",
    );
    expect(imageOutputFileName("photo", "webp")).toBe("photo.webp");
  });

  it("guards canvas dimensions", () => {
    expect(hasSafeImageDimensions(6000, 6000)).toBe(true);
    expect(hasSafeImageDimensions(8000, 6000)).toBe(false);
    expect(hasSafeImageDimensions(20_000, 100)).toBe(false);
    expect(hasSafeImageDimensions(0, 100)).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { GifReader, GifWriter } from "omggif";
import {
  matchesOrientation,
  rotatedPoint,
  rotateGif,
  rotationImageType,
  type Rotation,
} from "./image-rotate";

describe("image rotation", () => {
  it("filters by original orientation and treats squares separately", () => {
    expect(matchesOrientation(3, 2, "landscape")).toBe(true);
    expect(matchesOrientation(3, 2, "portrait")).toBe(false);
    expect(matchesOrientation(2, 3, "portrait")).toBe(true);
    expect(matchesOrientation(2, 2, "landscape")).toBe(false);
    expect(matchesOrientation(2, 2, "portrait")).toBe(false);
    expect(matchesOrientation(2, 2, "all")).toBe(true);
  });

  it("validates GIF signatures, extension, MIME, and empty files", async () => {
    await expect(
      rotationImageType(new File(["GIF89a"], "a.gif", { type: "image/gif" })),
    ).resolves.toBe("gif");
    await expect(
      rotationImageType(new File(["GIF87a"], "a.GIF")),
    ).resolves.toBe("gif");
    await expect(
      rotationImageType(new File(["GIF89a"], "a.png")),
    ).rejects.toThrow();
    await expect(
      rotationImageType(new File(["GIF89a"], "a.gif", { type: "image/png" })),
    ).rejects.toThrow();
    await expect(rotationImageType(new File([], "a.gif"))).rejects.toThrow();
  });

  it.each([90, 180, 270] as Rotation[])(
    "rotates animated GIF pixels and partial frame offsets by %i°",
    async (angle) => {
      const bytes: number[] = [];
      const writer = new GifWriter(bytes, 3, 2, {
        loop: 4,
        palette: [0xff0000, 0x00ff00, 0x0000ff, 0],
        background: 2,
      });
      writer.addFrame(0, 0, 3, 2, [0, 1, 2, 2, 1, 0], {
        delay: 7,
        disposal: 1,
      });
      writer.addFrame(1, 0, 2, 1, [0, 1], {
        palette: [0xffff00, 0],
        delay: 13,
        disposal: 2,
        transparent: 1,
      });
      writer.addFrame(0, 1, 1, 1, [1], { delay: 19, disposal: 3 });
      writer.end();
      const original = new GifReader(bytes);
      const output = new Uint8Array(
        await (await rotateGif(new Uint8Array(bytes), angle)).arrayBuffer(),
      );
      const result = new GifReader(output);
      expect([result.width, result.height]).toEqual(
        angle === 180 ? [3, 2] : [2, 3],
      );
      expect(result.numFrames()).toBe(3);
      expect(result.loopCount()).toBe(4);
      expect(output[11]).toBe(2);
      for (let frame = 0; frame < 3; frame++) {
        const info = result.frameInfo(frame);
        const before = original.frameInfo(frame);
        expect([info.delay, info.disposal, info.transparent_index]).toEqual([
          before.delay,
          before.disposal,
          before.transparent_index,
        ]);
        const source = new Uint8Array(24);
        const rotated = new Uint8Array(24);
        original.decodeAndBlitFrameRGBA(frame, source);
        result.decodeAndBlitFrameRGBA(frame, rotated);
        for (let y = 0; y < 2; y++)
          for (let x = 0; x < 3; x++) {
            const point = rotatedPoint(x, y, 3, 2, angle);
            const offset = (point.y * result.width + point.x) * 4;
            expect(rotated.slice(offset, offset + 4)).toEqual(
              source.slice((y * 3 + x) * 4, (y * 3 + x) * 4 + 4),
            );
          }
      }
    },
  );

  it("maps asymmetric corners in the expected direction", () => {
    expect(rotatedPoint(0, 0, 3, 2, 90)).toEqual({ x: 1, y: 0 });
    expect(rotatedPoint(0, 0, 3, 2, 180)).toEqual({ x: 2, y: 1 });
    expect(rotatedPoint(0, 0, 3, 2, 270)).toEqual({ x: 0, y: 2 });
  });

  it("preserves non-looping GIFs and rejects oversized logical screens", async () => {
    const bytes: number[] = [];
    const writer = new GifWriter(bytes, 1, 1, { palette: [0, 0xffffff] });
    writer.addFrame(0, 0, 1, 1, [1]);
    writer.end();
    const rotated = new GifReader(
      new Uint8Array(
        await (await rotateGif(new Uint8Array(bytes), 90)).arrayBuffer(),
      ),
    );
    expect(rotated.loopCount()).toBeNull();
    bytes[6] = 0xff;
    bytes[7] = 0xff;
    await expect(rotateGif(new Uint8Array(bytes), 90)).rejects.toThrow(
      "GIF limit",
    );
  });
});

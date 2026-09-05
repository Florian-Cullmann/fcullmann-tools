import "omggif";

declare module "omggif" {
  interface GifWriter {
    // The encoder accepts typed arrays; upstream typings only list number[].
    addFrame(
      x: number,
      y: number,
      width: number,
      height: number,
      pixels: Uint8Array,
      options?: FrameOptions,
    ): number;
  }
}

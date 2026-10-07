import type { JpgToPdfOptions } from "@/lib/tools/pdf-images";

export type ImagePdfRequest =
  | { kind: "prepare"; files: File[] }
  | { kind: "convert"; files: File[]; options: JpgToPdfOptions; maxBytes: number };

export type ImagePdfErrorReason = "unsupported" | "dimensions" | "browser" | "read" | "size";

export type ImagePdfResponse =
  | { kind: "preview"; index: number; width: number; height: number; preview: Blob }
  | { kind: "progress"; completed: number; total: number }
  | { kind: "done" }
  | { kind: "pdf"; buffer: ArrayBuffer }
  | { kind: "error"; reason: ImagePdfErrorReason; fileName: string };

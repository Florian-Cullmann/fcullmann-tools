export const implementedToolSlugs = [
  "csv-to-excel",
  "excel-to-csv",
  "word-to-pdf",
  "pdf-compress",
  "pdf-merge",
  "pdf-split",
  "pdf-to-jpg",
  "jpg-to-pdf",
  "pdf-rotate",
  "pdf-organize",
  "pdf-page-numbers",
  "image-to-jpg",
  "image-to-png",
  "image-to-webp",
  "json-formatter",
  "base64",
  "uuid-generator",
  "url-encoder",
  "hash-generator",
  "timestamp-converter",
  "case-converter",
  "color-converter",
  "word-counter",
  "slug-generator",
] as const;

export type ToolSlug = (typeof implementedToolSlugs)[number];

const implementedToolSlugSet: ReadonlySet<string> = new Set(
  implementedToolSlugs,
);

export function isImplementedToolSlug(value: string): value is ToolSlug {
  return implementedToolSlugSet.has(value);
}

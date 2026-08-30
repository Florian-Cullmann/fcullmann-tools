import type { Locale } from "@/lib/content/types";

export const MAX_PDF_BYTES = 100 * 1024 * 1024;

export function isPdfFile(file: Pick<File, "name" | "type">) {
  return (
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
  );
}

export function formatFileSize(bytes: number, locale: Locale) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = units[0];

  for (let index = 1; value >= 1024 && index < units.length; index += 1) {
    value /= 1024;
    unit = units[index];
  }

  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value)} ${unit}`;
}

export function pdfBaseName(fileName: string) {
  return fileName.replace(/\.pdf$/i, "").trim() || "document";
}

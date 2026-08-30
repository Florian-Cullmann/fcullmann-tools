import { PDFDocument } from "pdf-lib";

export async function getPdfPageCount(data: ArrayBuffer | Uint8Array) {
  const document = await PDFDocument.load(data, { updateMetadata: false });
  return document.getPageCount();
}

export async function mergePdfDocuments(
  documents: ReadonlyArray<ArrayBuffer | Uint8Array>,
) {
  if (documents.length < 2) {
    throw new Error("At least two PDF documents are required.");
  }

  const merged = await PDFDocument.create();

  for (const data of documents) {
    const source = await PDFDocument.load(data, { updateMetadata: false });
    const pages = await merged.copyPages(source, source.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
  }

  return merged.save({ useObjectStreams: true });
}

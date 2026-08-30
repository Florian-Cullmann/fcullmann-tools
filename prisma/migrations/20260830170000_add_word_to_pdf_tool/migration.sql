INSERT INTO "Tool" (
  "id",
  "slug",
  "nameEn",
  "nameDe",
  "summaryEn",
  "summaryDe",
  "descriptionEn",
  "descriptionDe",
  "category",
  "icon",
  "status",
  "featured",
  "sortOrder",
  "usageCount",
  "createdAt",
  "updatedAt"
)
VALUES (
  'tool-word-to-pdf',
  'word-to-pdf',
  'Word to PDF',
  'Word in PDF',
  'Convert DOC and DOCX files into easy-to-share PDFs.',
  'Machen Sie DOC- und DOCX-Dateien einfacher lesbar, indem Sie sie in PDFs umwandeln.',
  'Convert DOC and DOCX documents into PDF files directly in your browser. DOCX layouts are retained where possible, while older DOC files become clean text documents.',
  'DOC- und DOCX-Dokumente direkt im Browser in PDF-Dateien umwandeln. DOCX-Layouts werden bestmöglich erhalten; ältere DOC-Dateien werden als übersichtliches Textdokument ausgegeben.',
  'office',
  'word-pdf',
  'PUBLISHED',
  false,
  3,
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("slug") DO NOTHING;

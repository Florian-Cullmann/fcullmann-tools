UPDATE "Tool"
SET "sortOrder" = 4, "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'word-to-pdf';

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
  'tool-csv-to-excel',
  'csv-to-excel',
  'CSV to Excel',
  'CSV zu Excel',
  'Turn CSV and TSV tables into polished Excel workbooks.',
  'CSV- und TSV-Tabellen in übersichtliche Excel-Dateien umwandeln.',
  'Open a CSV or TSV file, check its delimiter and columns, and create a formatted XLSX workbook without uploading the data.',
  'Eine CSV- oder TSV-Datei öffnen, Trennzeichen und Spalten prüfen und ohne Upload eine formatierte XLSX-Arbeitsmappe erstellen.',
  'office',
  'spreadsheet',
  'PUBLISHED',
  false,
  3,
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("slug") DO NOTHING;

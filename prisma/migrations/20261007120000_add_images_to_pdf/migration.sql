INSERT INTO "Tool" (
  "id", "slug", "nameEn", "nameDe", "summaryEn", "summaryDe",
  "descriptionEn", "descriptionDe", "category", "icon", "status",
  "featured", "sortOrder", "usageCount", "createdAt", "updatedAt"
) VALUES (
  'tool-images-to-pdf', 'images-to-pdf', 'Images to PDF', 'Bilder in PDF',
  'Combine multiple images into one PDF. One image per page.',
  'Mehrere Bilder zu einer PDF verbinden. Jedes Bild eine Seite.',
  'Select JPG, PNG, or WebP images, arrange their order, and create one PDF with a separate page for each image. Files are processed locally in your browser.',
  'JPG-, PNG- oder WebP-Bilder auswählen, ihre Reihenfolge festlegen und eine gemeinsame PDF erstellen. Jedes Bild erhält eine eigene Seite. Die Verarbeitung erfolgt lokal im Browser.',
  'images', 'image-pdf', 'PUBLISHED', false, 4, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

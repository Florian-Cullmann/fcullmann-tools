INSERT INTO "Tool" (
  "id", "slug", "nameEn", "nameDe", "summaryEn", "summaryDe",
  "descriptionEn", "descriptionDe", "category", "icon", "status",
  "featured", "sortOrder", "usageCount", "createdAt", "updatedAt"
) VALUES (
  'tool-image-rotate', 'image-rotate', 'Rotate images', 'Bild drehen',
  'Rotate multiple JPG, PNG, or GIF images at once. Choose all images or only landscape or portrait images.',
  'Mehrere JPG-, PNG- oder GIF-Bilder gleichzeitig drehen. Wahlweise alle oder nur Bilder im Quer- oder Hochformat drehen.',
  'Rotate images locally by 90°, 180°, or 270°, preview the result, and download individual files or a ZIP. GIF animations are preserved.',
  'Bilder lokal um 90°, 180° oder 270° drehen, das Ergebnis vorab ansehen und einzeln oder als ZIP herunterladen. GIF-Animationen bleiben erhalten.',
  'images', 'rotate', 'PUBLISHED', false, 3, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

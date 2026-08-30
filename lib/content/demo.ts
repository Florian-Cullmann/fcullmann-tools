import type { ArticleRecord, ProjectRecord, ToolRecord } from "@/lib/content/types";

export const demoTools: ToolRecord[] = [
  {
    id: "demo-json-formatter",
    slug: "json-formatter",
    name: { en: "JSON Formatter", de: "JSON-Formatierer" },
    summary: { en: "Format, validate, and inspect JSON.", de: "JSON formatieren, validieren und prüfen." },
    description: {
      en: "Turn compact or inconsistent JSON into readable, validated output without sending data to a server.",
      de: "Kompaktes oder uneinheitliches JSON lesbar formatieren und validieren, ohne Daten an einen Server zu senden."
    },
    category: "formatters",
    icon: "braces",
    featured: true,
    sortOrder: 1,
    usageCount: 0
  },
  {
    id: "demo-base64",
    slug: "base64",
    name: { en: "Base64 Encoder", de: "Base64-Konverter" },
    summary: { en: "Encode and decode Base64 text.", de: "Base64-Text kodieren und dekodieren." },
    description: {
      en: "Convert UTF-8 text to Base64 and back entirely in your browser.",
      de: "UTF-8-Text vollständig im Browser in Base64 umwandeln und zurück."
    },
    category: "encoders",
    icon: "binary",
    featured: true,
    sortOrder: 2,
    usageCount: 0
  },
  {
    id: "demo-uuid",
    slug: "uuid-generator",
    name: { en: "UUID Generator", de: "UUID-Generator" },
    summary: { en: "Generate secure UUID v4 values.", de: "Sichere UUID-v4-Werte erzeugen." },
    description: {
      en: "Generate one or many RFC 4122 UUID v4 identifiers using the browser crypto API.",
      de: "Eine oder mehrere RFC-4122-UUIDs v4 mit der Crypto-API des Browsers erzeugen."
    },
    category: "generators",
    icon: "fingerprint",
    featured: true,
    sortOrder: 3,
    usageCount: 0
  },
  {
    id: "demo-url-codec",
    slug: "url-encoder",
    name: { en: "URL Encoder", de: "URL-Kodierer" },
    summary: { en: "Encode and decode URL components.", de: "URL-Bestandteile kodieren und dekodieren." },
    description: {
      en: "Safely encode or decode query values and URL path fragments.",
      de: "Query-Werte und URL-Pfadbestandteile sicher kodieren oder dekodieren."
    },
    category: "encoders",
    icon: "link",
    featured: false,
    sortOrder: 4,
    usageCount: 0
  }
];

export const demoArticles: ArticleRecord[] = [
  {
    id: "demo-useful-tools",
    slug: "designing-tools-that-earn-their-tab",
    title: { en: "Designing tools that earn their tab", de: "Tools entwickeln, die ihren Tab verdienen" },
    excerpt: {
      en: "A practical framework for building focused utilities people return to.",
      de: "Ein praktischer Rahmen für fokussierte Werkzeuge, zu denen Menschen zurückkehren."
    },
    content: {
      en: "## Start with one finished job\n\nA useful tool has a narrow promise and a complete path from input to result. The interface should expose that path immediately.\n\n## Keep data close\n\nWhen a task can run safely in the browser, local processing improves speed, privacy, and resilience.\n\n> This sample article demonstrates the bilingual publishing model and should be replaced or approved before launch.",
      de: "## Mit einer abgeschlossenen Aufgabe beginnen\n\nEin nützliches Tool hat ein enges Versprechen und einen vollständigen Weg von der Eingabe zum Ergebnis. Die Oberfläche sollte diesen Weg sofort zeigen.\n\n## Daten lokal halten\n\nWenn eine Aufgabe sicher im Browser laufen kann, verbessert lokale Verarbeitung Geschwindigkeit, Datenschutz und Robustheit.\n\n> Dieser Beispielartikel demonstriert das zweisprachige Publikationsmodell und sollte vor dem Launch ersetzt oder freigegeben werden."
    },
    publishedAt: new Date("2026-08-12T09:00:00.000Z"),
    isDemo: true
  },
  {
    id: "demo-apis",
    slug: "reliable-api-boundaries",
    title: { en: "Reliable API boundaries", de: "Verlässliche API-Grenzen" },
    excerpt: {
      en: "Why validation, explicit failure states, and idempotency belong at the boundary.",
      de: "Warum Validierung, klare Fehlerzustände und Idempotenz an die Systemgrenze gehören."
    },
    content: {
      en: "## Boundaries carry responsibility\n\nAn API boundary should turn ambiguous input into explicit domain state. Validation errors are part of the contract, not an afterthought.\n\n> This is sample editorial content for the initial site build.",
      de: "## Grenzen tragen Verantwortung\n\nEine API-Grenze sollte mehrdeutige Eingaben in expliziten Domänenzustand übersetzen. Validierungsfehler sind Teil des Vertrags.\n\n> Dies ist ein Beispielinhalt für den initialen Website-Aufbau."
    },
    publishedAt: new Date("2026-07-24T09:00:00.000Z"),
    isDemo: true
  }
];

export const demoProjects: ProjectRecord[] = [
  {
    id: "demo-tool-platform",
    slug: "tool-platform",
    title: "fcullmann.com Tools",
    summary: {
      en: "A bilingual platform for focused browser utilities and technical writing.",
      de: "Eine zweisprachige Plattform für fokussierte Browser-Tools und technische Artikel."
    },
    description: {
      en: "The platform shown here is the first verified project record. Additional work will be added with source links and accurate context.",
      de: "Die hier gezeigte Plattform ist der erste verifizierte Projekteintrag. Weitere Arbeiten folgen mit Quelllinks und korrektem Kontext."
    },
    technologies: ["Next.js", "TypeScript", "PostgreSQL", "Prisma"],
    isDemo: false
  }
];

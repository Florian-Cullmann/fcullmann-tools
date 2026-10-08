import type { Locale } from "@/lib/i18n/types";

const messages = {
  en: {
    nav: {
      home: "Home",
      tools: "Tools",
    },
    home: {
      featured: "Featured tools",
      viewTools: "View all tools",
    },
    tools: {
      title: "Tools for focused work",
      intro:
        "Small, fast utilities designed to stay out of your way. Browser-first tools process data locally whenever possible.",
      search: "Search tools",
      noResults: "No tools match this search.",
      open: "Open tool",
    },
    common: {
      sample: "Sample",
      copy: "Copy",
      copied: "Copied",
      clear: "Clear",
      input: "Input",
      output: "Formatted output",
      jsonValid: "Valid JSON",
      jsonInvalid: "Invalid JSON",
      jsonDirty: "Ready to format",
      jsonIdle: "Waiting for input",
      jsonError: "Invalid JSON. Check quotes, commas, and brackets.",
      copyError: "Copy failed. Select the output and copy it manually.",
    },
  },
  de: {
    nav: {
      home: "Start",
      tools: "Tools",
    },
    home: {
      featured: "Beliebte Tools",
      viewTools: "Alle Tools ansehen",
    },
    tools: {
      title: "Tools für fokussiertes Arbeiten",
      intro:
        "Kleine, schnelle Werkzeuge, die nicht im Weg stehen. Daten werden nach Möglichkeit direkt im Browser verarbeitet.",
      search: "Tools durchsuchen",
      noResults: "Keine passenden Tools gefunden.",
      open: "Tool öffnen",
    },
    common: {
      sample: "Beispiel",
      copy: "Kopieren",
      copied: "Kopiert",
      clear: "Leeren",
      input: "Eingabe",
      output: "Formatiertes Ergebnis",
      jsonValid: "Gültiges JSON",
      jsonInvalid: "Ungültiges JSON",
      jsonDirty: "Bereit zum Formatieren",
      jsonIdle: "Wartet auf Eingabe",
      jsonError:
        "Ungültiges JSON. Prüfe Anführungszeichen, Kommas und Klammern.",
      copyError:
        "Kopieren fehlgeschlagen. Markiere die Ausgabe und kopiere sie manuell.",
    },
  },
} as const;

export function getMessages(locale: Locale) {
  return messages[locale];
}

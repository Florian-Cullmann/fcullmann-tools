import type { Locale } from "@/lib/content/types";

const messages = {
  en: {
    nav: { home: "Home", tools: "Tools", projects: "Projects", articles: "Articles", about: "About" },
    home: {
      title: "Florian Ullmann",
      role: "Senior Software Engineer",
      statement: "Useful software, carefully made.",
      intro: "I design dependable software and focused developer tools that make everyday work clearer.",
      legend: "Tools, projects, writing",
      legendTools: "Practical utilities that solve one task well.",
      legendProjects: "Selected systems, products, and experiments.",
      legendWriting: "Notes on software design and delivery.",
      featured: "Featured tools",
      latest: "Latest writing",
      viewTools: "View all tools",
      viewArticles: "View all articles",
      route: "Destination: tools"
    },
    tools: {
      title: "Tools for focused work",
      intro: "Small, fast utilities designed to stay out of your way. Browser-first tools process data locally whenever possible.",
      search: "Search tools",
      noResults: "No tools match this search.",
      open: "Open tool",
      privacy: "Runs locally in your browser"
    },
    articles: {
      title: "Field notes",
      intro: "Practical writing about software architecture, developer experience, and the decisions behind useful tools.",
      sample: "Sample content",
      read: "Read article"
    },
    projects: {
      title: "Selected work",
      intro: "A curated view of systems, tools, and experiments. Verified project records will replace the initial examples before launch.",
      sample: "Sample project"
    },
    about: {
      title: "Software should earn its complexity.",
      body: "I am Florian Ullmann, a senior software engineer focused on reliable systems, clear interfaces, and developer tools that solve concrete problems.",
      note: "A full biography, availability, and verified project history will be added before launch."
    },
    common: {
      sample: "Sample", copy: "Copy", copied: "Copied", clear: "Clear", input: "Input", output: "Formatted output",
      jsonValid: "Valid JSON", jsonInvalid: "Invalid JSON", jsonDirty: "Ready to format", jsonIdle: "Waiting for input",
      jsonError: "Invalid JSON. Check quotes, commas, and brackets.", copyError: "Copy failed. Select the output and copy it manually."
    }
  },
  de: {
    nav: { home: "Start", tools: "Tools", projects: "Projekte", articles: "Artikel", about: "Über mich" },
    home: {
      title: "Florian Ullmann",
      role: "Senior Software Engineer",
      statement: "Nützliche Software, sorgfältig entwickelt.",
      intro: "Ich entwickle verlässliche Software und fokussierte Developer-Tools, die tägliche Arbeit übersichtlicher machen.",
      legend: "Tools, Projekte, Artikel",
      legendTools: "Praktische Werkzeuge, die eine Aufgabe richtig lösen.",
      legendProjects: "Ausgewählte Systeme, Produkte und Experimente.",
      legendWriting: "Notizen über Softwaredesign und Umsetzung.",
      featured: "Beliebte Tools",
      latest: "Neue Artikel",
      viewTools: "Alle Tools ansehen",
      viewArticles: "Alle Artikel ansehen",
      route: "Ziel: Tools"
    },
    tools: {
      title: "Tools für fokussiertes Arbeiten",
      intro: "Kleine, schnelle Werkzeuge, die nicht im Weg stehen. Daten werden nach Möglichkeit direkt im Browser verarbeitet.",
      search: "Tools durchsuchen",
      noResults: "Keine passenden Tools gefunden.",
      open: "Tool öffnen",
      privacy: "Läuft lokal in deinem Browser"
    },
    articles: {
      title: "Notizen aus der Praxis",
      intro: "Praxisnahe Texte über Softwarearchitektur, Developer Experience und die Entscheidungen hinter nützlichen Tools.",
      sample: "Beispielinhalt",
      read: "Artikel lesen"
    },
    projects: {
      title: "Ausgewählte Arbeiten",
      intro: "Ein kuratierter Blick auf Systeme, Tools und Experimente. Verifizierte Projekte ersetzen vor dem Launch die ersten Beispiele.",
      sample: "Beispielprojekt"
    },
    about: {
      title: "Software sollte ihre Komplexität verdienen.",
      body: "Ich bin Florian Ullmann, Senior Software Engineer mit Fokus auf verlässliche Systeme, klare Oberflächen und Developer-Tools für konkrete Probleme.",
      note: "Eine vollständige Biografie, Verfügbarkeit und verifizierte Projekthistorie werden vor dem Launch ergänzt."
    },
    common: {
      sample: "Beispiel", copy: "Kopieren", copied: "Kopiert", clear: "Leeren", input: "Eingabe", output: "Formatiertes Ergebnis",
      jsonValid: "Gültiges JSON", jsonInvalid: "Ungültiges JSON", jsonDirty: "Bereit zum Formatieren", jsonIdle: "Wartet auf Eingabe",
      jsonError: "Ungültiges JSON. Prüfe Anführungszeichen, Kommas und Klammern.", copyError: "Kopieren fehlgeschlagen. Markiere die Ausgabe und kopiere sie manuell."
    }
  }
} as const;

export function getMessages(locale: Locale) {
  return messages[locale];
}

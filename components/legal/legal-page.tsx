import type { ReactNode } from "react";

export type LegalSection = {
  id: string;
  title: string;
  content: ReactNode;
};

export function LegalPage({
  title,
  intro,
  updated,
  contentsLabel,
  sections,
}: {
  title: string;
  intro: string;
  updated?: string;
  contentsLabel: string;
  sections: LegalSection[];
}) {
  return (
    <div className="legal-page site-shell">
      <header className="legal-page__header">
        <h1>{title}</h1>
        <p>{intro}</p>
        {updated && <time>{updated}</time>}
      </header>
      <div className="legal-page__layout">
        <aside className="legal-page__contents">
          <h2>{contentsLabel}</h2>
          <nav aria-label={contentsLabel}>
            {sections.map((section) => (
              <a key={section.id} href={`#${section.id}`}>
                {section.title}
              </a>
            ))}
          </nav>
        </aside>
        <article className="legal-page__body">
          {sections.map((section) => (
            <section id={section.id} key={section.id}>
              <h2>{section.title}</h2>
              {section.content}
            </section>
          ))}
        </article>
      </div>
    </div>
  );
}

import Link from "next/link";
import type { Locale } from "@/lib/i18n/types";

export function SiteFooter({ locale }: { locale: Locale }) {
  return (
    <footer className="site-footer">
      <div className="site-shell site-footer__inner">
        <p>© {new Date().getFullYear()} fcuTools</p>
        <p>
          {locale === "de"
            ? "Praktische Tools, direkt im Browser."
            : "Practical tools, right in your browser."}
        </p>
        <nav aria-label="Legal">
          <Link href={`/${locale}/impressum`}>
            {locale === "de" ? "Impressum" : "Legal notice"}
          </Link>
          <Link href={`/${locale}/datenschutz`}>
            {locale === "de" ? "Datenschutz" : "Privacy"}
          </Link>
        </nav>
      </div>
    </footer>
  );
}

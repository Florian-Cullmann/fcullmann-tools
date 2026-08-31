import Link from "next/link";
import type { Locale } from "@/lib/content/types";

export function SiteFooter({ locale }: { locale: Locale }) {
  return (
    <footer className="site-footer">
      <div className="site-shell site-footer__inner">
        <p>© {new Date().getFullYear()} Florian Cullmann</p>
        <p>
          {locale === "de"
            ? "Nützliche Software, sorgfältig entwickelt."
            : "Useful software, carefully made."}
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

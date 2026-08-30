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
          <Link href={`/${locale}/about`}>
            {locale === "de"
              ? "Impressum & Datenschutz folgen"
              : "Legal details forthcoming"}
          </Link>
        </nav>
      </div>
    </footer>
  );
}

import Link from "next/link";
import type { Locale } from "@/lib/content/types";

export function SiteFooter({ locale }: { locale: Locale }) {
  return (
    <footer className="site-footer">
      <div className="atlas-shell site-footer__inner">
        <p>© {new Date().getFullYear()} Florian Ullmann</p>
        <p className="coordinate-label">48° 08′ N · 11° 35′ E · ROUTE FC-01</p>
        <nav aria-label="Legal">
          <Link href={`/${locale}/about`}>{locale === "de" ? "Impressum & Datenschutz folgen" : "Legal details forthcoming"}</Link>
        </nav>
      </div>
    </footer>
  );
}

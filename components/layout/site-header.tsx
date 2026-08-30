import Link from "next/link";
import { Code2 } from "lucide-react";
import { LocaleSwitch } from "@/components/layout/locale-switch";
import type { Locale } from "@/lib/content/types";
import { getMessages } from "@/lib/i18n/messages";

export function SiteHeader({ locale }: { locale: Locale }) {
  const { nav } = getMessages(locale);
  const links = [
    [nav.tools, `/${locale}/tools`],
    [nav.projects, `/${locale}/projects`],
    [nav.articles, `/${locale}/articles`],
    [nav.about, `/${locale}/about`],
  ] as const;

  return (
    <header className="site-header">
      <div className="site-header__inner site-shell">
        <Link
          className="wordmark"
          href={`/${locale}`}
          aria-label={`${nav.home} — fcullmann.com`}
        >
          <span className="wordmark__mark">
            <Code2 aria-hidden="true" size={18} strokeWidth={2.2} />
          </span>
          <span>fcullmann.com</span>
        </Link>
        <nav aria-label="Primary navigation">
          {links.map(([label, href]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
        <LocaleSwitch locale={locale} />
      </div>
    </header>
  );
}

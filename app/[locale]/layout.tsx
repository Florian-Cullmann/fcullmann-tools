import type { Metadata } from "next";
import { JetBrains_Mono, Public_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { isLocale, locales } from "@/lib/i18n/config";
import "@/app/globals.css";

const sans = Public_Sans({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fcullmann.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Florian Cullmann — Developer Tools & Software Projects",
    template: "%s — Florian Cullmann",
  },
  description:
    "Focused browser tools, selected software projects, and practical engineering notes by Florian Cullmann.",
  applicationName: "fcullmann.com",
  authors: [{ name: "Florian Cullmann", url: siteUrl }],
  creator: "Florian Cullmann",
  alternates: { languages: { en: "/en", de: "/de" } },
  openGraph: {
    type: "website",
    siteName: "fcullmann.com",
    title: "Florian Cullmann — Developer Tools & Software Projects",
    description: "Useful software, carefully made.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Florian Cullmann",
    description: "Useful software, carefully made.",
  },
  robots: { index: true, follow: true },
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html lang={locale} className={`${sans.variable} ${mono.variable}`}>
      <body>
        <div
          className="contents"
          aria-hidden="true"
          dangerouslySetInnerHTML={{
            __html: `<!-- THESIS: Search First turns the personal site into a direct utility catalogue and refuses an oversized profile hero or atmospheric metaphor. OWN-WORLD: cool #F5F7FB canvas, white rounded utility cards, coral primary actions, multicolor functional glyph tiles, and compact sans typography. STORY: visitors understand that Florian builds and maintains useful tools, search or filter the catalogue, and open one; projects and writing support authorship. FIRST VIEWPORT: slim header, centered introduction, wide search, category filters, featured tools, and dense all-tools rows crossing the fold; search is the primary action. FORM: Straight Utility Catalogue, chosen explicitly, seed 9c978054. FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance -->`,
          }}
        />
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <SiteHeader locale={locale} />
        <main id="main-content">{children}</main>
        <SiteFooter locale={locale} />
      </body>
    </html>
  );
}

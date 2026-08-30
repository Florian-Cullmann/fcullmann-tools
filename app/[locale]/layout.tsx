import type { Metadata } from "next";
import { JetBrains_Mono, Public_Sans, Source_Serif_4 } from "next/font/google";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { isLocale, locales } from "@/lib/i18n/config";
import "@/app/globals.css";

const sans = Public_Sans({ subsets: ["latin"], variable: "--font-sans" });
const serif = Source_Serif_4({ subsets: ["latin"], variable: "--font-serif" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fcullmann.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Florian Ullmann — Software Engineer & Developer Tools", template: "%s — Florian Ullmann" },
  description: "Focused browser tools, selected software projects, and practical engineering notes by Florian Ullmann.",
  applicationName: "fcullmann.com",
  authors: [{ name: "Florian Ullmann", url: siteUrl }],
  creator: "Florian Ullmann",
  alternates: { languages: { en: "/en", de: "/de" } },
  openGraph: {
    type: "website",
    siteName: "fcullmann.com",
    title: "Florian Ullmann — Software Engineer & Developer Tools",
    description: "Useful software, carefully made.",
    url: siteUrl
  },
  twitter: { card: "summary_large_image", title: "Florian Ullmann", description: "Useful software, carefully made." },
  robots: { index: true, follow: true }
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html lang={locale} className={`${sans.variable} ${serif.variable} ${mono.variable}`}>
      <body>
        <div
          className="contents"
          aria-hidden="true"
          dangerouslySetInnerHTML={{
            __html: `<!-- THESIS: API Atlas turns a portfolio and tool catalogue into functional wayfinding, refusing the generic hero-plus-card-grid. OWN-WORLD: warm map stock, deep ink, vermilion primary routes, cartographic-blue secondary routes, fine coordinates, square bordered fields. STORY: visitors meet Florian, use a real formatter, then navigate tools and writing. FIRST VIEWPORT: compact navigation above a left identity legend and dominant two-pane formatter; featured routes cross the fold; Format JSON anchors the route. FORM: API Atlas, ranked first, seed a1ea90f0. FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance -->`
          }}
        />
        <a className="skip-link" href="#main-content">Skip to content</a>
        <SiteHeader locale={locale} />
        <main id="main-content">{children}</main>
        <SiteFooter locale={locale} />
      </body>
    </html>
  );
}

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
            __html: `<!-- THESIS: Florian's digital workshop makes the person behind the utilities visible without slowing down access to the tools. OWN-WORLD: cool #F5F7FB canvas, a warm editorial hero, coral primary actions, multicolor functional glyph tiles, and compact sans typography. STORY: visitors meet Florian, understand what he makes, search or filter his toolbox, and then explore projects and writing. FIRST VIEWPORT: slim header, personal introduction with portrait, direct links, search, category filters, and the first tool rows. FORM: Personal Workshop Catalogue. -->`,
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

import type { Metadata } from "next";
import { JetBrains_Mono, Public_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import Script from "next/script";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { isLocale, locales } from "@/lib/i18n/config";
import "@/app/globals.css";

const sans = Public_Sans({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tools.fcullmann.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "fcuTools – Practical online tools",
    template: "%s – fcuTools",
  },
  description:
    "Edit PDFs, convert images and Office files, and format data directly in your browser.",
  applicationName: "fcuTools",
  alternates: { languages: { en: "/en", de: "/de" } },
  openGraph: {
    type: "website",
    siteName: "fcuTools",
    title: "fcuTools – Practical online tools",
    description: "Practical tools, right in your browser.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "fcuTools",
    description: "Practical tools, right in your browser.",
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
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <SiteHeader locale={locale} />
        <main id="main-content">{children}</main>
        <SiteFooter locale={locale} />
      </body>
      <Script
        src="http://localhost:3000/widget.js"
        data-site="cmv2866xg002fim5o7ghjogde"
        strategy="afterInteractive"
        defer
      />
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3136105776325069"
        crossOrigin="anonymous"
      />
    </html>
  );
}

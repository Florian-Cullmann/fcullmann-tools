import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPage, type LegalSection } from "@/components/legal/legal-page";
import { isLocale } from "@/lib/i18n/config";
import { localizedAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/impressum">): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "de" ? "Impressum" : "Legal notice",
    description:
      locale === "de"
        ? "Impressum und Anbieterkennzeichnung von Florian Cullmann."
        : "Legal notice and provider information for Florian Cullmann.",
    alternates: isLocale(locale)
      ? localizedAlternates(locale, "impressum")
      : undefined,
  };
}

export default async function ImprintPage({
  params,
}: PageProps<"/[locale]/impressum">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const sections: LegalSection[] =
    locale === "de"
      ? [
          {
            id: "anbieter",
            title: "Angaben gemäß § 5 DDG",
            content: (
              <address>
                <strong>apidego IT-Solutions</strong>
                <br />
                Inhaber: Florian Cullmann
                <br />
                Stücks 32
                <br />
                66871 Konken
                <br />
                Deutschland
              </address>
            ),
          },
          {
            id: "kontakt",
            title: "Kontakt",
            content: (
              <p>
                Telefon: <a href="tel:+4917632811757">+49 176 32811757</a>
                <br />
                E-Mail: <a href="mailto:kontakt@apidego.de">kontakt@apidego.de</a>
              </p>
            ),
          },
          {
            id: "umsatzsteuer",
            title: "Umsatzsteuer-ID",
            content: (
              <p>
                Umsatzsteuer-Identifikationsnummer gemäß § 27 a
                Umsatzsteuergesetz: <strong>DE314153136</strong>
              </p>
            ),
          },
          {
            id: "redaktion",
            title: "Redaktionell verantwortlich",
            content: <p>Florian Cullmann, Stücks 32, 66871 Konken</p>,
          },
          {
            id: "streitbeilegung",
            title: "Verbraucherstreitbeilegung",
            content: (
              <p>
                Wir sind nicht bereit oder verpflichtet, an
                Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
                teilzunehmen.
              </p>
            ),
          },
        ]
      : [
          {
            id: "provider",
            title: "Information pursuant to § 5 DDG",
            content: (
              <address>
                <strong>apidego IT-Solutions</strong>
                <br />
                Proprietor: Florian Cullmann
                <br />
                Stücks 32
                <br />
                66871 Konken
                <br />
                Germany
              </address>
            ),
          },
          {
            id: "contact",
            title: "Contact",
            content: (
              <p>
                Phone: <a href="tel:+4917632811757">+49 176 32811757</a>
                <br />
                Email: <a href="mailto:kontakt@apidego.de">kontakt@apidego.de</a>
              </p>
            ),
          },
          {
            id: "vat-id",
            title: "VAT ID",
            content: (
              <p>
                VAT identification number pursuant to § 27 a of the German VAT
                Act: <strong>DE314153136</strong>
              </p>
            ),
          },
          {
            id: "editorial",
            title: "Editorial responsibility",
            content: <p>Florian Cullmann, Stücks 32, 66871 Konken, Germany</p>,
          },
          {
            id: "dispute-resolution",
            title: "Consumer dispute resolution",
            content: (
              <p>
                We are neither willing nor obliged to participate in dispute
                resolution proceedings before a consumer arbitration board.
              </p>
            ),
          },
        ];

  return (
    <LegalPage
      title={locale === "de" ? "Impressum" : "Legal notice"}
      intro={
        locale === "de"
          ? "Anbieterkennzeichnung und gesetzlich vorgeschriebene Kontaktangaben."
          : "Provider identification and legally required contact information."
      }
      contentsLabel={locale === "de" ? "Auf dieser Seite" : "On this page"}
      sections={sections}
    />
  );
}

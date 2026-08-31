import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPage, type LegalSection } from "@/components/legal/legal-page";
import { isLocale } from "@/lib/i18n/config";
import { localizedAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/datenschutz">): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "de" ? "Datenschutzerklärung" : "Privacy policy",
    description:
      locale === "de"
        ? "Informationen zur Verarbeitung personenbezogener Daten auf fcullmann.com."
        : "Information about the processing of personal data on fcullmann.com.",
    alternates: isLocale(locale)
      ? localizedAlternates(locale, "datenschutz")
      : undefined,
  };
}

export default async function PrivacyPage({
  params,
}: PageProps<"/[locale]/datenschutz">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const sections: LegalSection[] =
    locale === "de"
      ? [
          {
            id: "ueberblick",
            title: "1. Datenschutz auf einen Blick",
            content: (
              <>
                <p>
                  Personenbezogene Daten sind alle Daten, mit denen Sie persönlich
                  identifiziert werden können. Beim Besuch dieser Website werden
                  nur die Daten verarbeitet, die für einen sicheren Betrieb, die
                  Nutzung der angebotenen Funktionen oder Ihre Kontaktaufnahme
                  erforderlich sind.
                </p>
                <p>
                  Dokumente und Eingaben, die Sie in den angebotenen Tools
                  verwenden, werden lokal in Ihrem Browser verarbeitet und nicht
                  an den Anwendungsserver übertragen.
                </p>
              </>
            ),
          },
          {
            id: "verantwortlicher",
            title: "2. Verantwortliche Stelle",
            content: (
              <address>
                Florian Cullmann
                <br />
                Röbelweg 47
                <br />
                66869 Kusel
                <br />
                Deutschland
                <br />
                Telefon: <a href="tel:+4917632811757">+49 176 32811757</a>
                <br />
                E-Mail:{" "}
                <a href="mailto:f.cullmann@apidego.de">
                  f.cullmann@apidego.de
                </a>
              </address>
            ),
          },
          {
            id: "hosting",
            title: "3. Hosting",
            content: (
              <>
                <p>
                  Wir hosten diese Website bei ALL-INKL.COM – Neue Medien Münnich,
                  Hauptstraße 68, 02742 Friedersdorf, Deutschland. Mit dem Anbieter
                  wurde ein Vertrag über Auftragsverarbeitung geschlossen.
                </p>
                <p>
                  Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f
                  DSGVO. Unser berechtigtes Interesse liegt in der sicheren,
                  schnellen und zuverlässigen Bereitstellung dieser Website.
                </p>
              </>
            ),
          },
          {
            id: "serverprotokolle",
            title: "4. Server-Protokolldaten",
            content: (
              <>
                <p>
                  Beim Aufruf der Website verarbeitet der Hostinganbieter technisch
                  erforderliche Protokolldaten. Dazu können IP-Adresse, Zeitpunkt
                  des Zugriffs, aufgerufene Adresse, übertragene Datenmenge,
                  Referrer, Browser und Betriebssystem gehören.
                </p>
                <p>
                  Die Daten werden zur sicheren und fehlerfreien Bereitstellung
                  sowie zur Abwehr von Missbrauch verarbeitet. Rechtsgrundlage ist
                  Art. 6 Abs. 1 lit. f DSGVO. Sie werden gelöscht oder anonymisiert,
                  sobald sie für diese Zwecke nicht mehr erforderlich sind und
                  keine gesetzlichen Pflichten entgegenstehen.
                </p>
              </>
            ),
          },
          {
            id: "tools",
            title: "5. Browser-Tools und anonyme Nutzungsstatistik",
            content: (
              <>
                <p>
                  Dateien, Texte und sonstige Inhalte, die Sie in den Tools öffnen
                  oder eingeben, verbleiben auf Ihrem Gerät. Die Verarbeitung und
                  die Erzeugung von Ergebnisdateien erfolgen im Browser.
                </p>
                <p>
                  Nach der Nutzung eines Tools kann ein anonymer Zähler aktualisiert
                  werden. Dabei speichern wir ausschließlich die Kennung des
                  verwendeten Tools und den Zeitpunkt. Inhalte, Dateinamen,
                  Benutzerkonten, Cookies oder dauerhafte Nutzerkennungen werden
                  dafür nicht gespeichert. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f
                  DSGVO; unser Interesse liegt in der bedarfsgerechten
                  Weiterentwicklung des Angebots.
                </p>
              </>
            ),
          },
          {
            id: "kontakt",
            title: "6. Kontaktaufnahme",
            content: (
              <p>
                Wenn Sie uns per E-Mail oder Telefon kontaktieren, verarbeiten wir
                Ihre Angaben zur Bearbeitung Ihrer Anfrage und möglicher
                Anschlussfragen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO,
                soweit es um einen Vertrag oder vorvertragliche Maßnahmen geht, im
                Übrigen Art. 6 Abs. 1 lit. f DSGVO. Die Daten werden gelöscht,
                sobald der Zweck entfällt und keine gesetzlichen
                Aufbewahrungspflichten entgegenstehen.
              </p>
            ),
          },
          {
            id: "cookies",
            title: "7. Cookies und lokale Speicherung",
            content: (
              <>
                <p>
                  Die öffentlich zugängliche Website verwendet keine Cookies oder
                  vergleichbaren Speichertechnologien und keine Analyse- oder
                  Werbedienste. Die ausgewählte Sprache ist Bestandteil der
                  aufgerufenen Adresse und wird nicht im Browser gespeichert. Ein
                  Einwilligungsbanner ist daher nicht erforderlich.
                </p>
                <p>
                  Ausschließlich der geschützte, nicht für Besucher bestimmte
                  Administrationsbereich verwendet bei der Anmeldung technisch
                  notwendige Sicherheits- und Sitzungscookies. Diese dienen der
                  Authentifizierung und dem Schutz vor missbräuchlichen Anfragen und
                  werden nicht zu Analyse- oder Werbezwecken eingesetzt.
                </p>
              </>
            ),
          },
          {
            id: "externe-dienste",
            title: "8. Schriftarten und externe Links",
            content: (
              <p>
                Schriftarten, Bilder und Programmbestandteile werden über unseren
                eigenen Webserver ausgeliefert. Eine Verbindung zu Anbietern
                externer Links entsteht erst, wenn Sie den jeweiligen Link
                aufrufen. Ab diesem Zeitpunkt gelten die Datenschutzbestimmungen
                des betreffenden Anbieters.
              </p>
            ),
          },
          {
            id: "rechte",
            title: "9. Ihre Rechte",
            content: (
              <>
                <p>
                  Sie haben im Rahmen der gesetzlichen Voraussetzungen das Recht
                  auf Auskunft, Berichtigung, Löschung, Einschränkung der
                  Verarbeitung und Datenübertragbarkeit. Sie können einer
                  Verarbeitung auf Grundlage berechtigter Interessen widersprechen
                  und eine erteilte Einwilligung jederzeit für die Zukunft
                  widerrufen.
                </p>
                <p>
                  Außerdem haben Sie das Recht, sich bei einer
                  Datenschutzaufsichtsbehörde zu beschweren. Zuständig ist
                  insbesondere die Aufsichtsbehörde Ihres gewöhnlichen
                  Aufenthaltsorts, Ihres Arbeitsplatzes oder des Orts des
                  mutmaßlichen Verstoßes.
                </p>
              </>
            ),
          },
          {
            id: "sicherheit",
            title: "10. Sicherheit und Werbewiderspruch",
            content: (
              <>
                <p>
                  Diese Website nutzt aus Sicherheitsgründen eine SSL- bzw.
                  TLS-Verschlüsselung.
                </p>
                <p>
                  Der Nutzung der im Rahmen der Impressumspflicht veröffentlichten
                  Kontaktdaten zur Übersendung nicht ausdrücklich angeforderter
                  Werbung wird widersprochen.
                </p>
              </>
            ),
          },
        ]
      : [
          {
            id: "overview",
            title: "1. Privacy at a glance",
            content: (
              <>
                <p>
                  Personal data is any information that can identify you. When you
                  visit this website, we process only the data required to operate
                  it securely, provide its functions, or respond when you contact
                  us.
                </p>
                <p>
                  Documents and inputs used in the tools are processed locally in
                  your browser and are not uploaded to the application server.
                </p>
              </>
            ),
          },
          {
            id: "controller",
            title: "2. Controller",
            content: (
              <address>
                Florian Cullmann
                <br />
                Röbelweg 47
                <br />
                66869 Kusel
                <br />
                Germany
                <br />
                Phone: <a href="tel:+4917632811757">+49 176 32811757</a>
                <br />
                Email:{" "}
                <a href="mailto:f.cullmann@apidego.de">
                  f.cullmann@apidego.de
                </a>
              </address>
            ),
          },
          {
            id: "hosting",
            title: "3. Hosting",
            content: (
              <>
                <p>
                  This website is hosted by ALL-INKL.COM – Neue Medien Münnich,
                  Hauptstraße 68, 02742 Friedersdorf, Germany. We have concluded a
                  data processing agreement with the provider.
                </p>
                <p>
                  Processing is based on Article 6(1)(f) GDPR. Our legitimate
                  interest is the secure, fast, and reliable provision of this
                  website.
                </p>
              </>
            ),
          },
          {
            id: "server-logs",
            title: "4. Server logs",
            content: (
              <>
                <p>
                  When the website is accessed, the hosting provider processes
                  technically necessary log data. This may include the IP address,
                  access time, requested address, amount of data transferred,
                  referrer, browser, and operating system.
                </p>
                <p>
                  The data is used to provide the website securely and without
                  errors and to prevent misuse. The legal basis is Article 6(1)(f)
                  GDPR. It is deleted or anonymised when no longer required for
                  these purposes and no statutory obligations prevent deletion.
                </p>
              </>
            ),
          },
          {
            id: "tools",
            title: "5. Browser tools and anonymous usage statistics",
            content: (
              <>
                <p>
                  Files, text, and other content opened or entered in the tools
                  remain on your device. Processing and generation of result files
                  take place in the browser.
                </p>
                <p>
                  After a tool is used, an anonymous counter may be updated. We
                  store only the identifier of the tool and the time of use. We do
                  not store content, file names, user accounts, cookies, or
                  persistent user identifiers for this purpose. The legal basis is
                  Article 6(1)(f) GDPR; our legitimate interest is improving the
                  service according to demand.
                </p>
              </>
            ),
          },
          {
            id: "contact",
            title: "6. Contact",
            content: (
              <p>
                If you contact us by email or phone, we process your information to
                handle the request and any follow-up questions. The legal basis is
                Article 6(1)(b) GDPR where a contract or pre-contractual measures
                are concerned, and otherwise Article 6(1)(f) GDPR. The data is
                deleted when its purpose no longer applies and no statutory
                retention requirements prevent deletion.
              </p>
            ),
          },
          {
            id: "cookies",
            title: "7. Cookies and local storage",
            content: (
              <>
                <p>
                  The public website uses no cookies or comparable storage
                  technologies and no analytics or advertising services. The
                  selected language is part of the page address and is not stored
                  in the browser. A consent banner is therefore not required.
                </p>
                <p>
                  Only the protected administration area, which is not intended for
                  visitors, uses technically necessary security and session cookies
                  when the operator signs in. They provide authentication and
                  protection against abusive requests and are not used for
                  analytics or advertising.
                </p>
              </>
            ),
          },
          {
            id: "external-services",
            title: "8. Fonts and external links",
            content: (
              <p>
                Fonts, images, and program components are served from our own web
                server. A connection to the provider of an external link is made
                only when you open that link. From that point, the privacy terms of
                the relevant provider apply.
              </p>
            ),
          },
          {
            id: "rights",
            title: "9. Your rights",
            content: (
              <>
                <p>
                  Subject to the statutory requirements, you have rights to access,
                  rectification, erasure, restriction of processing, and data
                  portability. You may object to processing based on legitimate
                  interests and withdraw consent at any time with future effect.
                </p>
                <p>
                  You also have the right to lodge a complaint with a data
                  protection supervisory authority, particularly in the country of
                  your habitual residence, place of work, or place of the alleged
                  infringement.
                </p>
              </>
            ),
          },
          {
            id: "security",
            title: "10. Security and unsolicited advertising",
            content: (
              <>
                <p>This website uses SSL or TLS encryption for security.</p>
                <p>
                  We object to the use of contact details published as part of our
                  legal notice for unsolicited advertising.
                </p>
              </>
            ),
          },
        ];

  return (
    <LegalPage
      title={locale === "de" ? "Datenschutzerklärung" : "Privacy policy"}
      intro={
        locale === "de"
          ? "Wie fcullmann.com Daten verarbeitet, welche Informationen lokal bleiben und welche Rechte Sie haben."
          : "How fcullmann.com processes data, which information stays local, and what rights you have."
      }
      updated={
        locale === "de"
          ? "Stand: 31. August 2026"
          : "Last updated: 31 August 2026"
      }
      contentsLabel={locale === "de" ? "Auf dieser Seite" : "On this page"}
      sections={sections}
    />
  );
}

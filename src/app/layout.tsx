import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import TopNav from "@/components/TopNav";
import SiteFooter from "@/components/SiteFooter";
import { INITIAL_NODES, type ModelNode } from "@/data/landscape";
import pkg from "../../package.json";

const SITE_URL = "https://www.mliphub.com";
const SITE_NAME = "MLIP Hub";
const SITE_DESCRIPTION =
  "MLIP Hub is an interactive, curated map of machine-learning interatomic potentials — equivariant, invariant, descriptor, and transformer-style foundation models — with their lineage, papers, and code.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} – Interatomic Potential Explorer`,
    template: `%s – ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "MLIP",
    "machine learning interatomic potential",
    "neural network potential",
    "equivariant",
    "invariant",
    "foundation model",
    "materials science",
    "computational chemistry",
    "molecular dynamics",
    "NequIP",
    "MACE",
    "Orb",
    "UMA",
    "eSEN",
  ],
  authors: [{ name: "Lule Laboratory", url: SITE_URL }],
  creator: "Lule Laboratory",
  publisher: "Lule Laboratory",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} – Interatomic Potential Explorer`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} – Interatomic Potential Explorer`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "science",
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
};

const THEME_INIT_SCRIPT = `(() => {
  try {
    const stored = window.localStorage.getItem('mliphub.theme');
    const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const useDark = stored === 'dark' || (!stored && sysDark);
    if (useDark) document.documentElement.classList.add('dark');
  } catch (_) {}
})();`;

const version = (pkg as { version: string }).version;

const models = INITIAL_NODES.filter((n): n is ModelNode => n.type === "node");

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      publisher: { "@id": `${SITE_URL}/#publisher` },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#publisher`,
      name: "Lule Laboratory",
      url: SITE_URL,
    },
    {
      "@type": "Dataset",
      "@id": `${SITE_URL}/#dataset`,
      name: `${SITE_NAME} landscape dataset`,
      description:
        "Curated dataset of machine-learning interatomic potentials with categories, lineage, code and paper links.",
      url: SITE_URL,
      version,
      license: "https://opensource.org/licenses/MIT",
      creator: { "@id": `${SITE_URL}/#publisher` },
      keywords: [
        "machine learning interatomic potential",
        "MLIP",
        "equivariant neural network",
        "foundation model",
        "materials science",
        "computational chemistry",
      ],
      distribution: [
        {
          "@type": "DataDownload",
          encodingFormat: "application/json",
          contentUrl: `${SITE_URL}/data/landscape-latest.json`,
        },
        {
          "@type": "DataDownload",
          encodingFormat: "text/csv",
          contentUrl: `${SITE_URL}/data/landscape-v${version}.csv`,
        },
      ],
    },
    {
      "@type": "ItemList",
      "@id": `${SITE_URL}/#model-list`,
      name: "Machine-learning interatomic potentials",
      numberOfItems: models.length,
      itemListElement: models.map((m, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        item: {
          "@type": "SoftwareSourceCode",
          name: m.label,
          description: m.desc,
          author: { "@type": "Organization", name: m.author },
          datePublished: String(m.year),
          codeRepository: m.githubUrl,
          url: m.paperUrl ?? m.githubUrl ?? SITE_URL,
          keywords: [m.category, ...(m.tags ?? [])].join(", "),
        },
      })),
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <TopNav />
        <main className="flex-1 min-h-0 flex flex-col">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

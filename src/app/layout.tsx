import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

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

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}

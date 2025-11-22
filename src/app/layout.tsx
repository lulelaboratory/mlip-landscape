import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";

export const metadata: Metadata = {
  title: "MLIP Landscape – Interatomic Potential Explorer",
  description:
    "Interactive landscape of machine-learning interatomic potentials: equivariant, invariant, descriptor and transformer-style foundation models.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900">
        {/* Google AdSense global script – will only run if you set the client ID */}
        {adsenseClient && (
          <Script
            id="adsense-script"
            async
            strategy="afterInteractive"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
          />
        )}
        {children}
      </body>
    </html>
  );
}

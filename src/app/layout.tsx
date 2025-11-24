import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "MLIP Hub – Interatomic Potential Explorer",
  description:
    "MLIP Hub: interactive map of machine-learning interatomic potentials across equivariant, invariant, descriptor, and transformer-style foundation models.",
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

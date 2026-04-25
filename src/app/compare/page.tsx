import type { Metadata } from "next";
import { INITIAL_NODES, type ModelNode } from "@/data/landscape";
import CompareView from "./CompareView";

export const metadata: Metadata = {
  title: "Compare models",
  description:
    "Compare selected machine-learning interatomic potentials side by side: year, category, license, frameworks, properties, training data, and tags.",
  alternates: { canonical: "/compare" },
};

export default function ComparePage() {
  const models = INITIAL_NODES.filter(
    (n): n is ModelNode => n.type === "node",
  );
  return (
    <section
      className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-8 sm:py-12 overflow-y-auto"
      aria-labelledby="compare-heading"
    >
      <header className="mb-6">
        <h1
          id="compare-heading"
          className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100"
        >
          Compare models
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Pick up to four models to view their metadata side by side. The URL
          updates as you change the selection so the comparison is shareable.
        </p>
      </header>
      <CompareView allModels={models} />
    </section>
  );
}

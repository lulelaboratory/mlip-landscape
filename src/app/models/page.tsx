import type { Metadata } from "next";
import { INITIAL_NODES, type ModelNode } from "@/data/landscape";
import ModelsTable from "./ModelsTable";

export const metadata: Metadata = {
  title: "All models – sortable table",
  description:
    "Tabular view of every machine-learning interatomic potential in MLIP Hub, with sortable columns for year, category, license, and maintenance status.",
  alternates: { canonical: "/models" },
};

export default function ModelsPage() {
  const models = INITIAL_NODES.filter(
    (n): n is ModelNode => n.type === "node",
  );
  return (
    <section
      className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-8 sm:py-12 overflow-y-auto"
      aria-labelledby="models-table-heading"
    >
      <header className="mb-6">
        <h1
          id="models-table-heading"
          className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100"
        >
          All models
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {models.length} machine-learning interatomic potentials. Click a
          column header to sort. Use the search to filter by name, author, tag,
          or category.
        </p>
      </header>
      <ModelsTable models={models} />
    </section>
  );
}

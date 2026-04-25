import type { Metadata } from "next";
import Link from "next/link";
import {
  getFieldCoverage,
  getModelNodes,
  getOverallFillPct,
} from "@/data/landscape-fill-status";

export const metadata: Metadata = {
  title: "Editorial Policy",
  description:
    "How MLIP Hub selects, reviews, and maintains entries. Read what qualifies as a node, how we review, and how to request corrections.",
  alternates: { canonical: "/policy" },
};

export default function PolicyPage() {
  const coverage = getFieldCoverage();
  const totalModels = getModelNodes().length;
  const overall = getOverallFillPct();

  return (
    <article className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-8 sm:py-12 prose-invert text-slate-800 dark:text-slate-200 overflow-y-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">Editorial Policy</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        What counts as a node, how often we review, and how to request a
        correction.
      </p>

      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">What qualifies as a node</h2>
        <p>
          Any published machine-learning interatomic potential with a public
          code repository is eligible. To merit its own node (versus a
          description inside a parent entry), a model must introduce a
          <em> distinct architecture, training dataset, or use case</em>. Minor
          version bumps or re-trainings are folded into their parent.
        </p>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">
          Distinct model vs. variant
        </h2>
        <p>
          If a model shares architecture and dataset with an existing entry and
          differs only in hyperparameters or training budget, we list it as a
          variant in the parent description — not as its own card. Forks with a
          genuinely new inductive bias or dataset get their own node.
        </p>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">Review cadence</h2>
        <p>
          Every entry carries a <code>lastReviewed</code> date. We aim to
          re-review each model at least once every 12 months, plus on any
          reported broken link or significant upstream change. Entries older
          than 12 months without a review surface in the coverage table below
          as candidates for refresh.
        </p>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">
          What &ldquo;maintained&rdquo; means
        </h2>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>
            <strong>active</strong> — commits, releases, or issue responses in
            the last 6 months.
          </li>
          <li>
            <strong>maintained</strong> — receives bug fixes and compatibility
            updates but no new features.
          </li>
          <li>
            <strong>archived</strong> — repository frozen or marked archived
            upstream.
          </li>
          <li>
            <strong>experimental</strong> — research code, may break; no
            maintenance commitment.
          </li>
        </ul>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">
          Required capability fields for new entries
        </h2>
        <p>
          Every new model card must declare three capability fields so that
          users searching the table or compare views by capability get
          reliable results:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>
            <code>supportsCharges</code> — <strong>boolean or <code>null</code></strong>.
            Whether the model can be conditioned on total or atomic charge.
          </li>
          <li>
            <code>supportsSpins</code> — <strong>boolean or <code>null</code></strong>.
            Whether the model can be conditioned on spin multiplicity or
            magnetic moments.
          </li>
          <li>
            <code>elementsCovered</code> — <strong>string or <code>null</code></strong>.
            An explicit list (<code>&ldquo;H, C, N, O&rdquo;</code>), a
            shorthand (<code>&ldquo;all elements up to Z=94&rdquo;</code>),
            or <code>&ldquo;—&rdquo;</code> when no information is available.
          </li>
        </ul>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Use <code>null</code> (or <code>&ldquo;—&rdquo;</code> for
          <code>elementsCovered</code>) only when the information is not
          documented in the model&rsquo;s paper or repository. Existing
          model cards without these fields are progressively being
          back-filled.
        </p>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">Corrections &amp; additions</h2>
        <p>
          To report a broken link, stale description, or request a new model,
          open an issue on the{" "}
          <a
            href="https://github.com/lulelaboratory/mlip-landscape/issues"
            className="underline text-blue-600 dark:text-blue-400"
            target="_blank"
            rel="noreferrer"
          >
            GitHub repository
          </a>{" "}
          or email{" "}
          <a
            href="mailto:support@mliphub.com"
            className="underline text-blue-600 dark:text-blue-400"
          >
            support@mliphub.com
          </a>
          . See{" "}
          <Link href="/contribute" className="underline text-blue-600 dark:text-blue-400">
            Contribute
          </Link>{" "}
          for the full workflow.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Metadata coverage</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          MLIP Hub is progressively filling richer metadata (domain coverage,
          license, framework support, maintenance status, last-reviewed date)
          across {totalModels} tracked models. Overall fill:{" "}
          <strong>{overall}%</strong>.
        </p>
        <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 text-sm">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900 text-left">
              <tr>
                <th className="px-3 py-2 font-medium">Field</th>
                <th className="px-3 py-2 font-medium">Filled</th>
                <th className="px-3 py-2 font-medium">Coverage</th>
              </tr>
            </thead>
            <tbody>
              {coverage.map((c) => (
                <tr
                  key={c.field}
                  className="border-t border-slate-200 dark:border-slate-800"
                >
                  <td className="px-3 py-2 font-mono">{c.field}</td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-400">
                    {c.filled}/{c.total}
                  </td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-400">
                    {c.pct}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </article>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contribute",
  description:
    "How to contribute to MLIP Hub — add a model, fix a link, improve a description, or help with curation.",
  alternates: { canonical: "/contribute" },
};

const GITHUB_REPO = "https://github.com/lulelaboratory/mlip-landscape";

export default function ContributePage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-8 sm:py-12 text-slate-800 dark:text-slate-200 overflow-y-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">Contribute</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        New models, corrections, and curation help are all welcome.
      </p>

      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">Quick ways to help</h2>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>
            <strong>Add a model</strong> — open a pull request editing{" "}
            <code>src/data/landscape.ts</code>.
          </li>
          <li>
            <strong>Report a broken link or stale description</strong> — open a
            GitHub issue.
          </li>
          <li>
            <strong>Fill in metadata</strong> — coverage, framework support,
            license, last-reviewed date. See the per-field coverage on the{" "}
            <Link
              href="/policy"
              className="underline text-blue-600 dark:text-blue-400"
            >
              Policy
            </Link>{" "}
            page.
          </li>
          <li>
            <strong>Suggest a new relationship</strong> — an edge between
            models.
          </li>
        </ul>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">Full contributor guide</h2>
        <p className="text-sm">
          The full workflow — data schema, coordinate system, URL conventions,
          the curator review bar, and PR checklist — lives in{" "}
          <a
            href={`${GITHUB_REPO}/blob/main/CONTRIBUTING.md`}
            className="underline text-blue-600 dark:text-blue-400"
            target="_blank"
            rel="noreferrer"
          >
            CONTRIBUTING.md
          </a>
          .
        </p>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">Before you open a PR</h2>
        <pre className="whitespace-pre bg-slate-100 dark:bg-slate-900 rounded-lg p-4 text-sm font-mono border border-slate-200 dark:border-slate-800">
npm run lint
npm run check:landscape
npm run build
        </pre>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          The same checks run in CI.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Get started</h2>
        <div className="flex flex-wrap gap-3 text-sm">
          <a
            href={`${GITHUB_REPO}/issues/new`}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            target="_blank"
            rel="noreferrer"
          >
            Open an issue
          </a>
          <a
            href={`${GITHUB_REPO}/fork`}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            target="_blank"
            rel="noreferrer"
          >
            Fork the repo
          </a>
          <a
            href="mailto:support@mliphub.com"
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Email us
          </a>
        </div>
      </section>
    </article>
  );
}

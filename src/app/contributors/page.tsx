import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contributors",
  description:
    "People behind MLIP Hub — citation authors and the broader contributor community.",
  alternates: { canonical: "/contributors" },
};

type Person = {
  name: string;
  role: string;
  orcid?: string;
  github?: string;
};

const CITATION_AUTHORS: Person[] = [
  {
    name: "Le Lu",
    role: "Maintainer, curator",
    github: "https://github.com/lulelaboratory",
  },
];

const CONTRIBUTORS: Person[] = [
  { name: "MLIP Hub contributors", role: "See GitHub graph" },
];

function PersonRow({ p }: { p: Person }) {
  return (
    <li className="py-2 flex flex-wrap items-baseline gap-x-2">
      <span className="font-medium text-slate-900 dark:text-slate-100">
        {p.name}
      </span>
      <span className="text-sm text-slate-500 dark:text-slate-400">
        — {p.role}
      </span>
      {p.orcid ? (
        <a
          href={`https://orcid.org/${p.orcid}`}
          className="text-xs underline text-blue-600 dark:text-blue-400"
          target="_blank"
          rel="noreferrer"
        >
          ORCID
        </a>
      ) : null}
      {p.github ? (
        <a
          href={p.github}
          className="text-xs underline text-blue-600 dark:text-blue-400"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
      ) : null}
    </li>
  );
}

export default function ContributorsPage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-8 sm:py-12 text-slate-800 dark:text-slate-200 overflow-y-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">Contributors</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
        We separate <strong>citation authors</strong> (appear in the formal
        citation and <code>CITATION.cff</code>) from the broader{" "}
        <strong>contributor community</strong> (everyone who has helped, code
        or otherwise).
      </p>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Citation authors</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
          These people appear in the formal citation of the current release.
          See{" "}
          <Link
            href="/cite"
            className="underline text-blue-600 dark:text-blue-400"
          >
            How to cite
          </Link>
          .
        </p>
        <ul className="divide-y divide-slate-200 dark:divide-slate-800 rounded-lg border border-slate-200 dark:border-slate-800 px-4">
          {CITATION_AUTHORS.map((p) => (
            <PersonRow key={p.name} p={p} />
          ))}
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Contributors</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
          Everyone who has contributed — including non-code work: curation
          review, documentation, model suggestions, bug reports, QA, and
          design. We recognize non-code contributions alongside code.
        </p>
        <ul className="divide-y divide-slate-200 dark:divide-slate-800 rounded-lg border border-slate-200 dark:border-slate-800 px-4">
          {CONTRIBUTORS.map((p) => (
            <PersonRow key={p.name} p={p} />
          ))}
        </ul>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
          The{" "}
          <a
            href="https://github.com/lulelaboratory/mlip-landscape/graphs/contributors"
            className="underline text-blue-600 dark:text-blue-400"
            target="_blank"
            rel="noreferrer"
          >
            GitHub contributors graph
          </a>{" "}
          shows up to the top 100 code committers whose commits reach the
          default branch. Non-code contributions and contributors with
          unlinked commit emails may be missing from that view; this page is
          the authoritative list.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">How to get listed</h2>
        <p className="text-sm">
          Add yourself or someone else via a pull request editing{" "}
          <code>CONTRIBUTORS.md</code> and (for citation authors){" "}
          <code>CITATION.cff</code>. Include role and ORCID where applicable.
          See{" "}
          <Link
            href="/contribute"
            className="underline text-blue-600 dark:text-blue-400"
          >
            Contribute
          </Link>
          .
        </p>
      </section>
    </article>
  );
}

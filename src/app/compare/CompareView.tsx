"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import type { ModelNode } from "@/data/landscape";

const MAX_COMPARE = 4;

type Field = {
  key: string;
  label: string;
  render: (m: ModelNode) => React.ReactNode;
};

const FIELDS: Field[] = [
  { key: "year", label: "Year", render: (m) => m.year },
  { key: "category", label: "Category", render: (m) => m.category },
  { key: "author", label: "Author / Org", render: (m) => m.author },
  {
    key: "license",
    label: "License",
    render: (m) => m.license ?? "—",
  },
  {
    key: "maintenance",
    label: "Maintenance",
    render: (m) => m.maintenance ?? "—",
  },
  {
    key: "lastReviewed",
    label: "Last reviewed",
    render: (m) => m.lastReviewed ?? "—",
  },
  {
    key: "frameworks",
    label: "Frameworks",
    render: (m) =>
      m.frameworks && m.frameworks.length > 0 ? m.frameworks.join(", ") : "—",
  },
  {
    key: "properties",
    label: "Properties",
    render: (m) =>
      m.properties && m.properties.length > 0 ? m.properties.join(", ") : "—",
  },
  {
    key: "coverage",
    label: "Coverage",
    render: (m) =>
      m.coverage && m.coverage.length > 0 ? m.coverage.join(", ") : "—",
  },
  {
    key: "useCases",
    label: "Use cases",
    render: (m) =>
      m.useCases && m.useCases.length > 0 ? m.useCases.join(", ") : "—",
  },
  {
    key: "trainingData",
    label: "Training data",
    render: (m) =>
      m.trainingData && m.trainingData.length > 0
        ? m.trainingData.join(", ")
        : "—",
  },
  {
    key: "tags",
    label: "Tags",
    render: (m) => (m.tags && m.tags.length > 0 ? m.tags.join(", ") : "—"),
  },
  {
    key: "links",
    label: "Links",
    render: (m) => (
      <div className="flex flex-col gap-1">
        {m.githubUrl && (
          <a
            href={m.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline text-xs break-all"
          >
            Code
          </a>
        )}
        {m.paperUrl && (
          <a
            href={m.paperUrl}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline text-xs break-all"
          >
            Paper
          </a>
        )}
        <Link
          href={`/?model=${encodeURIComponent(m.id)}`}
          className="text-blue-600 dark:text-blue-400 hover:underline text-xs"
        >
          Open in landscape
        </Link>
      </div>
    ),
  },
  {
    key: "desc",
    label: "Description",
    render: (m) => (
      <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
        {m.desc}
      </p>
    ),
  },
];

export default function CompareView({
  allModels,
}: {
  allModels: ModelNode[];
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const initialized = useRef(false);

  // Hydrate selection from ?models=a,b,c on first mount.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("models");
    if (raw) {
      const ids = raw
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      const matched = ids
        .map((needle) =>
          allModels.find(
            (m) =>
              m.id.toLowerCase() === needle ||
              m.label.toLowerCase() === needle,
          ),
        )
        .filter((m): m is ModelNode => Boolean(m))
        .slice(0, MAX_COMPARE);
      setSelectedIds(matched.map((m) => m.id));
    }
    initialized.current = true;
  }, [allModels]);

  // Reflect selection back to the URL so the comparison is shareable.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!initialized.current) return;
    const params = new URLSearchParams(window.location.search);
    if (selectedIds.length > 0) params.set("models", selectedIds.join(","));
    else params.delete("models");
    const next = params.toString();
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${next ? `?${next}` : ""}${window.location.hash}`,
    );
  }, [selectedIds]);

  const selected = useMemo(
    () =>
      selectedIds
        .map((id) => allModels.find((m) => m.id === id))
        .filter((m): m is ModelNode => Boolean(m)),
    [selectedIds, allModels],
  );

  const remaining = useMemo(
    () => allModels.filter((m) => !selectedIds.includes(m.id)),
    [allModels, selectedIds],
  );

  const addModel = (id: string) => {
    setSelectedIds((prev) =>
      prev.length >= MAX_COMPARE || prev.includes(id) ? prev : [...prev, id],
    );
  };

  const removeModel = (id: string) => {
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  };

  return (
    <div>
      <ModelPicker
        remaining={remaining}
        onAdd={addModel}
        full={selectedIds.length >= MAX_COMPARE}
      />

      {selected.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
          Add models above to start comparing.
        </p>
      ) : (
        <div
          className="mt-6 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800"
          tabIndex={0}
          role="region"
          aria-label="Side-by-side model comparison"
        >
          <table className="w-full text-sm text-left text-slate-700 dark:text-slate-200">
            <caption className="sr-only">
              Comparison of {selected.length} models.
            </caption>
            <thead className="text-xs uppercase tracking-wider bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th scope="col" className="px-3 py-2 font-semibold w-40">
                  Field
                </th>
                {selected.map((m) => (
                  <th
                    key={m.id}
                    scope="col"
                    className="px-3 py-2 font-semibold align-top min-w-[12rem]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/?model=${encodeURIComponent(m.id)}`}
                        className="text-slate-900 dark:text-slate-100 hover:underline"
                      >
                        {m.label}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeModel(m.id)}
                        aria-label={`Remove ${m.label} from comparison`}
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FIELDS.map((field) => (
                <tr
                  key={field.key}
                  className="border-b border-slate-100 dark:border-slate-800 last:border-0 align-top"
                >
                  <th
                    scope="row"
                    className="px-3 py-2 font-medium text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider"
                  >
                    {field.label}
                  </th>
                  {selected.map((m) => (
                    <td key={m.id} className="px-3 py-2">
                      {field.render(m)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ModelPicker({
  remaining,
  onAdd,
  full,
}: {
  remaining: ModelNode[];
  onAdd: (id: string) => void;
  full: boolean;
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return remaining.slice(0, 8);
    return remaining
      .filter((m) =>
        [m.label, m.author, m.category, ...(m.tags ?? [])]
          .join(" ")
          .toLowerCase()
          .includes(q),
      )
      .slice(0, 12);
  }, [remaining, query]);

  return (
    <div>
      <label className="block">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Add a model
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            full
              ? "Comparison full — remove a model to add another"
              : "Search a model name, author, or tag…"
          }
          aria-label="Search to add a model to the comparison"
          disabled={full}
          className="mt-1 w-full max-w-md px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
        />
      </label>
      {!full && (
        <ul className="mt-2 flex flex-wrap gap-2" aria-label="Suggestions">
          {filtered.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => onAdd(m.id)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                <Plus size={12} aria-hidden="true" /> {m.label}
                <span className="text-slate-400 dark:text-slate-500">
                  · {m.year}
                </span>
              </button>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="text-xs text-slate-500 dark:text-slate-400">
              No matches.
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

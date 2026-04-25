"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, GitCompare, Search } from "lucide-react";
import type { ModelNode } from "@/data/landscape";

type SortKey = "label" | "year" | "category" | "license" | "maintenance";
type SortDir = "asc" | "desc";

const MAX_COMPARE = 4;

type ChargeSpinFilter = "any" | "yes" | "no" | "unknown";

const matchesChargeSpinFilter = (
  filter: ChargeSpinFilter,
  value: boolean | null | undefined,
): boolean => {
  if (filter === "any") return true;
  if (filter === "yes") return value === true;
  if (filter === "no") return value === false;
  // unknown: covers undefined, null, and the explicit "—" sentinel.
  return value === undefined || value === null;
};

const COLUMNS: ReadonlyArray<{
  key: SortKey;
  label: string;
  align?: "left" | "right";
  className?: string;
}> = [
  { key: "label", label: "Model" },
  { key: "year", label: "Year", align: "right" },
  { key: "category", label: "Category" },
  { key: "license", label: "License" },
  { key: "maintenance", label: "Maintenance" },
];

const compareNullable = (a: string | undefined, b: string | undefined) => {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return a.localeCompare(b);
};

export default function ModelsTable({ models }: { models: ModelNode[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("year");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [query, setQuery] = useState("");
  const [compareSelection, setCompareSelection] = useState<string[]>([]);
  const [chargesFilter, setChargesFilter] = useState<ChargeSpinFilter>("any");
  const [spinsFilter, setSpinsFilter] = useState<ChargeSpinFilter>("any");
  const [elementsFilter, setElementsFilter] = useState<string>("");

  const toggleCompare = (id: string) => {
    setCompareSelection((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  };

  const onSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "year" ? "desc" : "asc");
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const elementsQ = elementsFilter.trim().toLowerCase();
    return models.filter((m) => {
      if (q) {
        const haystack = [
          m.label,
          m.author,
          m.category,
          m.license ?? "",
          m.maintenance ?? "",
          String(m.year),
          m.elementsCovered ?? "",
          ...(m.tags ?? []),
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (!matchesChargeSpinFilter(chargesFilter, m.supportsCharges)) {
        return false;
      }
      if (!matchesChargeSpinFilter(spinsFilter, m.supportsSpins)) {
        return false;
      }
      if (elementsQ) {
        const cov = (m.elementsCovered ?? "").toLowerCase();
        // Split the user's query on commas/spaces so e.g. "C, N, O" matches
        // any model whose elementsCovered string contains all three tokens.
        const tokens = elementsQ
          .split(/[,\s]+/)
          .map((t) => t.trim())
          .filter(Boolean);
        if (tokens.length === 0) return true;
        if (!tokens.every((t) => cov.includes(t))) return false;
      }
      return true;
    });
  }, [models, query, chargesFilter, spinsFilter, elementsFilter]);

  const sorted = useMemo(() => {
    const next = [...filtered];
    next.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "label":
          cmp = a.label.localeCompare(b.label);
          break;
        case "year":
          cmp = a.year - b.year;
          break;
        case "category":
          cmp = a.category.localeCompare(b.category);
          break;
        case "license":
          cmp = compareNullable(a.license, b.license);
          break;
        case "maintenance":
          cmp = compareNullable(a.maintenance, b.maintenance);
          break;
      }
      if (cmp === 0) cmp = a.label.localeCompare(b.label);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return next;
  }, [filtered, sortKey, sortDir]);

  return (
    <div>
      <label className="block mb-4">
        <span className="sr-only">Filter models</span>
        <span className="relative block max-w-sm">
          <Search
            size={14}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by name, author, tag…"
            aria-label="Filter the model table by name, author, category, license, tag, or elements covered"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500"
          />
        </span>
      </label>

      <div
        role="group"
        aria-label="Capability filters"
        className="mb-4 flex flex-wrap items-end gap-3 text-sm"
      >
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Supports charges
          </span>
          <select
            value={chargesFilter}
            onChange={(e) => setChargesFilter(e.target.value as ChargeSpinFilter)}
            aria-label="Filter models by whether they support charges"
            className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500"
          >
            <option value="any">Any</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
            <option value="unknown">Unknown / —</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Supports spins
          </span>
          <select
            value={spinsFilter}
            onChange={(e) => setSpinsFilter(e.target.value as ChargeSpinFilter)}
            aria-label="Filter models by whether they support spins"
            className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500"
          >
            <option value="any">Any</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
            <option value="unknown">Unknown / —</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Elements covered contains
          </span>
          <input
            type="search"
            value={elementsFilter}
            onChange={(e) => setElementsFilter(e.target.value)}
            placeholder="e.g. H, C, N or '89 elements'"
            aria-label="Filter models whose elements covered contains all of these tokens"
            className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 min-w-[14rem]"
          />
        </label>
      </div>

      <div
        className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800"
        role="region"
        aria-label="Sortable table of MLIP models"
        tabIndex={0}
      >
        <table className="w-full text-sm text-left text-slate-700 dark:text-slate-200">
          <caption className="sr-only">
            All MLIP models, with sortable columns for model name, release year,
            architecture category, software license, and maintenance status.
            Showing {sorted.length} of {models.length} models.
          </caption>
          <thead className="text-xs uppercase tracking-wider bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th scope="col" className="px-3 py-2 w-8">
                <span className="sr-only">Compare</span>
              </th>
              {COLUMNS.map((col) => {
                const isActive = sortKey === col.key;
                const ariaSort: "ascending" | "descending" | "none" = isActive
                  ? sortDir === "asc"
                    ? "ascending"
                    : "descending"
                  : "none";
                const Indicator = isActive
                  ? sortDir === "asc"
                    ? ArrowUp
                    : ArrowDown
                  : ArrowUpDown;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={ariaSort}
                    className={`px-3 py-2 font-semibold ${
                      col.align === "right" ? "text-right" : "text-left"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onSort(col.key)}
                      className={`inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded ${
                        col.align === "right" ? "justify-end w-full" : ""
                      }`}
                      aria-label={`Sort by ${col.label} ${
                        isActive
                          ? sortDir === "asc"
                            ? "descending"
                            : "ascending"
                          : "ascending"
                      }`}
                    >
                      {col.label}
                      <Indicator
                        size={12}
                        aria-hidden="true"
                        className={isActive ? "opacity-90" : "opacity-40"}
                      />
                    </button>
                  </th>
                );
              })}
              <th scope="col" className="px-3 py-2 font-semibold">
                Charges
              </th>
              <th scope="col" className="px-3 py-2 font-semibold">
                Spins
              </th>
              <th scope="col" className="px-3 py-2 font-semibold">
                Elements covered
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td
                  colSpan={COLUMNS.length + 4}
                  className="px-3 py-6 text-center text-slate-500 dark:text-slate-400"
                >
                  No models match that search.
                </td>
              </tr>
            )}
            {sorted.map((m) => {
              const checked = compareSelection.includes(m.id);
              const disabled =
                !checked && compareSelection.length >= MAX_COMPARE;
              return (
              <tr
                key={m.id}
                className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900/60"
                itemScope
                itemType="https://schema.org/SoftwareSourceCode"
              >
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => toggleCompare(m.id)}
                    aria-label={`Add ${m.label} to comparison`}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-400 dark:border-slate-600 dark:bg-slate-800 disabled:opacity-40"
                  />
                </td>
                <th
                  scope="row"
                  className="px-3 py-2 font-medium text-slate-900 dark:text-slate-100"
                >
                  <Link
                    href={`/?model=${encodeURIComponent(m.id)}`}
                    className="hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded"
                    itemProp="name"
                  >
                    {m.label}
                  </Link>
                  <div
                    className="text-xs text-slate-500 dark:text-slate-400 font-normal"
                    itemProp="author"
                  >
                    {m.author}
                  </div>
                </th>
                <td className="px-3 py-2 text-right tabular-nums">
                  <time itemProp="datePublished" dateTime={String(m.year)}>
                    {m.year}
                  </time>
                </td>
                <td className="px-3 py-2" itemProp="applicationCategory">
                  {m.category}
                </td>
                <td
                  className="px-3 py-2 text-slate-600 dark:text-slate-300"
                  itemProp="license"
                >
                  {m.license ?? (
                    <span className="text-slate-400 dark:text-slate-500">—</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {m.maintenance ? (
                    <MaintenanceBadge status={m.maintenance} />
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500">—</span>
                  )}
                </td>
                <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
                  <BoolCell value={m.supportsCharges} />
                </td>
                <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
                  <BoolCell value={m.supportsSpins} />
                </td>
                <td className="px-3 py-2 text-slate-600 dark:text-slate-300 max-w-[18rem] whitespace-normal">
                  {m.elementsCovered ? (
                    m.elementsCovered
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500">—</span>
                  )}
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        Showing {sorted.length} of {models.length} models. Click a model name to
        open it in the interactive landscape. Tick the checkboxes to compare
        models side by side.
      </p>

      {compareSelection.length > 0 && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl shadow-slate-900/10 dark:shadow-slate-950/40"
        >
          <span className="text-sm text-slate-700 dark:text-slate-200">
            {compareSelection.length} selected
            <span className="text-slate-400 dark:text-slate-500">
              {" "}/ {MAX_COMPARE}
            </span>
          </span>
          <button
            type="button"
            onClick={() => setCompareSelection([])}
            className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Clear
          </button>
          <Link
            href={`/compare?models=${compareSelection.map(encodeURIComponent).join(",")}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <GitCompare size={14} aria-hidden="true" /> Compare
          </Link>
        </div>
      )}
    </div>
  );
}

function BoolCell({ value }: { value: boolean | null | undefined }) {
  if (value === true) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200">
        yes
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
        no
      </span>
    );
  }
  return <span className="text-slate-400 dark:text-slate-500">—</span>;
}

function MaintenanceBadge({
  status,
}: {
  status: NonNullable<ModelNode["maintenance"]>;
}) {
  const styles: Record<typeof status, string> = {
    active:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200",
    maintained:
      "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-200",
    archived:
      "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    experimental:
      "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

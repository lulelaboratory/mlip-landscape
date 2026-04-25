"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  HelpCircle,
  KeySquare,
  MousePointerClick,
  Palette,
  Search,
  X,
} from "lucide-react";

const STORAGE_KEY = "mliphub.tourSeen";

type Step = {
  title: string;
  body: React.ReactNode;
  Icon: typeof Search;
};

const STEPS: Step[] = [
  {
    title: "Welcome to MLIP Hub",
    Icon: HelpCircle,
    body: (
      <p>
        MLIP Hub is an interactive map of machine-learning interatomic
        potentials. Each card is a model; arrows show how architectures
        influenced each other. Take a quick tour, or skip to the graph.
      </p>
    ),
  },
  {
    title: "Color legend",
    Icon: Palette,
    body: (
      <div className="space-y-2">
        <p>Cards are color-coded by architectural family:</p>
        <ul className="space-y-1 text-sm">
          <li className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-400" aria-hidden="true" />
            <span>
              <strong>Equivariant</strong> — E(3) message-passing models
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-400" aria-hidden="true" />
            <span>
              <strong>Invariant</strong> — speed-oriented graph networks
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-400" aria-hidden="true" />
            <span>
              <strong>Transformer</strong> — attention-based potentials
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-400" aria-hidden="true" />
            <span>
              <strong>Descriptor</strong> — symmetry-function / kernel methods
            </span>
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: "Search and filter",
    Icon: Search,
    body: (
      <p>
        Type in the search box to filter by name, author, year, category, or
        tag. The category buttons toggle a single architectural family. Both
        the search query and the selected category live in the URL so views
        are shareable.
      </p>
    ),
  },
  {
    title: "Graph interactions",
    Icon: MousePointerClick,
    body: (
      <ul className="space-y-1 text-sm list-disc list-inside">
        <li>Click a card to open its details panel.</li>
        <li>Drag the background to pan, use the zoom buttons to scale.</li>
        <li>
          <span className="inline-flex items-center gap-1 align-middle">
            <KeySquare size={14} aria-hidden="true" /> Tab into the graph and
            use arrow keys
          </span>{" "}
          to move between models without a mouse.
        </li>
        <li>Press Escape to close the details panel.</li>
      </ul>
    ),
  },
];

export default function OnboardingTour() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  // On first visit, auto-open the tour. Subsequent visits stay closed unless
  // the user explicitly clicks the Help button.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = window.localStorage.getItem(STORAGE_KEY);
    if (!seen) setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setStep(0);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "1");
    }
  }, []);

  const reopen = useCallback(() => {
    setStep(0);
    setOpen(true);
  }, []);

  // ESC closes the dialog; focus the dialog when it opens.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handler);
    dialogRef.current?.focus();
    return () => window.removeEventListener("keydown", handler);
  }, [open, close]);

  const current = STEPS[step];
  const Icon = current.Icon;
  const isLast = step === STEPS.length - 1;

  return (
    <>
      <button
        type="button"
        onClick={reopen}
        aria-label="Open the guided tour"
        className="fixed bottom-4 right-4 z-30 inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur text-slate-700 dark:text-slate-200 shadow-lg shadow-slate-900/10 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
      >
        <HelpCircle size={16} aria-hidden="true" /> Tour
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center px-4"
          role="presentation"
        >
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={close}
            aria-hidden="true"
          />
          <div
            ref={dialogRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="tour-title"
            aria-describedby="tour-body"
            className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-700 p-6 focus:outline-none"
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close tour"
              className="absolute top-3 right-3 w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 flex items-center justify-center"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-200 flex items-center justify-center">
                <Icon size={18} aria-hidden="true" />
              </div>
              <h2
                id="tour-title"
                className="text-lg font-bold text-slate-900 dark:text-slate-100"
              >
                {current.title}
              </h2>
            </div>

            <div
              id="tour-body"
              className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed"
            >
              {current.body}
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <div
                className="flex items-center gap-1.5"
                role="tablist"
                aria-label="Tour progress"
              >
                {STEPS.map((s, i) => (
                  <button
                    key={s.title}
                    type="button"
                    role="tab"
                    aria-selected={i === step}
                    aria-label={`Step ${i + 1}: ${s.title}`}
                    onClick={() => setStep(i)}
                    className={`w-2 h-2 rounded-full transition ${
                      i === step
                        ? "bg-blue-600 dark:bg-blue-400"
                        : "bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600"
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold"
                  >
                    <ArrowLeft size={14} aria-hidden="true" /> Back
                  </button>
                )}
                {isLast ? (
                  <button
                    type="button"
                    onClick={close}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
                  >
                    Got it
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      setStep((s) => Math.min(STEPS.length - 1, s + 1))
                    }
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
                  >
                    Next <ArrowRight size={14} aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>

            {step === 0 && (
              <button
                type="button"
                onClick={close}
                className="mt-3 text-xs text-slate-500 dark:text-slate-400 hover:underline"
              >
                Skip tour
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

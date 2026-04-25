"use client";

import { useEffect, useRef, useState } from "react";
import { Github, Mail, MessageSquare, X } from "lucide-react";

const SUPPORT_EMAIL = "support@mliphub.com";
const GITHUB_REPO = "https://github.com/lulelaboratory/mlip-landscape";

export default function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    dialogRef.current?.focus();
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  const pageUrl =
    typeof window !== "undefined" ? window.location.href : "https://www.mliphub.com";

  const issueParams = new URLSearchParams({
    title: "[feedback] ",
    body: `Page: ${pageUrl}\n\nDescribe the correction or suggestion:\n`,
    labels: "feedback",
  });
  const issueUrl = `${GITHUB_REPO}/issues/new?${issueParams.toString()}`;

  const mailtoUrl = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
    "MLIP Hub feedback",
  )}&body=${encodeURIComponent(`Page: ${pageUrl}\n\nFeedback:\n`)}`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Send feedback or report a correction"
        className="fixed bottom-4 left-4 z-30 inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur text-slate-700 dark:text-slate-200 shadow-lg shadow-slate-900/10 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
      >
        <MessageSquare size={16} aria-hidden="true" /> Feedback
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center px-4"
          role="presentation"
        >
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={dialogRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-title"
            className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-700 p-6 focus:outline-none"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close feedback dialog"
              className="absolute top-3 right-3 w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 flex items-center justify-center"
            >
              <X size={16} />
            </button>

            <h2
              id="feedback-title"
              className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2"
            >
              Send feedback
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-5">
              Spotted a wrong link, missing model, or want to suggest one?
              Reach us by email if you don&apos;t have a GitHub account, or
              open an issue directly.
            </p>

            <div className="space-y-2">
              <a
                href={mailtoUrl}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
              >
                <Mail size={18} className="text-blue-600 dark:text-blue-400" aria-hidden="true" />
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Email us
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {SUPPORT_EMAIL} — no account required
                  </div>
                </div>
              </a>
              <a
                href={issueUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
              >
                <Github size={18} className="text-slate-800 dark:text-slate-200" aria-hidden="true" />
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Open a GitHub issue
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Requires a GitHub account; redirects to login if needed
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

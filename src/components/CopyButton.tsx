"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

type Props = {
  value: string;
  ariaLabel: string;
  className?: string;
};

export default function CopyButton({ value, ariaLabel, className }: Props) {
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can fail in non-secure contexts; fall back silently.
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-200 bg-white/90 text-xs font-semibold text-slate-600 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition dark:border-slate-700 dark:bg-slate-800/90 dark:text-slate-300 dark:hover:bg-slate-700 ${className ?? ""}`}
    >
      {copied ? (
        <>
          <Check size={12} aria-hidden="true" /> Copied
        </>
      ) : (
        <>
          <Copy size={12} aria-hidden="true" /> Copy
        </>
      )}
    </button>
  );
}

import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="shrink-0 w-full border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 py-3 px-4 flex flex-wrap justify-center items-center gap-x-4 gap-y-1">
      <span>
        Questions or suggestions? Contact
        <a
          href="mailto:support@mliphub.com"
          className="ml-1 text-slate-700 dark:text-slate-200 font-medium hover:underline"
        >
          support@mliphub.com
        </a>
      </span>
      <span aria-hidden="true" className="hidden sm:inline">
        ·
      </span>
      <Link
        href="/cite"
        className="text-slate-700 dark:text-slate-200 font-medium hover:underline"
      >
        How to cite
      </Link>
      <span aria-hidden="true" className="hidden sm:inline">
        ·
      </span>
      <Link
        href="/policy"
        className="text-slate-700 dark:text-slate-200 font-medium hover:underline"
      >
        Editorial policy
      </Link>
    </footer>
  );
}

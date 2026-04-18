import MLIPExplorer from "@/components/MLIPExplorer";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <MLIPExplorer />
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 py-3 px-4 flex justify-center">
        <span className="text-center">
          Questions or suggestions? Contact
          <a
            href="mailto:support@mliphub.com"
            className="ml-1 text-slate-700 dark:text-slate-200 font-medium hover:underline"
          >
            support@mliphub.com
          </a>
        </span>
      </footer>
    </div>
  );
}

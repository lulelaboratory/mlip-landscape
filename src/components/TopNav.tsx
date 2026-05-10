import Link from "next/link";
import { Layers, Menu } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

type NavLink = { href: string; label: string };

const LINKS: NavLink[] = [
  { href: "/", label: "Explore" },
  { href: "/models", label: "Table" },
  { href: "/compare", label: "Compare" },
  { href: "/learn", label: "Learn MLIPs" },
  { href: "/cite", label: "Cite" },
  { href: "/contributors", label: "Contributors" },
  { href: "/contribute", label: "Contribute" },
  { href: "/policy", label: "Policy" },
];

export default function TopNav() {
  return (
    <header
      // z-30 keeps the header (and its mobile dropdown nav) above the
      // explore-page filter panel — that filter card sits at z-20 inside
      // the canvas and was previously winning the tie because it comes
      // later in the DOM. The dropdown's own z-30 lives inside the
      // header's stacking context, so the parent z-index is what
      // actually decides whether the menu can paint over the filter on
      // small screens. We deliberately match (not exceed) the mobile
      // detail drawer's z-30 so opening a model still slides the drawer
      // over the header — same behaviour as before.
      className="shrink-0 relative z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-slate-950/50"
      // Honour the safe-area inset on landscape iPhone so the nav doesn't
      // hide behind the notch. Insets are 0 on desktops, so this is a
      // no-op on PCs and a fix on phones.
      style={{
        paddingLeft: "env(safe-area-inset-left, 0)",
        paddingRight: "env(safe-area-inset-right, 0)",
      }}
    >
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <Link
          href="/"
          className="flex items-center gap-3 shrink-0 min-w-0 group"
          aria-label="MLIP Hub home"
        >
          <div className="bg-blue-600 text-white p-2 rounded-lg shadow-lg shadow-blue-200 dark:shadow-blue-900/40 group-hover:bg-blue-700 transition shrink-0">
            <Layers size={20} />
          </div>
          <div className="leading-tight min-w-0">
            <div className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 truncate">
              MLIP Hub
            </div>
            <div className="text-[0.6875rem] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
              Interatomic Potential Explorer
            </div>
          </div>
        </Link>

        <nav
          aria-label="Primary"
          className="hidden md:flex items-center gap-1 text-sm"
        >
          {LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-3 py-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <details className="md:hidden relative">
            <summary
              aria-label="Open menu"
              className="list-none cursor-pointer w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <Menu size={16} />
            </summary>
            <nav
              aria-label="Primary mobile"
              className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900 z-30"
            >
              {LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 first:rounded-t-lg last:rounded-b-lg"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n";

interface MobileMenuProps {
  currentPage: "home" | "builds" | "championBuilds";
  locale: string;
}

const pages = [
  { key: "home" as const, href: "/", labelKey: "nav.home" as const },
  { key: "builds" as const, href: "/builds", labelKey: "nav.builds" as const },
  { key: "championBuilds" as const, href: "/champion-builds", labelKey: "nav.championBuilds" as const },
] as const;

export function MobileMenu({ currentPage, locale }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const { t } = useLocale();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Menu"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {open ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </>
          ) : (
            <>
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </>
          )}
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-50 bg-card border border-border rounded shadow-lg py-1 min-w-[180px]">
            {pages.map((page) => (
              page.key === currentPage ? (
                <span
                  key={page.key}
                  className="block text-sm px-3 py-2 bg-secondary/50 text-foreground font-medium"
                >
                  {t(page.labelKey)}
                </span>
              ) : (
                <Link
                  key={page.key}
                  href={page.href}
                  onClick={() => setOpen(false)}
                  className="block text-sm px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                >
                  {t(page.labelKey)}
                </Link>
              )
            ))}
          </div>
        </>
      )}
    </div>
  );
}

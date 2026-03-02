"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, LocaleProvider } from "@/lib/i18n";
import { ThemeToggle } from "@/components/theme-toggle";
import { SiteFooter } from "@/components/site-footer";

function MobileInfoMenu({ locale }: { locale: string }) {
  const [open, setOpen] = useState(false);
  const { t } = useLocale();

  return (
    <div className="relative sm:hidden">
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
          <div className="absolute left-0 top-full mt-1 z-50 bg-card border border-border rounded shadow-lg py-1 min-w-[160px]">
            <Link href="/" onClick={() => setOpen(false)} className="block text-sm px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
              {t("nav.home")}
            </Link>
            <Link href="/about" onClick={() => setOpen(false)} className="block text-sm px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
              {t("footer.about")}
            </Link>
            <Link href="/how-to-use" onClick={() => setOpen(false)} className="block text-sm px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
              {t("footer.howToUse")}
            </Link>
            <Link href="/faq" onClick={() => setOpen(false)} className="block text-sm px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
              {t("footer.faq")}
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function PageLayoutInner({ children }: { children: React.ReactNode }) {
  const { locale, setLocale, t } = useLocale();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-background border-b border-border font-[family-name:var(--font-space-grotesk)]">
        <div className="max-w-[1600px] mx-auto px-2 sm:px-4 h-10 flex items-center justify-between">
          <div className="flex gap-1 items-center">
            <MobileInfoMenu locale={locale} />
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm px-2.5 py-1 rounded text-[#C89B3C] font-bold hover:bg-secondary/50 transition-colors"
            >
              <img src="/logo.png" alt="" className="w-5 h-5 rounded" />
              LoL Build Sim
            </Link>
            <nav className="hidden sm:flex gap-1 items-center">
              <Link
                href="/about"
                className="text-sm px-2.5 py-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
              >
                {t("footer.about")}
              </Link>
              <Link
                href="/how-to-use"
                className="text-sm px-2.5 py-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
              >
                {t("footer.howToUse")}
              </Link>
              <Link
                href="/faq"
                className="text-sm px-2.5 py-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
              >
                {t("footer.faq")}
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setLocale(locale === "ja" ? "en" : "ja")}
              className="text-xs px-1.5 sm:px-2 py-1 rounded bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border transition-colors"
            >
              {locale === "ja" ? "EN" : "JP"}
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto px-4 py-8 w-full">
        {children}
      </main>

      <SiteFooter />
    </div>
  );
}

export function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <PageLayoutInner>{children}</PageLayoutInner>
    </LocaleProvider>
  );
}

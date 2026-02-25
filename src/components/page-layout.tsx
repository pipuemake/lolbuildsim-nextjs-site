"use client";

import Link from "next/link";
import { useLocale, LocaleProvider } from "@/lib/i18n";
import { ThemeToggle } from "@/components/theme-toggle";
import { SiteFooter } from "@/components/site-footer";

function PageLayoutInner({ children }: { children: React.ReactNode }) {
  const { locale, setLocale, t } = useLocale();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-background border-b border-border font-[family-name:var(--font-space-grotesk)]">
        <div className="max-w-[1600px] mx-auto px-4 h-10 flex items-center justify-between">
          <nav className="flex gap-1 items-center">
            <Link
              href="/"
              className="text-sm px-2.5 py-1 rounded text-[#C89B3C] font-bold hover:bg-secondary/50 transition-colors"
            >
              LoL Build Sim
            </Link>
            <Link
              href="/about"
              className="text-sm px-2.5 py-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            >
              {t("footer.about")}
            </Link>
            <Link
              href="/how-to-use"
              className="text-sm px-2.5 py-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors hidden sm:inline-block"
            >
              {t("footer.howToUse")}
            </Link>
            <Link
              href="/faq"
              className="text-sm px-2.5 py-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors hidden sm:inline-block"
            >
              {t("footer.faq")}
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLocale(locale === "ja" ? "en" : "ja")}
              className="text-xs px-2 py-1 rounded bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border transition-colors"
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

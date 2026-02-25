"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n";

export function SiteFooter() {
  const { t } = useLocale();

  return (
    <footer className="border-t border-border mt-8">
      <div className="max-w-[1600px] mx-auto px-4 py-6">
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-4 text-sm">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("footer.top")}
          </Link>
          <Link
            href="/about"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("footer.about")}
          </Link>
          <Link
            href="/how-to-use"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("footer.howToUse")}
          </Link>
          <Link
            href="/faq"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("footer.faq")}
          </Link>
          <Link
            href="/privacy"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("footer.privacy")}
          </Link>
          <Link
            href="/contact"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("footer.contact")}
          </Link>
        </nav>
        <div className="text-center text-xs text-muted-foreground/50">
          {t("footer.disclaimer")}
        </div>
      </div>
    </footer>
  );
}

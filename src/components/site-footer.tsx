"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n";

const FEEDBACK_FORM_URL = {
  en: "https://docs.google.com/forms/d/e/1FAIpQLSc1DWWx8Jo9MNKh_vXZiTLBPLLGCmQw_ZLrEZiBk24sHCSHNQ/viewform?embedded=true",
  ja: "https://docs.google.com/forms/d/e/1FAIpQLSe_tEwPDuo1sHsA-33uM2NJ3AB4zFyPnnlJfMRKSW6pQ9h9lg/viewform?embedded=true",
};

export function SiteFooter() {
  const { locale, t } = useLocale();

  const formUrl = FEEDBACK_FORM_URL[locale] ?? FEEDBACK_FORM_URL.en;

  return (
    <footer className="border-t border-border mt-8">
      <div className="max-w-[1600px] mx-auto px-4 py-6">
        {/* Feedback form */}
        <div className="mb-6">
          <h3 className="text-center text-sm font-semibold text-muted-foreground mb-3">
            {locale === "ja" ? "フィードバック / アンケート" : "Feedback / Survey"}
          </h3>
          <div className="flex justify-center">
            <iframe
              src={formUrl}
              width="100%"
              height="600"
              className="max-w-2xl w-full rounded border border-border"
              title={locale === "ja" ? "フィードバックフォーム" : "Feedback Form"}
            >
              Loading…
            </iframe>
          </div>
        </div>

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
          <Link
            href="/support"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("footer.support")}
          </Link>
        </nav>
        <div className="text-center text-xs text-muted-foreground/50">
          {t("footer.disclaimer")}
        </div>
      </div>
    </footer>
  );
}

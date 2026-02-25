"use client";

import { useLocale } from "@/lib/i18n";
import { PageLayout } from "@/components/page-layout";

function FAQContent() {
  const { t } = useLocale();

  const items = [
    { q: t("faq.q1"), a: t("faq.a1") },
    { q: t("faq.q2"), a: t("faq.a2") },
    { q: t("faq.q3"), a: t("faq.a3") },
    { q: t("faq.q4"), a: t("faq.a4") },
    { q: t("faq.q5"), a: t("faq.a5") },
    { q: t("faq.q6"), a: t("faq.a6") },
    { q: t("faq.q7"), a: t("faq.a7") },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-[#C89B3C] font-[family-name:var(--font-playfair)]">
        {t("faq.title")}
      </h1>
      <div className="space-y-6">
        {items.map((item, i) => (
          <div key={i} className="lol-card p-4 space-y-2">
            <h2 className="text-sm font-semibold text-foreground">
              Q. {item.q}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A. {item.a}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FAQPage() {
  return (
    <PageLayout>
      <FAQContent />
    </PageLayout>
  );
}

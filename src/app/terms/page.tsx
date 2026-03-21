"use client";

import { useLocale } from "@/lib/i18n";
import { PageLayout } from "@/components/page-layout";

function TermsContent() {
  const { t } = useLocale();

  const sections = [
    { title: t("terms.usage.title"), body: t("terms.usage.body") },
    { title: t("terms.riotApi.title"), body: t("terms.riotApi.body") },
    { title: t("terms.accuracy.title"), body: t("terms.accuracy.body") },
    { title: t("terms.prohibited.title"), body: t("terms.prohibited.body") },
    { title: t("terms.liability.title"), body: t("terms.liability.body") },
    { title: t("terms.changes.title"), body: t("terms.changes.body") },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-[#C89B3C] font-[family-name:var(--font-playfair)]">
        {t("terms.title")}
      </h1>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {t("terms.intro")}
      </p>
      {sections.map((section) => (
        <div key={section.title} className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">
            {section.title}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {section.body}
          </p>
        </div>
      ))}
      <p className="text-xs text-muted-foreground/50">{t("terms.updated")}</p>
    </div>
  );
}

export default function TermsPage() {
  return (
    <PageLayout>
      <TermsContent />
    </PageLayout>
  );
}

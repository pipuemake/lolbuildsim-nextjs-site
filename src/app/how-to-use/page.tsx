"use client";

import { useLocale } from "@/lib/i18n";
import { PageLayout } from "@/components/page-layout";

function HowToUseContent() {
  const { t } = useLocale();

  const steps = [
    { title: t("howToUse.champion.title"), body: t("howToUse.champion.body") },
    { title: t("howToUse.item.title"), body: t("howToUse.item.body") },
    { title: t("howToUse.rune.title"), body: t("howToUse.rune.body") },
    { title: t("howToUse.combo.title"), body: t("howToUse.combo.body") },
    { title: t("howToUse.damage.title"), body: t("howToUse.damage.body") },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-[#C89B3C] font-[family-name:var(--font-playfair)]">
        {t("howToUse.title")}
      </h1>
      <p className="text-sm text-muted-foreground">{t("howToUse.intro")}</p>
      {steps.map((step) => (
        <div key={step.title} className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">
            {step.title}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {step.body}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function HowToUsePage() {
  return (
    <PageLayout>
      <HowToUseContent />
    </PageLayout>
  );
}

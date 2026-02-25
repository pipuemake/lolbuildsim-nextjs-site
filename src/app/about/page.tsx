"use client";

import { useLocale } from "@/lib/i18n";
import { PageLayout } from "@/components/page-layout";

function AboutContent() {
  const { t } = useLocale();

  const sections = [
    { title: t("about.purpose.title"), body: t("about.purpose.body") },
    { title: t("about.tech.title"), body: t("about.tech.body") },
    { title: t("about.developer.title"), body: t("about.developer.body") },
    { title: t("about.disclaimer.title"), body: t("about.disclaimer.body") },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-[#C89B3C] font-[family-name:var(--font-playfair)]">
        {t("about.title")}
      </h1>
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
    </div>
  );
}

export default function AboutPage() {
  return (
    <PageLayout>
      <AboutContent />
    </PageLayout>
  );
}

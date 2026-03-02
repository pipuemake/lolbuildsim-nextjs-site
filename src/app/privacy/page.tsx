"use client";

import { useLocale } from "@/lib/i18n";
import { PageLayout } from "@/components/page-layout";

function PrivacyContent() {
  const { t } = useLocale();

  const sections = [
    { title: t("privacy.auth.title"), body: t("privacy.auth.body") },
    { title: t("privacy.ads.title"), body: t("privacy.ads.body") },
    { title: t("privacy.cookies.title"), body: t("privacy.cookies.body") },
    { title: t("privacy.thirdParty.title"), body: t("privacy.thirdParty.body") },
    { title: t("privacy.personalInfo.title"), body: t("privacy.personalInfo.body") },
    { title: t("privacy.dataDeletion.title"), body: t("privacy.dataDeletion.body") },
    { title: t("privacy.changes.title"), body: t("privacy.changes.body") },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-[#C89B3C] font-[family-name:var(--font-playfair)]">
        {t("privacy.title")}
      </h1>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {t("privacy.intro")}
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
      <p className="text-xs text-muted-foreground/50">{t("privacy.updated")}</p>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <PageLayout>
      <PrivacyContent />
    </PageLayout>
  );
}

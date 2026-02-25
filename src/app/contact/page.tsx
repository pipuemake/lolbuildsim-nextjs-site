"use client";

import { useLocale } from "@/lib/i18n";
import { PageLayout } from "@/components/page-layout";

function ContactContent() {
  const { t } = useLocale();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-[#C89B3C] font-[family-name:var(--font-playfair)]">
        {t("contact.title")}
      </h1>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {t("contact.body")}
      </p>
      <div className="lol-card p-6 space-y-3">
        <h2 className="text-sm font-semibold text-foreground">
          {t("contact.email")}
        </h2>
        <a
          href="mailto:pipurmake@gmail.com"
          className="text-[#C89B3C] hover:underline text-sm"
        >
          pipurmake@gmail.com
        </a>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {t("contact.note")}
      </p>
    </div>
  );
}

export default function ContactPage() {
  return (
    <PageLayout>
      <ContactContent />
    </PageLayout>
  );
}

"use client";

import { LocaleProvider } from "@/lib/i18n";
import { SimulatorClient } from "./simulator-client";
import { HomeIntro, RiotDisclaimerBanner } from "@/components/home-intro";

export default function Home() {
  return (
    <LocaleProvider>
      <RiotDisclaimerBanner />
      <SimulatorClient />
      <HomeIntro />
    </LocaleProvider>
  );
}

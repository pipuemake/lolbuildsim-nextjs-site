"use client";

import { LocaleProvider } from "@/lib/i18n";
import { SimulatorClient } from "./simulator-client";
import { HomeIntro } from "@/components/home-intro";

export default function Home() {
  return (
    <LocaleProvider>
      <SimulatorClient />
      <HomeIntro />
    </LocaleProvider>
  );
}

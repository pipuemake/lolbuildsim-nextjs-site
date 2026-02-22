import type { Metadata } from "next";
import {
  Geist_Mono,
  Playfair_Display,
  Merriweather,
  Space_Grotesk,
  DM_Sans,
} from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LoL ビルドシミュレーター | Build Simulator",
  description:
    "League of Legendsのビルドシミュレーター。チャンピオンのステータス、ダメージ計算、DPS、有効HPを日本語で確認できます。",
  openGraph: {
    title: "LoL ビルドシミュレーター",
    description:
      "League of Legendsのビルドシミュレーター。1v1ダメージ計算、ビルド比較、スキルダメージを日本語で。",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${playfair.variable} ${merriweather.variable} ${spaceGrotesk.variable} ${dmSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen font-[family-name:var(--font-dm-sans)]`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

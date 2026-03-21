import type { Metadata } from "next";
import { BuildsClient } from "./builds-client";

export const metadata: Metadata = {
  title: "ビルド作成 | LoL Build Sim",
  description: "League of Legendsのビルドを作成・保存・公開できるツール。アイテム、ルーン、サモナースペルを設定して共有しよう。",
  openGraph: {
    title: "ビルド作成 | LoL Build Sim",
    description: "LoLのビルドを作成・保存・公開。アイテム、ルーン、サモナースペルを設定して共有。",
  },
};

export default function BuildsPage() {
  return <BuildsClient />;
}

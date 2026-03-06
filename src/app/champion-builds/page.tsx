import type { Metadata } from "next";
import { ChampionBuildsClient } from "./champion-builds-client";

export const metadata: Metadata = {
  title: "チャンピオンビルド | LoL Build Sim(Beta)",
  description: "コミュニティが共有したLeague of Legendsのビルドを検索・ブックマーク。チャンピオン、レーン、役割でフィルタリング。",
  openGraph: {
    title: "チャンピオンビルド | LoL Build Sim(Beta)",
    description: "LoLのコミュニティビルドを検索・ブックマーク・シミュレーターに読み込み。",
  },
};

export default function ChampionBuildsPage() {
  return <ChampionBuildsClient />;
}

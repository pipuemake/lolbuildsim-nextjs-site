import type { Metadata } from "next";
import { MatchHistoryClient } from "./match-history-client";

export const metadata: Metadata = {
  title: "マッチ履歴 | LoL Build Sim",
  description: "Riot IDでマッチ履歴を検索し、タイムラインからビルドをシミュレーターにインポート。",
  openGraph: {
    title: "マッチ履歴 | LoL Build Sim",
    description: "LoLのマッチ履歴を検索してビルドをシミュレーターにインポート。",
  },
};

export default function MatchHistoryPage() {
  return <MatchHistoryClient />;
}

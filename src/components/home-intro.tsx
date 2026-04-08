"use client";

import { useLocale } from "@/lib/i18n";

export function RiotDisclaimerBanner() {
  const { locale } = useLocale();
  return (
    <div className="mx-auto max-w-6xl px-4 pt-3">
      <div className="rounded-md border border-yellow-500/40 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-200">
        {locale === "ja" ? (
          <>
            <strong className="font-semibold">ご注意:</strong>{" "}
            本サイトは League of Legends
            の非公式ファンメイドツールであり、Riot Games, Inc.
            によって承認・スポンサー・提携されたものではありません。
          </>
        ) : (
          <>
            <strong className="font-semibold">Notice:</strong> This site is an
            unofficial fan-made tool for League of Legends and is not endorsed,
            sponsored, or affiliated with Riot Games, Inc.
          </>
        )}
      </div>
    </div>
  );
}

export function HomeIntro() {
  const { locale } = useLocale();

  if (locale === "ja") {
    return (
      <section className="mx-auto max-w-4xl px-4 py-10 text-sm text-muted-foreground leading-relaxed space-y-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#C89B3C] font-[family-name:var(--font-playfair)]">
          LoL Build Sim — League of Legends ビルドシミュレーター
        </h1>
        <p>
          LoL Build Sim
          は、League of Legends
          のチャンピオンビルドをゲーム外で検証できる日本語対応のシミュレーターです。チャンピオン、アイテム、ルーン、レベルを自由に組み合わせて、最終ステータスや1v1でのダメージ計算、スキルコンボの威力、有効HP、DPSなどを数値で確認できます。パッチ後のビルド選択、初心者のアイテム学習、ランク戦前のマッチアップ予習など、幅広い用途にご活用いただけます。
        </p>
        <h2 className="text-lg font-semibold text-foreground pt-2">
          主な機能
        </h2>
        <ul className="list-disc list-inside space-y-1.5">
          <li>
            <strong className="text-foreground">1v1 ダメージ計算:</strong>{" "}
            味方と敵のチャンピオンを両側に配置し、スキルコンボ・オートアタック・アイテムアクティブを考慮したフルコンボダメージを双方向で比較できます。
          </li>
          <li>
            <strong className="text-foreground">全アイテム・ルーン対応:</strong>{" "}
            完成アイテムとルーン（キーストーン〜サブルーン）を網羅し、ステータス効果は自動反映。エリクサーやスタック系アイテム、ライフライン系シールドも計算に含まれます。
          </li>
          <li>
            <strong className="text-foreground">ミニオン・タワーダメージ:</strong>{" "}
            ゲーム時間に応じたミニオンの硬さ・タワーのダメージを表示し、プッシュ判断やダイブ時の耐久力の目安に使えます。
          </li>
          <li>
            <strong className="text-foreground">ビルド共有:</strong>{" "}
            作成したビルドは URL で共有可能。他のプレイヤーのビルドを閲覧・ブックマークすることもできます。
          </li>
        </ul>
        <h2 className="text-lg font-semibold text-foreground pt-2">
          使い方
        </h2>
        <p>
          画面上部の青側・赤側でチャンピオンを選択し、レベル・アイテム・ルーンを設定すると、中央にリアルタイムで計算結果が表示されます。スキルコンボバーでスキル使用回数・AA回数を調整し、実戦に近いダメージを算出できます。詳しい操作は
          <a
            href="/how-to-use"
            className="text-[#C89B3C] hover:underline mx-1"
          >
            使い方ガイド
          </a>
          を、よくある質問は
          <a href="/faq" className="text-[#C89B3C] hover:underline mx-1">
            FAQ
          </a>
          をご覧ください。
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-10 text-sm text-muted-foreground leading-relaxed space-y-5">
      <h1 className="text-2xl sm:text-3xl font-bold text-[#C89B3C] font-[family-name:var(--font-playfair)]">
        LoL Build Sim — League of Legends Build Simulator
      </h1>
      <p>
        LoL Build Sim is an out-of-game simulator that lets you test League of
        Legends champion builds before you play. Freely combine champions,
        items, runes, and levels to inspect final stats, 1v1 damage, full combo
        output, effective HP, and DPS — all in real time. It&apos;s designed
        for post-patch build validation, helping new players learn item
        choices, and previewing matchups before ranked games.
      </p>
      <h2 className="text-lg font-semibold text-foreground pt-2">
        Key Features
      </h2>
      <ul className="list-disc list-inside space-y-1.5">
        <li>
          <strong className="text-foreground">1v1 Damage Calculator:</strong>{" "}
          Place ally and enemy champions side by side to compare full-combo
          damage accounting for skills, auto attacks, and item actives in both
          directions.
        </li>
        <li>
          <strong className="text-foreground">
            Full Item &amp; Rune Coverage:
          </strong>{" "}
          Every completed item and rune (keystones through sub-runes) is
          supported, with stat effects auto-applied. Elixirs, stacking items,
          and lifeline shields are all included.
        </li>
        <li>
          <strong className="text-foreground">Minion &amp; Tower Damage:</strong>{" "}
          View minion tankiness and tower damage scaled to game time — useful
          for push decisions and tower-dive durability checks.
        </li>
        <li>
          <strong className="text-foreground">Build Sharing:</strong> Share any
          build via URL. Browse and bookmark builds created by other players.
        </li>
      </ul>
      <h2 className="text-lg font-semibold text-foreground pt-2">
        How to Use
      </h2>
      <p>
        Pick a champion on the blue and red sides, set level, items, and runes,
        and the center panel updates calculations in real time. Use the skill
        combo bar to adjust skill and AA counts for realistic damage figures.
        See the
        <a href="/how-to-use" className="text-[#C89B3C] hover:underline mx-1">
          How-to-Use guide
        </a>
        for detailed instructions and the
        <a href="/faq" className="text-[#C89B3C] hover:underline mx-1">
          FAQ
        </a>
        for common questions.
      </p>
    </section>
  );
}

"use client";

import { useEffect, useRef } from "react";

type AdUnitProps = {
  slot: string;
  format?: string;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Google AdSense 広告ユニット。
 * data-ad-slot は AdSense 管理画面で広告ユニットを作成して取得した ID に置き換えてください。
 */
export function AdUnit({
  slot,
  format = "auto",
  className,
  style,
}: AdUnitProps) {
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // adsbygoogle.js がまだ読み込まれていない場合は無視
    }
  }, []);

  return (
    <div className={className} style={{ margin: "12px 0", ...style }}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", minHeight: 90 }}
        data-ad-client="ca-pub-9413051018199631"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}

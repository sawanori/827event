"use client";

// 8/5 開催までのカウントダウン。ボーン紙のタイルに墨のセリフ数字。
// 時刻計測はクライアントのみ（ハイドレーション不一致回避）。

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { EVENT } from "@/lib/site-data";

function useCountdown(targetMs: number) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  if (now === null) return { ready: false, over: false, d: 0, h: 0, m: 0, s: 0 };
  const diff = targetMs - now;
  if (diff <= 0) return { ready: true, over: true, d: 0, h: 0, m: 0, s: 0 };
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { ready: true, over: false, d, h, m, s };
}

function Tile({ value, label, reduced }: { value: number; label: string; reduced: boolean }) {
  const display = value < 0 ? 0 : value;
  const padded = String(display).padStart(2, "0");
  return (
    <div className="flex flex-col items-center">
      <div
        className="relative overflow-hidden rounded-xl px-4 py-3 md:px-6 md:py-4 min-w-[64px] md:min-w-[86px] text-center"
        style={{ background: "var(--paper-2)", border: "1px solid var(--line)" }}
      >
        {reduced ? (
          <span className="relative block font-num text-3xl md:text-5xl tabular-nums" style={{ color: "var(--ink)" }}>
            {padded}
          </span>
        ) : (
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={padded}
              initial={{ y: "-70%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              exit={{ y: "70%", opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative block font-num text-3xl md:text-5xl tabular-nums"
              style={{ color: "var(--ink)" }}
            >
              {padded}
            </motion.span>
          </AnimatePresence>
        )}
      </div>
      <span
        className="mt-2 text-[0.68rem] md:text-xs font-body tracking-[0.2em]"
        style={{ color: "var(--subtle)" }}
      >
        {label}
      </span>
    </div>
  );
}

export default function Countdown() {
  const reduced = useReducedMotion() ?? false;
  const targetMs = useMemo(() => new Date(EVENT.dateISO).getTime(), []);
  const { ready, over, d, h, m, s } = useCountdown(targetMs);

  if (over) {
    return (
      <p className="font-display text-2xl md:text-3xl" style={{ color: "var(--shu-deep)" }}>
        本日開催。ご来場をお待ちしています。
      </p>
    );
  }

  const Sep = () => (
    <span className="font-num text-2xl md:text-4xl pt-2 md:pt-3" style={{ color: "var(--line-strong)" }}>
      :
    </span>
  );

  return (
    <div className="flex flex-col items-start">
      <div className="flex items-start gap-2 md:gap-3">
        <Tile value={d} label="DAYS" reduced={reduced} />
        <Sep />
        <Tile value={h} label="HOURS" reduced={reduced} />
        <Sep />
        <Tile value={m} label="MIN" reduced={reduced} />
        <Sep />
        <Tile value={s} label="SEC" reduced={reduced} />
      </div>
      <p className="mt-3 font-body text-xs md:text-sm tracking-jp" style={{ color: "var(--muted)" }}>
        {ready ? `${EVENT.dateJa}（${EVENT.weekday}） ${EVENT.timeLabel} 開催まで` : "開催までカウントダウン中…"}
      </p>
    </div>
  );
}

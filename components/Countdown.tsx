"use client";

// 8/5 開催までのカウントダウン。提灯色のタイルに金の数字。秒更新ごとに小さな
// 火花（花火）が弾ける。時刻計測はクライアントのみ（ハイドレーション不一致回避）。

import { useEffect, useMemo, useRef, useState } from "react";
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
    <div className="relative flex flex-col items-center">
      <div className="relative overflow-hidden rounded-2xl glass px-4 py-3 md:px-6 md:py-4 min-w-[68px] md:min-w-[92px] text-center border"
        style={{ borderColor: "var(--color-line)" }}>
        <div
          className="absolute inset-0 opacity-40"
          style={{ background: "radial-gradient(circle at 50% 20%, rgba(255,138,61,0.35), transparent 70%)" }}
        />
        {reduced ? (
          <span className="relative block font-num text-3xl md:text-5xl font-extrabold text-gradient-gold tabular-nums">
            {padded}
          </span>
        ) : (
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={padded}
              initial={{ y: "-70%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              exit={{ y: "70%", opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative block font-num text-3xl md:text-5xl font-extrabold text-gradient-gold tabular-nums"
            >
              {padded}
            </motion.span>
          </AnimatePresence>
        )}
      </div>
      <span className="mt-2 text-xs md:text-sm font-body tracking-jp" style={{ color: "var(--color-subtle)" }}>
        {label}
      </span>
    </div>
  );
}

function Sparks({ trigger }: { trigger: number }) {
  const sparks = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        angle: (i / 8) * Math.PI * 2,
        dist: 26 + (i % 3) * 8,
      })),
    []
  );
  return (
    <AnimatePresence>
      <motion.div key={trigger} className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2">
        {sparks.map((sp, i) => (
          <motion.span
            key={i}
            className="absolute block h-1 w-1 rounded-full"
            style={{ background: i % 2 ? "var(--color-gold-bright)" : "var(--color-vermilion-light)" }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos(sp.angle) * sp.dist,
              y: Math.sin(sp.angle) * sp.dist,
              opacity: 0,
              scale: 0.3,
            }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
        ))}
      </motion.div>
    </AnimatePresence>
  );
}

export default function Countdown() {
  const reduced = useReducedMotion() ?? false;
  const targetMs = useMemo(() => new Date(EVENT.dateISO).getTime(), []);
  const { ready, over, d, h, m, s } = useCountdown(targetMs);
  const lastSecond = useRef(-1);
  const [sparkKey, setSparkKey] = useState(0);

  useEffect(() => {
    if (!ready || over || reduced) return;
    if (s === lastSecond.current) return;
    const first = lastSecond.current === -1;
    lastSecond.current = s; // 初回の観測秒は記録のみ（余分な火花を出さない）
    if (!first) setSparkKey((k) => k + 1);
  }, [s, ready, over, reduced]);

  if (over) {
    return (
      <div className="text-center">
        <p className="font-display text-2xl md:text-3xl font-bold text-gradient-festival">
          本日開催！ご来場をお待ちしています
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center">
      {!reduced && sparkKey > 0 && <Sparks trigger={sparkKey} />}
      <div className="flex items-start gap-2 md:gap-4">
        <Tile value={d} label="日" reduced={reduced} />
        <span className="font-num text-3xl md:text-5xl font-bold pt-3 md:pt-4" style={{ color: "var(--color-gold)" }}>:</span>
        <Tile value={h} label="時間" reduced={reduced} />
        <span className="font-num text-3xl md:text-5xl font-bold pt-3 md:pt-4" style={{ color: "var(--color-gold)" }}>:</span>
        <Tile value={m} label="分" reduced={reduced} />
        <span className="font-num text-3xl md:text-5xl font-bold pt-3 md:pt-4" style={{ color: "var(--color-gold)" }}>:</span>
        <Tile value={s} label="秒" reduced={reduced} />
      </div>
      <p className="mt-4 font-body text-sm tracking-jp" style={{ color: "var(--color-muted)" }}>
        {ready ? `${EVENT.dateJa}（${EVENT.weekday}） ${EVENT.timeLabel} 開催まで` : "開催までカウントダウン中…"}
      </p>
    </div>
  );
}

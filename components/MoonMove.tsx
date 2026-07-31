"use client";

// ============================================================================
// MoonMove — 「halfmoon / moooove!!」を想起させる装飾バンド。
// スクロール進捗に連動して、半月（halfmoon）が右奥から昇り、地平の線の上を
// 丸（moooove の o）が勢いの筋を曳きながら右へ転がり、最後に「!!」が跳ねる。
// 文字は置かず、形だけで曲名を想起させる。
// 配色は既存トークン（紙／墨／錆朱／金茶／琥珀）のみ。reduce-motion では静止する。
// ============================================================================

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";

// md 未満は横幅が足りず、月と o と「!!」が重なる。小さめ・短い距離に切り替える。
function useCompact() {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setCompact(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return compact;
}

// ---- 半月（halfmoon）。右半分だけが照らされた月。 ----
// viewBox 0 0 120 120、中心 (60,60)、半径 52。弦がそのまま明暗境界になる。
const MOON_R = 52;
const MOON_LIT = `M 60 ${60 - MOON_R} A ${MOON_R} ${MOON_R} 0 0 1 60 ${60 + MOON_R} Z`;

function HalfMoon({ size = 132 }: { size?: number }) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 120 120" style={{ display: "block", overflow: "visible" }}>
      {/* 月あかり */}
      <circle cx={60} cy={60} r={MOON_R * 1.5} fill="url(#moonGlow)" />
      <defs>
        <radialGradient id="moonGlow">
          <stop offset="0%" stopColor="var(--sun)" stopOpacity="0.34" />
          <stop offset="55%" stopColor="var(--sun)" stopOpacity="0.12" />
          <stop offset="100%" stopColor="var(--sun)" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* 影の側（沈んだ半分。丸み全体をうっすら残す） */}
      <circle cx={60} cy={60} r={MOON_R} fill="var(--clay)" opacity={0.13} />
      {/* 照らされた半分 */}
      <path d={MOON_LIT} fill="var(--sun)" />
      {/* 海（クレーター）。明部にだけ薄く落とす。 */}
      <ellipse cx={78} cy={44} rx={9} ry={7} fill="var(--clay)" opacity={0.34} />
      <ellipse cx={90} cy={72} rx={6} ry={5} fill="var(--clay)" opacity={0.28} />
      <ellipse cx={70} cy={86} rx={5} ry={4} fill="var(--clay)" opacity={0.24} />
    </svg>
  );
}

// ---- 転がる丸（moooove の o）----
// from/to は帯の幅に対する横位置(%)、spin は転がりの回転量(deg)。
type Roller = { r: number; from: number; to: number; spin: number; fill: string; baseline: number };

const ROLLERS: Roller[] = [
  { r: 30, from: -6, to: 88, spin: 900, fill: "var(--shu)", baseline: 0 },
  { r: 21, from: -22, to: 72, spin: 1100, fill: "var(--clay)", baseline: -6 },
  { r: 25, from: -38, to: 56, spin: 1000, fill: "var(--shu-bright)", baseline: 4 },
  { r: 16, from: -54, to: 40, spin: 1250, fill: "var(--sun)", baseline: -10 },
];

// 横位置は親の幅に対する割合で動かしたいので、全幅のラッパーごと translate する
// （transform の % は要素自身の幅基準になるため、丸に直接かけると効かない）。
function RollingO({
  o,
  p,
  reduce,
  compact,
}: {
  o: Roller;
  p: MotionValue<number>;
  reduce: boolean;
  compact: boolean;
}) {
  const to = compact ? o.to - 30 : o.to;
  const x = useTransform(p, [0, 1], reduce ? [`${to}%`, `${to}%`] : [`${o.from}%`, `${to}%`]);
  const rotate = useTransform(p, [0, 1], reduce ? [0, 0] : [0, o.spin]);
  const opacity = useTransform(p, [0, 0.12, 0.92, 1], [0, 1, 1, 0.85]);
  const r = Math.round(o.r * (compact ? 0.6 : 1));
  const d = r * 2;
  const baseline = Math.round(o.baseline * (compact ? 0.6 : 1));

  return (
    <motion.div className="pointer-events-none absolute inset-x-0" style={{ x, opacity }}>
      <div className="absolute" style={{ left: 0, top: baseline, width: d, height: d, marginTop: -d }}>
        {/* 勢いの筋（進行方向の後ろへ伸びる） */}
        <span
          aria-hidden
          className="absolute top-1/2 right-full"
          style={{
            width: d * 3.4,
            height: Math.max(2, r * 0.24),
            marginTop: -Math.max(1, r * 0.12),
            marginRight: r * 0.5,
            borderRadius: 999,
            background: `linear-gradient(90deg, transparent, ${o.fill})`,
            opacity: 0.34,
          }}
        />
        <motion.svg width={d} height={d} viewBox="0 0 100 100" style={{ rotate, display: "block" }} aria-hidden>
          {/* o そのもの。中の欠けで回転が見える。 */}
          <circle cx={50} cy={50} r={46} fill={o.fill} />
          <circle cx={50} cy={50} r={22} fill="var(--paper)" />
          <circle cx={50} cy={18} r={5.5} fill="var(--paper)" />
        </motion.svg>
      </div>
    </motion.div>
  );
}

// ---- 「!!」。転がりの終点で跳ねる。 ----
function BangMark({ p, reduce, compact }: { p: MotionValue<number>; reduce: boolean; compact: boolean }) {
  const opacity = useTransform(p, [0.46, 0.58], [0, 1]);
  const scale = useTransform(p, [0.46, 0.62, 0.72], reduce ? [1, 1, 1] : [0.4, 1.18, 1]);
  const y = useTransform(p, [0.46, 0.62, 0.72], reduce ? [0, 0, 0] : [18, -8, 0]);
  const w = compact ? 7 : 11;
  const tall = compact ? 32 : 50;
  // 月に重ならない位置（転がりの終点あたり）で、地平線の上に立たせる。
  return (
    <motion.div
      className="absolute"
      style={{ right: compact ? "46%" : "30%", top: compact ? -42 : -64, opacity, scale, y }}
    >
      <div className="flex items-end" style={{ transform: "skewX(-12deg)", gap: compact ? 7 : 10 }}>
        {[0, 1].map((i) => (
          <span key={i} className="flex flex-col items-center" style={{ gap: compact ? 4 : 6 }}>
            <span
              style={{
                display: "block",
                width: w,
                height: i ? Math.round(tall * 0.76) : tall,
                borderRadius: 999,
                background: "var(--shu)",
              }}
            />
            <span style={{ display: "block", width: w, height: w, borderRadius: 999, background: "var(--shu)" }} />
          </span>
        ))}
      </div>
    </motion.div>
  );
}

export default function MoonMove() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;
  const compact = useCompact();
  const moonSize = compact ? 92 : 132;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 30, mass: 0.5, restDelta: 0.001 });

  // 月は右奥から昇り、少しだけ傾きを起こす。
  const moonY = useTransform(p, [0, 1], reduce ? [0, 0] : [110, -46]);
  const moonX = useTransform(p, [0, 1], reduce ? ["0%", "0%"] : ["16%", "-4%"]);
  const moonRotate = useTransform(p, [0, 1], reduce ? [0, 0] : [-20, 5]);
  const moonOpacity = useTransform(p, [0, 0.22, 1], [0, 1, 1]);
  // 地平線は進捗に合わせて左から引かれる。
  const lineScale = useTransform(p, [0.05, 0.5], [0, 1]);

  return (
    <section
      ref={ref}
      aria-hidden
      className="relative overflow-hidden"
      style={{ background: "var(--paper)", height: "clamp(260px, 38vh, 360px)" }}
    >
      {/* 昇る半月 */}
      <motion.div
        className="absolute top-1/2"
        style={{
          right: compact ? "6%" : "10%",
          x: moonX,
          y: moonY,
          rotate: moonRotate,
          opacity: moonOpacity,
          marginTop: -moonSize / 2,
        }}
      >
        <HalfMoon size={moonSize} />
      </motion.div>

      {/* 地平の線と、その上を転がる o たち */}
      <div className="absolute inset-x-0" style={{ bottom: "34%" }}>
        <motion.span
          className="absolute inset-x-[6%] block h-px origin-left"
          style={{ background: "var(--line-strong)", opacity: 0.5, scaleX: lineScale }}
        />
        <div className="relative mx-[6%]">
          {ROLLERS.map((o, i) => (
            <RollingO key={i} o={o} p={p} reduce={reduce} compact={compact} />
          ))}
          <BangMark p={p} reduce={reduce} compact={compact} />
        </div>
      </div>
    </section>
  );
}

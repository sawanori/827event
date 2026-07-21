"use client";

// リポジトリの効果部品を、このLPのブランド色（朱 --shu ＋ ペーパー）で控えめに再現。
// セクション背景パターン（stripes / polka_dots / circle_wave）と星アクセント。

import type { ReactNode } from "react";
import { motion, type Variants } from "framer-motion";

const STAR = "50,8 60,36 90,37 66,55 75,84 50,67 25,84 34,55 10,37 40,36";

// stripes.gdshader / polka_dots.gdshader / circle_wave.gdshader を朱の淡色で
export function SectionFx({ variant = "dots" }: { variant?: "stripes" | "dots" | "wave" }) {
  if (variant === "stripes") {
    return (
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "repeating-linear-gradient(-24deg, rgba(193,56,31,0.10) 0 3px, transparent 3px 24px)",
          WebkitMaskImage: "linear-gradient(115deg, black, transparent 90%)",
          maskImage: "linear-gradient(115deg, black, transparent 90%)",
        }}
        animate={{ backgroundPositionX: ["0px", "54px"] }}
        transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
      />
    );
  }
  if (variant === "wave") {
    return (
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.span
            key={i}
            className="absolute -right-[6%] top-1/2 rounded-full"
            style={{ width: 620, height: 620, marginTop: -310, border: "2px solid rgba(193,56,31,0.18)" }}
            initial={{ scale: 0.12, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 0 }}
            transition={{ duration: 5.5, repeat: Infinity, delay: i * 1.1, ease: "easeOut" }}
          />
        ))}
      </div>
    );
  }
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage: "radial-gradient(rgba(193,56,31,0.14) 1.6px, transparent 2px)",
        backgroundSize: "20px 20px",
        WebkitMaskImage: "linear-gradient(120deg, black, transparent 90%)",
        maskImage: "linear-gradient(120deg, black, transparent 90%)",
      }}
      animate={{ backgroundPositionX: ["0px", "20px"], backgroundPositionY: ["0px", "-20px"] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
    />
  );
}

// star_shape_move.gdshader を朱で（見出し脇の小さな星アクセント）
export function StarAccent({ size = 13 }: { size?: number }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden
      className="inline-block shrink-0"
      animate={{ rotate: 360 }}
      transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
    >
      <motion.polygon
        points={STAR}
        fill="var(--shu)"
        animate={{ scale: [1, 1.18, 1] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "50px 50px" }}
      />
    </motion.svg>
  );
}

// アグレッシブなセクション見出し：特大の斜体アウトライン数字 ＋ 見出し ＋ 斜め朱バー。
// 全セクションの頭を「破壊的」に作り替える構造部品（配色はブランドの朱×墨のまま）。
export function SectionHead({
  no,
  en,
  children,
  align = "left",
}: {
  no: string;
  en: string;
  children: ReactNode;
  align?: "left" | "center";
}) {
  // スクロールで叩き込むように出現（P5R風：高速スラムイン＋着弾のヒットシェイク＋朱フラッシュ）
  const containerV: Variants = {
    hidden: {},
    show: { x: [0, -9, 8, -4, 0], y: [0, 5, -3, 1, 0], transition: { duration: 0.32, times: [0, 0.28, 0.55, 0.8, 1], delay: 0.12, ease: [0.16, 1, 0.3, 1] } },
  };
  const flashV: Variants = {
    hidden: { opacity: 0, scaleX: 0.1, skewY: -2.4 },
    show: { opacity: [0, 0.9, 0], scaleX: [0.1, 1, 1.04], skewY: -2.4, transition: { duration: 0.5, times: [0, 0.42, 1], ease: [0.16, 1, 0.3, 1], delay: 0.04 } },
  };
  const numberV: Variants =
    align === "center"
      ? { hidden: { opacity: 0, y: 100, scale: 0.34, skewX: -22, rotate: -5 }, show: { opacity: 1, y: 0, scale: 1, skewX: 0, rotate: 0, transition: { type: "spring", stiffness: 760, damping: 11, mass: 0.9, delay: 0.02 } } }
      : { hidden: { opacity: 0, x: -240, skewX: -48, rotate: -13, scale: 0.9 }, show: { opacity: 1, x: 0, skewX: 0, rotate: 0, scale: 1, transition: { type: "spring", stiffness: 780, damping: 11, mass: 0.9, delay: 0.02 } } };
  const kickerV: Variants = { hidden: { opacity: 0, x: align === "center" ? 0 : -34, y: align === "center" ? 16 : 0 }, show: { opacity: 1, x: 0, y: 0, transition: { type: "spring", stiffness: 640, damping: 15, delay: 0.14 } } };
  const echoV: Variants = { hidden: { opacity: 0, x: 22, y: 15, skewX: -14 }, show: { opacity: [0, 0.7, 0], x: [22, 6, 0], y: [15, 4, 0], skewX: [-14, -4, 0], transition: { duration: 0.52, times: [0, 0.5, 1], ease: [0.16, 1, 0.3, 1], delay: 0.14 } } };
  const headingV: Variants = { hidden: { opacity: 0, x: -52, skewX: -16, clipPath: "inset(0 100% 0 0)" }, show: { opacity: 1, x: 0, skewX: 0, clipPath: "inset(0 0% 0 0)", transition: { duration: 0.52, ease: [0.34, 1.56, 0.64, 1], delay: 0.16 } } };
  const barV: Variants = { hidden: { scaleX: 0, skewX: -24 }, show: { scaleX: [0, 1.14, 1], skewX: -24, transition: { duration: 0.5, times: [0, 0.68, 1], ease: [0.16, 1, 0.3, 1], delay: 0.3 } } };
  const linesV: Variants = { hidden: { opacity: 0 }, show: { opacity: [0, 0.78, 0], transition: { duration: 0.6, times: [0, 0.26, 1], ease: [0.16, 1, 0.3, 1], delay: 0.03 } } };
  const focus = align === "center" ? "50%" : "9%";

  return (
    <motion.div
      className={`relative mb-9 md:mb-12 ${align === "center" ? "text-center" : ""}`}
      variants={containerV}
      initial="hidden"
      whileInView="show"
      // もう少しスクロールしてから発火：ビューポート下端を18%縮めて検知点を上へずらす
      viewport={{ once: true, amount: 0.4, margin: "0px 0px -18% 0px" }}
    >
      {/* 集中線（スピードライン）が一瞬走る */}
      <motion.div
        aria-hidden
        variants={linesV}
        className="pointer-events-none absolute -inset-x-4 -top-8 bottom-0"
        style={{
          backgroundImage: `repeating-conic-gradient(from 0deg at ${focus} 56%, rgba(193,56,31,0.16) 0deg 0.5deg, transparent 0.5deg 3.4deg)`,
          WebkitMaskImage: `radial-gradient(58% 62% at ${focus} 56%, black, transparent 72%)`,
          maskImage: `radial-gradient(58% 62% at ${focus} 56%, black, transparent 72%)`,
        }}
      />

      {/* 着弾の朱フラッシュが一閃 */}
      <motion.div
        aria-hidden
        variants={flashV}
        className="pointer-events-none absolute inset-x-0 top-0"
        style={{
          height: "3.4em",
          background:
            align === "center"
              ? "linear-gradient(90deg, rgba(193,56,31,0) 0%, var(--shu) 50%, rgba(193,56,31,0) 100%)"
              : "linear-gradient(90deg, var(--shu) 0%, rgba(193,56,31,0) 72%)",
          transformOrigin: align === "center" ? "center" : "left",
          WebkitMaskImage: "linear-gradient(#000, transparent 88%)",
          maskImage: "linear-gradient(#000, transparent 88%)",
        }}
      />

      <div className={`relative flex flex-col gap-1 md:flex-row md:items-end md:gap-6 ${align === "center" ? "items-center md:justify-center" : "items-start"}`}>
        <motion.span
          variants={numberV}
          className="font-num leading-[0.8] select-none"
          style={{ fontSize: "clamp(2.8rem, 8vw, 5.6rem)", fontStyle: "italic", color: "transparent", WebkitTextStroke: "2px var(--shu)" }}
          aria-hidden
        >
          {no}
        </motion.span>
        <div className="pb-1.5">
          <motion.span variants={kickerV} className="block font-serif text-[0.7rem] tracking-[0.34em] mb-2" style={{ color: "var(--shu)" }}>
            {en}
          </motion.span>
          <div className="relative">
            <motion.span
              aria-hidden
              variants={echoV}
              className="font-display absolute inset-0 select-none"
              style={{ color: "var(--shu)", fontSize: "clamp(1.7rem, 4.2vw, 3.1rem)", lineHeight: 1.12, fontWeight: 700, letterSpacing: "-0.01em" }}
            >
              {children}
            </motion.span>
            <motion.h2
              variants={headingV}
              className="font-display relative"
              style={{ color: "var(--ink)", fontSize: "clamp(1.7rem, 4.2vw, 3.1rem)", lineHeight: 1.12, fontWeight: 700, letterSpacing: "-0.01em" }}
            >
              {children}
            </motion.h2>
          </div>
        </div>
      </div>
      <motion.div
        aria-hidden
        variants={barV}
        className="relative mt-4 h-[3px]"
        style={{ background: "linear-gradient(90deg, var(--shu), transparent)", transformOrigin: "left" }}
      />
    </motion.div>
  );
}

// 斜めに走る朱の帯（セクション区切り）。左からスライドインする。
export function SlashBand({ label }: { label?: string }) {
  return (
    <div aria-hidden className="relative overflow-hidden" style={{ height: "2.8rem" }}>
      <motion.div
        className="absolute inset-x-[-4%] inset-y-0 flex items-center"
        style={{ background: "var(--shu)", transform: "skewY(-2.2deg)" }}
        initial={{ x: "-102%" }}
        whileInView={{ x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
      >
        {label && (
          <span className="whitespace-nowrap px-8 font-body text-[0.62rem] font-bold tracking-[0.42em]" style={{ color: "var(--paper-2)" }}>
            {label} · {label} · {label}
          </span>
        )}
      </motion.div>
    </div>
  );
}

// 夏のギラギラした光（イントロ幕用）。波打つ太陽光線（サイン波＋陽炎で揺らめく）＋白熱コアの
// サングロー＋斜めの光スイープ＋きらめき。ブランド配色（紙/墨/朱）を守り、加算的な光ハイライト
// のみで“真夏の陽射し”を演出する。
function Glint({ left, top, delay, size = 22 }: { left: string; top: string; delay: number; size?: number }) {
  return (
    <motion.svg
      aria-hidden
      className="absolute"
      style={{ left, top, width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2 }}
      viewBox="0 0 100 100"
      initial={{ opacity: 0, scale: 0.3 }}
      animate={{ opacity: [0, 1, 0], scale: [0.3, 1, 0.3], rotate: [0, 80] }}
      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1.1, delay, ease: "easeInOut" }}
    >
      <path d="M50 0 L57 43 L100 50 L57 57 L50 100 L43 57 L0 50 L43 43 Z" fill="rgba(255,247,226,0.95)" />
    </motion.svg>
  );
}

// サイン波でうねらせた放射光線のパスを生成（決定的：乱数不使用）。viewBox 0..1000 前提。
function buildWavyRays(count: number) {
  const cx = 500;
  const cy = 500;
  return Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2;
    const dx = Math.cos(a);
    const dy = Math.sin(a);
    const px = -dy; // 進行方向に対する垂直（うねりのオフセット方向）
    const py = dx;
    const long = i % 2 === 0;
    const ri = 116;
    const ro = long ? 478 : 372;
    const amp = long ? 16 : 11;
    const waves = long ? 1.5 : 2.3;
    const phase = (i % 5) * 0.8;
    const steps = 18;
    let d = "";
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const r = ri + (ro - ri) * t;
      const off = amp * Math.sin(waves * Math.PI * 2 * t + phase) * (0.2 + 0.8 * t);
      const x = cx + dx * r + px * off;
      const y = cy + dy * r + py * off;
      d += (s === 0 ? "M" : "L") + `${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    return { d, long, i };
  });
}

export function SummerGlare() {
  const rays = buildWavyRays(26);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* 陽炎フィルタ（feTurbulence を SMIL で揺らし、光線を feDisplacementMap でクネクネさせる） */}
      <svg width="0" height="0" className="absolute" aria-hidden focusable="false">
        <defs>
          <filter id="summerHeat" x="-25%" y="-25%" width="150%" height="150%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.009 0.016" numOctaves={2} seed={7} result="noise">
              <animate
                attributeName="baseFrequency"
                dur="6s"
                values="0.009 0.016;0.014 0.023;0.009 0.016"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={20} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* 白熱コアのサングロー（白→橙→朱、呼吸） */}
      <motion.div
        className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: "92vmin",
          height: "92vmin",
          background:
            "radial-gradient(circle, rgba(255,248,224,0.7) 0%, rgba(255,196,102,0.42) 22%, rgba(226,72,46,0.18) 46%, transparent 68%)",
        }}
        animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.75, 1, 0.75] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 波打つ太陽の光線（ゆっくり回転＋陽炎で揺らめく） */}
      <motion.svg
        className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2"
        style={{ width: "150vmax", height: "150vmax", overflow: "visible" }}
        viewBox="0 0 1000 1000"
        animate={{ rotate: 360 }}
        transition={{ duration: 44, repeat: Infinity, ease: "linear" }}
      >
        <g filter="url(#summerHeat)">
          {rays.map((r) => (
            <path
              key={r.i}
              d={r.d}
              fill="none"
              stroke={r.long ? "rgba(226,72,46,0.20)" : "rgba(255,178,78,0.18)"}
              strokeWidth={r.long ? 8 : 4.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </g>
      </motion.svg>

      {/* 斜めの光のスイープ（一閃／繰り返し） */}
      <motion.div
        className="absolute inset-x-0 inset-y-[-20%]"
        style={{
          background:
            "linear-gradient(104deg, transparent 34%, rgba(255,255,255,0.6) 48%, rgba(255,236,192,0.42) 53%, transparent 64%)",
          mixBlendMode: "screen",
        }}
        initial={{ x: "-115%" }}
        animate={{ x: ["-115%", "115%"] }}
        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.8, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* きらめき（グリント） */}
      <Glint left="24%" top="33%" delay={0.1} size={26} />
      <Glint left="73%" top="30%" delay={0.6} />
      <Glint left="67%" top="63%" delay={1.0} size={18} />
      <Glint left="31%" top="64%" delay={1.5} size={20} />
    </div>
  );
}

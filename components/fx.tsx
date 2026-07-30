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
          backgroundImage: "repeating-linear-gradient(-24deg, rgba(176,58,23,0.10) 0 3px, transparent 3px 24px)",
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
            style={{ width: 620, height: 620, marginTop: -310, border: "2px solid rgba(176,58,23,0.18)" }}
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
        backgroundImage: "radial-gradient(rgba(176,58,23,0.14) 1.6px, transparent 2px)",
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
          backgroundImage: `repeating-conic-gradient(from 0deg at ${focus} 56%, rgba(176,58,23,0.16) 0deg 0.5deg, transparent 0.5deg 3.4deg)`,
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
              ? "linear-gradient(90deg, rgba(176,58,23,0) 0%, var(--shu) 50%, rgba(176,58,23,0) 100%)"
              : "linear-gradient(90deg, var(--shu) 0%, rgba(176,58,23,0) 72%)",
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

// 秋のモチーフ。形はすべてSVGパスで持ち、ブランド配色（紙／墨／錆朱）の範囲を守って
// 差し色に金茶・琥珀を使う。イントロ幕は紅葉、矢印の軌跡（ScrollArrowFlow）は木の実。

// ============================ 紅葉（イントロ幕用） ============================

const LEAF_CX = 50;
const LEAF_CY = 58;

// モミジの七裂。真上を 0°として左右対称に開く（角度・裂片の長さ）。
const MOMIJI_LOBES = [
  { a: -142, r: 30 },
  { a: -95, r: 38 },
  { a: -48, r: 42 },
  { a: 0, r: 44 },
  { a: 48, r: 42 },
  { a: 95, r: 38 },
  { a: 142, r: 30 },
] as const;

// 裂片の片側の縁（付け根→先端）。角度オフセットと半径比のジグザグがそのまま鋸歯になる。
const MOMIJI_EDGE: readonly (readonly [number, number])[] = [
  [24, 0.56],
  [20, 0.72],
  [17.5, 0.67],
  [13, 0.85],
  [9.5, 0.79],
  [5, 0.95],
];

function leafPolar(deg: number, r: number): readonly [number, number] {
  const a = (deg * Math.PI) / 180;
  return [LEAF_CX + Math.sin(a) * r, LEAF_CY - Math.cos(a) * r] as const;
}

// 葉の輪郭を生成（決定的：乱数不使用）。viewBox 0 0 100 100 前提。
// 各裂片は「谷 → 鋸歯の縁 → 先端 → 鋸歯の縁」で構成し、最後に葉柄の付け根で閉じる。
function buildMomijiPath(): string {
  const pts: string[] = [];
  const at = (deg: number, r: number) => {
    const [x, y] = leafPolar(deg, r);
    pts.push(`${x.toFixed(1)} ${y.toFixed(1)}`);
  };
  MOMIJI_LOBES.forEach((lobe, i) => {
    const prev = MOMIJI_LOBES[i - 1];
    if (prev) at((prev.a + lobe.a) / 2, Math.min(prev.r, lobe.r) * 0.3);
    MOMIJI_EDGE.forEach(([d, k]) => at(lobe.a - d, lobe.r * k));
    at(lobe.a, lobe.r);
    [...MOMIJI_EDGE].reverse().forEach(([d, k]) => at(lobe.a + d, lobe.r * k));
  });
  at(180, 9);
  return `M ${pts.join(" L ")} Z`;
}

const MOMIJI_PATH = buildMomijiPath();

// 葉柄。
const MOMIJI_STEM = `M ${LEAF_CX} ${LEAF_CY} L ${LEAF_CX} 92`;

// 葉脈：中心から各裂片の先端へ。
const MOMIJI_VEINS = MOMIJI_LOBES.map((lobe) => {
  const [x, y] = leafPolar(lobe.a, lobe.r * 0.72);
  return `M ${LEAF_CX} ${LEAF_CY} L ${x.toFixed(1)} ${y.toFixed(1)}`;
}).join(" ");

// 一枚の紅葉（葉脈・葉柄つき）。
function MomijiLeaf({ fill, size = 40 }: { fill: string; size?: number }) {
  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ display: "block", overflow: "visible" }}
    >
      <path d={MOMIJI_PATH} fill={fill} />
      <path d={MOMIJI_STEM} stroke={fill} strokeWidth={3.2} strokeLinecap="round" />
      <path d={MOMIJI_VEINS} stroke="rgba(25,21,18,0.20)" strokeWidth={1.4} strokeLinecap="round" fill="none" />
    </svg>
  );
}

// ====================== 木の実（矢印の軌跡＝ScrollArrowFlow 用） ======================

export type NutKind = "acorn" | "chestnut" | "berries";

// 陰影・筋の墨。実の面が濃色なので、やや強めに乗せる。
const NUT_INK = "rgba(25,21,18,0.26)";

// 見た目の重心（原点に合わせるためのオフセット）。viewBox 0 0 100 100 前提。
const NUT_ANCHOR: Record<NutKind, readonly [number, number]> = {
  acorn: [50, 48],
  chestnut: [50, 52],
  berries: [50, 50],
};

// 実そのものの描画。fill が実の面、accent が殻斗・座・果柄。
function NutShape({ kind, fill, accent }: { kind: NutKind; fill: string; accent: string }) {
  if (kind === "acorn") {
    return (
      <>
        {/* 堅果 */}
        <path d="M 27 41 C 24 66 33 85 50 88 C 67 85 76 66 73 41 Z" fill={fill} />
        {/* 殻斗（帽子） */}
        <path d="M 19 42 C 19 25 33 14 50 14 C 67 14 81 25 81 42 C 69 47 31 47 19 42 Z" fill={accent} />
        <path d="M 24 34 C 34 38 66 38 76 34" stroke={NUT_INK} strokeWidth={2} strokeLinecap="round" fill="none" />
        <path d="M 22 39 C 33 43 67 43 78 39" stroke={NUT_INK} strokeWidth={2} strokeLinecap="round" fill="none" />
        {/* 果柄 */}
        <path d="M 50 15 L 50 6" stroke={accent} strokeWidth={5} strokeLinecap="round" />
      </>
    );
  }
  if (kind === "chestnut") {
    return (
      <>
        <path
          d="M 50 16 C 57 31 85 41 85 61 C 85 79 71 88 50 88 C 29 88 15 79 15 61 C 15 41 43 31 50 16 Z"
          fill={fill}
        />
        {/* 座（果実の付いていた淡い部分） */}
        <ellipse cx={50} cy={81} rx={17} ry={6} fill={accent} />
        <path d="M 50 75 L 50 65" stroke={NUT_INK} strokeWidth={2} strokeLinecap="round" />
        <path d="M 40 77 L 34 69" stroke={NUT_INK} strokeWidth={2} strokeLinecap="round" />
        <path d="M 60 77 L 66 69" stroke={NUT_INK} strokeWidth={2} strokeLinecap="round" />
      </>
    );
  }
  return (
    <>
      {/* 果柄（三つの実へ枝分かれ） */}
      <path d="M 50 18 L 38 46" stroke={accent} strokeWidth={4} strokeLinecap="round" />
      <path d="M 50 18 L 64 48" stroke={accent} strokeWidth={4} strokeLinecap="round" />
      <path d="M 50 18 L 54 28" stroke={accent} strokeWidth={4} strokeLinecap="round" />
      <path d="M 50 18 L 50 5" stroke={accent} strokeWidth={4.5} strokeLinecap="round" />
      <circle cx={54} cy={33} r={15} fill={fill} />
      <circle cx={35} cy={60} r={21} fill={fill} />
      <circle cx={68} cy={63} r={18} fill={fill} />
      {/* 照り */}
      <circle cx={28} cy={52} r={5} fill={accent} opacity={0.5} />
      <circle cx={62} cy={56} r={4} fill={accent} opacity={0.5} />
    </>
  );
}

// 他のSVGの座標系へ埋め込む用。原点が実の重心なので、
// 呼び出し側は translate / rotate だけで好きな位置と角度に置ける。size は実の高さ相当px。
export function NutGlyph({
  kind,
  fill,
  accent,
  size,
}: {
  kind: NutKind;
  fill: string;
  accent: string;
  size: number;
}) {
  const [ax, ay] = NUT_ANCHOR[kind];
  return (
    <g transform={`scale(${(size / 100).toFixed(4)}) translate(${-ax} ${-ay})`}>
      <NutShape kind={kind} fill={fill} accent={accent} />
    </g>
  );
}

// ============================== イントロ幕 ==============================

// 舞い落ちる葉の配置（決定的：乱数不使用。開始位置を画面全体に散らし、
// 幕が出た瞬間から上下いっぱいに葉が舞っている状態にする）。
type LeafSpec = {
  left: string;
  top: string;
  size: number;
  dur: number;
  sway: number;
  spin: number;
  tint: string;
  opacity: number;
};

const FALLING_LEAVES: LeafSpec[] = [
  { left: "6%", top: "-14vh", size: 58, dur: 7.2, sway: 30, spin: 300, tint: "var(--shu)", opacity: 0.95 },
  { left: "18%", top: "12vh", size: 30, dur: 8.6, sway: 18, spin: -260, tint: "var(--clay)", opacity: 0.8 },
  { left: "29%", top: "-6vh", size: 44, dur: 6.4, sway: 24, spin: 380, tint: "var(--shu-bright)", opacity: 0.9 },
  { left: "39%", top: "38vh", size: 24, dur: 9.4, sway: 14, spin: -200, tint: "var(--sun)", opacity: 0.72 },
  { left: "48%", top: "62vh", size: 50, dur: 7.8, sway: 26, spin: 240, tint: "var(--shu-deep)", opacity: 0.85 },
  { left: "57%", top: "4vh", size: 30, dur: 8.2, sway: 20, spin: -340, tint: "var(--clay)", opacity: 0.78 },
  { left: "66%", top: "26vh", size: 62, dur: 6.8, sway: 32, spin: 280, tint: "var(--shu)", opacity: 0.95 },
  { left: "74%", top: "-10vh", size: 26, dur: 9.0, sway: 16, spin: -220, tint: "var(--sun)", opacity: 0.7 },
  { left: "83%", top: "50vh", size: 42, dur: 7.4, sway: 22, spin: 320, tint: "var(--shu-bright)", opacity: 0.88 },
  { left: "91%", top: "18vh", size: 34, dur: 8.0, sway: 19, spin: -300, tint: "var(--shu)", opacity: 0.82 },
  { left: "12%", top: "70vh", size: 22, dur: 9.8, sway: 12, spin: 210, tint: "var(--clay)", opacity: 0.68 },
];

// 落下（linear）と、横揺れ・回転（easeInOut / linear）を入れ子で分ける。
// こうすると「まっすぐ落ちながら、ひらひら回る」動きになる。
function FallingLeaf({ spec }: { spec: LeafSpec }) {
  return (
    <motion.div
      className="absolute"
      style={{ left: spec.left, top: spec.top }}
      initial={{ y: 0, opacity: spec.opacity }}
      animate={{ y: "122vh", opacity: [spec.opacity, spec.opacity, 0] }}
      transition={{
        y: { duration: spec.dur, repeat: Infinity, ease: "linear" },
        opacity: { duration: spec.dur, repeat: Infinity, times: [0, 0.82, 1], ease: "linear" },
      }}
    >
      <motion.div
        animate={{
          x: [0, spec.sway, -spec.sway * 0.7, spec.sway * 0.35, 0],
          rotate: [0, spec.spin],
        }}
        transition={{
          x: { duration: spec.dur * 0.46, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: spec.dur * 0.72, repeat: Infinity, ease: "linear" },
        }}
      >
        <MomijiLeaf fill={spec.tint} size={spec.size} />
      </motion.div>
    </motion.div>
  );
}

export function AutumnLeaves() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* 秋の低い斜光（琥珀→金茶→錆朱。ゆっくり呼吸する） */}
      <motion.div
        className="absolute -right-[12%] -top-[16%] rounded-full"
        style={{
          width: "98vmin",
          height: "98vmin",
          background:
            "radial-gradient(circle, rgba(224,164,65,0.46) 0%, rgba(216,150,55,0.30) 20%, rgba(204,120,45,0.18) 36%, rgba(190,88,32,0.10) 50%, rgba(176,58,23,0.05) 62%, rgba(176,58,23,0.02) 72%, transparent 84%)",
        }}
        animate={{ scale: [0.94, 1.07, 0.94], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 地面側にたまる暖色の照り返し */}
      <div
        className="absolute inset-x-0 bottom-0 h-[42%]"
        style={{ background: "linear-gradient(to top, rgba(156,111,38,0.16), transparent 78%)" }}
      />

      {/* 舞い落ちる紅葉 */}
      {FALLING_LEAVES.map((spec, i) => (
        <FallingLeaf key={i} spec={spec} />
      ))}

      {/* 斜めに流れる、やわらかな秋の光 */}
      <motion.div
        className="absolute inset-x-0 inset-y-[-20%]"
        style={{
          background:
            "linear-gradient(104deg, transparent 36%, rgba(255,244,222,0.45) 48%, rgba(240,206,150,0.30) 54%, transparent 66%)",
          mixBlendMode: "screen",
        }}
        initial={{ x: "-115%" }}
        animate={{ x: ["-115%", "115%"] }}
        transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 1.1, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}

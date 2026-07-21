"use client";

// ============================================================================
// ScrollArrowFlow — Persona 5R 風「矢印が伸びて、それに沿って出現」ギミック。
// スクロールに連動して朱の“エッジの効いた”角ばった背骨（矢印）が pathLength で描き
// 伸び、実パス上を返し付きの矢じりが進む。進行方向にはシェブロン(≫)が点灯し、先端が
// 各ノードに達するとステップカードがスラムインで出現する。
// 配色はこのLPの朱(--shu)/紙(--paper)/墨(--ink)のみ（ダーク化しない）。
// 内容は EVENT / SLOTS の確定事実にのみ接地する（数値・実績を発明しない）。
//
// 設計（レスポンシブ）：
//  - 幾何は内側コンテナの実測幅 W から比例算出。ResizeObserver で追従。
//  - viewBox=W×H かつ要素実寸=W×H の 1:1 空間 → getPointAtLength の座標＝画面px。
//  - md+（W>=768）: センター振り分けの鋭いジグザグ。カード幅は左右の空きから逆算し
//    W からはみ出さないよう clamp。
//  - モバイル（W<768）: 左バンドで鋭くジグザグ＋右1カラムのカード（左端/幅を W 比例で確定）。
//  - 進捗は getBoundingClientRect から自前計算（useScroll({target}) がこのレイアウトだと
//    0 固定になるため）。reduced-motion / 未計測時は静的リストへフォールバック。
// ============================================================================

import { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionValueEvent,
  useReducedMotion,
  type MotionValue,
  type Variants,
} from "framer-motion";
import { EVENT, SLOTS } from "@/lib/site-data";

type Side = "left" | "right";
type Mode = "desktop" | "mobile";

type Step = {
  no: string;
  en: string;
  jp: string;
  body: string;
  side: Side; // md+ でのカード配置。mobile は常に右。
};

const STEPS: Step[] = [
  {
    no: "01",
    en: "RESERVE",
    jp: "ご予約",
    body: `オンラインで枠を確保。全${SLOTS.length}枠・${EVENT.price}でご参加いただけます。`,
    side: "left",
  },
  {
    no: "02",
    en: "VISIT",
    jp: "ご来場",
    body: `当日は${EVENT.venue}へ。${EVENT.timeLabel}。会場の詳細はご予約者へ個別にご案内します。`,
    side: "right",
  },
  {
    no: "03",
    en: "SHOOT",
    jp: "撮影",
    body: `お一人10分。自然光のなか、自然な表情を${EVENT.photographer}が引き出します。`,
    side: "left",
  },
  {
    no: "04",
    en: "RETOUCH",
    jp: "仕上げ",
    body: `撮影者が一枚を厳選し、丁寧にレタッチ。テイストは撮影者にお任せください。`,
    side: "right",
  },
  {
    no: "05",
    en: "DELIVER",
    jp: "お届け",
    body: `${EVENT.benefit}。後日、データでお届けします。`,
    side: "left",
  },
];

type NodePt = { x: number; y: number; side: Side; tickX: number };
type Chevron = { x: number; y: number; deg: number; frac: number };
type Geom = {
  W: number;
  H: number;
  mode: Mode;
  nodes: NodePt[];
  d: string;
  frac: number[];
  chevrons: Chevron[];
  cardW: number;
  cardLeft: number; // mobile 時のカード左端（px）
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// ---- 幾何生成：実測幅 W から鋭いジグザグ・ノード・カード寸法を比例算出 ----
function buildGeom(W: number): Geom {
  const N = STEPS.length;
  const pad = 16;
  const mode: Mode = W < 768 ? "mobile" : "desktop";

  let gap: number, padTop: number, padBottom: number;
  const nodes: NodePt[] = [];
  let cardW = 300;
  let cardLeft = 0;

  if (mode === "desktop") {
    gap = 292;
    padTop = 172;
    padBottom = 196;
    const center = W / 2;
    const amp = clamp(W * 0.16, 88, 205); // 振幅は幅に比例（鋭い対角）
    for (let i = 0; i < N; i++) {
      const side: Side = i % 2 === 0 ? "left" : "right";
      const x = side === "left" ? center - amp : center + amp;
      const y = padTop + i * gap;
      nodes.push({ x, y, side, tickX: x + (side === "left" ? -24 : 24) });
    }
    const innerSpace = center - amp - 26 - pad; // 外側カードが収まる幅
    cardW = Math.min(340, innerSpace);
  } else {
    gap = 250;
    padTop = 132;
    padBottom = 158;
    const bandLo = W * 0.05;
    const bandHi = W * 0.38;
    for (let i = 0; i < N; i++) {
      const x = i % 2 === 0 ? bandLo : bandHi; // 左バンド内で鋭くジグザグ
      const y = padTop + i * gap;
      nodes.push({ x, y, side: "right", tickX: x + 24 });
    }
    cardLeft = W * 0.44;
    cardW = W - cardLeft - 14;
  }

  const H = padTop + padBottom + (N - 1) * gap;

  // 鋭い純ジグザグ（ノードを直結。各ノードは鋭角の V 頂点）
  let d = `M ${nodes[0].x.toFixed(2)} ${nodes[0].y.toFixed(2)}`;
  for (let i = 1; i < N; i++) d += ` L ${nodes[i].x.toFixed(2)} ${nodes[i].y.toFixed(2)}`;

  // 累積長 → 各ノードの frac
  const cum: number[] = [0];
  for (let i = 1; i < N; i++) {
    cum.push(cum[i - 1] + Math.hypot(nodes[i].x - nodes[i - 1].x, nodes[i].y - nodes[i - 1].y));
  }
  const total = cum[N - 1] || 1;
  const frac = cum.map((c) => c / total);

  // セグメント中点に進行方向シェブロン
  const chevrons: Chevron[] = [];
  for (let i = 0; i < N - 1; i++) {
    const a = nodes[i];
    const b = nodes[i + 1];
    chevrons.push({
      x: (a.x + b.x) / 2,
      y: (a.y + b.y) / 2,
      deg: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI,
      frac: (cum[i] + cum[i + 1]) / 2 / total,
    });
  }

  return { W, H, mode, nodes, d, frac, chevrons, cardW, cardLeft };
}

// ---- ノード（背骨上の朱ダイヤ）。draw が frac に達したらポップイン ----
function FlowNode({ node, frac, draw }: { node: NodePt; frac: number; draw: MotionValue<number> }) {
  const a = Math.max(0, frac - 0.05);
  const b = Math.max(a + 0.001, frac);
  const scale = useTransform(draw, [a, b], [0, 1]);
  const opacity = useTransform(draw, [a, Math.max(a + 0.001, frac - 0.008)], [0, 1]);
  const R = 12;
  const diamond = (r: number) =>
    `${node.x},${node.y - r} ${node.x + r},${node.y} ${node.x},${node.y + r} ${node.x - r},${node.y}`;
  return (
    <motion.g style={{ opacity, scale, transformBox: "fill-box", transformOrigin: "center" }}>
      <polygon points={diamond(R + 6)} fill="none" stroke="var(--shu)" strokeWidth={2} opacity={0.45} />
      <polygon points={diamond(R)} fill="var(--shu)" />
      <polygon points={diamond(R * 0.42)} fill="var(--paper)" />
    </motion.g>
  );
}

// ---- ノードからカードへ伸びる短い朱のティック ----
function Connector({ node, frac, draw }: { node: NodePt; frac: number; draw: MotionValue<number> }) {
  const a = Math.max(0, frac - 0.01);
  const b = Math.max(a + 0.001, Math.min(1, frac + 0.02));
  const opacity = useTransform(draw, [a, b], [0, 1]);
  return (
    <motion.line
      x1={node.x}
      y1={node.y}
      x2={node.tickX}
      y2={node.y}
      stroke="var(--shu)"
      strokeWidth={2}
      vectorEffect="non-scaling-stroke"
      style={{ opacity }}
    />
  );
}

// ---- 進行方向シェブロン(≫) ----
function ChevronMark({ c, draw }: { c: Chevron; draw: MotionValue<number> }) {
  const a = Math.max(0, c.frac - 0.02);
  const b = Math.max(a + 0.001, Math.min(1, c.frac + 0.02));
  const opacity = useTransform(draw, [a, b], [0, 1]);
  return (
    <motion.path
      d="M -8 -10 L 4 0 L -8 10"
      fill="none"
      stroke="var(--shu)"
      strokeWidth={2.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
      transform={`translate(${c.x.toFixed(2)} ${c.y.toFixed(2)}) rotate(${c.deg.toFixed(2)})`}
      style={{ opacity }}
    />
  );
}

// ---- ステップカード（HTML）。draw が frac を通過するとスラムインで出現 ----
function FlowCard({
  step,
  mode,
  nodeX,
  nodeY,
  cardLeft,
  cardW,
  frac,
  draw,
}: {
  step: Step;
  mode: Mode;
  nodeX: number;
  nodeY: number;
  cardLeft: number;
  cardW: number;
  frac: number;
  draw: MotionValue<number>;
}) {
  const side: Side = mode === "mobile" ? "right" : step.side;
  const start = Math.max(0, frac - 0.02);
  const end = Math.min(1, Math.max(start + 0.02, frac + 0.07));
  const opacity = useTransform(draw, [start, end], [0, 1]);
  const x = useTransform(draw, [start, end], [side === "left" ? -60 : 60, 0]);
  const y = useTransform(draw, [start, end], [22, 0]);
  const skewX = useTransform(draw, [start, end], [side === "left" ? 9 : -9, 0]);

  const anchor: React.CSSProperties =
    mode === "mobile"
      ? { position: "absolute", top: nodeY, left: cardLeft, transform: "translate(0, -50%)" }
      : {
          position: "absolute",
          top: nodeY,
          left: nodeX,
          transform: side === "left" ? "translate(calc(-100% - 26px), -50%)" : "translate(26px, -50%)",
        };
  const rot = side === "left" ? -1.5 : 1.4;

  return (
    <div style={anchor}>
      <motion.div style={{ opacity, x, y, skewX, width: cardW }}>
        <div
          className="relative rounded-2xl px-5 py-5 md:px-6 md:py-6"
          style={{
            transform: `rotate(${rot}deg)`,
            background: "var(--paper-2)",
            border: "1px solid var(--line)",
            boxShadow: "0 26px 50px -32px rgba(25,21,18,0.55)",
          }}
        >
          {/* 朱の角アクセント（P5的な鋭い縁） */}
          <span
            aria-hidden
            className="absolute -top-px h-[3px]"
            style={{
              width: 46,
              background: "var(--shu)",
              ...(side === "left" ? { right: 14 } : { left: 14 }),
            }}
          />
          <div className="mb-2 flex items-baseline gap-3">
            <span
              className="font-num italic leading-none"
              style={{
                fontSize: "clamp(1.9rem, 4.4vw, 2.9rem)",
                color: "transparent",
                WebkitTextStroke: "1.6px var(--shu)",
              }}
            >
              {step.no}
            </span>
            <span className="font-serif text-[0.62rem] tracking-[0.34em]" style={{ color: "var(--shu)" }}>
              {step.en}
            </span>
          </div>
          <h3
            className="font-display mb-2 tracking-jp"
            style={{ color: "var(--ink)", fontSize: "clamp(1.25rem, 2.6vw, 1.7rem)", lineHeight: 1.15 }}
          >
            {step.jp}
          </h3>
          <p className="font-body text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
            {step.body}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// ---- 静的フォールバック（未マウント / reduced-motion / 未計測時） ----
function StaticFlow() {
  return (
    <ol className="mx-auto flex max-w-2xl flex-col gap-4 px-6">
      {STEPS.map((s, i) => (
        <li
          key={s.no}
          className="relative flex items-start gap-5 rounded-2xl px-5 py-5"
          style={{ background: "var(--paper-2)", border: "1px solid var(--line)" }}
        >
          <span className="flex flex-col items-center pt-1">
            <span
              className="font-num italic leading-none"
              style={{ fontSize: "1.7rem", color: "transparent", WebkitTextStroke: "1.6px var(--shu)" }}
            >
              {s.no}
            </span>
            {i < STEPS.length - 1 && (
              <span className="mt-2 block h-8 w-px" style={{ background: "var(--shu)", opacity: 0.4 }} />
            )}
          </span>
          <span>
            <span className="mb-1 block font-serif text-[0.62rem] tracking-[0.34em]" style={{ color: "var(--shu)" }}>
              {s.en}
            </span>
            <span className="mb-1 block font-display tracking-jp" style={{ color: "var(--ink)", fontSize: "1.4rem" }}>
              {s.jp}
            </span>
            <span className="block font-body text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
              {s.body}
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}

// ---- 返し付きの矢じり（実パス先端に追従・接線方向へ回転） ----
// SVG transform 属性を毎フレーム命令的に更新し、回転軸を先端に固定する。
function ArrowHead({
  draw,
  trackRef,
  pathD,
}: {
  draw: MotionValue<number>;
  trackRef: React.RefObject<SVGPathElement | null>;
  pathD: string;
}) {
  const gRef = useRef<SVGGElement>(null);

  const apply = (p: number) => {
    const path = trackRef.current;
    const g = gRef.current;
    if (!path || !g) return;
    let L = 0;
    try {
      L = path.getTotalLength();
    } catch {
      return;
    }
    if (!L) return;
    const len = Math.max(0.001, Math.min(L, p * L));
    const tip = path.getPointAtLength(len);
    const back = path.getPointAtLength(Math.max(0, len - 8));
    const deg = (Math.atan2(tip.y - back.y, tip.x - back.x) * 180) / Math.PI;
    g.setAttribute("transform", `translate(${tip.x.toFixed(2)} ${tip.y.toFixed(2)}) rotate(${deg.toFixed(2)})`);
    g.style.opacity = p > 0.012 ? "1" : "0";
  };

  useMotionValueEvent(draw, "change", apply);
  useEffect(() => {
    apply(draw.get());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathD]);

  return (
    <g ref={gRef} style={{ opacity: 0 }}>
      {/* グロー（返し付き） */}
      <path d="M 4 0 L -40 -22 L -26 0 L -40 22 Z" fill="var(--shu)" opacity={0.2} />
      {/* 本体：返し付き（凹背）で攻撃的なP5シルエット。先端を local 原点に固定 */}
      <path d="M 2 0 L -31 -16 L -20 0 L -31 16 Z" fill="var(--shu)" />
      <circle cx={0} cy={0} r={3.2} fill="var(--paper)" opacity={0.92} />
    </g>
  );
}

// CTA のスラムイン（P5R風：小さく縮んだ状態から行き過ぎて着地）
const ctaVariants: Variants = {
  hidden: { opacity: 0, scale: 0.4, y: 16 },
  show: {
    opacity: 1,
    scale: [0.35, 1.25, 0.94, 1],
    y: [16, -6, 2, 0],
    transition: { duration: 0.6, times: [0, 0.5, 0.8, 1], ease: [0.16, 1, 0.3, 1] },
  },
};

// 飛び散る火花の到達位置（決定的：乱数不使用）
const CTA_SPARKS = Array.from({ length: 14 }, (_, i) => {
  const a = (i / 14) * Math.PI * 2;
  const r = 104 + (i % 3) * 30;
  return { x: Math.cos(a) * r, y: Math.sin(a) * r };
});

// CTA 出現の派手なバースト（フラッシュ＋ショックウェーブ＋集中線＋火花）。一度だけ再生する。
function CtaBurst() {
  return (
    <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2">
      {/* 背後の朱フラッシュ帯（P5R） */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ width: 360, height: 66, background: "var(--shu)", filter: "blur(3px)" }}
        initial={{ scaleX: 0.12, opacity: 0, skewX: -14 }}
        animate={{ scaleX: [0.12, 1.18, 1], opacity: [0, 0.9, 0], skewX: -14 }}
        transition={{ duration: 0.5, times: [0, 0.4, 1], ease: [0.16, 1, 0.3, 1] }}
      />
      {/* フラッシュ（白熱→橙→朱） */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 260,
          height: 260,
          background:
            "radial-gradient(circle, rgba(255,250,230,1), rgba(255,152,70,0.6) 38%, rgba(226,72,46,0.35) 56%, transparent 74%)",
        }}
        initial={{ scale: 0.2, opacity: 0 }}
        animate={{ scale: [0.2, 1.7], opacity: [0, 1, 0] }}
        transition={{ duration: 0.55, times: [0, 0.26, 1], ease: "easeOut" }}
      />
      {/* ショックウェーブ・リング（3本） */}
      {[0, 0.1, 0.2].map((d, i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ width: 130, height: 130, border: "3.5px solid var(--shu)" }}
          initial={{ scale: 0.3, opacity: 1 }}
          animate={{ scale: 3.8, opacity: 0 }}
          transition={{ duration: 0.78, delay: d, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}
      {/* 集中線（スピードライン）一閃 */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 460,
          height: 460,
          background:
            "repeating-conic-gradient(from 0deg at 50% 50%, rgba(226,72,46,0.6) 0deg 0.9deg, transparent 0.9deg 6.5deg)",
          WebkitMaskImage: "radial-gradient(circle, transparent 22%, black 40%, transparent 66%)",
          maskImage: "radial-gradient(circle, transparent 22%, black 40%, transparent 66%)",
        }}
        initial={{ scale: 0.55, opacity: 0, rotate: -6 }}
        animate={{ scale: [0.55, 1.15], opacity: [0, 0.9, 0], rotate: 0 }}
        transition={{ duration: 0.52, times: [0, 0.38, 1], ease: "easeOut" }}
      />
      {/* 火花 */}
      {CTA_SPARKS.map((s, i) => (
        <motion.span
          key={i}
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: 8,
            height: 8,
            marginLeft: -4,
            marginTop: -4,
            background: i % 2 ? "var(--shu)" : "#ffb84d",
          }}
          initial={{ x: 0, y: 0, opacity: 0, scale: 1 }}
          animate={{ x: s.x, y: s.y, opacity: [0, 1, 0], scale: [1, 1, 0.2] }}
          transition={{ duration: 0.66, times: [0, 0.18, 1], ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

export default function ScrollArrowFlow() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<SVGPathElement | null>(null);

  const prefersReduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [W, setW] = useState(0);

  useEffect(() => setMounted(true), []);

  // 内側コンテナ幅を実測（レスポンシブに追従）
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const update = () => setW((prev) => (prev === el.clientWidth ? prev : el.clientWidth));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [mounted]);

  const geom = useMemo(() => (W > 0 ? buildGeom(W) : null), [W]);

  const animated = mounted && !prefersReduced && geom !== null;

  // 背骨エリアの進捗 0→1 を getBoundingClientRect から自前計算。
  // p=0 でコンテナ上端が viewport の 80% 位置、p=1 で下端が 80% 位置。
  const target = useMotionValue(0);
  const draw = useSpring(target, { stiffness: 120, damping: 30, restDelta: 0.001 });

  // 矢印の描画がほぼ完了したら CTA を派手に出現させる（一度出たら維持）
  const [ctaReady, setCtaReady] = useState(false);
  useMotionValueEvent(draw, "change", (v) => {
    if (v > 0.985) setCtaReady(true);
  });

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || !animated) return;
    let raf = 0;
    const compute = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const H = rect.height || 1;
      const p = Math.min(1, Math.max(0, (vh * 0.8 - rect.top) / H));
      target.set(p);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [animated, geom, target]);

  return (
    <section
      className="torn-top relative overflow-hidden py-24 md:py-32"
      style={{ background: "var(--paper)" }}
      aria-label="当日の流れ"
    >
      {/* 背景の巨大な淡い和字（P5的テクスチャ） */}
      <span
        aria-hidden
        className="pointer-events-none absolute -left-[3vw] top-24 select-none font-display leading-none"
        style={{ fontSize: "clamp(12rem, 30vw, 34rem)", color: "var(--ink)", opacity: 0.04, writingMode: "vertical-rl" }}
      >
        流
      </span>

      {/* 見出し */}
      <div className="relative z-10 mx-auto mb-8 max-w-6xl px-6 md:mb-4">
        <span className="font-serif text-[0.7rem] tracking-[0.36em]" style={{ color: "var(--shu)" }}>
          Session Flow
        </span>
        <h2
          className="font-display mt-3"
          style={{
            color: "var(--ink)",
            fontSize: "clamp(1.7rem, 5.2vw, 3.4rem)",
            lineHeight: 1.1,
            letterSpacing: "-0.015em",
            transform: "rotate(-1.2deg)",
          }}
        >
          ご予約から<span className="mark-shu">お届け</span>まで、<br />
          矢印に沿って。
        </h2>
        <p className="mt-4 max-w-md font-body text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
          当日の流れを、スクロールで辿れます。矢印が進むごとに、次のステップが現れます。
        </p>
      </div>

      {/* 背骨エリア（実測対象・スクロールターゲット） */}
      <div
        ref={sectionRef}
        className="relative z-10 mx-auto w-full max-w-6xl"
        style={animated && geom ? { height: geom.H } : undefined}
      >
        {animated && geom ? (
          <>
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full"
              viewBox={`0 0 ${geom.W} ${geom.H}`}
              preserveAspectRatio="none"
              aria-hidden
            >
              {/* トラック（薄い全体像＝計測用の実パス） */}
              <path
                ref={trackRef}
                d={geom.d}
                fill="none"
                stroke="var(--line-strong)"
                strokeWidth={1.5}
                strokeLinecap="butt"
                strokeLinejoin="miter"
                strokeMiterlimit={8}
                opacity={0.5}
                vectorEffect="non-scaling-stroke"
              />
              {/* 朱グロー（描画分の下地） */}
              <motion.path
                d={geom.d}
                fill="none"
                stroke="var(--shu)"
                strokeWidth={11}
                strokeLinecap="butt"
                strokeLinejoin="miter"
                strokeMiterlimit={8}
                opacity={0.14}
                vectorEffect="non-scaling-stroke"
                style={{ pathLength: draw }}
              />
              {/* 朱の描画本体（pathLength でスクロール連動に伸びる・鋭いミター角） */}
              <motion.path
                d={geom.d}
                fill="none"
                stroke="var(--shu)"
                strokeWidth={4}
                strokeLinecap="butt"
                strokeLinejoin="miter"
                strokeMiterlimit={8}
                vectorEffect="non-scaling-stroke"
                style={{ pathLength: draw }}
              />
              {/* ノード→カードのティック */}
              {geom.nodes.map((n, i) => (
                <Connector key={`c${i}`} node={n} frac={geom.frac[i]} draw={draw} />
              ))}
              {/* 進行方向シェブロン */}
              {geom.chevrons.map((c, i) => (
                <ChevronMark key={`ch${i}`} c={c} draw={draw} />
              ))}
              {/* ノード */}
              {geom.nodes.map((n, i) => (
                <FlowNode key={`n${i}`} node={n} frac={geom.frac[i]} draw={draw} />
              ))}
              {/* 返し付きの矢じり */}
              <ArrowHead draw={draw} trackRef={trackRef} pathD={geom.d} />
            </svg>

            {/* カード（HTML） */}
            {STEPS.map((s, i) => (
              <FlowCard
                key={s.no}
                step={s}
                mode={geom.mode}
                nodeX={geom.nodes[i].x}
                nodeY={geom.nodes[i].y}
                cardLeft={geom.cardLeft}
                cardW={geom.cardW}
                frac={geom.frac[i]}
                draw={draw}
              />
            ))}
          </>
        ) : (
          <StaticFlow />
        )}
      </div>

      {/* 締めのCTA（この流れの起点＝予約へ）：矢印の描画完了で派手に出現 */}
      <div className="relative z-10 mt-16 flex justify-center px-6">
        {animated ? (
          <div className="relative inline-flex">
            {ctaReady && <CtaBurst />}
            <motion.div
              className="relative z-10"
              variants={ctaVariants}
              initial="hidden"
              animate={ctaReady ? "show" : "hidden"}
            >
              <a href="#register" className="btn-primary">
                この流れで予約する
                <span aria-hidden>→</span>
              </a>
            </motion.div>
          </div>
        ) : (
          <a href="#register" className="btn-primary">
            この流れで予約する
            <span aria-hidden>→</span>
          </a>
        )}
      </div>
    </section>
  );
}

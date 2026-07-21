"use client";

// ============================================================================
// ScrollArrowFlow — Persona 5R 風「矢印が伸びて、それに沿って出現」ギミック。
// スクロールに連動して朱の角ばった背骨（矢印）が pathLength で描き伸び、実パス上を
// 矢じりが進む。先端が各ノードに達すると、そのステップカードがスラムインで出現する。
// 配色はこのLPの朱(--shu)/紙(--paper)/墨(--ink)のみ（ダーク化しない）。
// 内容は EVENT / SLOTS の確定事実にのみ接地する（数値・実績を発明しない）。
//
// 実装メモ：
//  - 幾何は内側コンテナの実測幅 W から算出。viewBox=W×H かつ要素実寸=W×H の 1:1 空間
//    にすることで、getPointAtLength の座標＝画面px となりノード/カードと厳密に一致。
//  - ノード/カードの発火は「描画進捗 draw(=pathLength)」に対する各ノードの正規化長さ
//    frac で決める。矢じりは実パスの getPointAtLength で先端に追従（SVG transform 属性を
//    命令的に更新し、回転軸を先端に固定＝ブラウザ間の transform-origin 差を回避）。
//  - reduced-motion / 未マウント / 未計測時は静的な縦リストへフォールバック。
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
} from "framer-motion";
import { EVENT, SLOTS } from "@/lib/site-data";

type Side = "left" | "right";

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

// ---- 幾何生成：実測幅 W から背骨のパス・ノード座標・各ノードの正規化長さを作る ----
type Node = { x: number; y: number };
type Geom = {
  W: number;
  H: number;
  isMobile: boolean;
  nodes: Node[];
  d: string;
  frac: number[]; // 各ノードの「パス全長に対する累積長さ」= draw 発火しきい値
};

function buildGeom(W: number): Geom {
  const isMobile = W < 768;
  const N = STEPS.length;
  const gap = isMobile ? 300 : 336;
  const padTop = isMobile ? 150 : 200;
  const padBottom = isMobile ? 170 : 220;
  const H = padTop + padBottom + (N - 1) * gap;

  const railX = isMobile ? 40 : W / 2;
  const amp = isMobile ? 26 : Math.min(W * 0.15, 148);

  const nodes: Node[] = STEPS.map((_, i) => {
    const y = padTop + i * gap;
    const dir = i % 2 === 0 ? -1 : 1;
    const x = isMobile ? railX + (i % 2 === 0 ? 0 : amp) : railX + dir * amp;
    return { x, y };
  });

  // 角ばったP5的ステア：ノード間に肘（elbow）を2点挟んで折れ線にする。
  const pts: Node[] = [{ x: nodes[0].x, y: nodes[0].y }];
  const nodeIndexInPts: number[] = [0];
  const bend = isMobile ? 34 : 46;
  for (let i = 1; i < nodes.length; i++) {
    const a = nodes[i - 1];
    const b = nodes[i];
    const midY = (a.y + b.y) / 2;
    pts.push({ x: a.x, y: midY - bend });
    pts.push({ x: b.x, y: midY + bend });
    pts.push({ x: b.x, y: b.y });
    nodeIndexInPts.push(pts.length - 1);
  }

  let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
  for (let i = 1; i < pts.length; i++) {
    d += ` L ${pts[i].x.toFixed(2)} ${pts[i].y.toFixed(2)}`;
  }

  // 累積ユークリッド長（SVGの折れ線長と一致）→ 各ノードの frac
  const cum: number[] = [0];
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].x - pts[i - 1].x;
    const dy = pts[i].y - pts[i - 1].y;
    cum.push(cum[i - 1] + Math.hypot(dx, dy));
  }
  const total = cum[cum.length - 1] || 1;
  const frac = nodeIndexInPts.map((idx) => cum[idx] / total);

  return { W, H, isMobile, nodes, d, frac };
}

// ---- 個々のノード（背骨上の朱ダイヤ）。draw が frac に達したらポップイン ----
// 拡大中心は transform-box: fill-box + transform-origin: center（＝ダイヤ自身の中心＝
// ノード点）で確定させ、SVG の transform-origin 解釈差を回避する。
function FlowNode({ node, frac, draw }: { node: Node; frac: number; draw: MotionValue<number> }) {
  const a = Math.max(0, frac - 0.05);
  const b = Math.max(a + 0.001, frac);
  const scale = useTransform(draw, [a, b], [0, 1]);
  const opacity = useTransform(draw, [a, Math.max(a + 0.001, frac - 0.008)], [0, 1]);
  const R = 13;
  const diamond = (r: number) =>
    `${node.x},${node.y - r} ${node.x + r},${node.y} ${node.x},${node.y + r} ${node.x - r},${node.y}`;
  return (
    <motion.g style={{ opacity, scale, transformBox: "fill-box", transformOrigin: "center" }}>
      <polygon points={diamond(R + 5)} fill="none" stroke="var(--shu)" strokeWidth={2} opacity={0.5} />
      <polygon points={diamond(R)} fill="var(--shu)" />
      <polygon points={diamond(R * 0.4)} fill="var(--paper)" />
    </motion.g>
  );
}

// ---- ステップカード（HTML）。draw が frac を通過するとスラムインで出現 ----
function FlowCard({
  step,
  node,
  frac,
  draw,
  isMobile,
}: {
  step: Step;
  node: Node;
  frac: number;
  draw: MotionValue<number>;
  isMobile: boolean;
}) {
  const side: Side = isMobile ? "right" : step.side;
  const start = Math.max(0, frac - 0.02);
  const end = Math.min(1, Math.max(start + 0.02, frac + 0.07));
  const opacity = useTransform(draw, [start, end], [0, 1]);
  const x = useTransform(draw, [start, end], [side === "left" ? -46 : 46, 0]);
  const y = useTransform(draw, [start, end], [20, 0]);
  const skewX = useTransform(draw, [start, end], [side === "left" ? 7 : -7, 0]);

  const anchor: React.CSSProperties = {
    position: "absolute",
    top: node.y,
    left: node.x,
    transform: side === "left" ? "translate(calc(-100% - 26px), -50%)" : "translate(26px, -50%)",
  };
  const cardWidth = isMobile ? "min(70vw, 280px)" : "min(33vw, 340px)";
  const rot = side === "left" ? -1.4 : 1.3;

  return (
    <div style={anchor}>
      <motion.div style={{ opacity, x, y, skewX, width: cardWidth }}>
        <div className="relative" style={{ transform: `rotate(${rot}deg)` }}>
          {/* ノードへ伸びる短い朱の連結線 */}
          <span
            aria-hidden
            className="absolute top-1/2 h-[2px]"
            style={{
              width: 26,
              background: "var(--shu)",
              ...(side === "left" ? { right: -26 } : { left: -26 }),
            }}
          />
          <div
            className="rounded-2xl px-5 py-5 md:px-6 md:py-6"
            style={{
              background: "var(--paper-2)",
              border: "1px solid var(--line)",
              boxShadow: "0 26px 50px -32px rgba(25,21,18,0.55)",
            }}
          >
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

// ---- 動く矢じり（実パス先端に追従・接線方向へ回転） ----
// 回転の曖昧さを避けるため、SVG transform 属性を毎フレーム命令的に更新する。
// tip を local 原点に置いた三角形を translate→rotate するので、回転軸は常に先端。
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
  // 初期化＆パス変化（リサイズ）時に先端位置を取り直す
  useEffect(() => {
    apply(draw.get());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathD]);

  return (
    <g ref={gRef} style={{ opacity: 0 }}>
      <path d="M 4 0 L -34 -17 L -34 17 Z" fill="var(--shu)" opacity={0.22} />
      <path d="M 2 0 L -24 -13 L -24 13 Z" fill="var(--shu)" />
      <circle cx={0} cy={0} r={3.4} fill="var(--paper)" opacity={0.9} />
    </g>
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

  // 背骨エリアを通過する間の進捗 0→1 を getBoundingClientRect から自前計算する。
  // （useScroll({target}) はこのページのレイアウトだとオフセット計算に失敗し 0 固定に
  //   なるため、window スクロールから直接算出して確実にする。）
  // offset 相当：p=0 でコンテナ上端が viewport の 80% 位置、p=1 で下端が 80% 位置。
  const target = useMotionValue(0);
  const draw = useSpring(target, { stiffness: 120, damping: 30, restDelta: 0.001 });

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
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.5}
                vectorEffect="non-scaling-stroke"
              />
              {/* 朱グロー（描画分の下地） */}
              <motion.path
                d={geom.d}
                fill="none"
                stroke="var(--shu)"
                strokeWidth={9}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.16}
                vectorEffect="non-scaling-stroke"
                style={{ pathLength: draw }}
              />
              {/* 朱の描画本体（pathLength でスクロール連動に伸びる） */}
              <motion.path
                d={geom.d}
                fill="none"
                stroke="var(--shu)"
                strokeWidth={3.4}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                style={{ pathLength: draw }}
              />
              {/* ノード */}
              {geom.nodes.map((n, i) => (
                <FlowNode key={i} node={n} frac={geom.frac[i]} draw={draw} />
              ))}
              {/* 動く矢じり */}
              <ArrowHead draw={draw} trackRef={trackRef} pathD={geom.d} />
            </svg>

            {/* カード（HTML） */}
            {STEPS.map((s, i) => (
              <FlowCard
                key={s.no}
                step={s}
                node={geom.nodes[i]}
                frac={geom.frac[i]}
                draw={draw}
                isMobile={geom.isMobile}
              />
            ))}
          </>
        ) : (
          <StaticFlow />
        )}
      </div>

      {/* 締めのCTA（この流れの起点＝予約へ） */}
      <div className="relative z-10 mt-14 flex justify-center px-6">
        <a href="#register" className="btn-primary">
          この流れで予約する
          <span aria-hidden>→</span>
        </a>
      </div>
    </section>
  );
}

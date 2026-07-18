"use client";

// リポジトリ（Persona_5_menu_in_Godot）の各部品を、Webで実現したサンプル集。
// 各カードは元の .gdshader / .gd に1対1で対応（効果を独自にWeb実装。コードや素材のコピーではない）。

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";

const RED = "#e2482e";
const INK = "#0d0b0a";
const STAR = "50,8 60,36 90,37 66,55 75,84 50,67 25,84 34,55 10,37 40,36";
const POLY = "12,22 88,6 96,64 52,96 6,58";

function Card({ title, tag, children }: { title: string; tag: string; children: React.ReactNode }) {
  return (
    <div className="relative flex flex-col overflow-hidden rounded-2xl" style={{ border: "1px solid var(--line)", background: "var(--paper-2)" }}>
      <div className="relative flex min-h-[180px] flex-1 items-center justify-center overflow-hidden">{children}</div>
      <div className="flex items-center justify-between gap-2 px-4 py-3" style={{ borderTop: "1px solid var(--line)" }}>
        <span className="font-display text-sm" style={{ color: "var(--ink)" }}>{title}</span>
        <code className="font-num text-[0.6rem]" style={{ color: RED }}>{tag}</code>
      </div>
    </div>
  );
}

/* stripes.gdshader — 斜めストライプ（回転・速度） */
function Stripes() {
  return (
    <motion.div
      className="h-full w-full"
      style={{ backgroundImage: `repeating-linear-gradient(-24deg, ${RED} 0 14px, ${INK} 14px 28px)` }}
      animate={{ backgroundPositionX: ["0px", "56px"] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
    />
  );
}

/* polka_dots.gdshader — 45°に流れるハーフトーン水玉 */
function PolkaDots() {
  return (
    <motion.div
      className="h-full w-full"
      style={{ background: INK, backgroundImage: `radial-gradient(${RED} 30%, transparent 33%)`, backgroundSize: "20px 20px" }}
      animate={{ backgroundPositionX: ["0px", "20px"], backgroundPositionY: ["0px", "-20px"] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
    />
  );
}

/* circle_wave.gdshader — 中心から広がる同心円ウェーブ */
function CircleWave() {
  return (
    <div className="relative h-full w-full" style={{ background: INK }}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{ width: 200, height: 200, marginLeft: -100, marginTop: -100, border: `2px solid ${RED}` }}
          initial={{ scale: 0, opacity: 0.9 }}
          animate={{ scale: 1, opacity: 0 }}
          transition={{ duration: 2.1, repeat: Infinity, delay: i * 0.7, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

/* distortion.gdshader — ノイズによる歪み（SVGフィルタ） */
function Distortion() {
  return (
    <div className="relative flex h-full w-full items-center justify-center" style={{ background: INK }}>
      <svg width="0" height="0" aria-hidden style={{ position: "absolute" }}>
        <filter id="p5-distort">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves={2} result="n">
            <animate attributeName="baseFrequency" dur="7s" values="0.012 0.02;0.03 0.012;0.012 0.02" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="n" scale="16" />
        </filter>
      </svg>
      <span className="font-num text-5xl italic" style={{ color: RED, filter: "url(#p5-distort)" }}>DISTORT</span>
    </div>
  );
}

/* star_shape_move.gdshader — 回転しながら脈動する星 */
function StarMove() {
  return (
    <div className="flex h-full w-full items-center justify-center" style={{ background: INK }}>
      <motion.svg viewBox="0 0 100 100" className="h-28 w-28" animate={{ rotate: 360 }} transition={{ duration: 9, repeat: Infinity, ease: "linear" }}>
        <motion.polygon points={STAR} fill={RED} animate={{ scale: [1, 1.16, 1] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: "50px 50px" }} />
        <motion.polygon points={STAR} fill="none" stroke={RED} strokeWidth={1.5} animate={{ scale: [1, 1.6], opacity: [0.7, 0] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }} style={{ transformOrigin: "50px 50px" }} />
      </motion.svg>
    </div>
  );
}

/* color_tint.gdshader — 画像に色を掛け合わせ（乗算） */
function ColorTint({ img }: { img?: string }) {
  return (
    <div className="relative h-full w-full">
      {img ? <Image src={img} alt="" fill sizes="30vw" className="object-cover" /> : <div className="h-full w-full" style={{ background: "#888" }} />}
      <motion.div
        className="absolute inset-0"
        style={{ mixBlendMode: "multiply" }}
        animate={{ backgroundColor: [RED, "#2b57b8", "#e7bd54", RED] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

/* simple_mask.gdshader — 形（文字）でテクスチャを抜く */
function MaskReveal() {
  return (
    <div className="flex h-full w-full items-center justify-center" style={{ background: INK }}>
      <motion.span
        className="font-num text-6xl italic"
        style={{
          backgroundImage: `repeating-linear-gradient(-20deg, ${RED} 0 8px, #ffcf5c 8px 16px)`,
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          color: "transparent",
        }}
        animate={{ backgroundPositionX: ["0px", "48px"] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
      >
        MASK
      </motion.span>
    </div>
  );
}

/* Juicy_button.gd — フォーカス/押下のジューシーなオーバーシュート */
function JuicyButton() {
  return (
    <div className="flex h-full w-full items-center justify-center" style={{ background: "var(--paper-3)" }}>
      <motion.button
        type="button"
        whileHover={{ scale: 1.14, skewX: -6 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 500, damping: 10 }}
        className="px-6 py-3 font-display text-lg italic"
        style={{ background: RED, color: "#fff", transformOrigin: "center" }}
      >
        SELECT
      </motion.button>
    </div>
  );
}

/* Follow_mouse.gd — カーソルに追従するオブジェクト */
function FollowMouse() {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18 });
  const sy = useSpring(y, { stiffness: 220, damping: 18 });
  const move = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    x.set(e.clientX - r.left);
    y.set(e.clientY - r.top);
  };
  return (
    <div ref={ref} onMouseMove={move} className="relative h-full w-full cursor-crosshair" style={{ background: INK }}>
      <motion.div className="pointer-events-none absolute h-8 w-8" style={{ left: sx, top: sy, x: "-50%", y: "-50%", background: RED, transform: "skewX(-12deg)" }} />
      <span className="absolute bottom-3 left-3 font-body text-[0.6rem]" style={{ color: "rgba(255,255,255,0.5)" }}>move cursor here</span>
    </div>
  );
}

/* polygon_outline.gd — 多角形の輪郭を描くアニメーション */
function PolygonOutline() {
  return (
    <div className="flex h-full w-full items-center justify-center" style={{ background: INK }}>
      <svg viewBox="0 0 100 100" className="h-28 w-28">
        <polygon points={POLY} fill="rgba(226,72,46,0.12)" />
        <motion.polygon
          points={POLY}
          fill="none"
          stroke={RED}
          strokeWidth={3}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: [0, 1, 1], opacity: [1, 1, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}

/* copy_polygon.gd — 多角形を複製してエコー（残像） */
function CopyPolygon() {
  return (
    <div className="flex h-full w-full items-center justify-center" style={{ background: INK }}>
      <motion.svg viewBox="0 0 140 100" className="h-28 w-40" animate={{ x: [-6, 6, -6] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}>
        {[3, 2, 1, 0].map((k) => (
          <polygon
            key={k}
            points={POLY}
            transform={`translate(${k * 12}, ${k * 3})`}
            fill={k === 0 ? RED : "none"}
            stroke={RED}
            strokeWidth={1.5}
            opacity={k === 0 ? 1 : 0.25 + (3 - k) * 0.05}
          />
        ))}
      </motion.svg>
    </div>
  );
}

/* selecting.tscn — 項目間をスナップする選択カーソル */
function Selecting() {
  const items = ["ITEM 01", "ITEM 02", "ITEM 03"];
  const [sel, setSel] = useState(0);
  return (
    <div className="flex h-full w-full flex-col justify-center gap-2 px-6" style={{ background: "var(--paper-3)" }}>
      {items.map((it, i) => (
        <button key={it} onMouseEnter={() => setSel(i)} onFocus={() => setSel(i)} className="relative px-4 py-2 text-left font-display italic" style={{ color: sel === i ? RED : "var(--muted)" }}>
          {sel === i && (
            <motion.span layoutId="sel-cursor" className="absolute inset-0" style={{ border: `2px solid ${RED}`, background: "var(--shu-wash)" }} transition={{ type: "spring", stiffness: 500, damping: 34 }} />
          )}
          <span className="relative">{it}</span>
        </button>
      ))}
    </div>
  );
}

export default function UiShowcase({ images = [] }: { images?: string[] }) {
  const img = images[0];
  return (
    <section className="relative py-20 md:py-28" style={{ background: "var(--paper)" }}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-3 flex items-center gap-3">
          <span className="h-px w-8" style={{ background: RED }} />
          <span className="font-serif text-xs tracking-[0.3em]" style={{ color: "var(--subtle)" }}>FROM THE REPOSITORY</span>
        </div>
        <h2 className="font-display display-md mb-3" style={{ color: "var(--ink)" }}>リポジトリの部品をWebで再現</h2>
        <p className="font-body text-sm md:text-base mb-10 max-w-2xl" style={{ color: "var(--muted)" }}>
          Persona_5_menu_in_Godot の各シェーダー / スクリプトに対応するライブサンプル。元ファイル名を各カードに表示。
          効果は Next.js（CSS / SVGフィルタ / Framer Motion）で独自に再実装しています（コード・素材のコピーではありません）。
        </p>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Card title="斜めストライプ" tag="stripes.gdshader"><Stripes /></Card>
          <Card title="ハーフトーン水玉" tag="polka_dots.gdshader"><PolkaDots /></Card>
          <Card title="円形ウェーブ" tag="circle_wave.gdshader"><CircleWave /></Card>
          <Card title="ノイズ歪み" tag="distortion.gdshader"><Distortion /></Card>
          <Card title="星形＋脈動" tag="star_shape_move.gdshader"><StarMove /></Card>
          <Card title="カラーティント" tag="color_tint.gdshader"><ColorTint img={img} /></Card>
          <Card title="マスク抜き" tag="simple_mask.gdshader"><MaskReveal /></Card>
          <Card title="ジューシーボタン" tag="Juicy_button.gd"><JuicyButton /></Card>
          <Card title="マウス追従" tag="Follow_mouse.gd"><FollowMouse /></Card>
          <Card title="多角形の輪郭描画" tag="polygon_outline.gd"><PolygonOutline /></Card>
          <Card title="多角形エコー" tag="copy_polygon.gd"><CopyPolygon /></Card>
          <Card title="選択カーソル" tag="selecting.tscn"><Selecting /></Card>
        </div>
      </div>
    </section>
  );
}

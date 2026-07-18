"use client";

// UIパターンのサンプル集。各カードが独立したライブデモ（すべてオリジナル実装）。
// このLPの技術（Framer Motion / CSS / 3D transform）でどんなUIが作れるかの見本。

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";

function Card({ title, tag, children, bg }: { title: string; tag: string; children: React.ReactNode; bg?: string }) {
  return (
    <div
      className="relative flex flex-col overflow-hidden rounded-2xl"
      style={{ border: "1px solid var(--line)", background: "var(--paper-2)" }}
    >
      <div className="relative flex min-h-[200px] flex-1 items-center justify-center overflow-hidden p-6" style={{ background: bg }}>
        {children}
      </div>
      <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: "1px solid var(--line)" }}>
        <span className="font-display text-sm" style={{ color: "var(--ink)" }}>{title}</span>
        <span className="font-body text-[0.58rem] tracking-[0.22em]" style={{ color: "var(--subtle)" }}>{tag}</span>
      </div>
    </div>
  );
}

/* 1. マグネティックボタン */
function MagneticButton() {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 300, damping: 15 });
  const sy = useSpring(y, { stiffness: 300, damping: 15 });
  const move = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    x.set((e.clientX - (r.left + r.width / 2)) * 0.4);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.4);
  };
  return (
    <motion.button
      ref={ref}
      onMouseMove={move}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ x: sx, y: sy }}
      className="btn-primary"
    >
      Hover me <span aria-hidden>→</span>
    </motion.button>
  );
}

/* 2. 3Dチルトカード */
function TiltCard({ img }: { img?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 200, damping: 15 });
  const sry = useSpring(ry, { stiffness: 200, damping: 15 });
  const move = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 20);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 20);
  };
  return (
    <div style={{ perspective: 800 }}>
      <motion.div
        ref={ref}
        onMouseMove={move}
        onMouseLeave={() => { rx.set(0); ry.set(0); }}
        style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d" }}
        className="relative h-44 w-32 overflow-hidden rounded-xl"
      >
        {img ? (
          <Image src={img} alt="" fill sizes="140px" className="object-cover" />
        ) : (
          <div className="h-full w-full" style={{ background: "linear-gradient(140deg, var(--shu), var(--indigo, #16336e))" }} />
        )}
        <div className="absolute inset-0" style={{ boxShadow: "inset 0 0 40px rgba(0,0,0,0.25)" }} />
      </motion.div>
    </div>
  );
}

/* 3. グラスモーフィズム */
function GlassCard() {
  return (
    <div className="relative h-full w-full">
      <motion.div
        aria-hidden
        className="absolute -left-6 top-2 h-28 w-28 rounded-full"
        style={{ background: "var(--shu)" }}
        animate={{ x: [0, 40, 0], y: [0, 20, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute right-0 bottom-0 h-32 w-32 rounded-full"
        style={{ background: "#3b6cd4" }}
        animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <div
        className="absolute left-1/2 top-1/2 flex h-28 w-44 -translate-x-1/2 -translate-y-1/2 flex-col justify-center rounded-2xl px-5"
        style={{ background: "rgba(255,255,255,0.28)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.5)" }}
      >
        <span className="font-display text-base" style={{ color: "#1a1a1a" }}>Frosted Glass</span>
        <span className="font-body text-[0.62rem]" style={{ color: "rgba(0,0,0,0.55)" }}>backdrop-blur</span>
      </div>
    </div>
  );
}

/* 4. Bentoグリッド */
function BentoGrid() {
  const cells = [
    { c: "var(--shu)", s: "col-span-2" },
    { c: "var(--paper-3)", s: "" },
    { c: "#16336e", s: "" },
    { c: "var(--gold, #e7bd54)", s: "" },
    { c: "var(--ink)", s: "col-span-2" },
  ];
  return (
    <div className="grid w-full max-w-[220px] grid-cols-3 gap-2">
      {cells.map((cell, i) => (
        <motion.div
          key={i}
          className={`h-14 rounded-lg ${cell.s}`}
          style={{ background: cell.c }}
          whileHover={{ scale: 1.08, zIndex: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        />
      ))}
    </div>
  );
}

/* 5. 流体グラデーション */
function FluidGradient() {
  const blobs = [
    { c: "#e2482e", d: 8 },
    { c: "#ffcf5c", d: 11 },
    { c: "#2b57b8", d: 9 },
  ];
  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl" style={{ background: "#0d0b1a" }}>
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          className="absolute h-28 w-28 rounded-full"
          style={{ background: b.c, filter: "blur(28px)", left: `${20 + i * 25}%`, top: "30%", mixBlendMode: "screen" }}
          animate={{ x: [0, 40, -20, 0], y: [0, -30, 30, 0], scale: [1, 1.3, 0.9, 1] }}
          transition={{ duration: b.d, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* 6. コマンドパレット（⌘K風） */
function CommandPalette() {
  const cmds = ["新規予約を作成", "ギャラリーを開く", "メンバーを招待", "CSVを書き出す", "設定を開く", "ログアウト"];
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const filtered = cmds.filter((c) => c.includes(q));
  const key = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(s + 1, filtered.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
  };
  return (
    <div className="w-full max-w-[240px] overflow-hidden rounded-xl" style={{ background: "var(--paper)", border: "1px solid var(--line)" }}>
      <input
        value={q}
        onChange={(e) => { setQ(e.target.value); setSel(0); }}
        onKeyDown={key}
        placeholder="⌘K  コマンド検索…"
        className="w-full bg-transparent px-4 py-3 font-body text-sm outline-none"
        style={{ color: "var(--ink)", borderBottom: "1px solid var(--line)" }}
      />
      <div className="max-h-[120px] overflow-auto py-1">
        {filtered.length === 0 && <div className="px-4 py-2 font-body text-xs" style={{ color: "var(--subtle)" }}>該当なし</div>}
        {filtered.map((c, i) => (
          <div
            key={c}
            onMouseEnter={() => setSel(i)}
            className="mx-1 rounded-md px-3 py-2 font-body text-sm"
            style={{ background: sel === i ? "var(--shu-wash)" : "transparent", color: sel === i ? "var(--shu-deep)" : "var(--ink-soft)" }}
          >
            {c}
          </div>
        ))}
      </div>
    </div>
  );
}

/* 7. スプリング・セグメントトグル */
function SegmentedToggle() {
  const opts = ["日", "週", "月"];
  const [i, setI] = useState(0);
  return (
    <div className="flex gap-1 rounded-full p-1" style={{ background: "var(--paper-3)", border: "1px solid var(--line)" }}>
      {opts.map((o, idx) => (
        <button
          key={o}
          onClick={() => setI(idx)}
          className="relative rounded-full px-5 py-2 font-body text-sm"
          style={{ color: i === idx ? "var(--paper-2)" : "var(--muted)" }}
        >
          {i === idx && (
            <motion.span
              layoutId="seg-pill"
              className="absolute inset-0 rounded-full"
              style={{ background: "var(--shu)" }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative">{o}</span>
        </button>
      ))}
    </div>
  );
}

/* 8. コンフェッティ・ボタン */
function ConfettiButton() {
  const [parts, setParts] = useState<{ id: number; x: number; y: number; c: string }[]>([]);
  const idRef = useRef(0);
  const colors = ["#e2482e", "#e7bd54", "#2b57b8", "#ffffff"];
  const burst = () => {
    const next = Array.from({ length: 14 }, (_, k) => {
      const a = (k / 14) * Math.PI * 2;
      const d = 40 + Math.random() * 40;
      return { id: idRef.current++, x: Math.cos(a) * d, y: Math.sin(a) * d, c: colors[k % colors.length] };
    });
    setParts((p) => [...p, ...next]);
    setTimeout(() => setParts((p) => p.slice(next.length)), 700);
  };
  return (
    <div className="relative">
      <button onClick={burst} className="btn-primary">Celebrate 🎉</button>
      <AnimatePresence>
        {parts.map((p) => (
          <motion.span
            key={p.id}
            className="pointer-events-none absolute left-1/2 top-1/2 h-2 w-2 rounded-sm"
            style={{ background: p.c }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

/* 9. 無限マーキー */
function Marquee() {
  const tags = ["Next.js", "Framer Motion", "Three.js", "GLSL", "Tailwind", "TypeScript"];
  const row = [...tags, ...tags];
  return (
    <div className="w-full overflow-hidden" style={{ maskImage: "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)", WebkitMaskImage: "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)" }}>
      <motion.div className="flex w-max gap-3" animate={{ x: ["0%", "-50%"] }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }}>
        {row.map((t, i) => (
          <span key={i} className="whitespace-nowrap rounded-full px-4 py-2 font-body text-sm" style={{ background: "var(--paper-3)", border: "1px solid var(--line)", color: "var(--ink-soft)" }}>{t}</span>
        ))}
      </motion.div>
    </div>
  );
}

export default function UiShowcase({ images = [] }: { images?: string[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const tiltImg = images[0];

  return (
    <section className="relative py-20 md:py-28" style={{ background: "var(--paper)" }}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-3 flex items-center gap-3">
          <span className="h-px w-8" style={{ background: "var(--shu)" }} />
          <span className="font-serif text-xs tracking-[0.3em]" style={{ color: "var(--subtle)" }}>UI PATTERNS</span>
        </div>
        <h2 className="font-display display-md mb-3" style={{ color: "var(--ink)" }}>実装できるUIの例</h2>
        <p className="font-body text-sm md:text-base mb-10 max-w-xl" style={{ color: "var(--muted)" }}>
          各カードはそのまま触れるライブデモです（ホバー・クリック・入力を試せます）。すべてこのLPの技術によるオリジナル実装。
        </p>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Card title="マグネティックボタン" tag="SPRING / MAGNETIC"><MagneticButton /></Card>
          <Card title="3Dチルトカード" tag="PERSPECTIVE / TILT"><TiltCard img={tiltImg} /></Card>
          <Card title="グラスモーフィズム" tag="BACKDROP BLUR"><GlassCard /></Card>
          <Card title="Bentoグリッド" tag="LAYOUT / HOVER"><BentoGrid /></Card>
          <Card title="流体グラデーション" tag="ANIMATED BLOBS"><FluidGradient /></Card>
          <Card title="コマンドパレット" tag="⌘K / KEYBOARD"><CommandPalette /></Card>
          <Card title="セグメントトグル" tag="SHARED LAYOUT"><SegmentedToggle /></Card>
          <Card title="コンフェッティ" tag="PARTICLES"><ConfettiButton /></Card>
          <Card title="無限マーキー" tag="INFINITE SCROLL">{mounted ? <Marquee /> : null}</Card>
        </div>
      </div>
    </section>
  );
}

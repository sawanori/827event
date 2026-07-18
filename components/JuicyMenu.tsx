"use client";

// UIモーションのテスト用「ジューシーなメニュー」。
// スキュー（斜め）パネル＋バネのオーバーシュート＋スイープ帯＋カットイン＋マウス追従グロー。
// 配色・レイアウト・文言はすべてオリジナル（特定作品の素材・ロゴ・フォントは不使用）。

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";

type Item = { key: string; label: string; en: string; no: string; href?: string };

const ITEMS: Item[] = [
  { key: "reserve", label: "予約する", en: "RESERVE", no: "01", href: "#register" },
  { key: "gallery", label: "作品ギャラリー", en: "GALLERY", no: "02", href: "#gallery" },
  { key: "about", label: "撮影会について", en: "ABOUT", no: "03", href: "#about" },
  { key: "details", label: "開催概要", en: "DETAILS", no: "04" },
  { key: "contact", label: "お問い合わせ", en: "CONTACT", no: "05", href: "#register" },
];

const RED = "#e2482e"; // 本LPの朱に寄せたアクセント
const INK = "#0d0b0a";

export default function JuicyMenu({ images = [] }: { images?: string[] }) {
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const gx = useSpring(mx, { stiffness: 120, damping: 20 });
  const gy = useSpring(my, { stiffness: 120, damping: 20 });

  const onMove = (e: React.MouseEvent) => {
    const r = wrapRef.current?.getBoundingClientRect();
    if (!r) return;
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  };

  const go = (href?: string) => {
    if (!href) return;
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  const cutImg = images.length ? images[active % images.length] : undefined;
  const cur = ITEMS[active];

  return (
    <section
      ref={wrapRef}
      onMouseMove={onMove}
      className="relative overflow-hidden py-20 md:py-28"
      style={{ background: INK }}
    >
      {/* 斜めストライプ（ゆっくり流れる） */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-24deg, rgba(255,255,255,0.05) 0 2px, transparent 2px 22px)",
        }}
        animate={{ backgroundPositionX: ["0px", "48px"] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      />
      {/* 水玉（ハーフトーン風） */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(rgba(226,72,46,0.22) 1.4px, transparent 1.7px)",
          backgroundSize: "18px 18px",
          WebkitMaskImage: "linear-gradient(120deg, black, transparent 72%)",
          maskImage: "linear-gradient(120deg, black, transparent 72%)",
        }}
      />
      {/* マウス追従グロー */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute h-64 w-64 rounded-full"
        style={{
          left: gx,
          top: gy,
          x: "-50%",
          y: "-50%",
          background: "radial-gradient(circle, rgba(226,72,46,0.30), transparent 65%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="mb-8 flex items-center gap-3">
          <span className="inline-block h-3 w-3" style={{ background: RED, transform: "skewX(-14deg)" }} />
          <span className="font-body text-xs tracking-[0.34em]" style={{ color: "rgba(255,255,255,0.6)" }}>
            UI MOTION TEST — JUICY MENU
          </span>
        </div>

        <div className="grid items-center gap-10 md:grid-cols-2">
          {/* メニュー */}
          <ul className="flex flex-col gap-3">
            {ITEMS.map((it, i) => {
              const on = active === i;
              return (
                <motion.li
                  key={it.key}
                  initial={{ opacity: 0, x: -60, skewX: -18 }}
                  whileInView={{ opacity: 1, x: 0, skewX: -12 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ type: "spring", stiffness: 320, damping: 18, delay: i * 0.06 }}
                >
                  <motion.button
                    type="button"
                    onHoverStart={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onClick={() => {
                      setActive(i);
                      go(it.href);
                    }}
                    whileHover={{ x: 22, scale: 1.05, skewX: -6 }}
                    whileFocus={{ x: 22, scale: 1.05, skewX: -6 }}
                    whileTap={{ scale: 0.95, skewX: -14 }}
                    transition={{ type: "spring", stiffness: 500, damping: 13 }}
                    className="relative flex w-full items-center gap-4 overflow-hidden px-5 py-4 text-left"
                    style={{
                      transformOrigin: "left center",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    {/* スイープ帯（フォーカスで左から伸びる） */}
                    <motion.span
                      aria-hidden
                      className="absolute inset-0 origin-left"
                      style={{ background: RED }}
                      initial={false}
                      animate={{ scaleX: on ? 1 : 0 }}
                      transition={{ type: "spring", stiffness: 420, damping: 20 }}
                    />
                    <span
                      className="relative font-num text-2xl"
                      style={{ color: on ? "#fff" : RED, fontStyle: "italic" }}
                    >
                      {it.no}
                    </span>
                    <span className="relative flex-1">
                      <span
                        className="block font-display text-xl"
                        style={{ color: "#fff", fontStyle: "italic", letterSpacing: "0.02em" }}
                      >
                        {it.label}
                      </span>
                      <span
                        className="block font-body text-[0.6rem] tracking-[0.3em]"
                        style={{ color: on ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.4)" }}
                      >
                        {it.en}
                      </span>
                    </span>
                    <span
                      className="relative font-num text-lg transition-opacity"
                      style={{ color: "#fff", opacity: on ? 1 : 0 }}
                    >
                      →
                    </span>
                  </motion.button>
                </motion.li>
              );
            })}
          </ul>

          {/* カットイン */}
          <div className="relative hidden h-[440px] md:block">
            <AnimatePresence>
              <motion.div
                key={cur.key}
                initial={{ opacity: 0, x: 120, rotate: 8, skewY: 5 }}
                animate={{ opacity: 1, x: 0, rotate: -4, skewY: 0 }}
                exit={{ opacity: 0, x: -90, rotate: -10 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                className="absolute inset-0"
              >
                <span
                  className="absolute -top-8 right-0 font-num leading-none"
                  style={{ fontSize: "9rem", color: "rgba(226,72,46,0.25)", fontStyle: "italic" }}
                >
                  {cur.no}
                </span>
                <div
                  className="absolute inset-6 overflow-hidden"
                  style={{
                    transform: "skewY(-4deg) rotate(2deg)",
                    border: `3px solid ${RED}`,
                    boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
                  }}
                >
                  {cutImg ? (
                    <Image
                      src={cutImg}
                      alt=""
                      fill
                      sizes="40vw"
                      className="object-cover"
                      style={{ transform: "scale(1.18) skewY(4deg)" }}
                    />
                  ) : (
                    <div className="h-full w-full" style={{ background: RED }} />
                  )}
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(120deg, rgba(226,72,46,0.35), transparent 60%)" }}
                  />
                </div>
                <div
                  className="absolute bottom-3 left-1 px-5 py-2"
                  style={{ background: INK, border: `2px solid ${RED}`, transform: "skewX(-10deg)" }}
                >
                  <span className="font-display text-lg" style={{ color: "#fff", fontStyle: "italic" }}>
                    {cur.label}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

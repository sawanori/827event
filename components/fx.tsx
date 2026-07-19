"use client";

// リポジトリの効果部品を、このLPのブランド色（朱 --shu ＋ ペーパー）で控えめに再現。
// セクション背景パターン（stripes / polka_dots / circle_wave）と星アクセント。

import type { ReactNode } from "react";
import { motion } from "framer-motion";

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
  return (
    <div className={`relative mb-9 md:mb-12 ${align === "center" ? "text-center" : ""}`}>
      <motion.div
        initial={{ opacity: 0, x: align === "center" ? 0 : -48, y: 20, skewX: align === "center" ? 0 : -8 }}
        whileInView={{ opacity: 1, x: 0, y: 0, skewX: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ type: "spring", stiffness: 240, damping: 20 }}
        className={`flex flex-col gap-1 md:flex-row md:items-end md:gap-6 ${align === "center" ? "items-center md:justify-center" : "items-start"}`}
      >
        <span
          className="font-num leading-[0.8] select-none"
          style={{
            fontSize: "clamp(2.8rem, 8vw, 5.6rem)",
            fontStyle: "italic",
            color: "transparent",
            WebkitTextStroke: "2px var(--shu)",
          }}
          aria-hidden
        >
          {no}
        </span>
        <div className="pb-1.5">
          <span className="block font-serif text-[0.7rem] tracking-[0.34em] mb-2" style={{ color: "var(--shu)" }}>
            {en}
          </span>
          <h2
            className="font-display"
            style={{ color: "var(--ink)", fontSize: "clamp(1.7rem, 4.2vw, 3.1rem)", lineHeight: 1.12, fontWeight: 700, letterSpacing: "-0.01em" }}
          >
            {children}
          </h2>
        </div>
      </motion.div>
      <motion.div
        aria-hidden
        className="mt-4 h-[3px]"
        style={{ background: "linear-gradient(90deg, var(--shu), transparent)", transformOrigin: "left", transform: "skewX(-24deg)" }}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      />
    </div>
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

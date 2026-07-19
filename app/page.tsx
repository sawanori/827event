"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
  MotionConfig,
  type Variants,
} from "framer-motion";
import Countdown from "@/components/Countdown";
import BookingForm from "@/components/BookingForm";
import Parallax from "@/components/Parallax";
import ParallaxImage from "@/components/ParallaxImage";
import { SectionFx, SectionHead, SlashBand } from "@/components/fx";
import {
  EVENT,
  SLOTS,
  CONCERNS,
  NOTICES,
  GALLERY_TABS,
  MEMBER_IMAGES,
  MEMBER_HERO_IMAGES,
  type GalleryCategory,
} from "@/lib/site-data";

// WebGL コンポーネントは SSR を避けてクライアントのみで読み込む
const HeroPortrait = dynamic(() => import("@/components/three/HeroPortrait"), {
  ssr: false,
  loading: () => null,
});
const ScrollRibbon = dynamic(() => import("@/components/three/ScrollRibbon"), {
  ssr: false,
  loading: () => null,
});

// 表示のたびに順番をシャッフル（Fisher–Yates）。SSRは元順のまま、マウント後にランダム化して
// ハイドレーション不一致を避ける。
function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Caps = { webgl: boolean; reduced: boolean; ready: boolean };

/* ---- モーション共通 ---- */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};
const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

function Reveal({
  children,
  className,
  delay = 0,
  y = 26,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.28 }}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

function Eyebrow({ children, ink = false }: { children: React.ReactNode; ink?: boolean }) {
  return <span className={`eyebrow ${ink ? "eyebrow-ink" : ""}`}>{children}</span>;
}

export default function Home() {
  const [intro, setIntro] = useState(true);
  const [caps, setCaps] = useState<Caps>({ webgl: true, reduced: false, ready: false });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<GalleryCategory>("member");
  const [slideIndex, setSlideIndex] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [showSticky, setShowSticky] = useState(false);

  const prefersReduced = useReducedMotion();
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress: heroProg } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroSmooth = useSpring(heroProg, { stiffness: 90, damping: 30, mass: 0.5, restDelta: 0.001 });
  const heroTitleY = useTransform(heroSmooth, [0, 1], prefersReduced ? [0, 0] : [0, -90]);
  const heroTitleOpacity = useTransform(heroSmooth, [0, 0.8], [1, 0]);
  const heroPortraitY = useTransform(heroSmooth, [0, 1], prefersReduced ? [0, 0] : [0, 70]);
  const heroBgY = useTransform(heroSmooth, [0, 1], prefersReduced ? ["0%", "0%"] : ["0%", "26%"]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  // マウント後に毎回シャッフル（初回描画は元順にしてSSRと一致させる）
  const memberImages = useMemo(() => (mounted ? shuffle(MEMBER_IMAGES) : MEMBER_IMAGES), [mounted]);
  // ヒーローは ○1 のみ（＋port）の専用セットから
  const heroImages = useMemo(() => (mounted ? shuffle(MEMBER_HERO_IMAGES) : MEMBER_HERO_IMAGES), [mounted]);
  const heroPortraits = useMemo(() => heroImages.slice(0, 5), [heroImages]);
  const ribbonImages = useMemo(() => memberImages.slice(2, 11), [memberImages]);
  const slideshowImages = useMemo(() => memberImages.slice(0, 6), [memberImages]);
  const currentImages = useMemo(() => {
    const base = GALLERY_TABS.find((t) => t.key === activeTab)!.images;
    return mounted ? shuffle(base) : base;
  }, [activeTab, mounted]);
  const use3DHero = caps.ready && caps.webgl && !caps.reduced;

  // 端末性能・モーション設定を検出
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let webgl = false;
    try {
      const c = document.createElement("canvas");
      webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      webgl = false;
    }
    setCaps({ webgl, reduced, ready: true });
  }, []);

  // イントロ幕
  useEffect(() => {
    const t = setTimeout(() => setIntro(false), 1250);
    return () => clearTimeout(t);
  }, []);

  // About スライドショー
  useEffect(() => {
    const id = setInterval(() => setSlideIndex((i) => (i + 1) % slideshowImages.length), 4600);
    return () => clearInterval(id);
  }, [slideshowImages.length]);

  // ヘッダ／スティッキーCTA
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      setShowSticky(window.scrollY > window.innerHeight * 0.9);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ライトボックスのキーボード操作・フォーカス管理
  useEffect(() => {
    if (!selectedImage) return;
    const prev = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedImage(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, [selectedImage]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="grain">
        {/* ===== イントロ幕 ===== */}
        <AnimatePresence>
          {intro && (
            <motion.div
              key="intro"
              className="fixed inset-0 z-[70] flex flex-col items-center justify-center px-6"
              style={{ background: "var(--paper)" }}
              initial={{ y: 0 }}
              exit={{ y: "-101%" }}
              transition={{ duration: 0.95, ease: [0.76, 0, 0.24, 1] }}
            >
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="font-body text-xs tracking-[0.32em] mb-5"
                style={{ color: "var(--muted)" }}
              >
                NONTURN.LLC — SUMMER SESSION
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.08 }}
                className="font-num text-5xl md:text-7xl"
                style={{ color: "var(--ink)" }}
              >
                2026<span style={{ color: "var(--shu)" }}>.</span>8<span style={{ color: "var(--shu)" }}>.</span>5
              </motion.p>
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="mt-6 block h-px w-40 origin-left"
                style={{ background: "var(--shu)" }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== ヘッダ ===== */}
        <header
          className="fixed inset-x-0 top-0 z-50 transition-all duration-500"
          style={{
            background: scrolled ? "rgba(241,235,223,0.82)" : "transparent",
            borderBottom: `1px solid ${scrolled ? "var(--line)" : "transparent"}`,
            backdropFilter: scrolled ? "blur(10px)" : "none",
          }}
        >
          <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
            <div className="flex items-baseline gap-3">
              <span className="font-display text-lg tracking-jp" style={{ color: "var(--ink)" }}>
                夏の撮影会
              </span>
              <span className="hidden sm:inline font-body text-[0.68rem] tracking-[0.24em]" style={{ color: "var(--subtle)" }}>
                NONTURN.LLC
              </span>
            </div>
            <div className="flex items-center gap-5">
              <span className="hidden md:inline font-num text-sm" style={{ color: "var(--muted)" }}>
                2026.8.5
              </span>
              <a href="#register" className="btn-ghost text-sm">予約する</a>
            </div>
          </div>
        </header>

        {/* ===== スティッキー予約CTA（モバイル） ===== */}
        <motion.a
          href="#register"
          initial={{ y: 90, opacity: 0 }}
          animate={showSticky ? { y: 0, opacity: 1 } : { y: 90, opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="btn-primary fixed z-40 bottom-5 left-1/2 -translate-x-1/2 md:hidden text-sm"
        >
          予約する（残枠あり）
        </motion.a>

        <main className="relative">
          {/* ===== ヒーロー ===== */}
          <section
            ref={heroRef}
            className="relative min-h-[100svh] flex items-center overflow-hidden md:pt-24 md:pb-16"
          >
            {/* 背景の大きな和字（最遅レイヤー） */}
            <motion.div
              aria-hidden
              style={{ y: heroBgY }}
              className="hidden md:block pointer-events-none absolute -right-[6vw] top-1/2 -translate-y-1/2 select-none"
            >
              <span
                className="font-display leading-none"
                style={{
                  fontSize: "clamp(16rem, 34vw, 40rem)",
                  color: "var(--ink)",
                  opacity: 0.04,
                  writingMode: "vertical-rl",
                }}
              >
                夏
              </span>
            </motion.div>

            {/* ===== モバイル：画像全面＋テキスト重ね（md未満のみ） ===== */}
            <div className="md:hidden absolute inset-0 z-0">
              <Image
                src={heroPortraits[0]}
                alt="プロフィール撮影サンプル"
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
              {/* 可読性のためのスクリム（上は控えめ・下は濃いめ） */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(20,16,14,0.30) 0%, rgba(20,16,14,0.08) 34%, rgba(20,16,14,0.18) 58%, rgba(20,16,14,0.74) 100%)",
                }}
              />
            </div>

            <motion.div
              className="md:hidden relative z-10 flex min-h-[100svh] flex-col justify-between px-6 pt-28 pb-12"
              variants={stagger}
              initial="hidden"
              animate={intro ? "hidden" : "show"}
            >
              <div style={{ textShadow: "0 2px 14px rgba(0,0,0,0.45)" }}>
                <motion.p
                  variants={fadeUp}
                  className="font-serif text-[0.7rem] tracking-[0.3em] mb-4"
                  style={{ color: "rgba(255,255,255,0.85)" }}
                >
                  SUMMER PORTRAIT SESSION
                </motion.p>
                <motion.h1
                  variants={fadeUp}
                  className="font-display mb-4"
                  style={{ color: "#fff", fontSize: "clamp(2rem, 11vw, 2.9rem)", lineHeight: 1.1, letterSpacing: "-0.01em" }}
                >
                  <span className="block">夏の光で、</span>
                  <span className="block">
                    新しい<span style={{ color: "#ff8360" }}>自分</span>を。
                  </span>
                </motion.h1>
                <motion.p
                  variants={fadeUp}
                  className="font-display text-lg tracking-jp"
                  style={{ color: "rgba(255,255,255,0.92)" }}
                >
                  夏の新プロフィール撮影会
                </motion.p>
              </div>

              <motion.div variants={fadeUp} className="flex flex-col gap-4">
                <p
                  className="font-body text-xs leading-relaxed"
                  style={{ color: "rgba(255,255,255,0.88)", textShadow: "0 1px 10px rgba(0,0,0,0.5)" }}
                >
                  {EVENT.dateJa}（{EVENT.weekday}）{EVENT.timeLabel} ／ {EVENT.venue}・{EVENT.price}・限定{EVENT.capacity}名
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <a href="#register" className="btn-primary">
                    いますぐ予約する
                    <span aria-hidden>→</span>
                  </a>
                  <a
                    href="#about"
                    className="btn-outline"
                    style={{ color: "#fff", borderColor: "rgba(255,255,255,0.55)" }}
                  >
                    撮影会について
                  </a>
                </div>
              </motion.div>
            </motion.div>

            {/* ===== md以上：左右分割（現状維持） ===== */}
            <div className="hidden md:block relative z-10 mx-auto w-full max-w-7xl px-6">
              <div className="grid md:grid-cols-12 gap-10 md:gap-8 items-center">
                {/* コピー */}
                <motion.div
                  style={{ y: heroTitleY, opacity: heroTitleOpacity }}
                  className="hero-copy md:col-span-7 lg:col-span-6"
                >
                  <motion.div
                    variants={stagger}
                    initial="hidden"
                    animate={intro ? "hidden" : "show"}
                  >
                    <motion.div variants={fadeUp} className="mb-7">
                      <Eyebrow>Summer Portrait Session</Eyebrow>
                    </motion.div>

                    <motion.h1
                      variants={fadeUp}
                      className="font-display hero-title mb-6"
                      style={{ color: "var(--ink)" }}
                    >
                      <span className="block">夏の光で、</span>
                      <span className="block">
                        新しい<span className="mark-shu">自分</span>を。
                      </span>
                    </motion.h1>

                    <motion.p
                      variants={fadeUp}
                      className="font-display text-xl md:text-2xl mb-5 tracking-jp"
                      style={{ color: "var(--ink-soft)" }}
                    >
                      夏の新プロフィール撮影会
                    </motion.p>

                    <motion.p
                      variants={fadeUp}
                      className="font-body text-sm md:text-base leading-relaxed mb-8 max-w-lg"
                      style={{ color: "var(--muted)" }}
                    >
                      {EVENT.brand}のフォトグラファー{EVENT.photographer}が、企業ブランディングで培った
                      技術で、あなたの自然な表情を一枚に。{EVENT.dateJa}（{EVENT.weekday}）{EVENT.timeLabel}、
                      {EVENT.venue}にて。{EVENT.price}・限定{EVENT.capacity}名・{EVENT.target}。
                    </motion.p>

                    <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3 mb-10">
                      <a href="#register" className="btn-primary">
                        いますぐ予約する
                        <span aria-hidden>→</span>
                      </a>
                      <a href="#about" className="btn-outline">撮影会について</a>
                    </motion.div>

                    <motion.div variants={fadeUp}>
                      <Countdown />
                    </motion.div>
                  </motion.div>
                </motion.div>

                {/* ポートレート（WebGL） */}
                <motion.div
                  style={{ y: heroPortraitY }}
                  initial={{ opacity: 0 }}
                  animate={intro ? { opacity: 0 } : { opacity: 1 }}
                  transition={{ duration: 1.1, delay: 0.2 }}
                  className="md:col-span-5 lg:col-span-6"
                >
                  <div className="relative mx-auto w-full max-w-[380px] md:max-w-none">
                    <div className="relative aspect-[3/4] frame frame-inset canvas-well">
                      {use3DHero ? (
                        <HeroPortrait images={heroPortraits} />
                      ) : (
                        <ParallaxImage
                          src={heroPortraits[0]}
                          alt="プロフィール撮影サンプル"
                          amount={8}
                          priority
                          sizes="(max-width: 768px) 90vw, 40vw"
                          style={{ position: "absolute", inset: 0 }}
                        />
                      )}
                      <div className="pointer-events-none absolute inset-0" style={{ boxShadow: "inset 0 0 90px rgba(25,21,18,0.10)" }} />
                    </div>
                    {/* キャプション */}
                    <div className="absolute -bottom-4 left-4 flex items-center gap-3 px-4 py-2 rounded-full glass">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--shu)" }} />
                      <span className="font-serif text-xs tracking-[0.18em]" style={{ color: "var(--ink-soft)" }}>
                        PORTRAIT — by {EVENT.photographer}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* スクロールインジケータ（md以上のみ） */}
            <div className="hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2 flex-col items-center gap-2">
              <span className="font-serif text-[0.62rem] tracking-[0.3em]" style={{ color: "var(--subtle)" }}>SCROLL</span>
              <span className="block h-10 w-px" style={{ background: "linear-gradient(var(--line-strong), transparent)" }} />
            </div>
          </section>

          {/* ===== コンセプト / お悩み ===== */}
          <section className="relative overflow-hidden py-28 md:py-44">
            <SectionFx variant="stripes" />
            {/* 巨大なアウトライン 01（背面・はみ出し・回転） */}
            <span
              aria-hidden
              className="pointer-events-none absolute -left-[4vw] -top-6 select-none font-num leading-none"
              style={{
                fontSize: "clamp(11rem, 34vw, 30rem)",
                fontStyle: "italic",
                color: "transparent",
                WebkitTextStroke: "2px var(--shu)",
                opacity: 0.13,
                transform: "rotate(-7deg)",
              }}
            >
              01
            </span>

            <div className="relative z-10 mx-auto max-w-6xl px-6">
              {/* 見出し：左に寄せ・回転・少しはみ出す */}
              <Reveal className="max-w-2xl md:-ml-1">
                <span className="font-serif text-[0.7rem] tracking-[0.36em]" style={{ color: "var(--shu)" }}>
                  CONCEPT
                </span>
                <h2
                  className="font-display mt-3"
                  style={{
                    color: "var(--ink)",
                    fontSize: "clamp(1.7rem, 5.2vw, 3.5rem)",
                    lineHeight: 1.1,
                    letterSpacing: "-0.015em",
                    transform: "rotate(-1.4deg)",
                  }}
                >
                  装いが変わる季節に、<br />
                  表情もひとつ、<span className="mark-shu">新しく</span>。
                </h2>
              </Reveal>

              {/* お悩み：非対称・回転・重なりの階段カード（右寄せ） */}
              <motion.ul
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.12 }}
                className="mt-12 flex flex-col md:ml-auto md:mt-2 md:w-[64%]"
              >
                {CONCERNS.map((item, i) => (
                  <motion.li
                    key={i}
                    variants={fadeUp}
                    className={`relative ${["md:ml-0", "md:ml-[26px]", "md:ml-[46px]", "md:ml-[60px]"][i] ?? ""}`}
                    style={{ marginTop: i === 0 ? 0 : "-0.6rem", zIndex: 20 - i }}
                  >
                    <div
                      className="flex items-center gap-5 rounded-2xl px-6 py-5"
                      style={{
                        background: "var(--paper-2)",
                        border: "1px solid var(--line)",
                        boxShadow: "0 22px 44px -30px rgba(25,21,18,0.5)",
                        transform: `rotate(${[-1.4, 1.2, -1.1, 1.5][i] ?? 0}deg)`,
                      }}
                    >
                      <span className="font-num italic leading-none" style={{ color: "var(--shu)", fontSize: "clamp(2.2rem, 5vw, 3.2rem)" }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <p className="font-body text-base md:text-lg leading-snug" style={{ color: "var(--ink-soft)" }}>
                        {item.text}
                      </p>
                    </div>
                  </motion.li>
                ))}
              </motion.ul>

              <Reveal className="mt-14 max-w-md">
                <p className="font-body leading-loose" style={{ color: "var(--muted)" }}>
                  衣替えのように、プロフィールも夏仕様へ。ほんの少しの光の違いで、写真の印象は大きく変わります。この夏、後半戦のあなたを、新しい一枚から始めませんか。
                </p>
              </Reveal>
            </div>
          </section>

          {/* ===== 撮影会について ===== */}
          <section id="about" className="relative py-28 md:py-44 overflow-hidden">
            <SectionFx variant="wave" />
            <div className="relative mx-auto max-w-6xl px-6">
              <div className="grid items-center gap-y-12 md:grid-cols-12 md:gap-x-4">
                {/* テキスト（左・前面・チェックはずらした回転チップ） */}
                <div className="relative z-20 order-2 md:order-1 md:col-span-7 md:pr-6">
                  <Reveal>
                    <SectionHead no="02" en="About the Session">
                      夏の光を味方に、<br />
                      <span className="mark-shu">映える</span>あなたを。
                    </SectionHead>
                    <p className="mb-8 max-w-md font-body leading-loose" style={{ color: "var(--muted)" }}>
                      普段は企業ブランディング向けに行う撮影を、個人の方にも。
                      自然光と表情を丁寧に引き出し、プロフィールにふさわしい一枚に仕上げます。
                    </p>
                    <ul className="flex max-w-lg flex-col gap-3">
                      {[
                        { t: `${EVENT.price}でご参加いただけます`, s: "参加費は一切かかりません" },
                        { t: EVENT.benefit, s: "後日データでお渡しします" },
                        { t: `限定${EVENT.capacity}名・${EVENT.target}`, s: "少人数だからこその丁寧な撮影" },
                      ].map((b, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-4 rounded-xl px-5 py-3.5"
                          style={{
                            background: "var(--paper-2)",
                            border: "1px solid var(--line)",
                            marginLeft: `${i * 24}px`,
                            transform: `rotate(${i % 2 ? -1.4 : 1.2}deg)`,
                            boxShadow: "0 16px 34px -26px rgba(25,21,18,0.5)",
                          }}
                        >
                          <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full" style={{ background: "var(--shu)" }}>
                            <svg className="h-3.5 w-3.5" fill="none" stroke="var(--paper-2)" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                          <span>
                            <span className="block font-body text-base md:text-lg" style={{ color: "var(--ink)" }}>{b.t}</span>
                            <span className="block font-body text-sm" style={{ color: "var(--subtle)" }}>{b.s}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </Reveal>
                </div>

                {/* 画像（右・回転・背面の朱ブロック・テキストへ重なる） */}
                <div className="relative order-1 md:order-2 md:col-span-5 md:-ml-12">
                  <Reveal y={40}>
                    <div className="relative">
                      {/* 背面の朱ブロック */}
                      <div
                        aria-hidden
                        className="absolute -bottom-5 -right-4 h-[72%] w-[86%] rounded-2xl"
                        style={{ background: "var(--shu)", zIndex: 0, transform: "rotate(4.5deg)" }}
                      />
                      <div className="relative z-10">
                      <Parallax speed={0.18}>
                        <div className="relative aspect-[4/5] frame" style={{ transform: "rotate(-3.2deg)" }}>
                          {slideshowImages.map((img, i) => (
                            <div
                              key={i}
                              className={`absolute inset-0 transition-opacity duration-[1200ms] ${i === slideIndex ? "opacity-100" : "opacity-0"}`}
                            >
                              <Image src={img} alt="撮影サンプル" fill className="object-cover" sizes="(max-width: 768px) 90vw, 40vw" priority={i === 0} />
                            </div>
                          ))}
                          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
                            {slideshowImages.map((_, i) => (
                              <button
                                key={i}
                                onClick={() => setSlideIndex(i)}
                                aria-label={`スライド ${i + 1}`}
                                className="h-1.5 rounded-full transition-all duration-300"
                                style={{ width: i === slideIndex ? 22 : 7, background: i === slideIndex ? "var(--paper-2)" : "rgba(247,242,232,0.5)" }}
                              />
                            ))}
                          </div>
                        </div>
                      </Parallax>
                      </div>
                    </div>
                  </Reveal>
                </div>
              </div>
            </div>
          </section>

          {/* ===== 開催概要 / 時間枠 ===== */}
          <section className="skew-top relative overflow-hidden py-24 md:py-36" style={{ background: "var(--paper-3)" }}>
            <SectionFx variant="dots" />
            <div className="mx-auto max-w-6xl px-6">
              <SectionHead no="03" en="Information">開催概要</SectionHead>

              <div className="grid md:grid-cols-12 gap-8 md:gap-12">
                {/* 定義リスト */}
                <Reveal className="md:col-span-6">
                  <dl>
                    {[
                      { k: "開催日", v: `${EVENT.dateJa}（${EVENT.weekday}）` },
                      { k: "時間", v: EVENT.timeLabel },
                      { k: "会場", v: EVENT.venue },
                      { k: "定員", v: `限定${EVENT.capacity}名` },
                      { k: "参加費", v: EVENT.price },
                      { k: "特典", v: EVENT.benefit },
                      { k: "撮影", v: `${EVENT.photographer}（${EVENT.brand}）` },
                    ].map((row) => (
                      <div key={row.k} className="flex items-baseline gap-6 py-4 border-b" style={{ borderColor: "var(--line)" }}>
                        <dt className="font-serif text-xs uppercase tracking-[0.2em] w-20 flex-shrink-0" style={{ color: "var(--shu)" }}>{row.k}</dt>
                        <dd className="font-body text-base md:text-lg" style={{ color: "var(--ink)" }}>{row.v}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-4 font-body text-xs" style={{ color: "var(--subtle)" }}>※ {EVENT.venueNote}</p>
                </Reveal>

                {/* スケジュール */}
                <Reveal className="md:col-span-6" delay={0.1}>
                  <div className="card">
                    <div className="flex items-baseline justify-between mb-1">
                      <h3 className="font-display text-xl" style={{ color: "var(--ink)" }}>撮影スケジュール</h3>
                      <span className="font-serif text-sm" style={{ color: "var(--subtle)" }}>全{SLOTS.length}枠</span>
                    </div>
                    <p className="font-body text-sm mb-6" style={{ color: "var(--muted)" }}>お一人10分（撮影）＋5分（入替）</p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {SLOTS.map((s) => (
                        <div
                          key={s.id}
                          className="flex items-center gap-3 rounded-lg px-3 py-2.5"
                          style={{ background: "var(--paper)", border: "1px solid var(--line)" }}
                        >
                          <span className="index-serif text-lg w-6 text-center">{s.id}</span>
                          <span className="font-num text-sm" style={{ color: "var(--ink)" }}>{s.range}</span>
                        </div>
                      ))}
                    </div>
                    <a href="#register" className="btn-primary w-full justify-center mt-6">枠を選んで予約する</a>
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

          {/* ===== スクロール演出（WebGL リボン） ===== */}
          {use3DHero && <ScrollRibbon images={ribbonImages} />}

          <SlashBand label="PORTFOLIO" />

          {/* ===== ギャラリー ===== */}
          <section className="relative py-24 md:py-36">
            <div className="mx-auto max-w-7xl px-6">
              <Reveal className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
                <div className="min-w-0">
                  <SectionHead no="04" en="Portfolio">作品ギャラリー</SectionHead>
                </div>
                <div className="inline-flex self-start sm:self-auto rounded-full p-1 glass">
                  {GALLERY_TABS.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className="relative px-5 py-2 rounded-full font-body text-sm transition-colors duration-300"
                      style={{ color: activeTab === tab.key ? "var(--paper-2)" : "var(--muted)" }}
                    >
                      {activeTab === tab.key && (
                        <motion.span
                          layoutId="gallery-tab-cursor"
                          className="absolute inset-0 rounded-full"
                          style={{ background: "var(--shu)" }}
                          transition={{ type: "spring", stiffness: 500, damping: 34 }}
                        />
                      )}
                      <span className="relative z-10">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </Reveal>

              <div className="gap-3 md:gap-4 [column-fill:_balance] columns-2 md:columns-3 lg:columns-4">
                {currentImages.map((img, i) => {
                  const aspect = ["aspect-[3/4]", "aspect-[4/5]", "aspect-[5/7]", "aspect-[2/3]", "aspect-[3/4]", "aspect-[5/6]"][i % 6];
                  const rot = [-2.4, 1.6, -1, 2.1, -1.7, 1.2][i % 6];
                  return (
                  <motion.button
                    type="button"
                    key={`${activeTab}-${i}`}
                    initial={{ opacity: 0, y: 26, rotate: rot * 1.6 }}
                    whileInView={{ opacity: 1, y: 0, rotate: rot }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: (i % 4) * 0.05 }}
                    onClick={() => setSelectedImage(img)}
                    aria-label={`撮影サンプル ${i + 1} を拡大表示`}
                    className={`group relative gallery-item mb-3 md:mb-4 block w-full break-inside-avoid overflow-hidden p-0 appearance-none bg-transparent ${aspect}`}
                  >
                    <Image
                      src={img}
                      alt={`撮影サンプル ${i + 1}`}
                      fill
                      sizes="(max-width: 768px) 45vw, 24vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.07]"
                    />
                    {/* color_tint.gdshader：朱の掛け合わせ */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{ background: "rgba(193,56,31,0.32)", mixBlendMode: "multiply" }}
                    />
                    {/* polygon_outline.gd：朱の内枠 */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{ border: "1.5px solid var(--shu)" }}
                    />
                    <span
                      className="absolute inset-0 flex items-end p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{ background: "linear-gradient(to top, rgba(25,21,18,0.5), transparent 55%)" }}
                    >
                      <span className="font-serif text-xs tracking-[0.18em]" style={{ color: "var(--paper-2)" }}>VIEW</span>
                    </span>
                  </motion.button>
                  );
                })}
              </div>
              <p className="mt-6 text-center font-body text-sm" style={{ color: "var(--subtle)" }}>タップで拡大表示</p>
            </div>
          </section>

          {/* ===== NonTurn 紹介 ===== */}
          <section className="relative py-24 md:py-36" style={{ background: "var(--paper-3)" }}>
            <div className="mx-auto max-w-4xl px-6 text-center">
              <Reveal>
                <SectionHead no="05" en="Who We Are" align="center">
                  About <span className="accent-serif not-italic" style={{ fontStyle: "normal" }}>NonTurn</span>
                </SectionHead>
                <p className="font-serif italic text-lg mb-8" style={{ color: "var(--shu)" }}>
                  Film · Photo · Web — one-stop creative studio
                </p>
                <p className="font-body leading-loose mb-6 max-w-2xl mx-auto" style={{ color: "var(--muted)" }}>
                  {EVENT.brand}は、動画制作・スチール撮影を通じて企業のブランディングを支援する
                  クリエイティブスタジオです。今回の撮影会は、企業様向けの撮影技術を活かし、
                  個人の方にもプロフェッショナルな撮影を体験いただく特別企画です。
                </p>
                <p className="font-body text-sm mb-9" style={{ color: "var(--subtle)" }}>
                  代表・撮影担当：{EVENT.photographer}
                </p>
                <div className="flex items-center justify-center gap-3">
                  <a href="https://non-turn.com/" target="_blank" rel="noopener noreferrer" className="btn-outline text-sm">公式サイト</a>
                  <a
                    href="https://www.instagram.com/nonturn2022?igsh=MWxoOWx2MnZ0M3I0eg=="
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300 hover:-translate-y-1"
                    style={{ border: "1px solid var(--line-strong)" }}
                    aria-label="Instagram"
                  >
                    <svg className="h-5 w-5" fill="var(--ink)" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z" />
                    </svg>
                  </a>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ===== 注意事項 ===== */}
          <section className="relative py-24 md:py-36">
            <div className="mx-auto max-w-3xl px-6">
              <Reveal className="mb-12">
                <SectionHead no="06" en="Notice">ご参加にあたって</SectionHead>
              </Reveal>
              <motion.ul
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
                className="border-t"
                style={{ borderColor: "var(--line)" }}
              >
                {NOTICES.map((text, i) => (
                  <motion.li key={i} variants={fadeUp} className="flex items-baseline gap-5 py-5 border-b" style={{ borderColor: "var(--line)" }}>
                    <span className="index-serif text-xl w-8 flex-shrink-0">{String(i + 1).padStart(2, "0")}</span>
                    <p className="font-body leading-relaxed pt-0.5" style={{ color: "var(--ink-soft)" }}>{text}</p>
                  </motion.li>
                ))}
              </motion.ul>
            </div>
          </section>

          <SlashBand label="RESERVE NOW" />

          {/* ===== 予約 ===== */}
          <section id="register" className="relative overflow-hidden py-24 md:py-36" style={{ background: "var(--paper-3)" }}>
            <SectionFx variant="dots" />
            <div className="mx-auto max-w-2xl px-6">
              <Reveal className="mb-10 text-center">
                <SectionHead no="07" en="Reservation" align="center">ご予約はこちら</SectionHead>
                <p className="font-body" style={{ color: "var(--muted)" }}>
                  {EVENT.dateJa}（{EVENT.weekday}）{EVENT.timeLabel} ／ {EVENT.price}・限定{EVENT.capacity}名
                </p>
              </Reveal>
              <Reveal delay={0.08}>
                <BookingForm />
              </Reveal>
            </div>
          </section>

          {/* ===== フッター ===== */}
          <footer className="relative py-16 text-center" style={{ background: "var(--paper)" }}>
            <div className="mx-auto max-w-3xl px-6">
              <div className="divider-festival mb-8 max-w-xs mx-auto" />
              <p className="font-display text-xl mb-2" style={{ color: "var(--ink)" }}>夏の新プロフィール撮影会</p>
              <p className="font-num text-sm mb-4" style={{ color: "var(--shu)" }}>2026.8.5</p>
              <p className="font-body text-xs" style={{ color: "var(--subtle)" }}>
                &copy; 2025–2026 {EVENT.brand} — Summer Photo Session
              </p>
            </div>
          </footer>
        </main>

        {/* ===== ライトボックス ===== */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="撮影サンプルの拡大表示"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] flex items-center justify-center p-4"
              style={{ background: "rgba(25,21,18,0.92)", backdropFilter: "blur(6px)" }}
              onClick={() => setSelectedImage(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full h-[85vh] max-w-4xl"
                onClick={(e) => e.stopPropagation()}
              >
                <Image src={selectedImage} alt="撮影サンプル（拡大）" fill className="object-contain" sizes="90vw" />
                <button
                  ref={closeBtnRef}
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-2 right-0 md:top-2 md:-right-14 flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300 hover:rotate-90"
                  style={{ background: "var(--paper-2)" }}
                  aria-label="閉じる"
                >
                  <svg className="h-5 w-5" fill="none" stroke="var(--ink)" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}

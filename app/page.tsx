"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion, MotionConfig } from "framer-motion";
import Countdown from "@/components/Countdown";
import BookingForm from "@/components/BookingForm";
import Parallax from "@/components/Parallax";
import {
  EVENT,
  SLOTS,
  CONCERNS,
  NOTICES,
  GALLERY_TABS,
  MEMBER_IMAGES,
  type GalleryCategory,
} from "@/lib/site-data";

// WebGL コンポーネントは SSR を避けてクライアントのみで読み込む
const NightSkyCanvas = dynamic(() => import("@/components/three/NightSkyCanvas"), {
  ssr: false,
  loading: () => null,
});
const LanternGallery = dynamic(() => import("@/components/three/LanternGallery"), {
  ssr: false,
  loading: () => null,
});

type Caps = { webgl: boolean; mobile: boolean; reduced: boolean; ready: boolean };

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [caps, setCaps] = useState<Caps>({ webgl: true, mobile: false, reduced: false, ready: false });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<GalleryCategory>("member");
  const [view, setView] = useState<"3d" | "grid">("3d");
  const [slideIndex, setSlideIndex] = useState(0);
  const [showSticky, setShowSticky] = useState(false);

  const prefersReduced = useReducedMotion();
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProg } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroContentY = useTransform(heroProg, [0, 1], [0, 140]);
  const heroContentOpacity = useTransform(heroProg, [0, 1], [1, 0]);
  const heroCanvasScale = useTransform(heroProg, [0, 1], [1, 1.18]);

  const slideshowImages = MEMBER_IMAGES.slice(0, 6);
  const currentImages = GALLERY_TABS.find((t) => t.key === activeTab)!.images;
  const use3DHero = caps.ready && caps.webgl && !caps.reduced;

  // 端末性能・モーション設定を検出
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    let webgl = false;
    try {
      const c = document.createElement("canvas");
      webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      webgl = false;
    }
    setCaps({ webgl, mobile, reduced, ready: true });
    setView(webgl && !reduced ? "3d" : "grid");
  }, []);

  // ローディング
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 2400);
    return () => clearTimeout(t);
  }, []);

  // スクロール連動アニメーション
  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    const els = document.querySelectorAll(".reveal");
    els.forEach((el) => observer.observe(el));
    return () => els.forEach((el) => observer.unobserve(el));
  }, [loading, activeTab, view]);

  // About スライドショー
  useEffect(() => {
    const id = setInterval(() => setSlideIndex((i) => (i + 1) % slideshowImages.length), 4200);
    return () => clearInterval(id);
  }, [slideshowImages.length]);

  // スティッキー予約CTA
  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > window.innerHeight * 0.85);
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
      {/* ===== ローディング ===== */}
      {loading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden" style={{ background: "var(--color-bg)" }}>
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(255,138,61,0.18), transparent 60%)" }} />
          {[
            { x: "8%", y: "16%", r: -12, s: "w-20 h-28" },
            { x: "82%", y: "18%", r: 10, s: "w-24 h-32" },
            { x: "12%", y: "70%", r: 8, s: "w-20 h-28" },
            { x: "78%", y: "68%", r: -9, s: "w-24 h-32" },
          ].map((p, i) => (
            <div
              key={i}
              className="absolute rounded-lg overflow-hidden animate-float"
              style={{ left: p.x, top: p.y, transform: `rotate(${p.r}deg)`, animationDelay: `${i * 0.2}s` }}
            >
              <div className={`relative ${p.s}`}>
                <Image src={MEMBER_IMAGES[i]} alt="" fill className="object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(6,11,28,0.6), transparent)" }} />
              </div>
            </div>
          ))}
          <div className="relative text-center px-6">
            <div className="mx-auto mb-8 lantern w-16 h-20 animate-sway" />
            <p className="font-num text-sm tracking-[0.3em] mb-3" style={{ color: "var(--color-gold)" }}>{EVENT.dateLabel}</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-gradient-gold mb-4">夏の新プロフィール撮影会</h2>
            <div className="mx-auto loading-spinner" />
          </div>
        </div>
      )}

      {/* ===== スティッキー予約CTA ===== */}
      <motion.a
        href="#register"
        initial={{ y: 80, opacity: 0 }}
        animate={showSticky ? { y: 0, opacity: 1 } : { y: 80, opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="btn-primary fixed z-40 bottom-5 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 text-sm md:text-base shadow-2xl"
      >
        🎆 予約する（残枠あり）
      </motion.a>

      <main className="relative">
        {/* ===== ヒーロー ===== */}
        <section ref={heroRef} className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
          {/* WebGL 夜空 or フォールバック */}
          <motion.div className="absolute inset-0" style={{ scale: prefersReduced ? 1 : heroCanvasScale }}>
            {use3DHero ? (
              <NightSkyCanvas quality={caps.mobile ? "low" : "high"} interactive={!caps.mobile} />
            ) : (
              <div className="absolute inset-0">
                <div className="absolute inset-0 dots-pattern opacity-40" />
                {[...Array(30)].map((_, i) => (
                  <span
                    key={i}
                    className="absolute rounded-full animate-twinkle"
                    style={{
                      width: 2, height: 2, background: "var(--color-gold-light)",
                      left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%`,
                      animationDelay: `${(i % 5) * 0.4}s`,
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>

          {/* 下端グラデーションで馴染ませる */}
          <div className="absolute inset-x-0 bottom-0 h-40" style={{ background: "linear-gradient(to bottom, transparent, var(--color-bg))" }} />

          <motion.div style={{ y: prefersReduced ? 0 : heroContentY, opacity: prefersReduced ? 1 : heroContentOpacity }} className="relative z-10 text-center px-4 max-w-4xl mx-auto py-24">
            <div className="inline-flex items-center gap-3 badge badge-gold mb-6 animate-glow-pulse text-sm md:text-base">
              <span className="animate-sway">🎐</span>
              <span>{EVENT.dateLabel}（{EVENT.weekday}）SUMMER SESSION</span>
              <span className="animate-sway">🎐</span>
            </div>

            <h1 className="mb-6">
              <span className="block font-display text-lg md:text-2xl font-medium mb-3 tracking-jp" style={{ color: "var(--color-gold-light)" }}>
                夏の装いで、新しい自分を一枚に。
              </span>
              <span className="block font-display text-5xl md:text-7xl lg:text-8xl font-extrabold leading-[1.05]" style={{ color: "var(--color-ink)" }}>
                夏の新プロフィール
              </span>
              <span className="block font-display text-5xl md:text-7xl lg:text-8xl font-extrabold text-gradient-festival mt-1">
                撮影会
              </span>
            </h1>

            <p className="font-body text-base md:text-lg mb-8 tracking-jp" style={{ color: "var(--color-muted)" }}>
              {EVENT.timeLabel} ｜ {EVENT.venue} ｜ 限定{EVENT.capacity}名・{EVENT.price}
            </p>

            <div className="mb-10">
              <Countdown />
            </div>

            <a href="#register" className="btn-primary text-lg">
              いますぐ予約する
            </a>
          </motion.div>

          {/* スクロールインジケータ */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce z-10">
            <div className="w-6 h-10 rounded-full border-2 flex justify-center pt-2" style={{ borderColor: "var(--color-gold)" }}>
              <div className="w-1 h-2 rounded-full animate-pulse" style={{ background: "var(--color-vermilion-light)" }} />
            </div>
          </div>
        </section>

        {/* ===== お悩み / コンセプト ===== */}
        <section className="relative py-24 md:py-32 px-4 overflow-hidden">
          <Parallax speed={0.4} className="absolute -right-20 top-10">
            <div className="blob blob-vermilion w-[320px] h-[320px]" />
          </Parallax>
          <Parallax speed={-0.3} className="absolute -left-24 bottom-0">
            <div className="blob blob-indigo w-[280px] h-[280px]" />
          </Parallax>

          <div className="max-w-4xl mx-auto relative z-10">
            <div className="text-center mb-16 reveal">
              <span className="badge badge-vermilion mb-4">Check</span>
              <h2 className="font-display text-3xl md:text-5xl font-bold" style={{ color: "var(--color-ink)" }}>
                この夏、<span className="text-gradient-festival">こんな想い</span>はありませんか？
              </h2>
            </div>

            <div className="grid gap-5 md:gap-6 mb-16">
              {CONCERNS.map((item, i) => (
                <div key={i} className={`card flex items-start gap-5 reveal ${["", "delay-100", "delay-200", "delay-300"][i]}`}>
                  <span className="text-4xl animate-float" style={{ animationDelay: `${i * 0.4}s` }}>{item.icon}</span>
                  <p className="font-body text-base md:text-lg pt-2 leading-relaxed" style={{ color: "var(--color-ink)" }}>{item.text}</p>
                </div>
              ))}
            </div>

            <div className="text-center reveal delay-200">
              <div className="inline-block relative">
                <div className="absolute -inset-1 rounded-3xl animate-glow-pulse" style={{ background: "linear-gradient(135deg, var(--color-vermilion), var(--color-gold))", opacity: 0.4, filter: "blur(14px)" }} />
                <div className="relative card px-8 md:px-12 py-8">
                  <p className="font-display text-xl md:text-2xl font-bold text-gradient-gold mb-2">🎆 夏の夜、最高の一枚を 🎆</p>
                  <p className="font-body text-base md:text-lg" style={{ color: "var(--color-ink)" }}>後半戦のあなたを、新しい表情から始めましょう。</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== 撮影会について ===== */}
        <section className="relative py-24 md:py-32 px-4 overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="grid md:grid-cols-12 gap-10 md:gap-12 items-center">
              <div className="md:col-span-7 order-2 md:order-1 reveal reveal-left">
                <span className="badge badge-gold mb-4">About Session</span>
                <h2 className="font-display text-3xl md:text-5xl font-bold mb-6" style={{ color: "var(--color-ink)" }}>
                  夏の夜に、<span className="text-gradient-gold">映える</span>あなたを
                </h2>
                <p className="font-body text-base md:text-lg mb-8 leading-relaxed" style={{ color: "var(--color-muted)" }}>
                  {EVENT.brand}の{EVENT.photographer}が、普段は企業向けに行う撮影技術で、
                  あなたの自然な魅力を一枚に収めます。夏の装いで、新しいプロフィールを。
                </p>
                <div className="space-y-4">
                  {[
                    { t: `${EVENT.price}でご参加いただけます`, c: "var(--color-vermilion)" },
                    { t: EVENT.benefit, c: "var(--color-gold)" },
                    { t: `${EVENT.target}・限定${EVENT.capacity}名`, c: "var(--color-indigo-light)" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: item.c }}>
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="font-body text-base md:text-lg" style={{ color: "var(--color-ink)" }}>{item.t}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-5 order-1 md:order-2 reveal reveal-right">
                <div className="relative">
                  <div className="absolute -inset-3 rounded-3xl rotate-3" style={{ background: "linear-gradient(135deg, var(--color-vermilion), var(--color-gold))", opacity: 0.35, filter: "blur(6px)" }} />
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border" style={{ borderColor: "var(--color-line)" }}>
                    {slideshowImages.map((img, i) => (
                      <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === slideIndex ? "opacity-100" : "opacity-0"}`}>
                        <Image src={img} alt="撮影サンプル" fill className="object-cover" priority={i === 0} />
                      </div>
                    ))}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                      {slideshowImages.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setSlideIndex(i)}
                          aria-label={`スライド ${i + 1}`}
                          className="h-2 rounded-full transition-all duration-300"
                          style={{ width: i === slideIndex ? 24 : 8, background: i === slideIndex ? "var(--color-gold)" : "rgba(255,255,255,0.5)" }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== 開催概要 / 時間枠 ===== */}
        <section className="relative py-24 md:py-32 px-4 overflow-hidden">
          <div className="absolute inset-0 seigaiha opacity-60" />
          <div className="max-w-5xl mx-auto relative z-10">
            <div className="text-center mb-14 reveal">
              <span className="badge badge-indigo mb-4">Information</span>
              <h2 className="font-display text-3xl md:text-5xl font-bold" style={{ color: "var(--color-ink)" }}>開催概要</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-10">
              <div className="card reveal reveal-left space-y-5">
                {[
                  { k: "開催日", v: `${EVENT.dateJa}（${EVENT.weekday}）` },
                  { k: "時間", v: EVENT.timeLabel },
                  { k: "会場", v: EVENT.venue },
                  { k: "定員", v: `限定${EVENT.capacity}名` },
                  { k: "参加費", v: EVENT.price },
                  { k: "特典", v: EVENT.benefit },
                  { k: "撮影", v: `${EVENT.photographer}（${EVENT.brand}）` },
                ].map((row) => (
                  <div key={row.k} className="flex items-baseline gap-4 border-b pb-3" style={{ borderColor: "var(--color-line)" }}>
                    <span className="font-body text-sm w-16 flex-shrink-0" style={{ color: "var(--color-gold)" }}>{row.k}</span>
                    <span className="font-body text-base md:text-lg" style={{ color: "var(--color-ink)" }}>{row.v}</span>
                  </div>
                ))}
                <p className="font-body text-xs" style={{ color: "var(--color-subtle)" }}>※ {EVENT.venueNote}</p>
              </div>

              <div className="card reveal reveal-right">
                <h3 className="font-display text-xl font-bold mb-4 text-center" style={{ color: "var(--color-ink)" }}>
                  撮影スケジュール（全{SLOTS.length}枠）
                </h3>
                <p className="text-center font-body text-sm mb-5" style={{ color: "var(--color-muted)" }}>
                  お一人10分（撮影）＋5分（入替）
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  {SLOTS.map((s) => (
                    <div key={s.id} className="flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--color-line)" }}>
                      <span className="number-badge text-sm" style={{ width: 28, height: 28, background: "linear-gradient(135deg,var(--color-gold),var(--color-gold-bright))" }}>{s.label}</span>
                      <span className="font-num text-sm" style={{ color: "var(--color-ink)" }}>{s.range}</span>
                    </div>
                  ))}
                </div>
                <a href="#register" className="btn-gold w-full text-center mt-6">枠を選んで予約する</a>
              </div>
            </div>
          </div>
        </section>

        {/* ===== ギャラリー ===== */}
        <section className="relative py-24 md:py-32 overflow-hidden">
          <Parallax speed={0.3} className="absolute right-0 top-20">
            <div className="blob blob-gold w-[300px] h-[300px]" />
          </Parallax>
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="text-center mb-10 reveal">
              <span className="badge badge-gold mb-4">Portfolio</span>
              <h2 className="font-display text-3xl md:text-5xl font-bold text-gradient-gold">作品ギャラリー</h2>
              <p className="mt-3 font-body text-sm" style={{ color: "var(--color-muted)" }}>
                {view === "3d" ? "ドラッグ／スワイプで回転・タップで拡大" : "タップで拡大"}
              </p>
            </div>

            {/* タブ + ビュー切替 */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 reveal">
              <div className="inline-flex p-1.5 rounded-full glass">
                {GALLERY_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className="px-5 py-2.5 rounded-full font-body font-semibold text-sm transition-all duration-300"
                    style={{
                      background: activeTab === tab.key ? "linear-gradient(135deg,var(--color-vermilion),var(--color-lantern))" : "transparent",
                      color: activeTab === tab.key ? "#fff" : "var(--color-muted)",
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              {caps.webgl && !caps.reduced && (
                <div className="inline-flex p-1.5 rounded-full glass">
                  {(["3d", "grid"] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => setView(v)}
                      className="px-4 py-2.5 rounded-full font-num font-semibold text-sm transition-all duration-300"
                      style={{
                        background: view === v ? "rgba(231,189,84,0.2)" : "transparent",
                        color: view === v ? "var(--color-gold-light)" : "var(--color-subtle)",
                      }}
                    >
                      {v === "3d" ? "3D" : "格子"}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3D 提灯ギャラリー */}
            {view === "3d" && caps.webgl && !caps.reduced ? (
              <div className="reveal reveal-scale">
                <div
                  className="w-full rounded-3xl overflow-hidden border"
                  style={{ height: "min(72vh, 620px)", borderColor: "var(--color-line)", background: "radial-gradient(ellipse at 50% 60%, rgba(22,51,110,0.4), transparent 70%)" }}
                >
                  <LanternGallery key={activeTab} images={currentImages} onSelect={setSelectedImage} autoRotate />
                </div>
              </div>
            ) : (
              /* 2D 格子フォールバック */
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {currentImages.map((img, i) => (
                  <button
                    type="button"
                    key={`${activeTab}-${i}`}
                    className={`gallery-item relative cursor-pointer reveal w-full p-0 appearance-none bg-transparent ${i % 5 === 0 ? "md:row-span-2" : ""}`}
                    style={{ transitionDelay: `${(i % 8) * 40}ms`, aspectRatio: i % 5 === 0 ? "3/5" : "3/4" }}
                    onClick={() => setSelectedImage(img)}
                    aria-label={`撮影サンプル ${i + 1} を拡大表示`}
                  >
                    <Image src={img} alt={`撮影サンプル ${i + 1}`} fill className="object-cover" />
                    <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-4" style={{ background: "linear-gradient(to top, rgba(6,11,28,0.7), transparent)" }}>
                      <span className="text-white font-body text-sm">タップで拡大</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ===== NonTurn 紹介 ===== */}
        <section className="relative py-24 md:py-32 px-4 overflow-hidden">
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="text-center mb-12 reveal">
              <span className="badge badge-indigo mb-4">Who We Are</span>
              <h2 className="font-display text-3xl md:text-5xl font-bold" style={{ color: "var(--color-ink)" }}>
                About <span className="text-gradient-gold">NonTurn</span>
              </h2>
            </div>
            <div className="card reveal delay-100">
              <div className="text-center mb-8">
                <h3 className="font-display text-2xl font-bold mb-2" style={{ color: "var(--color-ink)" }}>{EVENT.brand}</h3>
                <p className="font-body" style={{ color: "var(--color-muted)" }}>代表者：{EVENT.photographer}</p>
                <div className="flex gap-3 justify-center mt-5">
                  <a href="https://non-turn.com/" target="_blank" rel="noopener noreferrer" className="btn-ghost text-sm">公式サイト</a>
                  <a
                    href="https://www.instagram.com/nonturn2022?igsh=MWxoOWx2MnZ0M3I0eg=="
                    target="_blank" rel="noopener noreferrer"
                    className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 hover:-translate-y-1"
                    style={{ background: "linear-gradient(135deg,var(--color-vermilion),var(--color-lantern))" }}
                    aria-label="Instagram"
                  >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z" />
                    </svg>
                  </a>
                </div>
              </div>
              <div className="space-y-4 font-body leading-relaxed" style={{ color: "var(--color-muted)" }}>
                <p>動画制作・スチール撮影を用いて、企業のブランディングアップのお手伝いをしています。</p>
                <p className="text-sm p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--color-line)" }}>
                  今回の撮影会は、普段企業様向けに行っている撮影技術を活かし、個人の方にもプロフェッショナルな写真撮影を体験していただく特別企画です。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== 注意事項 ===== */}
        <section className="relative py-24 md:py-32 px-4 overflow-hidden">
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="text-center mb-12 reveal">
              <span className="badge badge-vermilion mb-4">Notice</span>
              <h2 className="font-display text-3xl md:text-5xl font-bold" style={{ color: "var(--color-ink)" }}>注意事項</h2>
            </div>
            <div className="card reveal delay-100">
              <ul className="space-y-6">
                {NOTICES.map((text, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span
                      className="number-badge"
                      style={{ background: ["linear-gradient(135deg,var(--color-vermilion),var(--color-lantern))", "linear-gradient(135deg,var(--color-gold),var(--color-gold-bright))", "linear-gradient(135deg,var(--color-indigo-light),#3a5bb0)", "linear-gradient(135deg,var(--color-vermilion),var(--color-lantern))", "linear-gradient(135deg,var(--color-gold),var(--color-gold-bright))"][i], color: i === 2 ? "#fff" : "#10142a" }}
                    >
                      {i + 1}
                    </span>
                    <p className="font-body leading-relaxed pt-2" style={{ color: "var(--color-ink)" }}>{text}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ===== 予約 ===== */}
        <section id="register" className="relative py-24 md:py-32 px-4 overflow-hidden">
          <Parallax speed={0.35} className="absolute -left-20 top-0">
            <div className="blob blob-vermilion w-[360px] h-[360px]" />
          </Parallax>
          <Parallax speed={-0.25} className="absolute -right-20 bottom-0">
            <div className="blob blob-gold w-[300px] h-[300px]" />
          </Parallax>
          <div className="max-w-2xl mx-auto relative z-10">
            <div className="text-center mb-10 reveal">
              <span className="badge badge-gold mb-4 animate-glow-pulse">Reservation</span>
              <h2 className="font-display text-3xl md:text-5xl font-bold mb-4" style={{ color: "var(--color-ink)" }}>
                ご<span className="text-gradient-festival">予約</span>はこちら
              </h2>
              <p className="font-body" style={{ color: "var(--color-muted)" }}>
                {EVENT.dateJa}（{EVENT.weekday}）{EVENT.timeLabel} ／ 限定{EVENT.capacity}名
              </p>
            </div>
            <div className="reveal delay-100">
              <BookingForm />
            </div>
          </div>
        </section>

        {/* ===== フッター ===== */}
        <footer className="relative py-12 text-center overflow-hidden" style={{ background: "var(--color-night)" }}>
          <div className="divider-festival mb-8 max-w-xs mx-auto" />
          <p className="font-display mb-2 text-gradient-gold">🎆 夏の新プロフィール撮影会 🎆</p>
          <p className="font-body text-sm" style={{ color: "var(--color-subtle)" }}>
            {EVENT.dateLabel} ｜ &copy; 2025-2026 {EVENT.brand} Special Photo Session.
          </p>
        </footer>
      </main>

      {/* ===== ライトボックス ===== */}
      {selectedImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="撮影サンプルの拡大表示"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          style={{ background: "rgba(6,11,28,0.92)" }}
          onClick={() => setSelectedImage(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative max-w-4xl max-h-[90vh] w-full h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image src={selectedImage} alt="撮影サンプル（拡大）" fill className="object-contain" />
            <button
              ref={closeBtnRef}
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:rotate-90"
              style={{ background: "linear-gradient(135deg,var(--color-vermilion),var(--color-lantern))" }}
              aria-label="閉じる"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        </div>
      )}
    </MotionConfig>
  );
}

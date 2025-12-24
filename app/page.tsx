"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'member' | 'community'>('member');
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll('.scroll-animation');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, [loading]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 4500);

    return () => clearTimeout(timer);
  }, []);

  // メンバー撮影分の画像
  const memberImages = [
    { path: "https://rpk6snz1bj3dcdnk.public.blob.vercel-storage.com/port18.jpg" },
    { path: "https://rpk6snz1bj3dcdnk.public.blob.vercel-storage.com/port03.jpg" },
    { path: "https://rpk6snz1bj3dcdnk.public.blob.vercel-storage.com/port09.jpg" },
    { path: "https://rpk6snz1bj3dcdnk.public.blob.vercel-storage.com/port22.jpg" },
    { path: "https://rpk6snz1bj3dcdnk.public.blob.vercel-storage.com/port06.jpg" },
    { path: "https://rpk6snz1bj3dcdnk.public.blob.vercel-storage.com/port16.jpg" },
    { path: "https://rpk6snz1bj3dcdnk.public.blob.vercel-storage.com/port01.jpg" },
    { path: "https://rpk6snz1bj3dcdnk.public.blob.vercel-storage.com/port20.jpg" },
    { path: "https://rpk6snz1bj3dcdnk.public.blob.vercel-storage.com/port05.jpg" },
    { path: "https://rpk6snz1bj3dcdnk.public.blob.vercel-storage.com/port19.jpg" },
    { path: "https://rpk6snz1bj3dcdnk.public.blob.vercel-storage.com/port08.jpg" },
    { path: "https://rpk6snz1bj3dcdnk.public.blob.vercel-storage.com/port02.jpg" },
    { path: "https://rpk6snz1bj3dcdnk.public.blob.vercel-storage.com/port07.jpg" },
    { path: "https://rpk6snz1bj3dcdnk.public.blob.vercel-storage.com/port04.jpg" },
  ];;

  // コミュニティー撮影分の画像
  const communityImages = [
    { path: "/images/827/DSC00927.jpg" },
    { path: "/images/827/DSC01074.jpg" },
    { path: "/images/yon/DSC00833のコピー.jpg" },
    { path: "/images/827/DSC01011のコピー.jpg" },
    { path: "/images/827/DSC01335.jpg" },
    { path: "/images/827/DSC00949.jpg" },
    { path: "/images/yon/DSC00843のコピー.jpg" },
    { path: "/images/827/DSC01398.jpg" },
    { path: "/images/827/DSC01020のコピー.jpg" },
    { path: "/images/827/DSC01109.jpg" },
    { path: "/images/yon/DSC00861のコピー.jpg" },
    { path: "/images/827/DSC01356.jpg" },
    { path: "/images/827/DSC00895のコピー.jpg" },
    { path: "/images/827/DSC01152.jpg" },
    { path: "/images/827/DSC01404のコピー.jpg" },
    { path: "/images/827/DSC01011のコピー2.jpg" },
    { path: "/images/827/DSC01099.jpg" },
    { path: "/images/827/DSC01314のコピー.jpg" },
    { path: "/images/827/kinpatu 12.jpg" },
    { path: "/images/827/kinpatu 15.jpg" },
  ];

  // port16以降の画像をスライドショーに使用
  const slideshowImages = memberImages.slice(9); // port16, port18, port19, port20, port22

  const heroSlideshows = [
    memberImages.slice(9, 12),  // port16, port18, port19
    memberImages.slice(12, 14).concat(memberImages.slice(9, 10)), // port20, port22, port16
    memberImages.slice(10, 13), // port18, port19, port20
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlideIndex((prevIndex) =>
        (prevIndex + 1) % slideshowImages.length
      );
    }, 7000);

    return () => clearInterval(interval);
  }, [slideshowImages.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroSlideIndex((prevIndex) =>
        (prevIndex + 1) % heroSlideshows.length
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [heroSlideshows.length]);

  // タブ切り替えハンドラー
  const handleTabChange = (tab: 'member' | 'community') => {
    if (tab !== activeTab) {
      setGalleryLoading(true);
      setLoadedImages(new Set());
      setActiveTab(tab);
    }
  };

  // 画像読み込み完了ハンドラー
  const handleImageLoad = (imagePath: string, totalImages: number) => {
    setLoadedImages((prev) => {
      const newSet = new Set(prev);
      newSet.add(imagePath);
      if (newSet.size >= totalImages) {
        setGalleryLoading(false);
      }
      return newSet;
    });
  };

  return (
    <>
      {/* Loading Animation - Impact Version */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)' }}>
          {/* Animated gradient background */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(212, 175, 55, 0.3) 0%, transparent 50%)',
              animation: 'pulse 2s ease-in-out infinite'
            }}
          />

          {/* Floating photos mosaic - scattered around */}
          {[
            { x: '5%', y: '10%', rotate: -15, delay: 0, size: 'w-20 h-28' },
            { x: '85%', y: '15%', rotate: 12, delay: 0.1, size: 'w-24 h-32' },
            { x: '10%', y: '75%', rotate: 8, delay: 0.2, size: 'w-22 h-30' },
            { x: '80%', y: '70%', rotate: -10, delay: 0.3, size: 'w-20 h-28' },
            { x: '25%', y: '5%', rotate: 5, delay: 0.15, size: 'w-16 h-22' },
            { x: '70%', y: '85%', rotate: -8, delay: 0.25, size: 'w-18 h-24' },
          ].map((pos, i) => (
            <div
              key={`corner-${i}`}
              className={`absolute ${pos.size} rounded-lg overflow-hidden shadow-2xl float-photo`}
              style={{
                left: pos.x,
                top: pos.y,
                transform: `rotate(${pos.rotate}deg)`,
                animationDelay: `${pos.delay}s`,
                '--float-rotate': `${pos.rotate}deg`,
                boxShadow: '0 10px 40px rgba(212, 175, 55, 0.3)',
              } as React.CSSProperties}
            >
              <Image
                src={memberImages[i % memberImages.length].path}
                alt=""
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          ))}

          {/* Center 3D rotating orbit */}
          <div className="loading-container relative">
            {/* Pulsing rings */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="ring-pulse w-48 h-48" style={{ animationDelay: '0s' }} />
              <div className="ring-pulse w-48 h-48" style={{ animationDelay: '0.5s' }} />
              <div className="ring-pulse w-48 h-48" style={{ animationDelay: '1s' }} />
            </div>

            {/* Orbiting photos */}
            <div className="orbit-container relative w-64 h-64 flex items-center justify-center">
              {[0, 1, 2, 3, 4, 5].map((i) => {
                const angle = (i * 60) * (Math.PI / 180);
                const radius = 120;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;
                return (
                  <div
                    key={`orbit-${i}`}
                    className="orbit-item w-16 h-20 rounded-lg overflow-hidden shadow-xl"
                    style={{
                      transform: `translateX(${x}px) translateZ(${z}px)`,
                      boxShadow: '0 8px 32px rgba(196, 30, 58, 0.4)',
                    }}
                  >
                    <Image
                      src={memberImages[i + 3].path}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  </div>
                );
              })}
            </div>

            {/* Center logo with glow */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="center-logo relative w-40 h-40 rounded-full overflow-hidden border-4 border-white/50 shadow-[0_0_40px_rgba(212,175,55,0.6),0_0_80px_rgba(212,175,55,0.3)]">
                <Image
                  src="/images/827/load.png"
                  alt="Loading"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            {/* Sparkle effects */}
            {[...Array(8)].map((_, i) => {
              const angle = (i * 45) * (Math.PI / 180);
              const distance = 100 + (i % 3) * 20;
              return (
                <div
                  key={`sparkle-${i}`}
                  className="absolute w-2 h-2"
                  style={{
                    left: `calc(50% + ${Math.cos(angle) * distance}px)`,
                    top: `calc(50% + ${Math.sin(angle) * distance}px)`,
                    animation: `sparkle-burst 1.5s ease-in-out infinite`,
                    animationDelay: `${i * 0.2}s`,
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="var(--color-gold)" className="w-full h-full">
                    <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
                  </svg>
                </div>
              );
            })}
          </div>

          {/* Text content */}
          <div className="absolute bottom-16 left-0 right-0 text-center">
            <div className="space-y-3">
              <h2 className="relative inline-block">
                <span
                  className="block text-6xl md:text-7xl font-display font-extrabold animate-slide-up mb-2"
                  style={{
                    background: 'linear-gradient(135deg, #d4af37 0%, #fff8dc 30%, #ffd700 50%, #fff8dc 70%, #d4af37 100%)',
                    backgroundSize: '200% 100%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    animation: 'shimmer-gold 2s linear infinite, slide-up 0.6s var(--ease-out-expo) forwards',
                    textShadow: '0 0 40px rgba(212, 175, 55, 0.5)',
                  }}
                >
                  2026
                </span>
                <span className="block text-2xl md:text-3xl font-display font-bold text-gradient-coral animate-slide-up delay-100">
                  新年特別企画
                </span>
                <span className="block text-3xl md:text-4xl font-display font-bold mt-2 animate-slide-up delay-200 text-white">
                  プロフィール撮影会
                </span>
              </h2>
              <div className="flex items-center justify-center gap-3 animate-slide-up delay-300">
                <span className="text-2xl">📸</span>
                <p className="text-lg font-display font-medium" style={{ color: 'var(--color-gold)' }}>
                  Loading...
                </p>
                <span className="text-2xl">✨</span>
              </div>
            </div>
          </div>

          {/* Flash effect on transition */}
          <div
            className="absolute inset-0 bg-white pointer-events-none"
            style={{
              opacity: 0,
              animation: loading ? 'none' : 'flash-white 0.3s ease-out forwards',
            }}
          />
        </div>
      )}

      <div className="min-h-screen overflow-x-hidden" style={{ background: 'var(--color-bg)' }}>

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20">
          {/* Background decorations - New Year theme */}
          <div className="blob blob-coral w-[500px] h-[500px] -top-40 -right-40 opacity-40" />
          <div className="blob blob-gold w-[400px] h-[400px] top-1/3 -left-40 opacity-50" />
          <div className="blob blob-coral w-[300px] h-[300px] bottom-0 right-1/4 opacity-30" />
          <div className="blob blob-gold w-[250px] h-[250px] top-20 left-1/3 opacity-40" />

          {/* Floating gold confetti */}
          {[...Array(12)].map((_, i) => (
            <div
              key={`confetti-${i}`}
              className="absolute w-3 h-3 rounded-full animate-falling pointer-events-none"
              style={{
                background: i % 3 === 0 ? 'var(--color-gold)' : i % 3 === 1 ? 'var(--color-primary)' : 'rgba(255,255,255,0.8)',
                left: `${5 + i * 8}%`,
                animationDelay: `${i * 0.7}s`,
                animationDuration: `${7 + i * 0.3}s`,
                opacity: 0.7,
              }}
            />
          ))}

          {/* Background images grid */}
          <div className="absolute inset-0 opacity-10">
            {heroSlideshows.map((slideshow, slideIdx) => (
              <div
                key={slideIdx}
                className={`absolute inset-0 grid grid-cols-3 gap-2 p-4 transition-opacity duration-1000 ${
                  slideIdx === heroSlideIndex ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {slideshow.map((img, idx) => (
                  <div key={idx} className="relative h-full rounded-3xl overflow-hidden">
                    <Image
                      src={img.path}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            {/* Year Badge */}
            <div className="inline-flex items-center gap-4 badge-newyear-flashy animate-glow-pulse mb-6 text-2xl md:text-3xl px-8 py-4 rounded-xl">
              <span className="text-3xl md:text-4xl animate-bounce">🎍</span>
              <span className="font-extrabold tracking-wider">✨ 2026年 新春 ✨</span>
              <span className="text-3xl md:text-4xl animate-bounce" style={{ animationDelay: '0.2s' }}>🎍</span>
            </div>

            <h1 className="mb-6">
              <span className="block text-3xl md:text-4xl font-display font-bold text-gradient-gold mb-2 animate-slide-up">
                新年特別企画
              </span>
              <span className="block text-5xl md:text-7xl lg:text-8xl font-display font-extrabold animate-slide-up delay-100" style={{ color: 'var(--color-ink)' }}>
                プロフィール
              </span>
              <span className="block text-5xl md:text-7xl lg:text-8xl font-display font-extrabold animate-slide-up delay-200 text-gradient-coral">
                撮影会
              </span>
            </h1>

            <p className="text-xl md:text-2xl font-body mb-4 animate-slide-up delay-300" style={{ color: 'var(--color-muted)' }}>
              新しい年、新しいあなたを写真に
            </p>
            <p className="text-lg font-body mb-10 animate-slide-up delay-350" style={{ color: 'var(--color-secondary)' }}>
              2026年1月開催 ｜ 新年の始まりに最高の一枚を
            </p>

            <a
              href="#register"
              className="btn-primary inline-block text-lg animate-slide-up delay-400"
            >
              新年のスタートを切る
            </a>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 rounded-full border-2 flex justify-center pt-2" style={{ borderColor: 'var(--color-gold)' }}>
              <div className="w-1 h-2 rounded-full animate-pulse" style={{ background: 'var(--color-primary)' }} />
            </div>
          </div>
        </section>

        {/* Problems Section */}
        <section className="py-24 px-4 relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 dots-pattern opacity-30" />
          <div className="blob blob-gold w-[300px] h-[300px] -right-20 top-20 opacity-40" />

          <div className="max-w-4xl mx-auto relative z-10">
            <div className="text-center mb-16 scroll-animation">
              <span className="badge-gold mb-4 inline-block">Check This</span>
              <h2 className="text-4xl md:text-5xl font-display font-bold" style={{ color: 'var(--color-ink)' }}>
                新年に向けて<span className="text-gradient-coral">こんなお悩み</span>は？
              </h2>
            </div>

            <div className="grid gap-6 mb-16">
              {[
                { icon: "🎍", text: "新年を迎えるのに、プロフィール写真が古いまま…", delay: "delay-100" },
                { icon: "💕", text: "2026年こそ、マッチングアプリで映える写真が欲しい！", delay: "delay-200" },
                { icon: "💼", text: "新年度に向けて、LinkedIn等ビジネス用の写真を更新したい", delay: "delay-300" },
                { icon: "✨", text: "新しい年に、新しい自分を表現したい！", delay: "delay-400" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`card-pop flex items-start gap-4 scroll-animation ${item.delay}`}
                >
                  <span className="text-4xl animate-float" style={{ animationDelay: `${idx * 0.5}s` }}>
                    {item.icon}
                  </span>
                  <p className="text-lg font-body pt-2" style={{ color: 'var(--color-ink)' }}>
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="text-center scroll-animation delay-500">
              <div className="inline-block relative">
                <div className="absolute -inset-1 rounded-3xl animate-gradient" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-gold), var(--color-accent))', opacity: 0.5, filter: 'blur(10px)' }} />
                <div className="relative bg-white px-10 py-8 rounded-3xl border-2" style={{ borderColor: 'var(--color-gold-light)' }}>
                  <p className="text-2xl md:text-3xl font-display font-bold text-gradient-gold mb-2">
                    🎍 新年のスタートに！ 🎍
                  </p>
                  <p className="text-xl md:text-2xl font-display font-semibold" style={{ color: 'var(--color-ink)' }}>
                    2026年を最高の一枚から始めましょう！
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-24 px-4 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, var(--color-surface) 0%, #fffef9 100%)' }}>
          <div className="blob blob-coral w-[400px] h-[400px] -left-40 top-0 opacity-30" />
          <div className="blob blob-gold w-[300px] h-[300px] right-0 bottom-0 opacity-40" />

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="grid md:grid-cols-12 gap-12 items-center scroll-animation">
              {/* Content - 7 columns */}
              <div className="md:col-span-7 order-2 md:order-1">
                <span className="badge-gold mb-4 inline-block">About Session</span>
                <h2 className="text-4xl md:text-5xl font-display font-bold mb-6" style={{ color: 'var(--color-ink)' }}>
                  新年に<span className="text-gradient-gold">輝く</span>あなたを
                </h2>
                <p className="text-lg font-body mb-6 leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                  2026年の始まりに、当社NonTurnの澤田があなたの自然な美しさを写真に収めます。
                  新年の決意とともに、最高の一枚をお届けします。
                </p>

                <div className="space-y-4">
                  {[
                    { text: "完全無料（限定ーー名様）", color: "var(--color-primary)" },
                    { text: "レタッチ済み2カットをプレゼント", color: "var(--color-secondary)" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: item.color }}>
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-lg font-display font-medium" style={{ color: 'var(--color-ink)' }}>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Image - 5 columns */}
              <div className="md:col-span-5 order-1 md:order-2">
                <div className="relative">
                  {/* Decorative frame */}
                  <div className="absolute -inset-4 rounded-3xl rotate-3" style={{ background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-accent-light))' }} />
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
                    {slideshowImages.map((img, idx) => (
                      <div
                        key={idx}
                        className={`absolute inset-0 transition-opacity duration-1000 ${
                          idx === currentSlideIndex ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        <Image
                          src={img.path}
                          alt="撮影サンプル"
                          fill
                          className="object-cover"
                          priority={idx === 0}
                        />
                      </div>
                    ))}
                    {/* Slide indicators */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                      {slideshowImages.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentSlideIndex(idx)}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            idx === currentSlideIndex
                              ? 'w-8'
                              : 'opacity-50 hover:opacity-75'
                          }`}
                          style={{
                            background: idx === currentSlideIndex ? 'var(--color-primary)' : 'white'
                          }}
                          aria-label={`スライド ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Company Section */}
        <section className="py-24 px-4 relative overflow-hidden">
          <div className="blob blob-gold w-[350px] h-[350px] -right-20 top-1/4 opacity-40" />

          <div className="max-w-4xl mx-auto relative z-10">
            <div className="text-center mb-12 scroll-animation">
              <span className="badge-gold mb-4 inline-block">Who We Are</span>
              <h2 className="text-4xl md:text-5xl font-display font-bold" style={{ color: 'var(--color-ink)' }}>
                About <span className="text-gradient-gold">NonTurn</span>
              </h2>
            </div>

            <div className="card-pop scroll-animation delay-200">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-display font-bold mb-2" style={{ color: 'var(--color-ink)' }}>NonTurn.LLC</h3>
                <p className="font-body" style={{ color: 'var(--color-muted)' }}>代表者：澤田憲孝</p>
                <div className="flex gap-3 justify-center mt-4">
                  <a
                    href="https://non-turn.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-sm py-2 px-5"
                  >
                    公式サイトを見る
                  </a>
                  <a
                    href="https://www.instagram.com/nonturn2022?igsh=MWxoOWx2MnZ0M3I0eg=="
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:-translate-y-1"
                    style={{ background: 'var(--color-primary)' }}
                    aria-label="Instagram"
                  >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
                    </svg>
                  </a>
                </div>
              </div>
              <div className="space-y-4 font-body leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                <p>
                  動画制作・スチール撮影を用いて企業のブランディングアップのお手伝いをしております。
                </p>
                <p>
                  OG8Fの専用デスクで普段仕事してます。
                  仲良くして下さい。
                </p>
                <p className="text-sm pt-4 pb-2 px-4 rounded-xl" style={{ background: 'var(--color-surface)' }}>
                  今回の撮影会は、普段企業様向けに行っている撮影技術を活かし、
                  個人の方にもプロフェッショナルな写真撮影を体験していただく特別企画です。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, var(--color-surface) 0%, #fff8f0 100%)' }}>
          <div className="blob blob-coral w-[400px] h-[400px] -left-20 top-0 opacity-20" />
          <div className="blob blob-gold w-[300px] h-[300px] right-0 bottom-1/4 opacity-30" />

          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="text-center mb-12 scroll-animation">
              <span className="badge-gold mb-4 inline-block">Portfolio</span>
              <h2 className="text-4xl md:text-5xl font-display font-bold" style={{ color: 'var(--color-ink)' }}>
                <span className="text-gradient-newyear">Gallery</span>
              </h2>
            </div>

            {/* Tab Navigation */}
            <div className="flex justify-center mb-12 scroll-animation">
              <div className="inline-flex p-1.5 rounded-full" style={{ background: 'white' }}>
                <button
                  onClick={() => handleTabChange('member')}
                  className={`px-6 py-3 rounded-full font-display font-semibold transition-all duration-300 ${
                    activeTab === 'member'
                      ? 'text-white shadow-lg'
                      : ''
                  }`}
                  style={{
                    background: activeTab === 'member' ? 'var(--color-primary)' : 'transparent',
                    color: activeTab === 'member' ? 'white' : 'var(--color-muted)'
                  }}
                >
                  メンバー撮影分
                </button>
                <button
                  onClick={() => handleTabChange('community')}
                  className={`px-6 py-3 rounded-full font-display font-semibold transition-all duration-300 ${
                    activeTab === 'community'
                      ? 'text-white shadow-lg'
                      : ''
                  }`}
                  style={{
                    background: activeTab === 'community' ? 'var(--color-secondary)' : 'transparent',
                    color: activeTab === 'community' ? 'white' : 'var(--color-muted)'
                  }}
                >
                  コミュニティー撮影分
                </button>
              </div>
            </div>

            {/* Gallery Grid - Masonry-style */}
            <div className="relative">
              {/* Loading Overlay */}
              {galleryLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-2xl">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-[var(--color-primary)] rounded-full animate-spin"></div>
                    <span className="text-sm font-display" style={{ color: 'var(--color-muted)' }}>画像を読み込み中...</span>
                  </div>
                </div>
              )}
              <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 transition-opacity duration-300 ${galleryLoading ? 'opacity-30' : 'opacity-100'}`}>
                {(activeTab === 'member' ? memberImages : communityImages).map((img, idx) => {
                  const currentImages = activeTab === 'member' ? memberImages : communityImages;
                  return (
                    <div
                      key={`${activeTab}-${idx}`}
                      className={`gallery-item relative cursor-pointer animate-slide-up ${
                        idx % 5 === 0 ? 'md:row-span-2' : ''
                      }`}
                      style={{
                        animationDelay: `${idx * 50}ms`,
                        aspectRatio: idx % 5 === 0 ? '3/5' : '3/4'
                      }}
                      onClick={() => setSelectedImage(img.path)}
                    >
                      <Image
                        src={img.path}
                        alt=""
                        fill
                        className="object-cover"
                        onLoad={() => handleImageLoad(img.path, currentImages.length)}
                      />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <span className="text-white font-display text-sm">Click to view</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Notice Section */}
        <section className="py-24 px-4 relative overflow-hidden">
          <div className="blob blob-gold w-[350px] h-[350px] -left-20 bottom-0 opacity-30" />

          <div className="max-w-4xl mx-auto relative z-10">
            <div className="text-center mb-12 scroll-animation">
              <span className="badge-coral mb-4 inline-block">Important</span>
              <h2 className="text-4xl md:text-5xl font-display font-bold" style={{ color: 'var(--color-ink)' }}>
                注意事項
              </h2>
            </div>

            <div className="card-pop scroll-animation delay-200">
              <ul className="space-y-6">
                {[
                  "撮影内容は当社事例として使用させていただきます。",
                  "１社１名のみ（一人じゃ参加の勇気の出ない方はご相談ください）",
                  "前回参加者不可",
                  "撮影者の要望で撮影お請けできない場合ございます。",
                  "撮影する写真のテイストは撮影者の独断と偏見で決めるのでご希望ある際は別途有償でご依頼ご検討ください。"
                ].map((text, idx) => (
                  <li key={idx} className="flex items-start gap-4">
                    <span
                      className="number-badge text-white"
                      style={{
                        background: [
                          'var(--color-primary)',
                          'var(--color-secondary)',
                          'var(--color-lavender)',
                          'var(--color-peach)',
                          'var(--color-sky)'
                        ][idx]
                      }}
                    >
                      {idx + 1}
                    </span>
                    <p className="font-body leading-relaxed pt-2" style={{ color: 'var(--color-ink)' }}>
                      {text}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="register" className="py-24 px-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--color-surface) 0%, #fff5e6 100%)' }}>
          {/* Background decorations - New Year */}
          <div className="blob blob-coral w-[500px] h-[500px] -right-40 -top-40 opacity-30" />
          <div className="blob blob-gold w-[400px] h-[400px] -left-40 -bottom-40 opacity-40" />
          <div className="blob blob-coral w-[300px] h-[300px] right-1/4 bottom-0 opacity-20" />

          {/* Floating particles */}
          {[...Array(6)].map((_, i) => (
            <div
              key={`cta-particle-${i}`}
              className="absolute w-2 h-2 rounded-full animate-falling pointer-events-none"
              style={{
                background: i % 2 === 0 ? 'var(--color-gold)' : 'var(--color-primary)',
                left: `${15 + i * 15}%`,
                animationDelay: `${i * 1.2}s`,
                animationDuration: `${8 + i * 0.5}s`,
                opacity: 0.5,
              }}
            />
          ))}

          <div className="max-w-2xl mx-auto text-center relative z-10 scroll-animation">
            <div className="inline-flex items-center gap-2 badge-gold mb-4 animate-pulse">
              <span>🎍</span>
              <span className="font-bold">新春限定</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6" style={{ color: 'var(--color-ink)' }}>
              新年の<span className="text-gradient-gold">スタート</span>に
            </h2>
            <p className="text-lg font-body mb-10" style={{ color: 'var(--color-muted)' }}>
              2026年、最高の一枚であなたの新しいスタートを飾りませんか？
            </p>

            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border-2" style={{ borderColor: 'var(--color-gold-light)' }}>
              <div className="mb-4">
                <span className="text-4xl">🎍🌅🎍</span>
              </div>
              <p className="text-xl font-display font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
                2026年1月開催
              </p>
              <p className="font-body mb-2" style={{ color: 'var(--color-ink)' }}>
                下記のボタンから予約をお申し込みください
              </p>
              <p className="text-sm mb-8" style={{ color: 'var(--color-muted)' }}>
                ※PCからお申し込みの場合は<br />
                カレンダーが表示されたら2026年1月が表示される週まで<br />
                移動いただき、設定している撮影枠からご予約お願いいたします。
              </p>
              <a
                href="https://calendar.google.com/calendar/appointments/schedules/AcZssZ0iEean-B-BgWkc2-ksuujdTv5221lq77XPAULUGMY-iFGCQ83w1zDX7YDJ1LxIE35Icdmm4zLR?gv=true"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-block text-lg"
              >
                2026年1月の撮影予約はこちら
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-10 text-center relative overflow-hidden" style={{ background: 'var(--color-ink)' }}>
          <div className="blob blob-coral w-[200px] h-[200px] -left-20 top-0 opacity-10" />
          <div className="blob blob-gold w-[150px] h-[150px] right-0 -bottom-10 opacity-10" />

          <p className="font-body relative z-10 mb-2" style={{ color: 'var(--color-gold)' }}>
            🎍 2026年 新春特別企画 🎍
          </p>
          <p className="font-body relative z-10" style={{ color: 'var(--color-subtle)' }}>
            &copy; 2025-2026 NonTurn.LLC Special Photo Session. All rights reserved.
          </p>
        </footer>

        {/* Image Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh] w-full h-full animate-bounce-in">
              <Image
                src={selectedImage}
                alt=""
                fill
                className="object-contain"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:rotate-90"
                style={{ background: 'var(--color-primary)' }}
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

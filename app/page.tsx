"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'member' | 'community'>('member');
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);

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

    // Observe all elements with scroll-animation class
    const elements = document.querySelectorAll('.scroll-animation');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, [loading]); // Re-run when loading is done

  useEffect(() => {
    // ローディングアニメーションを3秒後に非表示
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // メンバー撮影分の画像
  const memberImages = [
    { path: "https://rpk6snz1bj3dcdnk.public.blob.vercel-storage.com/port01.jpg" },
    { path: "https://rpk6snz1bj3dcdnk.public.blob.vercel-storage.com/port02.jpg" },
    { path: "https://rpk6snz1bj3dcdnk.public.blob.vercel-storage.com/port03.jpg" },
    { path: "https://rpk6snz1bj3dcdnk.public.blob.vercel-storage.com/port04.jpg" },
    { path: "https://rpk6snz1bj3dcdnk.public.blob.vercel-storage.com/port05.jpg" },
    { path: "https://rpk6snz1bj3dcdnk.public.blob.vercel-storage.com/port06.jpg" },
    { path: "https://rpk6snz1bj3dcdnk.public.blob.vercel-storage.com/port07.jpg" },
    { path: "https://rpk6snz1bj3dcdnk.public.blob.vercel-storage.com/port08.jpg" },
    { path: "https://rpk6snz1bj3dcdnk.public.blob.vercel-storage.com/port09.jpg" },
  ];

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
  ];

  // 現在表示する画像（ヒーロー、スライドショー用）
  const images = memberImages;

  // Slideshow effect for About section
  const slideshowImages = images.slice(0, 5);

  // Hero slideshow images (3 sets of 3 images each)
  const heroSlideshows = [
    memberImages.slice(0, 3),
    memberImages.slice(3, 6),
    memberImages.slice(6, 9),
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlideIndex((prevIndex) =>
        (prevIndex + 1) % slideshowImages.length
      );
    }, 7000); // Change image every 7 seconds

    return () => clearInterval(interval);
  }, [slideshowImages.length]);

  // Hero slideshow effect
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroSlideIndex((prevIndex) =>
        (prevIndex + 1) % heroSlideshows.length
      );
    }, 5000); // Change hero slideshow every 5 seconds

    return () => clearInterval(interval);
  }, [heroSlideshows.length]);

  return (
    <>
      {/* Loading Animation */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="mb-8">
              <div className="relative w-32 h-32 mx-auto">
                <Image
                  src="/images/827/load.png"
                  alt="Loading"
                  width={128}
                  height={128}
                  className="animate-[spin_3s_linear_infinite]"
                  priority
                />
              </div>
            </div>
            <div className="space-y-2 animate-pulse">
              <h2 className="text-center relative inline-block w-full">
                <span className="absolute -top-3 md:-top-4 left-1/2 transform -translate-x-1/2 text-xl md:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-400 -rotate-2 whitespace-nowrap">
                  帰ってきた
                </span>
                <span className="block text-3xl md:text-4xl font-medium text-[#808080] pt-3 md:pt-4">
                  プロフィール撮影会
                </span>
              </h2>
              <p className="text-xl text-gray-600 animate-fade-in" style={{ animationDelay: '0.5s' }}>
                2025/10/21(Mon) 18:00~20:00
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          {heroSlideshows.map((slideshow, slideIdx) => (
            <div
              key={slideIdx}
              className={`absolute inset-0 grid grid-cols-3 gap-1 transition-opacity duration-1000 ${
                slideIdx === heroSlideIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {slideshow.map((img, idx) => (
                <div key={idx} className="relative h-full">
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
        <div className="relative z-10 text-center px-4">
          <h1 className="mb-4 relative inline-block">
            <span className="absolute -top-4 md:-top-5 left-0 text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-pink-400 to-rose-400 transform -rotate-2 drop-shadow-lg whitespace-nowrap">
              帰ってきた ✨
            </span>
            <span className="block text-5xl md:text-7xl font-medium text-[#808080] pt-4 md:pt-5">
              プロフィール撮影会
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-[#808080] mb-8">
            あなたの魅力をプロフィール写真に表現しませんか？
          </p>
          <a
            href="#register"
            className="inline-block bg-[#b8b6b6] text-white px-8 py-4 rounded-full hover:bg-[#808080] transition-colors text-lg"
          >
            勇気を出して参加する
          </a>
        </div>
      </section>

      {/* Problems Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-light text-[#808080] text-center mb-16 scroll-animation opacity-0 translate-y-10 transition-all duration-700">
            こんなお悩みございませんか？
          </h2>

          <div className="space-y-6 mb-16">
            <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-[#b8b6b6] scroll-animation opacity-0 translate-y-10 transition-all duration-700 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#808080]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed pt-2">
                  最近、SNSなどのプロフィールを変更していない
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-[#b8b6b6] scroll-animation opacity-0 translate-y-10 transition-all duration-700 delay-100 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#808080]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed pt-2">
                  マッチングアプリで使用する写真でもっと映える写真が欲しい
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-[#b8b6b6] scroll-animation opacity-0 translate-y-10 transition-all duration-700 delay-200 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#808080]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed pt-2">
                  LinkedIn 等ビジネスで使用するビジネスカジュアル感のある写真が手元にない
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-[#b8b6b6] scroll-animation opacity-0 translate-y-10 transition-all duration-700 delay-300 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#808080]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed pt-2">
                  自分の写真に自信がない（涙）
                </p>
              </div>
            </div>
          </div>

          <div className="text-center scroll-animation opacity-0 translate-y-10 transition-all duration-700 delay-400">
            <div className="inline-block bg-gradient-to-r from-[#808080] to-[#b8b6b6] p-1 rounded-3xl mb-6">
              <div className="bg-white px-8 py-6 rounded-3xl">
                <p className="text-2xl md:text-3xl font-light text-[#808080] mb-3">
                  お任せください！
                </p>
                <p className="text-xl md:text-2xl font-medium text-gray-800">
                  そんなお悩み当社が解決いたします！！
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center scroll-animation opacity-0 translate-y-10 transition-all duration-700">
          <div>
            <h2 className="text-4xl font-light text-[#808080] mb-6">
              あなたの魅力を引き出す
            </h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              当社NonTurnの澤田が、あなたの自然な美しさを写真に収めます。
              2時間のセッションで、2カットの厳選された写真をお渡しします。
            </p>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="text-[#b8b6b6] mr-2">✓</span>
                完全無料（限定ーー名様）
              </li>
             <li className="flex items-start">
                <span className="text-[#b8b6b6] mr-2">✓</span>
                レタッチ済み2カットをプレゼント
              </li>
            </ul>
          </div>
          <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-100">
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
                  className={`w-2 h-2 rounded-full transition-colors ${
                    idx === currentSlideIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                  aria-label={`スライド ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Company Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-light text-[#808080] text-center mb-12 scroll-animation opacity-0 translate-y-10 transition-all duration-700">
            About NonTurn
          </h2>
          <div className="bg-white rounded-2xl p-8 md:p-12 scroll-animation opacity-0 translate-y-10 transition-all duration-700 delay-200 border border-[#b8b6b6]">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-medium text-gray-800 mb-2">NonTurn.LLC</h3>
              <p className="text-gray-600 mb-4">代表者：澤田憲孝</p>
              <div className="flex gap-3 justify-center">
                <a
                  href="https://non-turn.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-[#b8b6b6] text-white px-6 py-2 rounded-full hover:bg-[#808080] transition-colors text-sm"
                >
                  公式サイトを見る
                </a>
                <a
                  href="https://www.instagram.com/nonturn2022?igsh=MWxoOWx2MnZ0M3I0eg=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-10 h-10 bg-[#b8b6b6] text-white rounded-full hover:bg-[#808080] transition-all"
                  aria-label="Instagram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
                  </svg>
                </a>
              </div>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                動画制作・スチール撮影を用いて企業のブランディングアップのお手伝いをしております。
              </p>
              <p>
                OG8Fの専用デスクで普段仕事してます。
                仲良くして下さい。
              </p>
              <p className="text-sm text-gray-600 mt-6">
                今回の撮影会は、普段企業様向けに行っている撮影技術を活かし、
                個人の方にもプロフェッショナルな写真撮影を体験していただく特別企画です。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-light text-[#808080] text-center mb-12 scroll-animation opacity-0 translate-y-10 transition-all duration-700">
            Gallery
          </h2>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-16 scroll-animation opacity-0 translate-y-10 transition-all duration-700">
            <div className="inline-flex bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setActiveTab('member')}
                className={`px-8 py-3 rounded-full transition-all duration-300 ${
                  activeTab === 'member'
                    ? 'bg-[#808080] text-white shadow-md'
                    : 'text-gray-600 hover:text-[#808080]'
                }`}
              >
                メンバー撮影分
              </button>
              <button
                onClick={() => setActiveTab('community')}
                className={`px-8 py-3 rounded-full transition-all duration-300 ${
                  activeTab === 'community'
                    ? 'bg-[#808080] text-white shadow-md'
                    : 'text-gray-600 hover:text-[#808080]'
                }`}
              >
                コミュニティー撮影分
              </button>
            </div>
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {(activeTab === 'member' ? memberImages : communityImages).map((img, idx) => (
              <div
                key={`${activeTab}-${idx}`}
                className={`relative aspect-[3/4] rounded-lg overflow-hidden cursor-pointer animate-fade-in`}
                style={{ animationDelay: `${idx * 30}ms` }}
                onClick={() => setSelectedImage(img.path)}
              >
                <Image
                  src={img.path}
                  alt=""
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Notice Section */}
      <section className="py-20 bg-[#f5f5f5]">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-light text-[#808080] text-center mb-12 scroll-animation opacity-0 translate-y-10 transition-all duration-700">
            注意事項
          </h2>
          <div className="bg-white rounded-2xl p-8 md:p-12 scroll-animation opacity-0 translate-y-10 transition-all duration-700 delay-200 border border-[#b8b6b6]">
            <ul className="space-y-6">
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#808080] text-white font-bold mr-4 flex-shrink-0 mt-0.5">
                  1
                </span>
                <p className="text-gray-700 leading-relaxed pt-1">
                  撮影内容は当社事例として使用させていただきます。
                </p>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#808080] text-white font-bold mr-4 flex-shrink-0 mt-0.5">
                  2
                </span>
                <p className="text-gray-700 leading-relaxed pt-1">
                  １社１名のみ（一人じゃ参加の勇気の出ない方はご相談ください）
                </p>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#808080] text-white font-bold mr-4 flex-shrink-0 mt-0.5">
                  3
                </span>
                <p className="text-gray-700 leading-relaxed pt-1">
                  前回参加者不可
                </p>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#808080] text-white font-bold mr-4 flex-shrink-0 mt-0.5">
                  4
                </span>
                <p className="text-gray-700 leading-relaxed pt-1">
                  撮影者の要望で撮影お請けできない場合ございます。
                </p>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#808080] text-white font-bold mr-4 flex-shrink-0 mt-0.5">
                  5
                </span>
                <p className="text-gray-700 leading-relaxed pt-1">
                  撮影する写真のテイストは撮影者の独断と偏見で決めるのでご希望ある際は別途有償でご依頼ご検討ください。
                </p>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="register" className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center scroll-animation opacity-0 translate-y-10 transition-all duration-700">
          <h2 className="text-4xl font-light text-[#808080] mb-6">
            今すぐお申し込みください
          </h2>
          <p className="text-gray-600 mb-8">
            限定ーー名様のみの特別企画です。お早めにお申し込みください。
          </p>
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <p className="text-gray-700 mb-2">
              下記のボタンから予約をお申し込みください
            </p>
            <p className="text-sm text-gray-500 mb-6">
              ※PCからお申し込みの場合は<br />
              カレンダーが表示されたら2025/10/21(月)が表示される週まで<br />
              移動いただき、設定している撮影枠からご予約お願いいたします。
            </p>
            <button
              onClick={() => setShowCalendar(true)}
              className="inline-block bg-[#b8b6b6] text-white px-8 py-4 rounded-full hover:bg-[#808080] transition-colors text-lg font-medium cursor-pointer"
            >
              予約はこちら
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#b8b6b6] py-8 text-center text-gray-600">
        <p>&copy; 2024 Special Photo Session. All rights reserved.</p>
      </footer>

      {/* Calendar Modal */}
      {showCalendar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowCalendar(false)}
        >
          <div 
            className="relative bg-white rounded-lg w-full max-w-5xl h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowCalendar(false)}
              className="absolute top-4 right-4 z-10 text-gray-600 bg-white bg-opacity-90 rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors shadow-lg"
            >
              ✕
            </button>
            <iframe 
              src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ1Gg_DmXJRTl_aM4LfxX8rnmI4ODzmDjHfhp8fgTWjoImlSacOfGBjReue48PR5OOUBraTF3JhM?gv=true" 
              style={{ border: 0 }} 
              width="100%" 
              height="100%" 
              frameBorder="0"
            ></iframe>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full">
            <Image
              src={selectedImage}
              alt=""
              fill
              className="object-contain"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-70 transition-opacity"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
    </>
  );
}

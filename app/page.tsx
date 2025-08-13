"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

  const images = [
    { path: "827/DSC00927.jpg" },
    { path: "827/DSC01074.jpg" },
    { path: "yon/DSC00833のコピー.jpg" },
    { path: "827/DSC01011のコピー.jpg" },
    { path: "827/DSC01335.jpg" },
    { path: "827/DSC00949.jpg" },
    { path: "yon/DSC00843のコピー.jpg" },
    { path: "827/DSC01398.jpg" },
    { path: "827/DSC01020のコピー.jpg" },
    { path: "827/DSC01109.jpg" },
    { path: "yon/DSC00861のコピー.jpg" },
    { path: "827/DSC01356.jpg" },
    { path: "827/DSC00895のコピー.jpg" },
    { path: "827/DSC01152.jpg" },
    { path: "827/DSC01404のコピー.jpg" },
    { path: "827/DSC01011のコピー2.jpg" },
    { path: "827/DSC01099.jpg" },
    { path: "827/DSC01314のコピー.jpg" },
  ];

  return (
    <>
      {/* Loading Animation */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="mb-8">
              <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto"></div>
            </div>
            <div className="space-y-2 animate-pulse">
              <h2 className="text-3xl font-light text-pink-800">Special Photo Session</h2>
              <p className="text-xl text-gray-600 animate-fade-in" style={{ animationDelay: '0.5s' }}>
                2025/8/27 18:00~
              </p>
              <p className="text-xl text-gray-600 animate-fade-in" style={{ animationDelay: '1s' }}>
                @7A会議室
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-3 gap-1 opacity-20">
          {images.slice(0, 6).map((img, idx) => (
            <div key={idx} className="relative h-full">
              <Image
                src={`/images/${img.path}`}
                alt=""
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-7xl font-light text-pink-800 mb-4">
            Special Photo Session
          </h1>
          <p className="text-xl md:text-2xl text-pink-600 mb-8">
            あなたの魅力をプロフィール写真に表現しませんか？
          </p>
          <a
            href="#register"
            className="inline-block bg-pink-400 text-white px-8 py-4 rounded-full hover:bg-pink-500 transition-colors text-lg"
          >
            無料で参加する
          </a>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center scroll-animation opacity-0 translate-y-10 transition-all duration-700">
          <div>
            <h2 className="text-4xl font-light text-pink-800 mb-6">
              あなたの魅力を引き出す
            </h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              当社NonTurnの澤田が、あなたの自然な美しさを写真に収めます。
              2時間のセッションで、2カットの厳選された写真をお渡しします。
            </p>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="text-pink-400 mr-2">✓</span>
                完全無料（限定8名様）
              </li>
             <li className="flex items-start">
                <span className="text-pink-400 mr-2">✓</span>
                レタッチ済み2カットをプレゼント
              </li>
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {images.slice(6, 10).map((img, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden">
                <Image
                  src={`/images/${img.path}`}
                  alt=""
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-light text-pink-800 text-center mb-12 scroll-animation opacity-0 translate-y-10 transition-all duration-700">
            About NonTurn
          </h2>
          <div className="bg-pink-50 rounded-2xl p-8 md:p-12 scroll-animation opacity-0 translate-y-10 transition-all duration-700 delay-200">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-medium text-gray-800 mb-2">NonTurn.LLC</h3>
              <p className="text-gray-600 mb-4">代表者：澤田憲孝</p>
              <div className="flex gap-3 justify-center">
                <a 
                  href="https://non-turn.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block bg-pink-400 text-white px-6 py-2 rounded-full hover:bg-pink-500 transition-colors text-sm"
                >
                  公式サイトを見る
                </a>
                <a 
                  href="https://www.instagram.com/nonturn2022?igsh=MWxoOWx2MnZ0M3I0eg==" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 transition-all"
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
      <section className="py-20 bg-pink-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-light text-pink-800 text-center mb-12 scroll-animation opacity-0 translate-y-10 transition-all duration-700">
            Gallery
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {images.map((img, idx) => (
              <div 
                key={idx} 
                className={`relative aspect-[3/4] rounded-lg overflow-hidden cursor-pointer scroll-animation opacity-0 translate-y-10 transition-all duration-700`}
                style={{ transitionDelay: `${idx * 50}ms` }}
                onClick={() => setSelectedImage(img.path)}
              >
                <Image
                  src={`/images/${img.path}`}
                  alt=""
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="register" className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center scroll-animation opacity-0 translate-y-10 transition-all duration-700">
          <h2 className="text-4xl font-light text-pink-800 mb-6">
            今すぐお申し込みください
          </h2>
          <p className="text-gray-600 mb-8">
            限定8名様のみの特別企画です。お早めにお申し込みください。
          </p>
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <p className="text-gray-700 mb-6">
              下記のボタンから予約をお申し込みください
            </p>
            <a 
              href="https://calendar.google.com/calendar/u/0/r/week/2025/8/27?hl=ja"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-pink-400 text-white px-8 py-4 rounded-full hover:bg-pink-500 transition-colors text-lg font-medium"
            >
              予約はこちら
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-pink-100 py-8 text-center text-gray-600">
        <p>&copy; 2024 Special Photo Session. All rights reserved.</p>
      </footer>

      {/* Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full">
            <Image
              src={`/images/${selectedImage}`}
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

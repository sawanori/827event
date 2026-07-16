import type { Metadata } from "next";
import { Outfit, Shippori_Mincho, Zen_Kaku_Gothic_New } from "next/font/google";
import "./globals.css";

// 見出し：和の明朝（格調・夏の情緒）
const mincho = Shippori_Mincho({
  variable: "--font-mincho",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

// 本文：和ゴシック（可読性）
const zen = Zen_Kaku_Gothic_New({
  variable: "--font-zen",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
});

// 数字・欧文アクセント（カウントダウン等）
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "夏の新プロフィール撮影会 | 2026.8.5 無料撮影会 - NonTurn.LLC",
  description:
    "2026年8月5日（水）18:00〜20:00開催。プロカメラマンによる完全無料の撮影会。限定8名・性別不問。レタッチ済み2カットをプレゼント。夏の装いで、新しいプロフィールを。",
  openGraph: {
    title: "夏の新プロフィール撮影会 | 2026.8.5",
    description:
      "完全無料・限定8名。夏の装いで新しいプロフィールを。レタッチ2カットプレゼント。",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${mincho.variable} ${zen.variable} ${outfit.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

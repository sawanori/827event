import type { Metadata } from "next";
import { Outfit, Syne } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "帰ってきたプロフィール撮影会 - 無料写真撮影会",
  description: "プロカメラマンによる2時間の無料撮影会。限定ーー名様、女性限定。2カットの厳選された写真をプレゼント。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${outfit.variable} ${syne.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

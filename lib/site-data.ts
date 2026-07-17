// ============================================================================
// 夏の新プロフィール撮影会 — 単一の情報源（Single Source of Truth）
// 2026/8/5 開催。イベント事実・画像・テーマ色・コピーをここに集約する。
// three.js コンポーネントと 2D セクションの双方がここから読み込む。
// ============================================================================

// ---- 開催イベントの事実（ここは勝手に変えない：確定情報） --------------------
export const EVENT = {
  title: "夏の新プロフィール撮影会",
  brand: "NonTurn.LLC",
  photographer: "澤田憲孝",
  // 2026-08-05（水）18:30〜20:00（JST）
  dateISO: "2026-08-05T18:30:00+09:00",
  dateLabel: "2026.8.5",
  dateJa: "2026年8月5日",
  weekday: "水",
  timeLabel: "18:30 – 20:00",
  // 会場：ユーザー指定「会議室7A」。建物名・住所・アクセスは未確定（要追記）。
  venue: "会議室7A",
  venueNote: "詳細な会場案内はご予約者へ個別にご連絡します",
  capacity: 6,
  price: "完全無料",
  target: "性別不問・どなたでも",
  benefit: "レタッチ済み2カットをプレゼント",
} as const;

// ---- 予約枠（18:30-20:00／撮影10分＋休憩5分＝全6枠） ------------------------
export type Slot = {
  id: number;
  label: string; // 表示用「①」など
  start: string; // "18:30"
  end: string; // "18:40"
  range: string; // "18:30 – 18:40"
};

export const SLOTS: Slot[] = [
  { id: 1, label: "①", start: "18:30", end: "18:40", range: "18:30 – 18:40" },
  { id: 2, label: "②", start: "18:45", end: "18:55", range: "18:45 – 18:55" },
  { id: 3, label: "③", start: "19:00", end: "19:10", range: "19:00 – 19:10" },
  { id: 4, label: "④", start: "19:15", end: "19:25", range: "19:15 – 19:25" },
  { id: 5, label: "⑤", start: "19:30", end: "19:40", range: "19:30 – 19:40" },
  { id: 6, label: "⑥", start: "19:45", end: "19:55", range: "19:45 – 19:55" },
];

// ---- 予約時の確認事項（すべて必須チェック） -------------------------------
// key は reservations テーブルの confirm_<key> 列と対応する。
export type Confirmation = { key: "photos" | "promo"; jp: string; en: string };

export const CONFIRMATIONS: Confirmation[] = [
  { key: "photos", jp: "データは2枚のみ", en: "Only 2 photos will be provided" },
  {
    key: "promo",
    jp: "当社NonTurn合同会社の宣材としてデータを利用する可能性がある",
    en: "Photos may be used for NonTurn LLC's promotional materials",
  },
];

// ---- 予約フォーム送信先（Formspree） ---------------------------------------
// 使い方：https://formspree.io で無料登録 →「New Form」→ 発行される
// エンドポイント（https://formspree.io/f/xxxxxxx）を .env.local に設定する：
//   NEXT_PUBLIC_FORMSPREE_ENDPOINT=https://formspree.io/f/xxxxxxx
// 未設定の間は下のプレースホルダのままとなり、フォームは「準備中」表示になる。
export const FORMSPREE_ENDPOINT =
  process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT ??
  "https://formspree.io/f/REPLACE_WITH_YOUR_FORM_ID";

export const FORMSPREE_IS_CONFIGURED =
  !FORMSPREE_ENDPOINT.includes("REPLACE_WITH_YOUR_FORM_ID");

// 予約通知の宛先。Formspree 未設定の間は、フォーム送信で mailto（メール作成画面）を
// 開き、この宛先へ予約内容を送る。Formspree を設定すればそちらが優先される。
export const CONTACT_EMAIL = "snp.inc.info@gmail.com";

// ---- 画像素材（既存素材を流用） --------------------------------------------
// メンバー撮影分（Vercel Blob）
export const MEMBER_IMAGES: string[] = [
  "https://rpk6snz1bj3dcdnk.public.blob.vercel-storage.com/port18.jpg",
  "https://rpk6snz1bj3dcdnk.public.blob.vercel-storage.com/port03.jpg",
  "https://rpk6snz1bj3dcdnk.public.blob.vercel-storage.com/port09.jpg",
  "https://rpk6snz1bj3dcdnk.public.blob.vercel-storage.com/port22.jpg",
  "https://rpk6snz1bj3dcdnk.public.blob.vercel-storage.com/port06.jpg",
  "https://rpk6snz1bj3dcdnk.public.blob.vercel-storage.com/port16.jpg",
  "https://rpk6snz1bj3dcdnk.public.blob.vercel-storage.com/port01.jpg",
  "https://rpk6snz1bj3dcdnk.public.blob.vercel-storage.com/port20.jpg",
  "https://rpk6snz1bj3dcdnk.public.blob.vercel-storage.com/port05.jpg",
  "https://rpk6snz1bj3dcdnk.public.blob.vercel-storage.com/port19.jpg",
  "https://rpk6snz1bj3dcdnk.public.blob.vercel-storage.com/port08.jpg",
  "https://rpk6snz1bj3dcdnk.public.blob.vercel-storage.com/port02.jpg",
  "https://rpk6snz1bj3dcdnk.public.blob.vercel-storage.com/port07.jpg",
  "https://rpk6snz1bj3dcdnk.public.blob.vercel-storage.com/port04.jpg",
];

// コミュニティー撮影分（ローカル /public/images）
export const COMMUNITY_IMAGES: string[] = [
  "/images/827/DSC00927.jpg",
  "/images/827/DSC01074.jpg",
  "/images/yon/DSC00833のコピー.jpg",
  "/images/827/DSC01011のコピー.jpg",
  "/images/827/DSC01335.jpg",
  "/images/827/DSC00949.jpg",
  "/images/yon/DSC00843のコピー.jpg",
  "/images/827/DSC01398.jpg",
  "/images/827/DSC01020のコピー.jpg",
  "/images/827/DSC01109.jpg",
  "/images/yon/DSC00861のコピー.jpg",
  "/images/827/DSC01356.jpg",
  "/images/827/DSC00895のコピー.jpg",
  "/images/827/DSC01152.jpg",
  "/images/827/DSC01404のコピー.jpg",
  "/images/827/DSC01011のコピー2.jpg",
  "/images/827/DSC01099.jpg",
  "/images/827/DSC01314のコピー.jpg",
  "/images/827/kinpatu 12.jpg",
  "/images/827/kinpatu 15.jpg",
];

export type GalleryCategory = "member" | "community";

export const GALLERY_TABS: { key: GalleryCategory; label: string; images: string[] }[] = [
  { key: "member", label: "メンバー撮影分", images: MEMBER_IMAGES },
  { key: "community", label: "コミュニティー撮影分", images: COMMUNITY_IMAGES },
];

// ---- テーマ配色：和モダン夏祭り（藍 / 朱 / 金） ------------------------------
// three.js は数値/hex を直接使うため、CSS 変数と別にここでも定義して共有する。
export const THEME = {
  // 藍（夜空）
  indigoDeep: "#050a1a",
  indigo: "#0b1d44",
  indigoLight: "#16336e",
  night: "#081026",
  // 朱（vermilion）
  vermilion: "#e2482e",
  vermilionLight: "#ff6f52",
  // 金（gold）
  gold: "#e7bd54",
  goldLight: "#ffe6a3",
  goldBright: "#ffd24a",
  // 提灯の灯り
  lantern: "#ff8a3d",
  lanternGlow: "#ffb066",
  // 花火の色バリエーション
  fireworks: ["#ffd24a", "#ff6f52", "#7fd4ff", "#ff9ecb", "#b8ff9e", "#ffffff"],
} as const;

// ---- コピー（8月／夏の新プロフィールに全面書き換え） ------------------------
export const CONCERNS: { icon: string; text: string }[] = [
  { icon: "🎐", text: "衣替えの季節。夏の装いで新しいプロフィールに更新したい" },
  { icon: "💗", text: "マッチングアプリで“夏映え”する一枚が欲しい" },
  { icon: "💼", text: "LinkedIn等、ビジネス用の写真をアップデートしたい" },
  { icon: "🎆", text: "上半期の自分をリセット、新しい表情で後半戦へ" },
];

export const NOTICES: string[] = [
  "撮影内容は当社事例として使用させていただきます。",
  "1社1名のみ（お一人での参加が不安な方はご相談ください）。",
  "より多くの企業様にご体験いただくため、過去にご参加いただいた企業様は今回対象外とさせていただいております。",
  "撮影する写真のテイストは撮影者にお任せください（ご希望は別途有償でご相談可）。",
  "撮影者の判断で撮影をお請けできない場合がございます。",
];

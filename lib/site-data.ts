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
const BLOB = "https://rpk6snz1bj3dcdnk.public.blob.vercel-storage.com";

// 2026夏の新規撮影分（Vercel Blob・WebP）16枚。既存素材に「追加」する形で先頭に置く
// （先頭にあるとヒーロー/リボン/スライドショーのスライスにも新画像が入る）。
const NEW_2026: string[] = [
  `${BLOB}/b1.webp`,
  `${BLOB}/b2.webp`,
  `${BLOB}/c1.webp`,
  `${BLOB}/c2.webp`,
  `${BLOB}/e1.webp`,
  `${BLOB}/e2.webp`,
  `${BLOB}/k1.webp`,
  `${BLOB}/k2.webp`,
  `${BLOB}/s1.webp`,
  `${BLOB}/s2.webp`,
  `${BLOB}/sg1.webp`,
  `${BLOB}/sg2.webp`,
  `${BLOB}/t1.webp`,
  `${BLOB}/t2.webp`,
  `${BLOB}/y1.webp`,
  `${BLOB}/y2.webp`,
];

// 作品ギャラリー用は各組の 2 枚目（○2）のみ。
const NEW_2026_GALLERY: string[] = [
  `${BLOB}/b2.webp`,
  `${BLOB}/c2.webp`,
  `${BLOB}/e2.webp`,
  `${BLOB}/k2.webp`,
  `${BLOB}/s2.webp`,
  `${BLOB}/sg2.webp`,
  `${BLOB}/t2.webp`,
  `${BLOB}/y2.webp`,
];

// ヒーロー用は各組の 1 枚目（○1）のみ。
const NEW_2026_HERO: string[] = [
  `${BLOB}/b1.webp`,
  `${BLOB}/c1.webp`,
  `${BLOB}/e1.webp`,
  `${BLOB}/k1.webp`,
  `${BLOB}/s1.webp`,
  `${BLOB}/sg1.webp`,
  `${BLOB}/t1.webp`,
  `${BLOB}/y1.webp`,
];

// 既存の port*（Vercel Blob）
const PORT_IMAGES: string[] = [
  `${BLOB}/port18.jpg`,
  `${BLOB}/port03.jpg`,
  `${BLOB}/port09.jpg`,
  `${BLOB}/port22.jpg`,
  `${BLOB}/port06.jpg`,
  `${BLOB}/port16.jpg`,
  `${BLOB}/port01.jpg`,
  `${BLOB}/port20.jpg`,
  `${BLOB}/port05.jpg`,
  `${BLOB}/port19.jpg`,
  `${BLOB}/port08.jpg`,
  `${BLOB}/port02.jpg`,
  `${BLOB}/port07.jpg`,
  `${BLOB}/port04.jpg`,
];

// メンバー撮影分（リボン/スライドショー用）：新16枚 ＋ port*
export const MEMBER_IMAGES: string[] = [...NEW_2026, ...PORT_IMAGES];

// 作品ギャラリー「メンバー撮影分」タブ用：新規は ○2 のみ ＋ port*
export const MEMBER_GALLERY_IMAGES: string[] = [...NEW_2026_GALLERY, ...PORT_IMAGES];

// ヒーロー「夏の光で、新しい自分を。」用：新規は ○1 のみ ＋ port*
export const MEMBER_HERO_IMAGES: string[] = [...NEW_2026_HERO, ...PORT_IMAGES];

// ヒーローのメインビジュアル。2枚をクロスフェードでスライドする（top=Vercel Blob / top2=ローカル）。
export const HERO_SINGLE = `${BLOB}/top.webp`;
export const HERO_SECOND = "/images/top2.webp";
export const HERO_SLIDES: string[] = [HERO_SINGLE, HERO_SECOND];

// About「映えるあなたを」セクションのスライド（ユーザー指定・○2カット7枚）。
export const ABOUT_SLIDES: string[] = [
  `${BLOB}/t2.webp`,
  `${BLOB}/e2.webp`,
  `${BLOB}/sg2.webp`,
  `${BLOB}/s2.webp`,
  `${BLOB}/c2.webp`,
  `${BLOB}/b2.webp`,
  `${BLOB}/k2.webp`,
];

// コミュニティー撮影分（既存のローカル /public/images 分）。
const COMMUNITY_LOCAL: string[] = [
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

// 2026新規のコミュニティー撮影分（Vercel Blob・WebP・1334×2000、blob/ct 由来）＝「最近追加した分」。
// スクロール演出（ScrollRibbon）はこの新規分を一人1枚として表示する。
export const COMMUNITY_NEW_2026: string[] = [
  `${BLOB}/ct/DSC08307.webp`,
  `${BLOB}/ct/DSC08315.webp`,
  `${BLOB}/ct/DSC08335.webp`,
  `${BLOB}/ct/DSC08343.webp`,
  `${BLOB}/ct/DSC08373.webp`,
  `${BLOB}/ct/DSC08377.webp`,
  `${BLOB}/ct/DSC08474.webp`,
  `${BLOB}/ct/DSC08477.webp`,
  `${BLOB}/ct/DSC08488.webp`,
  `${BLOB}/ct/DSC08504.webp`,
  `${BLOB}/ct/DSC08751.webp`,
  `${BLOB}/ct/DSC08758.webp`,
];

// コミュニティー撮影分：既存のローカル ＋ 2026新規分。
export const COMMUNITY_IMAGES: string[] = [...COMMUNITY_LOCAL, ...COMMUNITY_NEW_2026];

// スクロール演出（ScrollRibbon）用：新規12枚は6人×2カットなので「一人1枚」に厳選（6名）。
// 採用カットはユーザー指定（A:08307 / B:08343 / C:08377 / E:08474 / F:08504 / G:08751）。
export const COMMUNITY_RIBBON: string[] = [
  `${BLOB}/ct/DSC08307.webp`,
  `${BLOB}/ct/DSC08343.webp`,
  `${BLOB}/ct/DSC08377.webp`,
  `${BLOB}/ct/DSC08474.webp`,
  `${BLOB}/ct/DSC08504.webp`,
  `${BLOB}/ct/DSC08751.webp`,
];

export type GalleryCategory = "member" | "community";

export const GALLERY_TABS: { key: GalleryCategory; label: string; images: string[] }[] = [
  { key: "member", label: "メンバー撮影分", images: MEMBER_GALLERY_IMAGES },
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

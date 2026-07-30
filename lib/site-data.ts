// ============================================================================
// 秋の新プロフィール撮影会 — 単一の情報源（Single Source of Truth）
// 2026/9/9 開催。イベント事実・画像・テーマ色・コピーをここに集約する。
// three.js コンポーネントと 2D セクションの双方がここから読み込む。
// ============================================================================

// ---- 開催イベントの事実（ここは勝手に変えない：確定情報） --------------------
export const EVENT = {
  title: "秋の新プロフィール撮影会",
  brand: "NonTurn.LLC",
  photographer: "澤田憲孝",
  // 2026-09-09（水）18:30〜20:00（JST）
  dateISO: "2026-09-09T18:30:00+09:00",
  dateLabel: "2026.9.9",
  dateJa: "2026年9月9日",
  weekday: "水",
  timeLabel: "18:30 – 20:00",
  // 会場：ユーザー指定「会議室7A」。建物名・住所・アクセスは未確定（要追記）。
  venue: "会議室7A",
  venueNote: "詳細な会場案内はご予約者へ個別にご連絡します",
  capacity: 6,
  price: "完全無料",
  target: "性別不問",
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
export type Confirmation = { key: "photos" | "promo" | "prep"; jp: string; en: string };

export const CONFIRMATIONS: Confirmation[] = [
  { key: "photos", jp: "データは2枚のみ", en: "Only 2 photos will be provided" },
  {
    key: "promo",
    jp: "当社NonTurn合同会社の宣材としてデータを利用する可能性がある",
    en: "Photos may be used for NonTurn LLC's promotional materials",
  },
  {
    key: "prep",
    jp: "事前のコミュニケーションとして、撮影日前に撮影者とすり合わせする事が可能である",
    en: "Pre-shoot coordination with the photographer is available before the session date",
  },
];

// ---- キャンセル理由（管理画面で選択／理由別の同報メールを予約者へ送る） ----------
// 文面（件名・見出し・本文）もここに集約し、管理画面のセレクトとメールが同じ定義を参照する。
export type CancelReasonKey = "prev_participant" | "photographer_decline" | "time_change";

export const CANCEL_REASONS: {
  key: CancelReasonKey;
  label: string; // 管理画面セレクトの表示
  subject: string; // 予約者向けメールの件名
  heading: string; // 本文の見出し
  body: string; // 本文（丁寧文）
}[] = [
  {
    key: "prev_participant",
    label: "前回参加・行政プログラム入居の企業",
    subject: `【ご予約に関するお知らせ】${EVENT.title}`,
    heading: "ご予約を承ることができませんでした",
    body: "本撮影会は、当社とまだ接点をお持ちでないWeWorkメンバー様にご体験いただくため、過去に当社の撮影会へご参加いただいた企業様は対象外とさせていただいております。また、行政が推進するアクセラレータプログラム（例：神奈川県）をご利用のうえご入居されている企業様につきましても、参加をご遠慮いただいております。誠に恐れ入りますが、上記のいずれかに該当するため、今回のご予約はキャンセルとさせていただきました。何卒ご理解賜りますようお願い申し上げます。",
  },
  {
    key: "photographer_decline",
    label: "撮影者の判断で撮影不可",
    subject: `【ご予約に関するお知らせ】${EVENT.title}`,
    heading: "ご予約を見送らせていただきました",
    body: "誠に恐れ入りますが、撮影者の判断により、今回はご希望に沿った撮影をお請けすることが難しく、今回のご予約は見送らせていただくこととなりました。何卒ご理解賜りますようお願い申し上げます。",
  },
  {
    key: "time_change",
    label: "時間変更",
    subject: `【ご予約時間の変更について】${EVENT.title}`,
    heading: "ご予約時間の変更のお願い",
    body: "ご予約いただいたお時間について、変更のご相談をさせていただきたくご連絡いたしました。恐れ入りますが、改めて日程・お時間の調整をお願いできますでしょうか。詳細はこのメールにそのままご返信ください。",
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
// 作品ギャラリー（メンバー撮影分）末尾に追加した4人グループ（b3・ローカル最適化WebP・1334×2000）。
const MEMBER_GALLERY_EXTRA: string[] = ["/images/b3.webp"];
export const MEMBER_GALLERY_IMAGES: string[] = [...NEW_2026_GALLERY, ...PORT_IMAGES, ...MEMBER_GALLERY_EXTRA];

// ヒーロー「秋の光で、新しい自分を。」用：新規は ○1 のみ ＋ port*
export const MEMBER_HERO_IMAGES: string[] = [...NEW_2026_HERO, ...PORT_IMAGES];

// ヒーローのメインビジュアル。2枚をクロスフェードでスライドする（秋の紅葉カット・ローカルWebP）。
// 元データは top/autumntop{1,2}.png（941×1672）を cwebp -q 82 で変換したもの。
export const HERO_SINGLE = "/images/autumn-top1.webp";
export const HERO_SECOND = "/images/autumn-top2.webp";
export const HERO_SLIDES: string[] = [HERO_SINGLE, HERO_SECOND];

// About「映えるあなたを」セクションのスライド（ユーザー指定・○2カット7枚）。
// 注: Blob 上で t1/t2 の中身が入れ替わっている（t1.webp＝頬に手のポーズ, t2.webp＝正面ヘッドショット）。
// 希望のポーズ（頬に手＝“t2”）は t1.webp 側に入っているため、先頭は t1.webp を参照する。
export const ABOUT_SLIDES: string[] = [
  `${BLOB}/t1.webp`,
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

// ---- テーマ配色：和モダンの秋（墨 / 錆朱 / 金茶） ----------------------------
// three.js は数値/hex を直接使うため、CSS 変数と別にここでも定義して共有する。
export const THEME = {
  // 墨（夜）
  indigoDeep: "#050a1a",
  indigo: "#0b1d44",
  indigoLight: "#16336e",
  night: "#081026",
  // 錆朱（vermilion）
  vermilion: "#b03a17",
  vermilionLight: "#c9552b",
  // 金茶（gold）
  gold: "#9c6f26",
  goldLight: "#e0a441",
  goldBright: "#d08a2f",
  // 提灯の灯り（琥珀）
  lantern: "#d97a2b",
  lanternGlow: "#e8a45c",
  // 木の葉の色バリエーション
  fireworks: ["#d08a2f", "#c9552b", "#9c6f26", "#b03a17", "#e0a441", "#f8f3e6"],
} as const;

// ---- コピー（9月／秋の新プロフィールに全面書き換え） ------------------------
export const CONCERNS: { icon: string; text: string }[] = [
  { icon: "🍂", text: "衣替えの季節。秋の装いで新しいプロフィールに更新したい" },
  { icon: "💗", text: "マッチングアプリで“秋映え”する一枚が欲しい" },
  { icon: "💼", text: "LinkedIn等、ビジネス用の写真をアップデートしたい" },
  { icon: "🍁", text: "上半期の自分をリセット、新しい表情で後半戦へ" },
];

export const NOTICES: string[] = [
  "撮影内容は当社事例として使用させていただきます。",
  "1社1名のみ（お一人での参加が不安な方はご相談ください）。",
  "当社とまだ接点をお持ちでないWeWorkメンバー様にご体験いただくため、過去にご参加いただいた企業様は対象外とさせていただいております。",
  "撮影する写真のテイストは撮影者にお任せください（ご希望は別途有償でご相談可）。",
  "撮影者の判断で撮影をお請けできない場合がございます。",
];

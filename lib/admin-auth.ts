// /admin の共有パスワード認証。ミドルウェア（Edge）とサーバーアクション（Node）の
// 双方から使うため、両環境にある Web Crypto（crypto.subtle）だけで完結させる。
// Cookie にはパスワードそのものではなく、パスワード由来のハッシュ（セッショントークン）を入れる。

export const ADMIN_COOKIE = "photolp_admin";

export async function sessionToken(): Promise<string> {
  const pw = process.env.ADMIN_PASSWORD ?? "";
  const data = new TextEncoder().encode(`photolp-admin::${pw}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function isValidSession(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  if (!process.env.ADMIN_PASSWORD) return false;
  const expected = await sessionToken();
  if (token.length !== expected.length) return false;
  // 長さ一致時の定数時間比較
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, isValidSession } from "@/lib/admin-auth";

// /admin 配下を共有パスワードのセッションで保護する。未認証は /admin/login へ。
// Next.js 16 の proxy 規約（旧 middleware）。proxy は Node ランタイムで動作する。
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ログインページ自身は素通し（無限リダイレクト回避）
  if (pathname.startsWith("/admin/login")) return NextResponse.next();

  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (await isValidSession(token)) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*"],
};

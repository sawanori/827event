"use server";

// 管理画面の認証とキャンセル操作（Server Actions）。

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ADMIN_COOKIE, sessionToken } from "@/lib/admin-auth";
import { deleteReservation, getReservationById } from "@/lib/db";
import { sendCancellationEmails } from "@/lib/mail";
import { SLOTS } from "@/lib/site-data";

export type LoginState = { error?: string } | null;

export async function adminLogin(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const pw = String(formData.get("password") ?? "");
  const from = String(formData.get("from") ?? "/admin") || "/admin";

  if (!process.env.ADMIN_PASSWORD) {
    return { error: "サーバー未設定です（ADMIN_PASSWORD が未設定）。" };
  }
  if (pw !== process.env.ADMIN_PASSWORD) {
    return { error: "パスワードが違います。" };
  }

  const jar = await cookies();
  jar.set(ADMIN_COOKIE, await sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12, // 12時間
  });

  redirect(from.startsWith("/admin") ? from : "/admin");
}

export async function adminLogout(): Promise<void> {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

export async function cancelReservation(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  if (Number.isInteger(id)) {
    // 削除前に宛先情報を取得してから削除し、キャンセル通知メールを送る。
    const r = await getReservationById(id);
    await deleteReservation(id);
    if (r) {
      const slotRange = SLOTS.find((s) => s.id === r.slot_id)?.range ?? "";
      // メール失敗はキャンセル自体を失敗させない（予約は既に削除済み）。
      try {
        await sendCancellationEmails({
          name: r.name,
          company: r.company,
          email: r.email,
          sns: r.sns ?? undefined,
          slotRange,
        });
      } catch (e) {
        console.error("cancellation email failed (reservation already removed):", e);
      }
    }
  }
  revalidatePath("/admin");
}

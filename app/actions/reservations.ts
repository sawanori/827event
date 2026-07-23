"use server";

// 予約の受付と空き状況取得（Server Actions）。1枠1名。二重予約は slot_id の
// UNIQUE 制約で最終的に防ぐ。希望枠は具体的な1枠を必ず指定する。

import { SLOTS } from "@/lib/site-data";
import {
  getTakenSlotIds,
  insertReservation,
  isUniqueViolation,
  isDbConfigured,
} from "@/lib/db";
import { sendReservationEmails } from "@/lib/mail";

export type Availability = {
  configured: boolean;
  taken: number[];
  soldOut: boolean;
};

export async function getAvailability(): Promise<Availability> {
  if (!isDbConfigured()) return { configured: false, taken: [], soldOut: false };
  try {
    const taken = await getTakenSlotIds();
    return { configured: true, taken, soldOut: taken.length >= SLOTS.length };
  } catch {
    return { configured: false, taken: [], soldOut: false };
  }
}

export type ReservationInput = {
  name: string;
  company: string;
  email: string;
  slot: string; // SLOT id の文字列
  sns?: string;
  confirmPhotos: boolean;
  confirmPromo: boolean;
  confirmPrep: boolean;
};

export type CreateResult =
  | { ok: true; slotRange: string }
  | { ok: false; error: "slot_taken" | "sold_out" | "invalid" | "not_configured" | "server" };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function createReservation(input: ReservationInput): Promise<CreateResult> {
  if (!isDbConfigured()) return { ok: false, error: "not_configured" };

  const name = (input.name ?? "").trim();
  const company = (input.company ?? "").trim();
  const email = (input.email ?? "").trim();
  const sns = (input.sns ?? "").trim();
  const confirmPhotos = Boolean(input.confirmPhotos);
  const confirmPromo = Boolean(input.confirmPromo);
  const confirmPrep = Boolean(input.confirmPrep);

  // 確認事項は3つとも同意が必須。
  if (!name || !company || !EMAIL_RE.test(email) || !confirmPhotos || !confirmPromo || !confirmPrep) {
    return { ok: false, error: "invalid" };
  }

  const slotId = Number(input.slot);
  if (!Number.isInteger(slotId) || !SLOTS.some((s) => s.id === slotId)) {
    return { ok: false, error: "invalid" };
  }

  // 指定枠が競合（既予約）＝満席。UNIQUE 制約で二重予約を確実に防ぐ。
  try {
    await insertReservation({ slotId, name, company, email, sns, confirmPhotos, confirmPromo, confirmPrep });
  } catch (err) {
    if (isUniqueViolation(err)) return { ok: false, error: "slot_taken" };
    console.error("createReservation failed:", err);
    return { ok: false, error: "server" };
  }

  const slotRange = SLOTS.find((s) => s.id === slotId)?.range ?? "";

  // メール送信失敗は予約自体を失敗させない（予約はDBに確定済み）。
  try {
    await sendReservationEmails({ name, company, email, sns, slotRange });
  } catch (e) {
    console.error("reservation email failed (reservation is saved):", e);
  }

  return { ok: true, slotRange };
}

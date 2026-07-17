"use server";

// 予約の受付と空き状況取得（Server Actions）。1枠1名。二重予約は slot_id の
// UNIQUE 制約で最終的に防ぐ。"おまかせ" は最先の空き枠を割り当てる。

import { SLOTS } from "@/lib/site-data";
import {
  getTakenSlotIds,
  insertReservation,
  isUniqueViolation,
  isDbConfigured,
  firstOpenSlotId,
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
  slot: string; // SLOT id の文字列、または "any"
  sns?: string;
  confirmPhotos: boolean;
  confirmPromo: boolean;
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

  // 確認事項は2つとも同意が必須。
  if (!name || !company || !EMAIL_RE.test(email) || !confirmPhotos || !confirmPromo) {
    return { ok: false, error: "invalid" };
  }

  const isAny = input.slot === "any";
  let slotId: number;

  if (isAny) {
    const open = firstOpenSlotId(await getTakenSlotIds());
    if (open === null) return { ok: false, error: "sold_out" };
    slotId = open;
  } else {
    slotId = Number(input.slot);
    if (!Number.isInteger(slotId) || !SLOTS.some((s) => s.id === slotId)) {
      return { ok: false, error: "invalid" };
    }
  }

  // "おまかせ" は競合時に次の空き枠へリトライ。指定枠は競合＝満席。
  const maxTries = isAny ? SLOTS.length : 1;
  let tries = 0;
  for (;;) {
    try {
      await insertReservation({ slotId, name, company, email, sns, confirmPhotos, confirmPromo });
      break;
    } catch (err) {
      if (isUniqueViolation(err)) {
        if (isAny && ++tries < maxTries) {
          const open = firstOpenSlotId(await getTakenSlotIds());
          if (open === null) return { ok: false, error: "sold_out" };
          slotId = open;
          continue;
        }
        return { ok: false, error: "slot_taken" };
      }
      console.error("createReservation failed:", err);
      return { ok: false, error: "server" };
    }
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

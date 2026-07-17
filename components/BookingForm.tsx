"use client";

// LP 内予約フォーム。Turso 上の在庫を見て空き枠のみ選択可能にし、Server Action
// （createReservation）で受け付ける。1枠1名。埋まった枠は「満席」で選択不可。

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EVENT, SLOTS } from "@/lib/site-data";
import {
  createReservation,
  getAvailability,
  type CreateResult,
} from "@/app/actions/reservations";

type Status = "idle" | "submitting" | "success" | "error";

const ERROR_TEXT: Record<Exclude<CreateResult, { ok: true }>["error"], string> = {
  slot_taken: "その枠はちょうど埋まってしまいました。別の枠をお選びください。",
  sold_out: "申し訳ありません、満席になりました。",
  invalid: "入力内容をご確認ください。",
  not_configured: "予約システムは現在準備中です。時間をおいてお試しください。",
  server: "送信に失敗しました。時間をおいて再度お試しください。",
};

export default function BookingForm() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [slot, setSlot] = useState<string>("");
  const [sns, setSns] = useState("");
  const [agree, setAgree] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const [taken, setTaken] = useState<Set<number>>(new Set());
  const [configured, setConfigured] = useState(true);
  const [soldOut, setSoldOut] = useState(false);

  const refreshAvailability = async () => {
    const a = await getAvailability();
    setConfigured(a.configured);
    setSoldOut(a.soldOut);
    setTaken(new Set(a.taken));
  };

  useEffect(() => {
    refreshAvailability();
  }, []);

  const slotOk =
    slot === "any" ? !soldOut : slot !== "" && !taken.has(Number(slot));

  const canSubmit =
    configured &&
    !soldOut &&
    name.trim() !== "" &&
    company.trim() !== "" &&
    email.trim() !== "" &&
    slotOk &&
    agree &&
    status !== "submitting";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    const result = await createReservation({
      name,
      company,
      email,
      slot,
      sns,
      consent: agree,
    });

    if (result.ok) {
      setStatus("success");
      return;
    }

    // 満席・競合系は在庫を更新してから案内する
    if (result.error === "slot_taken" || result.error === "sold_out") {
      await refreshAvailability();
      if (result.error === "slot_taken") setSlot("");
    }
    setErrorMsg(ERROR_TEXT[result.error]);
    setStatus("error");
  };

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="card text-center py-14"
      >
        <div
          className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full"
          style={{ background: "var(--shu-wash)", border: "1px solid rgba(193,56,31,0.4)" }}
        >
          <svg className="h-6 w-6" fill="none" stroke="var(--shu)" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-display text-2xl md:text-3xl mb-3" style={{ color: "var(--ink)" }}>
          ご予約ありがとうございます
        </h3>
        <p className="font-body leading-relaxed" style={{ color: "var(--muted)" }}>
          受付が完了しました。ご入力のメールアドレスへ確認メールをお送りしています。
          <br />
          当日、担当の{EVENT.photographer}がお待ちしております。
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card md:p-10">
      {/* お名前 */}
      <label className="block mb-5">
        <span className="block mb-2 font-body text-sm" style={{ color: "var(--ink)" }}>
          お名前 <span style={{ color: "var(--shu)" }}>*</span>
        </span>
        <input
          className="field-input"
          type="text"
          required
          placeholder="山田 花子"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>

      {/* 企業名 */}
      <label className="block mb-5">
        <span className="block mb-2 font-body text-sm" style={{ color: "var(--ink)" }}>
          企業名 <span style={{ color: "var(--shu)" }}>*</span>
        </span>
        <input
          className="field-input"
          type="text"
          required
          placeholder="株式会社〇〇"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </label>

      {/* メール */}
      <label className="block mb-5">
        <span className="block mb-2 font-body text-sm" style={{ color: "var(--ink)" }}>
          メールアドレス <span style={{ color: "var(--shu)" }}>*</span>
        </span>
        <input
          className="field-input"
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>

      {/* 希望枠 */}
      <div className="mb-5">
        <span className="block mb-2 font-body text-sm" style={{ color: "var(--ink)" }}>
          ご希望の時間枠 <span style={{ color: "var(--shu)" }}>*</span>
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SLOTS.map((s) => {
            const isTaken = taken.has(s.id);
            const active = slot === String(s.id);
            return (
              <button
                type="button"
                key={s.id}
                disabled={isTaken}
                onClick={() => !isTaken && setSlot(String(s.id))}
                className="rounded-lg px-2 py-3 text-center transition-all duration-300"
                style={{
                  border: `1px solid ${active ? "var(--shu)" : "var(--line)"}`,
                  background: active ? "var(--shu-wash)" : "var(--paper-2)",
                  opacity: isTaken ? 0.45 : 1,
                  cursor: isTaken ? "not-allowed" : "pointer",
                }}
              >
                <span
                  className="block font-num text-lg"
                  style={{ color: active ? "var(--shu-deep)" : "var(--ink)" }}
                >
                  {s.label}
                </span>
                <span className="block font-num text-xs" style={{ color: "var(--subtle)" }}>
                  {s.range}
                </span>
                <span className="block font-body text-[0.6rem] mt-0.5" style={{ color: isTaken ? "var(--shu-deep)" : "var(--subtle)" }}>
                  {isTaken ? "満席" : "空き"}
                </span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          disabled={soldOut}
          onClick={() => !soldOut && setSlot("any")}
          className="mt-2 w-full rounded-lg px-2 py-2.5 text-center transition-all duration-300 font-body text-sm"
          style={{
            border: `1px solid ${slot === "any" ? "var(--shu)" : "var(--line)"}`,
            background: slot === "any" ? "var(--shu-wash)" : "var(--paper-2)",
            color: slot === "any" ? "var(--shu-deep)" : "var(--muted)",
            opacity: soldOut ? 0.45 : 1,
            cursor: soldOut ? "not-allowed" : "pointer",
          }}
        >
          どの枠でも可（おまかせ）
        </button>
      </div>

      {/* SNS（任意） */}
      <label className="block mb-5">
        <span className="block mb-2 font-body text-sm" style={{ color: "var(--ink)" }}>
          SNSアカウント <span style={{ color: "var(--subtle)" }}>（任意）</span>
        </span>
        <input
          className="field-input"
          type="text"
          placeholder="Instagram @yourname など"
          value={sns}
          onChange={(e) => setSns(e.target.value)}
        />
      </label>

      {/* 同意 */}
      <label className="flex items-start gap-3 mb-6 cursor-pointer">
        <input
          type="checkbox"
          className="mt-1 accent-[var(--shu)] w-4 h-4"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
        />
        <span className="font-body text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
          撮影した写真を当社事例として使用する場合があることに同意します。
        </span>
      </label>

      <AnimatePresence>
        {status === "error" && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 text-sm font-body"
            style={{ color: "var(--shu-deep)" }}
          >
            {errorMsg}
          </motion.p>
        )}
      </AnimatePresence>

      {soldOut && (
        <p className="mb-4 text-sm font-body text-center" style={{ color: "var(--shu-deep)" }}>
          おかげさまで全枠満席となりました。キャンセルが出た場合はこちらで再度受け付けます。
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="btn-primary w-full justify-center"
        style={{ opacity: canSubmit ? 1 : 0.45, cursor: canSubmit ? "pointer" : "not-allowed" }}
      >
        {status === "submitting" ? "送信中…" : soldOut ? "満席" : "この内容で予約する"}
      </button>

      <p className="mt-4 text-center font-body text-xs" style={{ color: "var(--subtle)" }}>
        限定{EVENT.capacity}名・{EVENT.price}／{EVENT.benefit}
      </p>
      {!configured && (
        <p className="mt-2 text-center font-body text-xs" style={{ color: "var(--subtle)" }}>
          ※ 予約システムは現在準備中です
        </p>
      )}
    </form>
  );
}

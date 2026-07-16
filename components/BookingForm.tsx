"use client";

// LP 内予約フォーム。8つの時間枠から希望を選び、Formspree へ送信する。
// 送信先が未設定（プレースホルダ）の間は「準備中」バナーを出し送信を無効化する。

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  EVENT,
  SLOTS,
  FORMSPREE_ENDPOINT,
  FORMSPREE_IS_CONFIGURED,
  CONTACT_EMAIL,
} from "@/lib/site-data";

type Status = "idle" | "submitting" | "success" | "error";

export default function BookingForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [slot, setSlot] = useState<string>("");
  const [sns, setSns] = useState("");
  const [message, setMessage] = useState("");
  const [agree, setAgree] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const canSubmit =
    name.trim() !== "" &&
    email.trim() !== "" &&
    slot !== "" &&
    agree &&
    status !== "submitting";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selected =
      slot === "any"
        ? "どの枠でも可"
        : SLOTS.find((s) => String(s.id) === slot)?.range ?? slot;

    // Formspree 未設定時は mailto（メール作成画面）で予約を受け付ける
    if (!FORMSPREE_IS_CONFIGURED) {
      const subject = `【予約】${EVENT.title} ${EVENT.dateLabel}`;
      const body = [
        `イベント: ${EVENT.title}（${EVENT.dateJa}）`,
        `お名前: ${name}`,
        `メール: ${email}`,
        `希望枠: ${selected}`,
        `SNS: ${sns || "-"}`,
        `ご要望: ${message || "-"}`,
      ].join("\n");
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setStatus("success");
      return;
    }

    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          イベント: `${EVENT.title}（${EVENT.dateJa}）`,
          お名前: name,
          メール: email,
          希望枠: selected,
          SNS: sns,
          ご要望: message,
        }),
      });
      if (res.ok) {
        setStatus("success");
      } else {
        const data = await res.json().catch(() => null);
        setErrorMsg(
          data?.errors?.map((x: { message: string }) => x.message).join(" / ") ??
            "送信に失敗しました。時間をおいて再度お試しください。"
        );
        setStatus("error");
      }
    } catch {
      setErrorMsg("通信エラーが発生しました。ネットワークをご確認ください。");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card text-center py-14"
      >
        <div className="text-5xl mb-4">🎆</div>
        <h3 className="font-display text-2xl md:text-3xl font-bold text-gradient-gold mb-3">
          ご予約ありがとうございます
        </h3>
        <p className="font-body leading-relaxed" style={{ color: "var(--color-muted)" }}>
          {FORMSPREE_IS_CONFIGURED ? (
            <>
              受付が完了しました。折り返し、担当の{EVENT.photographer}より
              <br />
              ご連絡いたします。当日お会いできるのを楽しみにしています。
            </>
          ) : (
            <>
              ご予約メールの下書きを開きました。内容をご確認のうえ、
              <br />
              そのまま送信してください。折り返し{EVENT.photographer}よりご連絡します。
            </>
          )}
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card md:p-10">
      {/* お名前 */}
      <label className="block mb-5">
        <span className="block mb-2 font-body text-sm" style={{ color: "var(--color-ink)" }}>
          お名前 <span style={{ color: "var(--color-vermilion-light)" }}>*</span>
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

      {/* メール */}
      <label className="block mb-5">
        <span className="block mb-2 font-body text-sm" style={{ color: "var(--color-ink)" }}>
          メールアドレス <span style={{ color: "var(--color-vermilion-light)" }}>*</span>
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
        <span className="block mb-2 font-body text-sm" style={{ color: "var(--color-ink)" }}>
          ご希望の時間枠 <span style={{ color: "var(--color-vermilion-light)" }}>*</span>
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SLOTS.map((s) => {
            const active = slot === String(s.id);
            return (
              <button
                type="button"
                key={s.id}
                onClick={() => setSlot(String(s.id))}
                className="rounded-xl px-2 py-3 text-center transition-all duration-300 border"
                style={{
                  borderColor: active ? "var(--color-gold)" : "var(--color-line)",
                  background: active ? "rgba(231,189,84,0.16)" : "rgba(255,255,255,0.03)",
                  boxShadow: active ? "0 0 18px rgba(231,189,84,0.25)" : "none",
                }}
              >
                <span
                  className="block font-num font-bold text-lg"
                  style={{ color: active ? "var(--color-gold-light)" : "var(--color-ink)" }}
                >
                  {s.label}
                </span>
                <span className="block font-num text-xs" style={{ color: "var(--color-subtle)" }}>
                  {s.range}
                </span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setSlot("any")}
          className="mt-2 w-full rounded-xl px-2 py-2.5 text-center transition-all duration-300 border font-body text-sm"
          style={{
            borderColor: slot === "any" ? "var(--color-gold)" : "var(--color-line)",
            background: slot === "any" ? "rgba(231,189,84,0.16)" : "rgba(255,255,255,0.03)",
            color: slot === "any" ? "var(--color-gold-light)" : "var(--color-muted)",
          }}
        >
          どの枠でも可（おまかせ）
        </button>
      </div>

      {/* SNS（任意） */}
      <label className="block mb-5">
        <span className="block mb-2 font-body text-sm" style={{ color: "var(--color-ink)" }}>
          SNSアカウント <span style={{ color: "var(--color-subtle)" }}>（任意）</span>
        </span>
        <input
          className="field-input"
          type="text"
          placeholder="Instagram @yourname など"
          value={sns}
          onChange={(e) => setSns(e.target.value)}
        />
      </label>

      {/* ご要望（任意） */}
      <label className="block mb-5">
        <span className="block mb-2 font-body text-sm" style={{ color: "var(--color-ink)" }}>
          ご要望・ひとこと <span style={{ color: "var(--color-subtle)" }}>（任意）</span>
        </span>
        <textarea
          className="field-input resize-none"
          rows={3}
          placeholder="当日の服装のご相談、撮影の希望など"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </label>

      {/* 同意 */}
      <label className="flex items-start gap-3 mb-6 cursor-pointer">
        <input
          type="checkbox"
          className="mt-1 accent-[var(--color-gold)] w-4 h-4"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
        />
        <span className="font-body text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
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
            style={{ color: "var(--color-vermilion-light)" }}
          >
            {errorMsg}
          </motion.p>
        )}
      </AnimatePresence>

      <button
        type="submit"
        disabled={!canSubmit}
        className="btn-primary w-full text-center"
        style={{ opacity: canSubmit ? 1 : 0.5, cursor: canSubmit ? "pointer" : "not-allowed" }}
      >
        {status === "submitting" ? "送信中…" : "この内容で予約する"}
      </button>

      <p className="mt-4 text-center font-body text-xs" style={{ color: "var(--color-subtle)" }}>
        限定{EVENT.capacity}名・{EVENT.price}／{EVENT.benefit}
      </p>
      {!FORMSPREE_IS_CONFIGURED && (
        <p className="mt-2 text-center font-body text-xs" style={{ color: "var(--color-subtle)" }}>
          ※ 送信ボタンを押すとメール作成画面が開きます
        </p>
      )}
    </form>
  );
}

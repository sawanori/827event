"use client";

import { useState } from "react";
import { cancelReservation } from "@/app/actions/admin";
import { CANCEL_REASONS } from "@/lib/site-data";

export default function CancelButton({ id, label }: { id: number; label: string }) {
  const [reason, setReason] = useState("");

  return (
    <form
      action={cancelReservation}
      className="flex flex-col gap-2 sm:flex-row sm:items-center"
      onSubmit={(e) => {
        const r = CANCEL_REASONS.find((x) => x.key === reason);
        if (!r) {
          e.preventDefault();
          alert("キャンセル理由を選択してください。");
          return;
        }
        if (
          !confirm(
            `「${label}」の予約をキャンセル（削除）します。\n理由：${r.label}\n\nこの理由に沿った通知メールが予約者へ送信され、枠は再び予約可能になります。よろしいですか？`
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <select
        name="reason"
        required
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="font-body text-xs rounded-md px-2 py-1.5"
        style={{ border: "1px solid var(--line-strong)", color: "var(--ink)", background: "var(--paper-2)" }}
        aria-label="キャンセル理由"
      >
        <option value="" disabled>
          キャンセル理由を選択
        </option>
        {CANCEL_REASONS.map((r) => (
          <option key={r.key} value={r.key}>
            {r.label}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="font-body text-xs rounded-md px-3 py-1.5"
        style={{ border: "1px solid var(--line-strong)", color: "var(--shu-deep)", background: "var(--paper-2)" }}
      >
        キャンセル
      </button>
    </form>
  );
}

"use client";

import { cancelReservation } from "@/app/actions/admin";

export default function CancelButton({ id, label }: { id: number; label: string }) {
  return (
    <form
      action={cancelReservation}
      onSubmit={(e) => {
        if (!confirm(`「${label}」の予約をキャンセル（削除）しますか？\nこの枠は再び予約可能になります。`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
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

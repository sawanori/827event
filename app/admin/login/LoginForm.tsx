"use client";

import { useActionState } from "react";
import { adminLogin, type LoginState } from "@/app/actions/admin";

export default function LoginForm({ from }: { from: string }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(adminLogin, null);

  return (
    <main className="min-h-[100svh] flex items-center justify-center px-6" style={{ background: "var(--paper)" }}>
      <form action={formAction} className="w-full max-w-sm card md:p-8">
        <input type="hidden" name="from" value={from} />
        <h1 className="font-display text-2xl mb-1" style={{ color: "var(--ink)" }}>
          管理ログイン
        </h1>
        <p className="font-body text-sm mb-6" style={{ color: "var(--muted)" }}>
          予約管理ダッシュボード
        </p>

        <label className="block mb-4">
          <span className="block mb-2 font-body text-sm" style={{ color: "var(--ink)" }}>
            パスワード
          </span>
          <input
            className="field-input"
            type="password"
            name="password"
            required
            autoFocus
            placeholder="••••••••"
          />
        </label>

        {state?.error && (
          <p className="mb-4 text-sm font-body" style={{ color: "var(--shu-deep)" }}>
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="btn-primary w-full justify-center"
          style={{ opacity: pending ? 0.5 : 1 }}
        >
          {pending ? "確認中…" : "ログイン"}
        </button>
      </form>
    </main>
  );
}

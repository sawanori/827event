import { listReservations, isDbConfigured } from "@/lib/db";
import { SLOTS, EVENT } from "@/lib/site-data";
import { adminLogout } from "@/app/actions/admin";
import CancelButton from "./CancelButton";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const configured = isDbConfigured();
  const reservations = configured ? await listReservations() : [];
  const bySlot = new Map(reservations.map((r) => [r.slot_id, r]));
  const bookedCount = reservations.length;

  return (
    <main className="min-h-[100svh] px-6 py-10" style={{ background: "var(--paper)" }}>
      <div className="mx-auto max-w-4xl">
        {/* ヘッダ */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl md:text-3xl" style={{ color: "var(--ink)" }}>
              予約管理
            </h1>
            <p className="font-body text-sm mt-1" style={{ color: "var(--muted)" }}>
              {EVENT.title} ／ {EVENT.dateJa}（{EVENT.weekday}）{EVENT.timeLabel}
            </p>
          </div>
          <form action={adminLogout}>
            <button
              type="submit"
              className="font-body text-xs rounded-md px-3 py-2"
              style={{ border: "1px solid var(--line-strong)", color: "var(--muted)", background: "var(--paper-2)" }}
            >
              ログアウト
            </button>
          </form>
        </div>

        {!configured && (
          <div className="card mb-8">
            <p className="font-body text-sm" style={{ color: "var(--shu-deep)" }}>
              データベース未接続です。<code>TURSO_DATABASE_URL</code> / <code>TURSO_AUTH_TOKEN</code> を設定してください。
            </p>
          </div>
        )}

        {/* サマリー */}
        <div className="card mb-8 flex items-baseline gap-3">
          <span className="font-num text-4xl" style={{ color: "var(--shu-deep)" }}>
            {bookedCount}
          </span>
          <span className="font-body text-sm" style={{ color: "var(--muted)" }}>
            / 全{SLOTS.length}枠 予約済み（残り {SLOTS.length - bookedCount} 枠）
          </span>
        </div>

        {/* 枠ごとの状況 */}
        <div className="grid gap-3">
          {SLOTS.map((s) => {
            const r = bySlot.get(s.id);
            return (
              <div
                key={s.id}
                className="card flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6"
                style={{ borderColor: r ? "rgba(193,56,31,0.35)" : "var(--line)" }}
              >
                <div className="flex items-center gap-3 sm:w-48 shrink-0">
                  <span className="font-num text-xl" style={{ color: "var(--ink)" }}>{s.label}</span>
                  <span className="font-num text-sm" style={{ color: "var(--subtle)" }}>{s.range}</span>
                </div>

                {r ? (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm" style={{ color: "var(--ink)" }}>
                        <span style={{ fontWeight: 600 }}>{r.name}</span>
                        <span style={{ color: "var(--muted)" }}>（{r.company}）</span>
                      </p>
                      <p className="font-body text-xs mt-0.5 break-all" style={{ color: "var(--muted)" }}>
                        {r.email}
                        {r.sns ? ` ／ ${r.sns}` : ""}
                      </p>
                      <p className="font-body text-[0.65rem] mt-0.5" style={{ color: "var(--subtle)" }}>
                        受付: {r.created_at} UTC ／ 事例利用同意: {r.consent ? "あり" : "なし"}
                      </p>
                    </div>
                    <CancelButton id={r.id} label={`${s.range} ${r.name} 様`} />
                  </>
                ) : (
                  <span className="flex-1 font-body text-sm" style={{ color: "var(--subtle)" }}>
                    空き
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

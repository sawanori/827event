import "server-only";

// Turso（libSQL）データアクセス層。予約は「1枠1名」で、slot_id の UNIQUE 制約が
// 二重予約をDBレベルで防ぐ最終的な守り。ランタイム接続は @libsql/client + 環境変数。
// TURSO_DATABASE_URL / TURSO_AUTH_TOKEN を Vercel と .env.local に設定する。

import { createClient, type Client } from "@libsql/client";
import { SLOTS } from "@/lib/site-data";

let _client: Client | null = null;

function getClient(): Client {
  if (_client) return _client;
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url) throw new Error("TURSO_DATABASE_URL が未設定です");
  _client = createClient({ url, authToken });
  return _client;
}

export function isDbConfigured(): boolean {
  return Boolean(process.env.TURSO_DATABASE_URL);
}

// スキーマは初回アクセス時に一度だけ用意する（インスタンス内でメモ化）。
let _schemaReady: Promise<void> | null = null;
function ensureSchema(): Promise<void> {
  if (_schemaReady) return _schemaReady;
  _schemaReady = (async () => {
    await getClient().execute(`
      CREATE TABLE IF NOT EXISTS reservations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slot_id INTEGER NOT NULL UNIQUE,
        name TEXT NOT NULL,
        company TEXT NOT NULL,
        email TEXT NOT NULL,
        sns TEXT,
        consent INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);
  })().catch((e) => {
    // 失敗したら次回に再試行できるようリセット
    _schemaReady = null;
    throw e;
  });
  return _schemaReady;
}

export type Reservation = {
  id: number;
  slot_id: number;
  name: string;
  company: string;
  email: string;
  sns: string | null;
  consent: number;
  created_at: string;
};

export type CreateInput = {
  slotId: number;
  name: string;
  company: string;
  email: string;
  sns?: string;
  consent: boolean;
};

export function isUniqueViolation(err: unknown): boolean {
  const msg = String((err as { message?: string })?.message ?? err).toUpperCase();
  return msg.includes("UNIQUE") || msg.includes("CONSTRAINT");
}

export async function getTakenSlotIds(): Promise<number[]> {
  await ensureSchema();
  const rs = await getClient().execute("SELECT slot_id FROM reservations");
  return rs.rows.map((r) => Number((r as unknown as { slot_id: number }).slot_id));
}

export async function listReservations(): Promise<Reservation[]> {
  await ensureSchema();
  const rs = await getClient().execute(
    "SELECT id, slot_id, name, company, email, sns, consent, created_at FROM reservations ORDER BY slot_id ASC"
  );
  return rs.rows as unknown as Reservation[];
}

export async function insertReservation(input: CreateInput): Promise<void> {
  await ensureSchema();
  await getClient().execute({
    sql: "INSERT INTO reservations (slot_id, name, company, email, sns, consent) VALUES (?, ?, ?, ?, ?, ?)",
    args: [
      input.slotId,
      input.name,
      input.company,
      input.email,
      input.sns && input.sns.trim() !== "" ? input.sns.trim() : null,
      input.consent ? 1 : 0,
    ],
  });
}

export async function getReservationById(id: number): Promise<Reservation | null> {
  await ensureSchema();
  const rs = await getClient().execute({
    sql: "SELECT id, slot_id, name, company, email, sns, consent, created_at FROM reservations WHERE id = ?",
    args: [id],
  });
  return (rs.rows[0] as unknown as Reservation) ?? null;
}

export async function deleteReservation(id: number): Promise<void> {
  await ensureSchema();
  await getClient().execute({ sql: "DELETE FROM reservations WHERE id = ?", args: [id] });
}

// 予約可能な最先の枠を返す（"おまかせ" 用）。空きが無ければ null。
export function firstOpenSlotId(takenIds: Iterable<number>): number | null {
  const taken = new Set<number>([...takenIds].map(Number));
  const open = SLOTS.find((s) => !taken.has(s.id));
  return open ? open.id : null;
}

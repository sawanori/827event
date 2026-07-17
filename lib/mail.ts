import "server-only";

// SendGrid 送信層。NonTurn の既存プロジェクト（video-production-lp）と同じ構成を流用：
// @sendgrid/mail + SENDGRID_API_KEY、送信元は info@non-turn.com（NonTurn.LLC）。
// 予約者への確認メールと、管理者への通知メールを送る。

import sgMail from "@sendgrid/mail";
import { EVENT } from "@/lib/site-data";

const FROM = {
  email: process.env.SENDGRID_FROM_EMAIL || "info@non-turn.com",
  name: process.env.SENDGRID_FROM_NAME || "NonTurn.LLC",
};
const ADMIN_TO = process.env.ADMIN_NOTIFY_EMAIL || "info@non-turn.com";

export function isMailConfigured(): boolean {
  return Boolean(process.env.SENDGRID_API_KEY);
}

type MailData = {
  name: string;
  company: string;
  email: string;
  sns?: string;
  slotRange: string;
};

const wrap = (inner: string) => `
  <div style="font-family: -apple-system, 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif; max-width: 600px; margin: 0 auto; color: #241f1c;">
    ${inner}
    <div style="margin-top: 28px; padding: 18px; background: #f3efe6; border-radius: 10px; text-align: center;">
      <p style="color: #7a7168; margin: 0; font-size: 12px;">${EVENT.brand} — ${EVENT.title}</p>
    </div>
  </div>
`;

const infoTable = (d: MailData) => `
  <table style="width: 100%; border-collapse: collapse; margin-top: 8px;">
    <tr><td style="padding:10px;border-bottom:1px solid #e7e0d3;font-weight:bold;width:32%;">開催日</td><td style="padding:10px;border-bottom:1px solid #e7e0d3;">${EVENT.dateJa}（${EVENT.weekday}）</td></tr>
    <tr><td style="padding:10px;border-bottom:1px solid #e7e0d3;font-weight:bold;">ご予約枠</td><td style="padding:10px;border-bottom:1px solid #e7e0d3;">${d.slotRange}</td></tr>
    <tr><td style="padding:10px;border-bottom:1px solid #e7e0d3;font-weight:bold;">お名前</td><td style="padding:10px;border-bottom:1px solid #e7e0d3;">${d.name}</td></tr>
    <tr><td style="padding:10px;border-bottom:1px solid #e7e0d3;font-weight:bold;">企業名</td><td style="padding:10px;border-bottom:1px solid #e7e0d3;">${d.company}</td></tr>
    <tr><td style="padding:10px;border-bottom:1px solid #e7e0d3;font-weight:bold;">メール</td><td style="padding:10px;border-bottom:1px solid #e7e0d3;">${d.email}</td></tr>
    <tr><td style="padding:10px;font-weight:bold;">SNS</td><td style="padding:10px;">${d.sns && d.sns.trim() !== "" ? d.sns : "-"}</td></tr>
  </table>
`;

export async function sendReservationEmails(d: MailData): Promise<void> {
  if (!isMailConfigured()) return;
  sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

  const customerMsg = {
    to: d.email,
    from: FROM,
    subject: `【ご予約確認】${EVENT.title}（${EVENT.dateLabel}）`,
    html: wrap(`
      <h2 style="border-bottom:2px solid #c1381f;padding-bottom:10px;">ご予約ありがとうございます</h2>
      <p style="line-height:1.7;">${d.name} 様<br>
      下記の内容でご予約を承りました。当日お会いできるのを楽しみにしております。</p>
      <div style="background:#f9f6f0;padding:16px;border-radius:10px;">${infoTable(d)}</div>
      <p style="line-height:1.7;color:#57504a;font-size:13px;margin-top:16px;">
      ${EVENT.timeLabel} ／ ${EVENT.venue}（詳細はご予約者へ個別にご案内します）。<br>
      ご不明点はこのメールにそのままご返信ください。</p>
    `),
    replyTo: ADMIN_TO,
  };

  const adminMsg = {
    to: ADMIN_TO,
    from: FROM,
    subject: `【新規予約】${d.slotRange} / ${d.company} ${d.name} 様`,
    html: wrap(`
      <h2 style="border-bottom:2px solid #c1381f;padding-bottom:10px;">新しい予約が入りました</h2>
      <div style="background:#f9f6f0;padding:16px;border-radius:10px;">${infoTable(d)}</div>
    `),
    replyTo: d.email,
  };

  await sgMail.send([customerMsg, adminMsg]);
}

export async function sendCancellationEmails(d: MailData): Promise<void> {
  if (!isMailConfigured()) return;
  sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

  const customerMsg = {
    to: d.email,
    from: FROM,
    subject: `【ご予約キャンセルのお知らせ】${EVENT.title}（${EVENT.dateLabel}）`,
    html: wrap(`
      <h2 style="border-bottom:2px solid #c1381f;padding-bottom:10px;">ご予約をキャンセルしました</h2>
      <p style="line-height:1.7;">${d.name} 様<br>
      下記のご予約をキャンセルいたしました。ご都合が合いましたら、またのご予約をお待ちしております。</p>
      <div style="background:#f9f6f0;padding:16px;border-radius:10px;">${infoTable(d)}</div>
      <p style="line-height:1.7;color:#57504a;font-size:13px;margin-top:16px;">
      お心当たりがない場合や再予約をご希望の場合は、このメールにそのままご返信ください。</p>
    `),
    replyTo: ADMIN_TO,
  };

  const adminMsg = {
    to: ADMIN_TO,
    from: FROM,
    subject: `【予約キャンセル】${d.slotRange} / ${d.company} ${d.name} 様`,
    html: wrap(`
      <h2 style="border-bottom:2px solid #c1381f;padding-bottom:10px;">予約がキャンセルされました</h2>
      <p style="line-height:1.7;color:#57504a;font-size:13px;">この枠は再び予約可能になりました。</p>
      <div style="background:#f9f6f0;padding:16px;border-radius:10px;">${infoTable(d)}</div>
    `),
    replyTo: d.email,
  };

  await sgMail.send([customerMsg, adminMsg]);
}

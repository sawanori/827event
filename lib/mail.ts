import "server-only";

// SendGrid 送信層。NonTurn の既存プロジェクト（video-production-lp）と同じ構成を流用：
// @sendgrid/mail + SENDGRID_API_KEY、送信元は info@non-turn.com（NonTurn.LLC）。
// 予約者への確認メールと、管理者への通知メールを送る。

import sgMail from "@sendgrid/mail";
import { EVENT, CANCEL_REASONS, type CancelReasonKey } from "@/lib/site-data";

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
    <div style="margin-top: 28px; padding: 18px; background: #f4eee1; border-radius: 10px; text-align: center;">
      <p style="color: #7a7168; margin: 0; font-size: 12px;">${EVENT.brand} — ${EVENT.title}</p>
    </div>
  </div>
`;

const infoTable = (d: MailData) => `
  <table style="width: 100%; border-collapse: collapse; margin-top: 8px;">
    <tr><td style="padding:10px;border-bottom:1px solid #e8dfcb;font-weight:bold;width:32%;">開催日</td><td style="padding:10px;border-bottom:1px solid #e8dfcb;">${EVENT.dateJa}（${EVENT.weekday}）</td></tr>
    <tr><td style="padding:10px;border-bottom:1px solid #e8dfcb;font-weight:bold;">ご予約枠</td><td style="padding:10px;border-bottom:1px solid #e8dfcb;">${d.slotRange}</td></tr>
    <tr><td style="padding:10px;border-bottom:1px solid #e8dfcb;font-weight:bold;">お名前</td><td style="padding:10px;border-bottom:1px solid #e8dfcb;">${d.name}</td></tr>
    <tr><td style="padding:10px;border-bottom:1px solid #e8dfcb;font-weight:bold;">企業名</td><td style="padding:10px;border-bottom:1px solid #e8dfcb;">${d.company}</td></tr>
    <tr><td style="padding:10px;border-bottom:1px solid #e8dfcb;font-weight:bold;">メール</td><td style="padding:10px;border-bottom:1px solid #e8dfcb;">${d.email}</td></tr>
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
      <h2 style="border-bottom:2px solid #b03a17;padding-bottom:10px;">ご予約ありがとうございます</h2>
      <p style="line-height:1.7;">${d.name} 様<br>
      下記の内容でご予約を承りました。当日お会いできるのを楽しみにしております。</p>
      <div style="background:#faf5ea;padding:16px;border-radius:10px;">${infoTable(d)}</div>
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
      <h2 style="border-bottom:2px solid #b03a17;padding-bottom:10px;">新しい予約が入りました</h2>
      <div style="background:#faf5ea;padding:16px;border-radius:10px;">${infoTable(d)}</div>
    `),
    replyTo: d.email,
  };

  await sgMail.send([customerMsg, adminMsg]);
}

export async function sendCancellationEmails(
  d: MailData & { reasonKey?: CancelReasonKey }
): Promise<void> {
  if (!isMailConfigured()) return;
  sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

  // 理由が指定されていれば理由別の文面、無ければ従来の汎用文面（後方互換）。
  const reason = CANCEL_REASONS.find((r) => r.key === d.reasonKey);
  const subject = reason
    ? `${reason.subject}（${EVENT.dateLabel}）`
    : `【ご予約キャンセルのお知らせ】${EVENT.title}（${EVENT.dateLabel}）`;
  const heading = reason ? reason.heading : "ご予約をキャンセルしました";
  const bodyText = reason
    ? reason.body
    : "下記のご予約をキャンセルいたしました。ご都合が合いましたら、またのご予約をお待ちしております。";

  const customerMsg = {
    to: d.email,
    from: FROM,
    subject,
    html: wrap(`
      <h2 style="border-bottom:2px solid #b03a17;padding-bottom:10px;">${heading}</h2>
      <p style="line-height:1.7;">${d.name} 様<br>
      ${bodyText}</p>
      <div style="background:#faf5ea;padding:16px;border-radius:10px;">${infoTable(d)}</div>
      <p style="line-height:1.7;color:#57504a;font-size:13px;margin-top:16px;">
      ご不明点や再調整のご希望は、このメールにそのままご返信ください。</p>
    `),
    replyTo: ADMIN_TO,
  };

  const adminMsg = {
    to: ADMIN_TO,
    from: FROM,
    subject: `【予約キャンセル${reason ? `／${reason.label}` : ""}】${d.slotRange} / ${d.company} ${d.name} 様`,
    html: wrap(`
      <h2 style="border-bottom:2px solid #b03a17;padding-bottom:10px;">予約がキャンセルされました</h2>
      <p style="line-height:1.7;color:#57504a;font-size:13px;">
      ${reason ? `キャンセル理由：${reason.label}<br>` : ""}この枠は再び予約可能になりました。</p>
      <div style="background:#faf5ea;padding:16px;border-radius:10px;">${infoTable(d)}</div>
    `),
    replyTo: d.email,
  };

  await sgMail.send([customerMsg, adminMsg]);
}

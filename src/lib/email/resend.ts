// Lightweight Resend client. No SDK dependency — works as soon as
// RESEND_API_KEY is set in the environment, inert otherwise.
//
// Designed so existing flows never break: every send is fire-and-forget
// from the caller's perspective and returns a discriminated result.

import { siteUrl } from "@/lib/seo";

export type EmailResult =
  | { ok: true; id: string | null }
  | { ok: false; reason: "no_api_key" | "send_failed"; error?: string };

type SendOptions = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  tags?: { name: string; value: string }[];
};

const RESEND_API = "https://api.resend.com/emails";

export function emailEnabled(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendEmail(opts: SendOptions): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, reason: "no_api_key" };

  const from = opts.from || process.env.EMAIL_FROM || "Antry <[email protected]>";
  const replyTo = opts.replyTo || process.env.EMAIL_REPLY_TO;

  try {
    const res = await fetch(RESEND_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
        reply_to: replyTo,
        tags: opts.tags,
      }),
    });

    if (!res.ok) {
      const error = await res.text().catch(() => "unknown");
      return { ok: false, reason: "send_failed", error };
    }

    const data = (await res.json().catch(() => ({}))) as { id?: string };
    return { ok: true, id: data.id ?? null };
  } catch (err) {
    return {
      ok: false,
      reason: "send_failed",
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}

// ── Templates ──────────────────────────────────────────

const PRIMARY = "#C6F135";
const INK = "#0A0A0A";
const DIM = "#525252";
const BORDER = "#EBEBEB";

function shell(body: string, preheader: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>Antry</title>
</head>
<body style="margin:0;padding:0;background:#FAFAF7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${INK};">
  <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;font-size:1px;line-height:1px;">${preheader}</span>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#FAFAF7;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;background:#ffffff;border:1px solid ${BORDER};border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:28px 32px;border-bottom:1px solid ${BORDER};">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <div style="display:inline-block;width:32px;height:32px;border-radius:8px;background:${INK};color:${PRIMARY};text-align:center;line-height:32px;font-weight:800;font-size:18px;">A</div>
                  </td>
                  <td style="vertical-align:middle;padding-left:10px;font-weight:700;font-size:16px;letter-spacing:0.4px;">Antry</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">${body}</td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background:#FAFAF7;border-top:1px solid ${BORDER};font-size:12px;color:${DIM};line-height:1.6;">
              You're receiving this because you joined the Antry waitlist. Reply to this email any time —
              a real human (Ofir) reads every reply.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function welcomeEmailHtml(): string {
  const url = siteUrl().replace(/\/$/, "");
  const inner = `
    <h1 style="font-size:24px;line-height:1.3;margin:0 0 16px;color:${INK};font-weight:800;letter-spacing:-0.5px;">
      You're on the list. Now show us what you build.
    </h1>
    <p style="font-size:15px;line-height:1.65;color:${DIM};margin:0 0 16px;">
      Antry is a proof-of-work network for AI builders. No resumes. No buzzwords. Just shipped projects, demo links, and the receipts to back them up.
    </p>
    <p style="font-size:15px;line-height:1.65;color:${DIM};margin:0 0 24px;">
      Two quick things while you wait:
    </p>
    <ol style="font-size:15px;line-height:1.65;color:${DIM};margin:0 0 24px;padding-left:20px;">
      <li style="margin-bottom:8px;"><strong style="color:${INK};">Reply to this email</strong> with one sentence: what are you building right now? I read every reply and feature standout builders early.</li>
      <li><strong style="color:${INK};">Browse what others have shipped</strong> on Antry while we open up profile claims.</li>
    </ol>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 8px;">
      <tr>
        <td>
          <a href="${url}/discover" style="display:inline-block;background:${INK};color:#ffffff;text-decoration:none;padding:14px 22px;border-radius:12px;font-weight:600;font-size:15px;">See what's been shipped →</a>
        </td>
      </tr>
    </table>
    <p style="font-size:14px;line-height:1.6;color:${DIM};margin:24px 0 0;">
      — Ofir<br/>
      <span style="font-size:13px;color:#A3A3A3;">Founder, Antry</span>
    </p>
  `;
  return shell(inner, "You're on the Antry waitlist — tell me what you're building.");
}

export function welcomeEmailText(): string {
  const url = siteUrl().replace(/\/$/, "");
  return [
    "You're on the list. Now show us what you build.",
    "",
    "Antry is a proof-of-work network for AI builders. No resumes. No buzzwords. Just shipped projects, demo links, and the receipts to back them up.",
    "",
    "Two quick things while you wait:",
    "",
    "1. Reply to this email with one sentence: what are you building right now? I read every reply and feature standout builders early.",
    "2. Browse what others have shipped: " + url + "/discover",
    "",
    "— Ofir, Founder of Antry",
  ].join("\n");
}

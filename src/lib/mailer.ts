const RESEND_BATCH_URL = "https://api.resend.com/emails/batch";
const RESEND_BATCH_SIZE = 100;

export type MailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

export function isMailerConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export function mailerSetupHint() {
  return "Ajoutez RESEND_API_KEY (et MAIL_FROM) dans les variables d’environnement pour envoyer depuis l’admin.";
}

export function formatFromAddress(raw: string, siteTitle = "KISHA BUZZ") {
  const trimmed = String(raw || "").trim();
  if (!trimmed) return "";
  if (trimmed.includes("<") && trimmed.includes(">")) return trimmed;
  return `${siteTitle} <${trimmed}>`;
}

export function resolveMailFrom(siteEmail = "", siteTitle = "KISHA BUZZ") {
  return (
    formatFromAddress(process.env.MAIL_FROM || "", siteTitle) ||
    formatFromAddress(siteEmail, siteTitle)
  );
}

function resendApiKey() {
  return process.env.RESEND_API_KEY?.trim() || "";
}

type ResendBatchResponse = {
  data?: { id?: string }[];
  message?: string;
  name?: string;
};

async function sendResendBatch(from: string, messages: MailMessage[]) {
  const response = await fetch(RESEND_BATCH_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(
      messages.map((message) => ({
        from,
        to: [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
        ...(message.replyTo ? { reply_to: [message.replyTo] } : {}),
      }))
    ),
  });

  let payload: ResendBatchResponse = {};
  try {
    payload = (await response.json()) as ResendBatchResponse;
  } catch {
    payload = {};
  }

  if (!response.ok) {
    return {
      ok: false as const,
      error: payload.message || `Resend a refusé l’envoi (${response.status}).`,
    };
  }

  return { ok: true as const, count: messages.length };
}

export async function sendMails(from: string, messages: MailMessage[]) {
  if (!isMailerConfigured()) {
    return {
      sent: 0,
      failed: messages.map((message) => ({ to: message.to, error: mailerSetupHint() })),
    };
  }
  if (!from) {
    return {
      sent: 0,
      failed: messages.map((message) => ({
        to: message.to,
        error: "Indiquez MAIL_FROM ou l’email du site dans Paramètres.",
      })),
    };
  }

  let sent = 0;
  const failed: { to: string; error: string }[] = [];

  for (let index = 0; index < messages.length; index += RESEND_BATCH_SIZE) {
    const chunk = messages.slice(index, index + RESEND_BATCH_SIZE);
    const result = await sendResendBatch(from, chunk);
    if (result.ok) {
      sent += result.count;
      continue;
    }
    for (const message of chunk) {
      failed.push({ to: message.to, error: result.error });
    }
  }

  return { sent, failed };
}

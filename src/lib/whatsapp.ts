const GRAPH_BASE = "https://graph.facebook.com";

export type WhatsAppSendResult = {
  ok: boolean;
  error?: string;
};

export function isWhatsAppConfigured() {
  return Boolean(
    process.env.WHATSAPP_TOKEN?.trim() && process.env.WHATSAPP_PHONE_NUMBER_ID?.trim()
  );
}

export function whatsappSetupHint() {
  return "Ajoutez WHATSAPP_TOKEN et WHATSAPP_PHONE_NUMBER_ID (API Cloud Meta) pour envoyer les alertes WhatsApp.";
}

function graphVersion() {
  return process.env.WHATSAPP_GRAPH_VERSION?.trim() || "v21.0";
}

function templateName(kind: "ANNOUNCE" | "HEADLINE") {
  const key = kind === "ANNOUNCE" ? "WHATSAPP_TEMPLATE_ANNOUNCE" : "WHATSAPP_TEMPLATE_HEADLINE";
  return process.env[key]?.trim() || process.env.WHATSAPP_TEMPLATE?.trim() || "";
}

function templateLang() {
  return process.env.WHATSAPP_TEMPLATE_LANG?.trim() || "fr";
}

function templateParams(values: string[]) {
  return values
    .map((value) => String(value || "").replace(/\s+/g, " ").trim().slice(0, 1024))
    .filter(Boolean)
    .map((text) => ({ type: "text" as const, text }));
}

async function postWhatsAppMessage(body: Record<string, unknown>): Promise<WhatsAppSendResult> {
  const token = process.env.WHATSAPP_TOKEN?.trim() || "";
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim() || "";
  if (!token || !phoneId) {
    return { ok: false, error: whatsappSetupHint() };
  }

  const response = await fetch(`${GRAPH_BASE}/${graphVersion()}/${phoneId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  let payload: { error?: { message?: string } } = {};
  try {
    payload = (await response.json()) as { error?: { message?: string } };
  } catch {
    payload = {};
  }

  if (!response.ok) {
    return {
      ok: false,
      error: payload.error?.message || `WhatsApp a refusé l’envoi (${response.status}).`,
    };
  }

  return { ok: true };
}

export async function sendWhatsAppText(to: string, text: string): Promise<WhatsAppSendResult> {
  return postWhatsAppMessage({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "text",
    text: { preview_url: true, body: String(text || "").slice(0, 4096) },
  });
}

export async function sendWhatsAppAlert(input: {
  to: string;
  kind: "ANNOUNCE" | "HEADLINE";
  text: string;
  headline: string;
  when: string;
  url: string;
}): Promise<WhatsAppSendResult> {
  const name = templateName(input.kind);
  if (!name) {
    return sendWhatsAppText(input.to, input.text);
  }

  const parameters = templateParams([input.headline, input.when || "Bientôt", input.url]);
  return postWhatsAppMessage({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: input.to,
    type: "template",
    template: {
      name,
      language: { code: templateLang() },
      components: parameters.length
        ? [{ type: "body", parameters }]
        : [],
    },
  });
}

export async function sendWhatsAppAlerts(
  messages: {
    to: string;
    kind: "ANNOUNCE" | "HEADLINE";
    text: string;
    headline: string;
    when: string;
    url: string;
  }[]
) {
  let sent = 0;
  const failed: { to: string; error: string }[] = [];
  const concurrency = 5;

  for (let index = 0; index < messages.length; index += concurrency) {
    const chunk = messages.slice(index, index + concurrency);
    const results = await Promise.all(chunk.map((message) => sendWhatsAppAlert(message)));
    results.forEach((result, offset) => {
      if (result.ok) sent += 1;
      else failed.push({ to: chunk[offset].to, error: result.error || "Échec WhatsApp." });
    });
  }

  return { sent, failed };
}

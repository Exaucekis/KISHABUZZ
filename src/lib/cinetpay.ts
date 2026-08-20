const DEFAULT_CHECKOUT_BASE = "https://api-checkout.cinetpay.com";

export const CINETPAY_INIT_URL = `${DEFAULT_CHECKOUT_BASE}/v2/payment`;
export const CINETPAY_CHECK_URL = `${DEFAULT_CHECKOUT_BASE}/v2/payment/check`;

export type CinetPayCheckStatus = "ACCEPTED" | "REFUSED" | "CANCELLED" | "EXPIRED" | "PENDING";

export type CinetPayInitResult =
  | { ok: true; paymentUrl: string; paymentToken: string }
  | { ok: false; message: string };

export type CinetPayCheckResult = {
  ok: boolean;
  status: CinetPayCheckStatus;
  amount: number | null;
  currency: string;
  paymentMethod: string;
  raw: Record<string, unknown>;
  message: string;
};

function readCinetPaySecret(name: string) {
  return (process.env[name] || "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .trim();
}

/** Host only — never include /v2/payment here; the client appends it. */
export function cinetPayCheckoutBaseUrl() {
  let base = readCinetPaySecret("CINETPAY_BASE_URL") || DEFAULT_CHECKOUT_BASE;
  base = base.replace(/\/+$/, "").replace(/\/v2\/payment$/i, "");
  return base || DEFAULT_CHECKOUT_BASE;
}

export function cinetPayInitUrl() {
  return `${cinetPayCheckoutBaseUrl()}/v2/payment`;
}

export function cinetPayCheckUrl() {
  return `${cinetPayCheckoutBaseUrl()}/v2/payment/check`;
}

function cinetPayApiKey() {
  return readCinetPaySecret("CINETPAY_API_KEY") || readCinetPaySecret("CINETPAY_APIKEY");
}

export function isCinetPayConfigured() {
  return Boolean(cinetPayApiKey() && readCinetPaySecret("CINETPAY_SITE_ID"));
}

export function cinetPayCredentials() {
  return {
    apikey: cinetPayApiKey(),
    site_id: readCinetPaySecret("CINETPAY_SITE_ID"),
  };
}

export function sanitizeCinetPayText(value: string, max = 100) {
  return String(value || "")
    .replace(/[#/$_&]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export function mapCinetPayStatus(value: string | undefined): CinetPayCheckStatus {
  const status = String(value || "").toUpperCase();
  if (status === "ACCEPTED" || status === "SUCCESS") return "ACCEPTED";
  if (status === "REFUSED" || status === "FAILED") return "REFUSED";
  if (status === "CANCELED" || status === "CANCELLED") return "CANCELLED";
  if (status === "EXPIRED") return "EXPIRED";
  return "PENDING";
}

export function amountsMatch(
  expected: { amount: number; currency: string },
  received: { amount: number | null; currency: string }
) {
  if (received.amount === null) return false;
  return expected.amount === received.amount && expected.currency.toUpperCase() === received.currency.toUpperCase();
}

export function parseCinetPayNotifyBody(contentType: string, raw: string) {
  const payload = String(raw || "").slice(0, 4000);
  let transactionId = "";

  const tryAssign = (value: unknown) => {
    const next = String(value || "").trim();
    if (next) transactionId = next;
  };

  if (contentType.includes("json")) {
    try {
      const json = JSON.parse(raw) as Record<string, unknown>;
      tryAssign(json.cpm_trans_id);
      if (!transactionId) tryAssign(json.merchant_transaction_id);
      if (!transactionId) tryAssign(json.transaction_id);
    } catch {
      /* ignore */
    }
  } else {
    const params = new URLSearchParams(raw.includes("=") ? raw : "");
    tryAssign(params.get("cpm_trans_id"));
    if (!transactionId) tryAssign(params.get("merchant_transaction_id"));
    if (!transactionId) tryAssign(params.get("transaction_id"));
  }

  return { transactionId, payload };
}

function redactSecrets(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactSecrets);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      if (/apikey|api_key|api_password|access_token|secret|password|site_id/i.test(key)) {
        out[key] = "[redacted]";
      } else {
        out[key] = redactSecrets(nested);
      }
    }
    return out;
  }
  return value;
}

export function safeJson(value: unknown) {
  try {
    return JSON.stringify(redactSecrets(value)).slice(0, 8000);
  } catch {
    return "{}";
  }
}

async function postJson(url: string, body: Record<string, unknown>) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  let json: Record<string, unknown> = {};
  try {
    json = (await response.json()) as Record<string, unknown>;
  } catch {
    json = {};
  }
  return { ok: response.ok, status: response.status, json };
}

export async function initCinetPayPayment(input: {
  transactionId: string;
  amount: number;
  currency: string;
  description: string;
  notifyUrl: string;
  returnUrl: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  metadata?: string;
}): Promise<CinetPayInitResult> {
  if (!isCinetPayConfigured()) {
    return { ok: false, message: "CinetPay n’est pas configuré (CINETPAY_API_KEY / CINETPAY_SITE_ID)." };
  }

  const { apikey, site_id } = cinetPayCredentials();
  const parts = String(input.customerName || "Client").trim().split(/\s+/);
  const surname = parts.slice(1).join(" ") || parts[0] || "Client";

  const { json } = await postJson(cinetPayInitUrl(), {
    apikey,
    site_id,
    transaction_id: input.transactionId,
    amount: input.amount,
    currency: String(input.currency || "CDF").toUpperCase(),
    description: sanitizeCinetPayText(input.description, 80),
    notify_url: input.notifyUrl,
    return_url: input.returnUrl,
    channels: "ALL",
    lang: "fr",
    metadata: input.metadata || "",
    customer_name: sanitizeCinetPayText(parts[0] || "Client", 50),
    customer_surname: sanitizeCinetPayText(surname, 50),
    customer_email: input.customerEmail,
    customer_phone_number: input.customerPhone,
    customer_address: "Lubumbashi",
    customer_city: "Lubumbashi",
    customer_country: "CD",
    customer_state: "CD",
    customer_zip_code: "00000",
  });

  const data = (json.data || {}) as Record<string, unknown>;
  const paymentUrl = String(data.payment_url || "");
  const paymentToken = String(data.payment_token || "");
  const code = String(json.code || "");

  if (paymentUrl && (code === "201" || String(json.message || "").toUpperCase() === "CREATED")) {
    return { ok: true, paymentUrl, paymentToken };
  }

  return {
    ok: false,
    message: String(json.description || json.message || "CinetPay a refusé l’initialisation du paiement."),
  };
}

export async function checkCinetPayPayment(transactionId: string): Promise<CinetPayCheckResult> {
  if (!isCinetPayConfigured()) {
    return {
      ok: false,
      status: "PENDING",
      amount: null,
      currency: "",
      paymentMethod: "",
      raw: {},
      message: "CinetPay n’est pas configuré.",
    };
  }

  const { apikey, site_id } = cinetPayCredentials();
  const { json } = await postJson(cinetPayCheckUrl(), {
    apikey,
    site_id,
    transaction_id: transactionId,
  });

  const data = (json.data || {}) as Record<string, unknown>;
  const amountRaw = data.amount;
  const amount = typeof amountRaw === "number" ? amountRaw : Number.parseInt(String(amountRaw || ""), 10);
  const status = mapCinetPayStatus(String(data.status || ""));

  return {
    ok: String(json.code || "") === "00",
    status,
    amount: Number.isFinite(amount) ? amount : null,
    currency: String(data.currency || ""),
    paymentMethod: String(data.payment_method || ""),
    raw: json,
    message: String(json.message || ""),
  };
}

export function paymentUrlFromRaw(rawCheckJson: string) {
  try {
    const parsed = JSON.parse(rawCheckJson) as { payment_url?: string };
    return String(parsed.payment_url || "");
  } catch {
    return "";
  }
}

export function mergePaymentJson(rawCheckJson: string, patch: Record<string, unknown>) {
  let current: Record<string, unknown> = {};
  try {
    current = JSON.parse(rawCheckJson || "{}") as Record<string, unknown>;
  } catch {
    current = {};
  }
  return JSON.stringify({ ...current, ...patch }).slice(0, 8000);
}

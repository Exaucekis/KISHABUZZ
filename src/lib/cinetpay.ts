import dns from "node:dns";

try {
  dns.setDefaultResultOrder("ipv4first");
} catch {
  /* ignore on runtimes without this API */
}

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

type TokenCache = { token: string; expiresAt: number };

let tokenCache: TokenCache | null = null;

function readCinetPaySecret(name: string) {
  return (process.env[name] || "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .trim();
}

export function isCinetPayConfigured() {
  return Boolean(readCinetPaySecret("CINETPAY_API_KEY") && readCinetPaySecret("CINETPAY_API_PASSWORD"));
}

export function cinetPayBaseUrl() {
  const explicit = readCinetPaySecret("CINETPAY_API_BASE_URL").replace(/\/$/, "");
  if (explicit) return explicit;
  const key = readCinetPaySecret("CINETPAY_API_KEY");
  if (key.startsWith("sk_live_")) return "https://api.cinetpay.co";
  return "https://api.cinetpay.net";
}

export function sanitizeCinetPayText(value: string, max = 100) {
  return String(value || "")
    .replace(/[#/$_&]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function personName(value: string, fallback: string) {
  const clean = sanitizeCinetPayText(value, 255);
  return clean.length >= 2 ? clean : fallback;
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

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function pickString(...values: unknown[]) {
  for (const value of values) {
    const next = String(value || "").trim();
    if (next) return next;
  }
  return "";
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
      tryAssign(json.merchant_transaction_id);
      if (!transactionId) tryAssign(json.cpm_trans_id);
      if (!transactionId) tryAssign(json.transaction_id);
    } catch {
      /* ignore */
    }
  } else {
    const params = new URLSearchParams(raw.includes("=") ? raw : "");
    tryAssign(params.get("merchant_transaction_id"));
    if (!transactionId) tryAssign(params.get("cpm_trans_id"));
    if (!transactionId) tryAssign(params.get("transaction_id"));
  }

  return { transactionId, payload };
}

function redactSecrets(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactSecrets);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      if (/apikey|api_key|api_password|access_token|secret|password/i.test(key)) {
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

async function readJson(response: Response) {
  let json: Record<string, unknown> = {};
  try {
    json = (await response.json()) as Record<string, unknown>;
  } catch {
    json = {};
  }
  return json;
}

const jsonHeaders = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

async function cinetPayFetch(url: string, init: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: { ...jsonHeaders, ...(init.headers || {}) },
    redirect: "manual",
    cache: "no-store",
  });
  const location = response.headers.get("location");
  if (response.status >= 300 && response.status < 400 && location) {
    const next = location.startsWith("http") ? location : new URL(location, url).toString();
    return fetch(next, {
      ...init,
      method: init.method || "POST",
      headers: { ...jsonHeaders, ...(init.headers || {}) },
      cache: "no-store",
    });
  }
  return response;
}

function authFailureMessage(json: Record<string, unknown>, httpStatus: number) {
  const data = asRecord(json.data);
  const status = pickString(json.status, json.message, json.error, data.message).toUpperCase();
  if (status === "NOT_ALLOWED" || json.code === 708) {
    return "CinetPay refuse cet appel (NOT_ALLOWED). Ce n’est pas la liste blanche IP : l’URL, la méthode ou le droit d’utiliser l’API Sandbox est refusé. Vérifie dans CinetPay → Documentation l’URL de base ({{baseUrl}}) et que le mot de passe API est bien celui du panneau Sandbox.";
  }
  const detail = pickString(json.message, json.error, json.status, json.description, data.message);
  if (detail) return `CinetPay a refusé l’authentification (${detail}, HTTP ${httpStatus}).`;
  return `CinetPay a refusé l’authentification (HTTP ${httpStatus}).`;
}

async function loginCinetPay(force = false) {
  if (!force && tokenCache && tokenCache.expiresAt > Date.now()) {
    return tokenCache.token;
  }

  const apiKey = readCinetPaySecret("CINETPAY_API_KEY");
  const apiPassword = readCinetPaySecret("CINETPAY_API_PASSWORD");
  const url = `${cinetPayBaseUrl()}/v1/oauth/login`;
  const response = await cinetPayFetch(url, {
    method: "POST",
    body: JSON.stringify({ api_key: apiKey, api_password: apiPassword }),
  });
  const json = await readJson(response);
  const data = asRecord(json.data);
  const token = pickString(json.access_token, data.access_token);
  if (!token) {
    tokenCache = null;
    console.error("[cinetpay] login", {
      http: response.status,
      code: json.code ?? null,
      status: json.status ?? null,
      url: response.url || url,
    });
    throw new Error(authFailureMessage(json, response.status));
  }

  const expiresIn = Number(json.expires_in);
  const ttlMs = (Number.isFinite(expiresIn) && expiresIn > 120 ? expiresIn - 120 : 60 * 50) * 1000;
  tokenCache = { token, expiresAt: Date.now() + ttlMs };
  return token;
}

async function cinetPayRequest(path: string, init: RequestInit = {}, retried = false): Promise<Record<string, unknown>> {
  const token = await loginCinetPay(retried);
  const response = await cinetPayFetch(`${cinetPayBaseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
  });
  const json = await readJson(response);
  if (response.status === 401 && !retried) {
    tokenCache = null;
    return cinetPayRequest(path, init, true);
  }
  return json;
}

function paymentStatusFromPayload(json: Record<string, unknown>) {
  const data = asRecord(json.data);
  const details = asRecord(json.details);
  const wrapper = String(json.status || "").toUpperCase();
  const nested = pickString(details.status, data.status, data.payment_status, json.payment_status);
  if (nested) return mapCinetPayStatus(nested);
  if (wrapper === "OK") return "PENDING";
  return mapCinetPayStatus(wrapper);
}

function amountFromPayload(json: Record<string, unknown>) {
  const data = asRecord(json.data);
  const details = asRecord(json.details);
  const raw = data.amount ?? details.amount ?? json.amount;
  const amount = typeof raw === "number" ? raw : Number.parseInt(String(raw || ""), 10);
  return Number.isFinite(amount) ? amount : null;
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
    return { ok: false, message: "CinetPay n’est pas configuré (CINETPAY_API_KEY / CINETPAY_API_PASSWORD)." };
  }

  const parts = String(input.customerName || "Client").trim().split(/\s+/);
  const firstName = personName(parts[0] || "Client", "Client");
  const lastName = personName(parts.slice(1).join(" "), firstName);
  const phone = input.customerPhone.startsWith("+") ? input.customerPhone : `+${input.customerPhone.replace(/^\+/, "")}`;

  let json: Record<string, unknown>;
  try {
    json = await cinetPayRequest("/v1/payment", {
      method: "POST",
      body: JSON.stringify({
        currency: input.currency,
        merchant_transaction_id: input.transactionId.slice(0, 30),
        amount: input.amount,
        lang: "fr",
        designation: sanitizeCinetPayText(input.description, 80),
        client_email: input.customerEmail,
        client_phone_number: phone,
        client_first_name: firstName,
        client_last_name: lastName,
        success_url: input.returnUrl.slice(0, 120),
        failed_url: input.returnUrl.slice(0, 120),
        notify_url: input.notifyUrl.slice(0, 120),
        direct_pay: false,
      }),
    });
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "CinetPay indisponible." };
  }

  const data = asRecord(json.data);
  const details = asRecord(json.details);
  const paymentUrl = pickString(json.payment_url, data.payment_url);
  const paymentToken = pickString(json.payment_token, data.payment_token);
  const detailStatus = String(details.status || "").toUpperCase();

  if (paymentUrl && detailStatus !== "FAILED") {
    return { ok: true, paymentUrl, paymentToken };
  }

  return {
    ok: false,
    message: String(
      details.message || json.message || json.error || "CinetPay a refusé l’initialisation du paiement."
    ),
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

  let json: Record<string, unknown> = {};
  try {
    json = await cinetPayRequest(`/v1/payment/${encodeURIComponent(transactionId)}`, { method: "GET" });
  } catch (error) {
    return {
      ok: false,
      status: "PENDING",
      amount: null,
      currency: "",
      paymentMethod: "",
      raw: {},
      message: error instanceof Error ? error.message : "CinetPay indisponible.",
    };
  }

  const data = asRecord(json.data);
  const status = paymentStatusFromPayload(json);
  const amount = amountFromPayload(json);

  return {
    ok: status === "ACCEPTED",
    status,
    amount,
    currency: pickString(data.currency, json.currency),
    paymentMethod: pickString(data.payment_method, json.payment_method),
    raw: json,
    message: pickString(json.message, asRecord(json.details).message, data.message),
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

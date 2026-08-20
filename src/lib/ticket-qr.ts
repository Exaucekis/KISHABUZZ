import { createHmac, timingSafeEqual } from "node:crypto";
import QRCode from "qrcode";
import { isPublicCode } from "@/lib/ticket-codes";
import { absoluteUrl } from "@/lib/utils";

export function ticketQrSecret() {
  const secret = process.env.TICKET_QR_SECRET?.trim() || process.env.AUTH_SECRET?.trim() || "";
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("TICKET_QR_SECRET ou AUTH_SECRET est requis.");
  }
  return "dev-ticket-qr";
}

export function signTicketCode(publicCode: string, secret = ticketQrSecret()) {
  return createHmac("sha256", secret).update(publicCode).digest("hex");
}

export function verifyTicketSignature(publicCode: string, signature: string, secret = ticketQrSecret()) {
  if (!isPublicCode(publicCode) || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  const expected = signTicketCode(publicCode, secret);
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(signature, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function ticketQrPayload(publicCode: string, secret = ticketQrSecret()) {
  const url = new URL(absoluteUrl(`/s/${publicCode}`));
  url.searchParams.set("s", signTicketCode(publicCode, secret));
  return url.toString();
}

export function parseTicketQrPayload(raw: string) {
  const value = String(raw || "").trim();
  if (!value) return { publicCode: "", signature: "" };

  try {
    const json = JSON.parse(value) as { c?: string; s?: string };
    if (json.c) {
      return { publicCode: String(json.c), signature: String(json.s || "") };
    }
  } catch {
    /* URL or plain code */
  }

  try {
    const url = new URL(value);
    const fromPath = url.pathname.split("/").filter(Boolean).pop() || "";
    return {
      publicCode: decodeURIComponent(fromPath),
      signature: url.searchParams.get("s") || "",
    };
  } catch {
    return { publicCode: value, signature: "" };
  }
}

export async function ticketQrPng(publicCode: string, size = 360) {
  return QRCode.toBuffer(ticketQrPayload(publicCode), {
    type: "png",
    errorCorrectionLevel: "M",
    margin: 1,
    width: size,
    color: { dark: "#0d1017", light: "#ffffff" },
  });
}

export async function ticketQrDataUrl(publicCode: string, size = 360) {
  const png = await ticketQrPng(publicCode, size);
  return `data:image/png;base64,${png.toString("base64")}`;
}

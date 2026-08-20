export function digitsOnly(value: string) {
  return String(value || "").replace(/\D/g, "");
}

export function isValidBuyerPhone(value: string) {
  const digits = digitsOnly(value);
  return digits.length >= 9 && digits.length <= 15;
}

/** Numéro CinetPay : indicatif pays + national, sans + ni espaces. */
export function toCinetPayPhone(value: string) {
  let digits = digitsOnly(value);
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0") && digits.length === 10) {
    return `243${digits.slice(1)}`;
  }
  if (digits.length === 9) return `243${digits}`;
  return digits;
}

export function normalizePhoneDisplay(value: string) {
  const cinet = toCinetPayPhone(value);
  return cinet ? `+${cinet}` : "";
}

/** WhatsApp Cloud API : indicatif pays + national, sans + ni espaces. */
export function toWhatsAppPhone(value: string) {
  return toCinetPayPhone(value);
}

export function isValidWhatsAppPhone(value: string) {
  const digits = toWhatsAppPhone(value);
  return digits.length >= 10 && digits.length <= 15 && !digits.startsWith("0");
}

export function formatWhatsAppDisplay(value: string) {
  const digits = toWhatsAppPhone(value);
  if (!digits) return "";
  if (digits.startsWith("243") && digits.length === 12) {
    return `+243 ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
  }
  return `+${digits}`;
}

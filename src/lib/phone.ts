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

export function isCronAuthorized(request: Request) {
  if (request.headers.get("x-vercel-cron") === "1") return true;
  const secret = process.env.CRON_SECRET?.trim();
  if (secret) {
    return request.headers.get("authorization") === `Bearer ${secret}`;
  }
  return process.env.NODE_ENV !== "production";
}

import { absoluteUrl } from "@/lib/utils";

export function escapeHtml(value: string) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function textToHtmlParagraphs(body: string) {
  const blocks = String(body || "")
    .replace(/\r\n/g, "\n")
    .trim()
    .split(/\n{2,}/)
    .filter(Boolean);

  return blocks
    .map(
      (block) =>
        `<p style="margin:0 0 16px;color:#1f2430;font-size:16px;line-height:1.6;">${escapeHtml(block).replace(/\n/g, "<br />")}</p>`
    )
    .join("");
}

export function buildCampaignText(body: string, unsubscribeUrl?: string) {
  const parts = [String(body || "").trim()];
  if (unsubscribeUrl) {
    parts.push("", `Se désinscrire : ${unsubscribeUrl}`);
  }
  parts.push("", "KISHA BUZZ", absoluteUrl("/"));
  return parts.join("\n");
}

export function buildCampaignHtml({
  siteTitle,
  kind,
  subject,
  body,
  unsubscribeUrl,
}: {
  siteTitle: string;
  kind: "NEWSLETTER" | "NOTICE";
  subject: string;
  body: string;
  unsubscribeUrl?: string;
}) {
  const kindLabel = kind === "NOTICE" ? "Notification" : "Newsletter";
  const unsubscribe = unsubscribeUrl
    ? `<p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:#6b7280;">
        Vous recevez ce message parce que vous êtes inscrit à la newsletter ${escapeHtml(siteTitle)}.
        <a href="${escapeHtml(unsubscribeUrl)}" style="color:#e85d04;">Se désinscrire</a>
      </p>`
    : "";

  return `<!DOCTYPE html>
<html lang="fr">
  <body style="margin:0;padding:0;background:#f3f4f6;">
    <div style="max-width:640px;margin:0 auto;padding:24px 16px;">
      <div style="background:#0d1017;color:#fff;padding:18px 24px;">
        <p style="margin:0;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#f4a261;">${escapeHtml(kindLabel)}</p>
        <p style="margin:6px 0 0;font-size:22px;font-weight:700;">${escapeHtml(siteTitle)}</p>
      </div>
      <div style="background:#fff;padding:28px 24px 24px;">
        <h1 style="margin:0 0 18px;font-size:22px;line-height:1.3;color:#0d1017;">${escapeHtml(subject)}</h1>
        ${textToHtmlParagraphs(body)}
        ${unsubscribe}
      </div>
      <p style="margin:16px 8px 0;font-size:12px;color:#6b7280;">
        <a href="${escapeHtml(absoluteUrl("/"))}" style="color:#6b7280;">${escapeHtml(siteTitle)}</a>
      </p>
    </div>
  </body>
</html>`;
}

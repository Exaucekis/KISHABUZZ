import { resolveContactInbox } from "@/lib/contact";
import { buildCampaignHtml, buildCampaignText } from "@/lib/mail-template";
import { isMailerConfigured, resolveMailFrom, sendMails } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";
import { collaborationLabel } from "@/lib/utils";

export type ContactNotifyInput = {
  name: string;
  organization: string;
  phone: string;
  email: string;
  subject: string;
  collaborationType: string;
  message: string;
};

export async function notifyContactInbox(input: ContactNotifyInput) {
  if (!isMailerConfigured()) return { sent: 0 };

  const settings = await prisma.siteSetting.findUnique({ where: { id: "main" } });
  const siteTitle = settings?.siteTitle || "KISHA BUZZ";
  const inbox = resolveContactInbox(settings?.email || "");
  const from = resolveMailFrom(inbox, siteTitle);
  if (!from) return { sent: 0 };

  const kindLabel = collaborationLabel(input.collaborationType);
  const body = [
    `Nouvelle demande depuis le site ${siteTitle}.`,
    `Nom : ${input.name}`,
    input.organization ? `Organisation : ${input.organization}` : "",
    `Email : ${input.email}`,
    input.phone ? `Téléphone : ${input.phone}` : "",
    `Type : ${kindLabel}`,
    "",
    input.message,
  ]
    .filter((line) => line !== "")
    .join("\n");

  return sendMails(from, [
    {
      to: inbox,
      replyTo: input.email,
      subject: `[Contact] ${input.subject}`,
      html: buildCampaignHtml({
        siteTitle,
        kind: "NOTICE",
        subject: input.subject,
        body,
      }),
      text: buildCampaignText(body),
    },
  ]);
}

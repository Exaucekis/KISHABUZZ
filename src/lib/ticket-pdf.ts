import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { eventPlace, formatMoney } from "@/lib/events";
import { ticketQrPng } from "@/lib/ticket-qr";
import { formatDate } from "@/lib/utils";

const ink = rgb(0.05, 0.063, 0.09);
const paper = rgb(1, 1, 1);
const ember = rgb(0.91, 0.365, 0.016);
const muted = rgb(0.45, 0.47, 0.52);

function latin(value: string) {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export type TicketPdfInput = {
  publicCode: string;
  holderName: string;
  eventTitle: string;
  startsAt: Date;
  venueName?: string;
  city?: string;
  address?: string;
  ticketType: string;
  orderNumber: string;
  amount?: number;
  currency?: string;
};

export async function buildTicketPdf(ticket: TicketPdfInput) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 320]);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const { width, height } = page.getSize();

  page.drawRectangle({ x: 0, y: 0, width, height, color: paper });
  page.drawRectangle({ x: 0, y: height - 54, width, height: 54, color: ink });
  page.drawRectangle({ x: 0, y: 0, width: 8, height, color: ember });

  page.drawText("KISHA BUZZ", {
    x: 28,
    y: height - 28,
    size: 11,
    font: bold,
    color: ember,
  });
  page.drawText("BILLET NUMERIQUE", {
    x: 28,
    y: height - 44,
    size: 9,
    font: regular,
    color: paper,
  });
  page.drawText(latin(ticket.publicCode), {
    x: width - 28 - bold.widthOfTextAtSize(ticket.publicCode, 11),
    y: height - 34,
    size: 11,
    font: bold,
    color: paper,
  });

  const title = latin(ticket.eventTitle).slice(0, 48);
  page.drawText(title, {
    x: 28,
    y: height - 92,
    size: title.length > 32 ? 16 : 20,
    font: bold,
    color: ink,
  });

  const when = latin(formatDate(ticket.startsAt, "EEEE d MMMM yyyy  HH:mm"));
  const place = latin(eventPlace(ticket));
  page.drawText(when, { x: 28, y: height - 118, size: 11, font: regular, color: muted });
  if (place) {
    page.drawText(place, { x: 28, y: height - 136, size: 11, font: regular, color: muted });
  }

  const facts = [
    ["Tarif", latin(ticket.ticketType)],
    ["Titulaire", latin(ticket.holderName)],
    ["Commande", latin(ticket.orderNumber)],
  ];
  if (typeof ticket.amount === "number") {
    facts.push(["Montant", formatMoney(ticket.amount, ticket.currency || "CDF")]);
  }

  let y = 118;
  for (const [label, value] of facts) {
    page.drawText(label.toUpperCase(), { x: 28, y, size: 8, font: bold, color: ember });
    page.drawText(value.slice(0, 42), { x: 110, y, size: 11, font: regular, color: ink });
    y -= 22;
  }

  const qr = await ticketQrPng(ticket.publicCode, 420);
  const image = await pdf.embedPng(qr);
  const qrSize = 168;
  page.drawRectangle({
    x: width - qrSize - 36,
    y: 36,
    width: qrSize + 16,
    height: qrSize + 16,
    color: paper,
    borderColor: ink,
    borderWidth: 0.6,
  });
  page.drawImage(image, {
    x: width - qrSize - 28,
    y: 44,
    width: qrSize,
    height: qrSize,
  });

  page.drawText("A presenter a l entree  ·  Le scan serveur fait foi", {
    x: 28,
    y: 18,
    size: 8,
    font: regular,
    color: muted,
  });

  return pdf.save();
}

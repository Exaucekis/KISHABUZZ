import { notFound, redirect } from "next/navigation";
import { applyCinetPayCheck } from "@/lib/ticket-orders";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ orderId: string }> };

export default async function PaymentReturnPage({ params }: Props) {
  const { orderId } = await params;
  const order = await prisma.ticketOrder.findUnique({
    where: { id: orderId },
    include: { payment: true },
  });
  if (!order) notFound();

  if (order.status !== "PAID" && order.payment) {
    await applyCinetPayCheck(order.payment.transactionId, "RETURN");
  }

  const fresh = await prisma.ticketOrder.findUnique({ where: { id: orderId }, select: { status: true } });
  if (fresh?.status === "PAID") {
    redirect(`/paiement/${orderId}/confirmation`);
  }
  redirect(`/paiement/${orderId}`);
}

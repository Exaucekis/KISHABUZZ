import { statusLabel } from "@/lib/utils";

const COLORS: Record<string, string> = {
  DRAFT: "bg-white/10 text-[#aeb6c5]",
  SCHEDULED: "bg-amber-500/20 text-amber-200",
  PUBLISHED: "bg-emerald-500/20 text-emerald-200",
  ARCHIVED: "bg-slate-500/20 text-slate-300",
  NEW: "bg-sky-500/20 text-sky-200",
  IN_PROGRESS: "bg-amber-500/20 text-amber-200",
  DONE: "bg-emerald-500/20 text-emerald-200",
  ACTIVE: "bg-emerald-500/20 text-emerald-200",
  UNSUBSCRIBED: "bg-slate-500/20 text-slate-300",
  SENT: "bg-emerald-500/20 text-emerald-200",
  PARTIAL: "bg-amber-500/20 text-amber-200",
  FAILED: "bg-red-500/20 text-red-200",
  NEWSLETTER: "bg-sky-500/20 text-sky-200",
  NOTICE: "bg-violet-500/20 text-violet-200",
  SOLD_OUT: "bg-amber-500/20 text-amber-200",
  ENDED: "bg-slate-500/20 text-slate-300",
  CANCELLED: "bg-red-500/20 text-red-200",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded px-2 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wide ${
        COLORS[status] || "bg-white/10 text-[#aeb6c5]"
      }`}
    >
      {statusLabel(status)}
    </span>
  );
}

import { auditActionLabel } from "@/lib/event-audit";
import { formatDate } from "@/lib/utils";

type Log = {
  id: string;
  action: string;
  summary: string;
  createdAt: Date;
  actor: { name: string; email: string } | null;
};

export function EventAuditList({ logs }: { logs: Log[] }) {
  return (
    <div className="admin-card mt-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-[#9aa3b5]">Journal d’audit</h2>
      <p className="admin-hint">Capacité, statuts, annulations et remboursements.</p>
      <ul className="mt-4 divide-y divide-white/10">
        {logs.map((log) => (
          <li key={log.id} className="py-3">
            <p className="text-sm font-medium">{auditActionLabel(log.action)}</p>
            <p className="mt-1 text-sm text-[#aeb6c5]">{log.summary}</p>
            <p className="mt-1 text-xs text-[#9aa3b5]">
              {formatDate(log.createdAt, "d MMM yyyy HH:mm")}
              {log.actor ? ` · ${log.actor.name}` : ""}
            </p>
          </li>
        ))}
        {!logs.length ? (
          <li className="py-6 text-sm text-[#9aa3b5]">Aucun événement journalisé pour l’instant.</li>
        ) : null}
      </ul>
    </div>
  );
}

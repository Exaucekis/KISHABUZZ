import Link from "next/link";
import type { ReactNode } from "react";

export function AdminHint({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return <p className="admin-hint">{children}</p>;
}

export type AdminActionItem = {
  href: string;
  label: string;
  hint: string;
  variant?: "primary" | "ghost";
  target?: string;
};

export function AdminAction({ href, label, hint, variant = "ghost", target }: AdminActionItem) {
  return (
    <Link
      href={href}
      className="admin-action"
      target={target}
      rel={target === "_blank" ? "noreferrer" : undefined}
    >
      <span className={`admin-btn ${variant === "primary" ? "admin-btn-primary" : "admin-btn-ghost"}`}>
        {label}
      </span>
      <span className="admin-action-hint">{hint}</span>
    </Link>
  );
}

export function AdminActionRow({ children }: { children: ReactNode }) {
  return <div className="admin-action-row">{children}</div>;
}

export function AdminPageIntro({
  title,
  hint,
  actions,
}: {
  title: string;
  hint: string;
  actions?: ReactNode | AdminActionItem[];
}) {
  const items = Array.isArray(actions) ? actions : null;
  return (
    <header className="admin-page-intro">
      <div className="admin-page-intro__copy">
        <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold">{title}</h1>
        <p className="admin-page-hint">{hint}</p>
      </div>
      {items?.length ? (
        <AdminActionRow>
          {items.map((action) => (
            <AdminAction key={`${action.href}-${action.label}`} {...action} />
          ))}
        </AdminActionRow>
      ) : actions && !items ? (
        <AdminActionRow>{actions as ReactNode}</AdminActionRow>
      ) : null}
    </header>
  );
}

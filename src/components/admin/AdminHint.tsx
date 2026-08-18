export function AdminHint({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return <p className="admin-hint">{children}</p>;
}

export function AdminPageIntro({
  title,
  hint,
  actions,
}: {
  title: string;
  hint: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold">{title}</h1>
        <p className="admin-page-hint">{hint}</p>
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

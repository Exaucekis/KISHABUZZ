import Link from "next/link";

export type AdminTabItem = {
  id: string;
  label: string;
  hint?: string;
  href?: string;
  active?: boolean;
  onSelect?: () => void;
};

export function AdminTabs({
  items,
  label = "Rubriques",
}: {
  items: AdminTabItem[];
  label?: string;
}) {
  return (
    <nav className="admin-tabs" aria-label={label}>
      <div className="admin-tabs-track" role="tablist">
        {items.map((item) => {
          const className = `admin-tab${item.active ? " is-active" : ""}`;
          const inner = (
            <>
              <span className="admin-tab-label">{item.label}</span>
              {item.hint ? <span className="admin-tab-hint">{item.hint}</span> : null}
            </>
          );
          if (item.href) {
            return (
              <Link
                key={item.id}
                href={item.href}
                className={className}
                aria-current={item.active ? "page" : undefined}
              >
                {inner}
              </Link>
            );
          }
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={item.active}
              className={className}
              onClick={item.onSelect}
            >
              {inner}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

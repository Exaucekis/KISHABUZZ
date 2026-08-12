type Props = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function EmptyState({ title, description, action }: Props) {
  return (
    <div className="border border-dashed border-line px-6 py-14 text-center">
      <h3 className="font-display text-2xl">{title}</h3>
      {description ? (
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-paper-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

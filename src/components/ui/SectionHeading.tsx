type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

export function SectionHeading({ eyebrow, title, description, align = "left" }: Props) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl min-w-0"}>
      {eyebrow ? (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-ember-text">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="break-words font-display text-3xl leading-tight md:text-5xl">{title}</h2>
      <span className={`section-line${align === "center" ? " mx-auto" : ""}`} aria-hidden />
      {description ? (
        <p className="mt-4 text-base leading-relaxed text-paper-muted md:text-lg">{description}</p>
      ) : null}
    </div>
  );
}

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function ArenaPageIntro({ eyebrow = "Arena Culture", title, description }: Props) {
  return (
    <header className="ac-intro">
      <p className="ac-kicker">{eyebrow}</p>
      <h1>{title}</h1>
      {description ? <p>{description}</p> : null}
    </header>
  );
}

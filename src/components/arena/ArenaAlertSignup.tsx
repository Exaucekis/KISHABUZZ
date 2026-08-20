import { ArenaAlertForm } from "@/components/arena/ArenaAlertForm";

export function ArenaAlertSignup({ source = "arena" }: { source?: string }) {
  return (
    <section id="alertes" className="ac-alert">
      <p className="ac-kicker">Alertes</p>
      <h2>Prochain invité, dans votre poche</h2>
      <p>
        Laissez votre WhatsApp et/ou votre email. Dès qu’Arena Culture annonce un invité ou passe à la
        une, vous êtes prévenu.
      </p>
      <ArenaAlertForm source={source} />
    </section>
  );
}

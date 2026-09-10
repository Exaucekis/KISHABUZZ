import { Bell } from "lucide-react";
import { ArenaAlertForm } from "@/components/arena/ArenaAlertForm";

export function ArenaAlertSignup({ source = "arena" }: { source?: string }) {
  return (
    <section id="alertes" className="relative my-12 overflow-hidden rounded-3xl border border-amber-500/25 bg-gradient-to-br from-[#131826] via-[#0b0e17] to-[#05070c] p-6 shadow-2xl sm:p-10 md:p-12">
      {/* Halo lumineux vert/ambre de fond */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-4xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1.5 backdrop-blur-md">
          <Bell className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-[0.72rem] font-bold uppercase tracking-wider text-amber-300">
            Alertes Directes Arena Culture
          </span>
        </div>

        <h2 className="mt-4 font-display text-2xl font-extrabold text-white sm:text-3xl md:text-4xl">
          Prochain invité, dans votre poche
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
          Laissez votre WhatsApp et/ou votre email. Dès qu’Arena Culture annonce un invité ou passe à la une, vous êtes prévenu instantanément.
        </p>

        <ArenaAlertForm source={source} />
      </div>
    </section>
  );
}

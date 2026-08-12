"use client";

import { useActionState } from "react";
import { collaborationLabel } from "@/lib/utils";
import {
  submitContact,
  type ContactActionState,
} from "@/actions/contact";

const TYPES = [
  "MEDIA",
  "EVENT_COVERAGE",
  "INTERVIEW",
  "PARTNERSHIP",
  "ADVERTISING",
  "ARENA_CULTURE",
  "CONTENT_PRODUCTION",
  "OTHER",
] as const;

const initial: ContactActionState = { ok: false, message: "" };

export function ContactForm() {
  const [state, action, pending] = useActionState(submitContact, initial);

  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="Nom complet"
          name="name"
          required
          error={state.fieldErrors?.name?.[0]}
        />
        <Field
          label="Organisation"
          name="organization"
          error={state.fieldErrors?.organization?.[0]}
        />
        <Field
          label="Téléphone"
          name="phone"
          type="tel"
          error={state.fieldErrors?.phone?.[0]}
        />
        <Field
          label="Email"
          name="email"
          type="email"
          required
          error={state.fieldErrors?.email?.[0]}
        />
      </div>

      <Field
        label="Sujet"
        name="subject"
        required
        error={state.fieldErrors?.subject?.[0]}
      />

      <div>
        <label htmlFor="collaborationType" className="mb-2 block text-sm text-paper-muted">
          Type de collaboration
        </label>
        <select
          id="collaborationType"
          name="collaborationType"
          defaultValue="OTHER"
          className="w-full border border-line bg-ink-2 px-4 py-3 text-paper focus-ring"
        >
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {collaborationLabel(t)}
            </option>
          ))}
        </select>
        {state.fieldErrors?.collaborationType?.[0] ? (
          <p className="mt-1 text-sm text-red-400">{state.fieldErrors.collaborationType[0]}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="message" className="mb-2 block text-sm text-paper-muted">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          className="w-full border border-line bg-ink-2 px-4 py-3 text-paper focus-ring"
        />
        {state.fieldErrors?.message?.[0] ? (
          <p className="mt-1 text-sm text-red-400">{state.fieldErrors.message[0]}</p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-md bg-ember px-6 py-3 text-sm font-semibold text-on-ember transition hover:bg-ember-hot focus-ring disabled:opacity-60"
      >
        {pending ? "Envoi…" : "Envoyer la demande"}
      </button>

      {state.message ? (
        <p
          className={
            state.ok
              ? "border border-line bg-ink-2 px-4 py-3 text-sm text-paper"
              : "border border-red-500/40 bg-ink-2 px-4 py-3 text-sm text-red-300"
          }
          role="status"
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-sm text-paper-muted">
        {label}
        {required ? " *" : ""}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="w-full border border-line bg-ink-2 px-4 py-3 text-paper focus-ring"
      />
      {error ? <p className="mt-1 text-sm text-red-400">{error}</p> : null}
    </div>
  );
}

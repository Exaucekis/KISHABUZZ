"use client";

import { useRef, useState } from "react";
import { uploadImage } from "@/actions/admin/upload";

function wrapSelection(value: string, start: number, end: number, before: string, after: string) {
  const selected = value.slice(start, end) || "texte";
  return {
    next: `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`,
    cursor: start + before.length + selected.length + after.length,
  };
}

const TOOLS = [
  { label: "Gras", before: "<strong>", after: "</strong>" },
  { label: "Italique", before: "<em>", after: "</em>" },
  { label: "H2", before: "<h2>", after: "</h2>" },
  { label: "H3", before: "<h3>", after: "</h3>" },
  { label: "Lien", before: '<a href="https://">', after: "</a>" },
  { label: "Citation", before: "<blockquote>", after: "</blockquote>" },
  { label: "Liste", before: "<ul><li>", after: "</li></ul>" },
  { label: "Paragraphe", before: "<p>", after: "</p>" },
] as const;

export function ArticleEditor({
  name,
  defaultValue = "",
}: {
  name: string;
  defaultValue?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function apply(before: string, after: string) {
    const el = textareaRef.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    const { next, cursor } = wrapSelection(value, start, end, before, after);
    setValue(next);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(cursor, cursor);
    });
  }

  function insert(html: string) {
    const el = textareaRef.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    const next = `${value.slice(0, start)}${html}${value.slice(end)}`;
    setValue(next);
    requestAnimationFrame(() => {
      el?.focus();
      const pos = start + html.length;
      el?.setSelectionRange(pos, pos);
    });
  }

  async function onImage(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setMessage("");
    const fd = new FormData();
    fd.set("file", file);
    const result = await uploadImage(fd);
    setBusy(false);
    if (result.ok && result.url) {
      insert(`<img src="${result.url}" alt="" />`);
      setMessage("Image insérée.");
    } else {
      setMessage(result.message);
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="admin-field md:col-span-2">
      <label htmlFor={name}>Contenu</label>
      <div className="mb-2 flex flex-wrap gap-1">
        {TOOLS.map((tool) => (
          <button
            key={tool.label}
            type="button"
            className="admin-btn admin-btn-ghost !px-2 !py-1 text-xs"
            onClick={() => apply(tool.before, tool.after)}
          >
            {tool.label}
          </button>
        ))}
        <button
          type="button"
          className="admin-btn admin-btn-ghost !px-2 !py-1 text-xs"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
        >
          {busy ? "Envoi…" : "Image"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          onChange={(e) => void onImage(e.target.files?.[0])}
        />
      </div>
      <textarea
        ref={textareaRef}
        id={name}
        name={name}
        className="min-h-[18rem] font-mono text-sm"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {message ? (
        <p className={`mt-1 text-xs ${message.includes("insérée") ? "text-emerald-300" : "text-red-300"}`}>
          {message}
        </p>
      ) : null}
      <p className="mt-1 text-xs text-[#9aa3b5]">
        Sélectionnez du texte puis un bouton. Le HTML est affiché tel quel sur le site.
      </p>
    </div>
  );
}

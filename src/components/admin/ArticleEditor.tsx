"use client";

import { useRef, useState } from "react";
import { uploadImage, uploadMedia } from "@/actions/admin/upload";
import { articleInlineImageTag } from "@/lib/image-alt";

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
  const videoRef = useRef<HTMLInputElement>(null);

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

  function insertEmbed(url: string) {
    const safe = url.trim().replace(/&/g, "&amp;").replace(/"/g, "&quot;");
    insert(`<div data-kb-embed="${safe}"></div>\n`);
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
      const alt =
        window.prompt("Texte alternatif de l’image (pour malvoyants). Laissez vide si décoratif :") ||
        "";
      insert(articleInlineImageTag(result.url, alt.trim()));
      setMessage(alt.trim() ? "Image insérée avec texte alternatif." : "Image insérée.");
    } else {
      setMessage(result.message);
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  async function onVideoFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setMessage("");
    const fd = new FormData();
    fd.set("file", file);
    fd.set("folder", "articles");
    const result = await uploadMedia(fd);
    setBusy(false);
    if (result.ok && result.url) {
      insertEmbed(result.url);
      setMessage("Vidéo insérée.");
    } else {
      setMessage(result.message);
    }
    if (videoRef.current) videoRef.current.value = "";
  }

  function onVideoLink() {
    const url = window.prompt("Lien YouTube, Instagram, Facebook ou TikTok :");
    if (!url?.trim()) return;
    insertEmbed(url.trim());
    setMessage("Vidéo insérée.");
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
        <button
          type="button"
          className="admin-btn admin-btn-ghost !px-2 !py-1 text-xs"
          disabled={busy}
          onClick={onVideoLink}
        >
          Vidéo (lien)
        </button>
        <button
          type="button"
          className="admin-btn admin-btn-ghost !px-2 !py-1 text-xs"
          disabled={busy}
          onClick={() => videoRef.current?.click()}
        >
          Vidéo (fichier)
        </button>
        <input
          ref={fileRef}
          type="file"
          form="article-editor-upload"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          onChange={(e) => void onImage(e.target.files?.[0])}
        />
        <input
          ref={videoRef}
          type="file"
          form="article-editor-upload"
          accept="video/mp4,video/webm,video/ogg"
          className="sr-only"
          onChange={(e) => void onVideoFile(e.target.files?.[0])}
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
      <p className="admin-hint">
        Boutons : mettez le texte en forme. Image = fichier + texte alternatif. Vidéo = lien YouTube /
        Instagram / Facebook / TikTok, ou fichier. La lecture se fait sur le site.
      </p>
    </div>
  );
}

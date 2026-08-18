"use client";

import { useEffect, useRef, useState } from "react";
import { registerLibraryFile } from "@/actions/admin/library";
import { uploadMedia } from "@/actions/admin/upload";
import { AdminHint } from "@/components/admin/AdminHint";
import { CoverCropper } from "@/components/admin/CoverCropper";
import { IconPicker } from "@/components/admin/IconPicker";
import { LibraryPicker } from "@/components/admin/LibraryPicker";
import { VideoEmbed } from "@/components/media/VideoEmbed";
import { coverFocusStyle } from "@/lib/cover-focus";
import { isDirectVideo, isImageSrc, isPlayableMedia } from "@/lib/media";

export type MediaFieldKind = "image" | "video" | "logo" | "icon" | "any";

const ACCEPT: Record<MediaFieldKind, string> = {
  image: "image/jpeg,image/png,image/webp,image/gif,image/svg+xml",
  logo: "image/jpeg,image/png,image/webp,image/gif,image/svg+xml",
  icon: "image/jpeg,image/png,image/webp,image/gif,image/svg+xml",
  video: "video/mp4,video/webm,video/ogg,video/quicktime",
  any: "image/jpeg,image/png,image/webp,image/gif,image/svg+xml,video/mp4,video/webm,video/ogg",
};

const HINTS: Record<MediaFieldKind, string> = {
  image: "Lien, Téléverser, ou Bibliothèque (fichiers déjà envoyés).",
  logo: "Fichier, lien, ou réemploi depuis la Bibliothèque.",
  icon: "Cliquez une icône, Bibliothèque, ou petite image.",
  video: "Lien YouTube / Instagram / Facebook / TikTok, fichier, ou Bibliothèque.",
  any: "Lien, fichier, ou Bibliothèque.",
};

const PLACEHOLDERS: Record<MediaFieldKind, string> = {
  image: "https://… ou /uploads/…",
  logo: "https://… ou téléversez le logo",
  icon: "🎵  ou lien / fichier d’icône",
  video: "YouTube, Instagram, Facebook, TikTok ou fichier",
  any: "Lien réseau social ou fichier",
};

function extOf(file: File) {
  const name = file.name.toLowerCase();
  const match = name.match(/\.[a-z0-9]+$/);
  if (match) return match[0];
  if (file.type === "image/png") return ".png";
  if (file.type === "image/webp") return ".webp";
  if (file.type === "image/gif") return ".gif";
  if (file.type === "video/webm") return ".webm";
  if (file.type.startsWith("video/")) return ".mp4";
  return ".jpg";
}

async function uploadViaBlob(file: File, folder: string) {
  const { upload } = await import("@vercel/blob/client");
  const pathname = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}${extOf(file)}`;
  const blob = await upload(pathname, file, {
    access: "public",
    handleUploadUrl: "/api/admin/blob",
  });
  return blob.url;
}

export function MediaField({
  name,
  label,
  defaultValue = "",
  kind = "image",
  folder = "media",
  required = false,
  hint,
  altName,
  defaultAlt = "",
  focusName,
  defaultFocus = "50% 50%",
  className = "admin-field md:col-span-2",
  onUrlChange,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  kind?: MediaFieldKind;
  folder?: string;
  required?: boolean;
  hint?: string;
  altName?: string;
  defaultAlt?: string;
  focusName?: string;
  defaultFocus?: string;
  className?: string;
  onUrlChange?: (url: string) => void;
}) {
  const [url, setUrl] = useState(defaultValue);
  const [alt, setAlt] = useState(defaultAlt);
  const [focus, setFocus] = useState(defaultFocus);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [cropOpen, setCropOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function applyUrl(next: string) {
    setUrl(next);
    onUrlChange?.(next);
  }

  useEffect(() => {
    setUrl(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    setFocus(defaultFocus);
  }, [defaultFocus]);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setMessage("");
    const isVideo = file.type.startsWith("video/");

    if (isVideo && file.size > 3.5 * 1024 * 1024) {
      try {
        const blobUrl = await uploadViaBlob(file, folder);
        await registerLibraryFile({
          url: blobUrl,
          kind: "VIDEO",
          title: file.name.replace(/\.[^.]+$/, ""),
          folder,
        });
        setBusy(false);
        setOk(true);
        setMessage("Fichier envoyé.");
        applyUrl(blobUrl);
        if (inputRef.current) inputRef.current.value = "";
        return;
      } catch {
        // Local / sans token Blob : on retombe sur l’action serveur.
      }
    }

    const fd = new FormData();
    fd.set("file", file);
    fd.set("folder", folder);
    const result = await uploadMedia(fd);
    setBusy(false);
    setOk(result.ok);
    setMessage(result.message);
    if (result.ok && result.url) applyUrl(result.url);
    if (inputRef.current) inputRef.current.value = "";
  }

  const showVideo = url && (kind === "video" || kind === "any") && isPlayableMedia(url);
  const showImage = url && isImageSrc(url) && !isDirectVideo(url);

  return (
    <div className={className}>
      <label htmlFor={name}>{label}</label>
      {kind === "icon" ? <IconPicker value={url} onChange={applyUrl} /> : null}
      <input
        id={name}
        name={name}
        value={url}
        required={required}
        onChange={(e) => applyUrl(e.target.value)}
        placeholder={PLACEHOLDERS[kind]}
      />
      <div className="admin-media-split">
        <span>ou</span>
        <label className="admin-btn admin-btn-ghost shrink-0 cursor-pointer">
          {busy ? "Envoi…" : "Téléverser"}
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT[kind]}
            className="sr-only"
            disabled={busy}
            onChange={(e) => void onFile(e.target.files?.[0])}
          />
        </label>
        <button
          type="button"
          className="admin-btn admin-btn-ghost shrink-0"
          onClick={() => setLibraryOpen(true)}
        >
          Bibliothèque
        </button>
        {focusName && showImage ? (
          <button
            type="button"
            className="admin-btn admin-btn-ghost shrink-0"
            onClick={() => setCropOpen(true)}
          >
            Recadrer
          </button>
        ) : null}
      </div>
      <LibraryPicker
        open={libraryOpen}
        kind={kind === "video" ? "video" : kind === "any" ? "any" : "image"}
        onSelect={(next) => {
          applyUrl(next);
          setOk(true);
          setMessage("Média choisi dans la bibliothèque.");
        }}
        onClose={() => setLibraryOpen(false)}
      />
      <p className="admin-hint">{hint || HINTS[kind]}</p>
      {message ? (
        <p className={`mt-1 text-xs ${ok ? "text-emerald-300" : "text-red-300"}`}>{message}</p>
      ) : null}
      {focusName ? <input type="hidden" name={focusName} value={focus} /> : null}
      {showVideo ? (
        <div className="mt-3 max-w-md">
          <VideoEmbed url={url} lazy />
        </div>
      ) : showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={alt || ""}
          className={`mt-3 max-h-40 w-full max-w-md rounded-md ${kind === "logo" || kind === "icon" ? "object-contain" : "object-cover"}`}
          style={focusName ? coverFocusStyle(focus) : undefined}
        />
      ) : null}
      {focusName && url && isImageSrc(url) ? (
        <CoverCropper
          open={cropOpen}
          src={url}
          value={focus}
          onApply={setFocus}
          onClose={() => setCropOpen(false)}
        />
      ) : null}
      {altName && kind !== "video" ? (
        <div className="mt-3">
          <label htmlFor={altName}>Texte alternatif</label>
          <input
            id={altName}
            name={altName}
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="Décrivez l’image en une phrase"
          />
          <AdminHint>
            Pour les lecteurs d’écran. Ex. Gaz Mawete au micro, lumières oranges. Laissez vide si
            l’image est purement décorative.
          </AdminHint>
        </div>
      ) : null}
    </div>
  );
}

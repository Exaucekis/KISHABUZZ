"use client";

import { useEffect, useId, useRef, useState } from "react";
import { attachMediaUrl, type MediaAttachTarget } from "@/actions/admin/upload";
import { AdminHint } from "@/components/admin/AdminHint";
import { CoverCropper } from "@/components/admin/CoverCropper";
import { IconPicker } from "@/components/admin/IconPicker";
import { LibraryPicker } from "@/components/admin/LibraryPicker";
import { VideoEmbed } from "@/components/media/VideoEmbed";
import { coverFocusStyle } from "@/lib/cover-focus";
import { IMAGE_MAX_BYTES, VIDEO_MAX_BYTES, mediaExtension } from "@/lib/media-limits";
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
  image: "Téléversez un fichier : il s’affiche tout de suite sur le site.",
  logo: "Téléversez le logo, ou choisissez-le dans la Bibliothèque.",
  icon: "Cliquez une icône, ou téléversez une petite image.",
  video: "Lien YouTube / Instagram / TikTok, ou fichier. Publié tout de suite.",
  any: "Téléversez un fichier ou collez un lien.",
};

const PLACEHOLDERS: Record<MediaFieldKind, string> = {
  image: "https://… ou /uploads/…",
  logo: "https://… ou téléversez le logo",
  icon: "🎵  ou lien / fichier d’icône",
  video: "YouTube, Instagram, Facebook, TikTok ou fichier",
  any: "Lien réseau social ou fichier",
};

function xhrUpload(file: File, folder: string, onProgress: (pct: number) => void) {
  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/upload");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.max(1, Math.round((event.loaded / event.total) * 100)));
      }
    };
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText) as {
          ok?: boolean;
          url?: string;
          message?: string;
        };
        if (xhr.status >= 200 && xhr.status < 300 && data.ok && data.url) {
          resolve(data.url);
          return;
        }
        reject(new Error(data.message || "Échec de l’envoi."));
      } catch {
        reject(new Error("Échec de l’envoi."));
      }
    };
    xhr.onerror = () => reject(new Error("Connexion interrompue pendant l’envoi."));
    xhr.onabort = () => reject(new Error("Envoi annulé."));
    const fd = new FormData();
    fd.set("file", file);
    fd.set("folder", folder);
    xhr.send(fd);
  });
}

async function uploadViaBlob(file: File, folder: string, onProgress: (pct: number) => void) {
  const { upload } = await import("@vercel/blob/client");
  const pathname = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}${mediaExtension(file.type, file.name)}`;
  const blob = await upload(pathname, file, {
    access: "public",
    handleUploadUrl: "/api/admin/blob",
    multipart: true,
    onUploadProgress: (event: { percentage?: number; loaded?: number; total?: number }) => {
      if (typeof event.percentage === "number") {
        onProgress(Math.max(1, Math.round(event.percentage)));
        return;
      }
      if (event.total) {
        onProgress(Math.max(1, Math.round(((event.loaded || 0) / event.total) * 100)));
      }
    },
  } as never);
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
  persist,
  dropzone = false,
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
  dropzone?: boolean;
  persist?: { target: MediaAttachTarget; id?: string; field: string };
}) {
  const [url, setUrl] = useState(defaultValue);
  const [alt, setAlt] = useState(defaultAlt);
  const [focus, setFocus] = useState(defaultFocus);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [cropOpen, setCropOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const uploadFormId = `media-upload-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    const form = urlInputRef.current?.form;
    if (!form) return;
    const onReset = () => {
      setUrl(defaultValue);
      setAlt(defaultAlt);
      setFocus(defaultFocus);
      setBusy(false);
      setProgress(0);
      setMessage("");
      setOk(false);
      setDragOver(false);
      setLibraryOpen(false);
      setCropOpen(false);
      if (inputRef.current) inputRef.current.value = "";
    };
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  }, [defaultValue, defaultAlt, defaultFocus]);

  function applyUrl(next: string) {
    setUrl(next);
    onUrlChange?.(next);
  }

  async function commitUrl(next: string) {
    applyUrl(next);
    if (!persist) {
      setOk(true);
      setMessage("Fichier prêt. Cliquez Enregistrer en bas du formulaire.");
      return;
    }
    const result = await attachMediaUrl({
      target: persist.target,
      id: persist.id,
      field: persist.field,
      url: next,
    });
    setOk(result.ok);
    setMessage(result.message);
  }

  useEffect(() => {
    setUrl(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    setFocus(defaultFocus);
  }, [defaultFocus]);

  async function onFile(file: File | undefined) {
    if (!file) return;
    const isVideo = kind === "video" || file.type.startsWith("video/");
    if (isVideo && file.size > VIDEO_MAX_BYTES) {
      setOk(false);
      setMessage("Vidéo trop lourde (200 Mo max). Compressez-la ou collez un lien.");
      return;
    }
    if (!isVideo && file.size > IMAGE_MAX_BYTES) {
      setOk(false);
      setMessage("Image trop lourde (4 Mo max).");
      return;
    }

    setBusy(true);
    setProgress(1);
    setMessage(isVideo ? "Envoi de la vidéo… le formulaire reste utilisable." : "Envoi en cours…");
    setOk(false);

    try {
      let uploaded = "";
      try {
        uploaded = await uploadViaBlob(file, folder, setProgress);
      } catch (error) {
        console.warn("[media] envoi Blob, bascule vers /api/admin/upload", error);
        const localHost = /localhost|127\.0\.0\.1/.test(window.location.hostname);
        if (!localHost && file.size > IMAGE_MAX_BYTES) {
          throw new Error(
            "L’envoi direct a échoué. Réessayez, ou collez un lien YouTube / Facebook / TikTok."
          );
        }
        uploaded = await xhrUpload(file, folder, setProgress);
      }
      setProgress(100);
      if (inputRef.current) inputRef.current.value = "";
      await commitUrl(uploaded);
    } catch (error) {
      setOk(false);
      setMessage(error instanceof Error ? error.message : "Échec de l’envoi.");
    } finally {
      setBusy(false);
    }
  }

  const showVideo = url && (kind === "video" || kind === "any") && isPlayableMedia(url);
  const showImage = url && isImageSrc(url) && !isDirectVideo(url);

  return (
    <div className={className}>
      <label htmlFor={name}>{label}</label>
      {kind === "icon" ? <IconPicker value={url} onChange={(next) => void commitUrl(next)} /> : null}
      <input ref={urlInputRef} type="hidden" name={name} value={url} />
      {dropzone ? (
        <label
          className={`mb-3 flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition ${
            dragOver
              ? "border-amber-300 bg-amber-400/15"
              : "border-white/20 bg-black/20 hover:border-amber-300/60"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            void onFile(e.dataTransfer.files?.[0]);
          }}
        >
          <span className="text-sm font-semibold text-[#eef1f6]">
            {busy
              ? kind === "video"
                ? `Envoi de la vidéo… ${progress}%`
                : `Envoi… ${progress}%`
              : kind === "video"
                ? "Déposez la vidéo ici"
                : "Cliquez ou déposez la photo ici"}
          </span>
          <span className="mt-1 text-xs text-[#9aa3b5]">
            {kind === "video" ? "MP4 / WebM, jusqu’à 200 Mo — sans bloquer la page" : "JPG, PNG ou WebP"}
          </span>
          {busy ? (
            <span className="mt-3 block h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-white/10">
              <span
                className="block h-full rounded-full bg-amber-300 transition-[width]"
                style={{ width: `${Math.min(100, progress)}%` }}
              />
            </span>
          ) : null}
          <input
            ref={inputRef}
            type="file"
            form={uploadFormId}
            accept={ACCEPT[kind]}
            className="sr-only"
            disabled={busy}
            onChange={(e) => void onFile(e.target.files?.[0])}
          />
        </label>
      ) : null}
      <input
        id={name}
        value={url}
        required={required}
        onChange={(e) => applyUrl(e.target.value)}
        onBlur={() => {
          if (persist && url !== defaultValue) void commitUrl(url);
        }}
        placeholder={
          dropzone && kind === "video"
            ? "Ou collez un lien YouTube, Facebook, Instagram ou TikTok"
            : PLACEHOLDERS[kind]
        }
      />
      <div className="admin-media-split">
        {dropzone ? null : (
          <>
            <span>ou</span>
            <label className="admin-btn admin-btn-ghost shrink-0 cursor-pointer">
              {busy ? "Envoi…" : "Téléverser"}
              <input
                ref={inputRef}
                type="file"
                form={uploadFormId}
                accept={ACCEPT[kind]}
                className="sr-only"
                disabled={busy}
                onChange={(e) => void onFile(e.target.files?.[0])}
              />
            </label>
          </>
        )}
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
          void commitUrl(next);
        }}
        onClose={() => setLibraryOpen(false)}
      />
      <p className="admin-hint">
        {hint || HINTS[kind]}
        {kind === "video"
          ? " L’envoi affiche une progression et n’empêche pas de remplir le nom et le thème."
          : ""}
      </p>
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

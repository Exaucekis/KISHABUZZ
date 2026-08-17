"use client";

import { useRef, useState } from "react";
import { uploadImage } from "@/actions/admin/upload";

export function ImageUploadField({
  name,
  label,
  defaultValue = "",
  hint,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  hint?: string;
}) {
  const [url, setUrl] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setMessage("");
    const fd = new FormData();
    fd.set("file", file);
    const result = await uploadImage(fd);
    setBusy(false);
    setOk(result.ok);
    setMessage(result.message);
    if (result.ok && result.url) setUrl(result.url);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="admin-field md:col-span-2">
      <label htmlFor={name}>{label}</label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id={name}
          name={name}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://… ou envoi ci-dessous"
        />
        <label className="admin-btn admin-btn-ghost shrink-0 cursor-pointer">
          {busy ? "Envoi…" : "Téléverser"}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            disabled={busy}
            onChange={(e) => void onFile(e.target.files?.[0])}
          />
        </label>
      </div>
      {hint ? <p className="mt-1 text-xs text-[#9aa3b5]">{hint}</p> : null}
      {message ? (
        <p className={`mt-1 text-xs ${ok ? "text-emerald-300" : "text-red-300"}`}>{message}</p>
      ) : null}
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="mt-3 max-h-40 rounded-md object-cover" />
      ) : null}
    </div>
  );
}

"use client";

import { useActionState } from "react";
import { saveSettings } from "@/actions/admin/settings";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { AdminActionState } from "@/lib/admin";

type Settings = {
  siteTitle: string;
  tagline: string;
  aboutShort: string;
  aboutLong: string;
  phone: string;
  email: string;
  address: string;
  whatsappEnabled: boolean;
  socialFacebook: string;
  socialInstagram: string;
  socialYoutube: string;
  socialX: string;
  socialTiktok: string;
  metaTitle: string;
  metaDescription: string;
  heroImage: string;
  heroVideo: string;
};

const initial: AdminActionState = { ok: false, message: "" };

export function SettingsForm({ settings }: { settings: Settings }) {
  const [state, action] = useActionState(saveSettings, initial);

  return (
    <form action={action} className="admin-card">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="admin-field">
          <label>Titre du site</label>
          <input name="siteTitle" required defaultValue={settings.siteTitle} />
        </div>
        <div className="admin-field">
          <label>Téléphone</label>
          <input name="phone" defaultValue={settings.phone} />
        </div>
        <div className="admin-field md:col-span-2">
          <label>Accroche</label>
          <input name="tagline" defaultValue={settings.tagline} />
        </div>
        <div className="admin-field">
          <label>Email</label>
          <input name="email" defaultValue={settings.email} />
        </div>
        <div className="admin-field">
          <label>Adresse</label>
          <input name="address" defaultValue={settings.address} />
        </div>
        <div className="admin-field md:col-span-2">
          <label>À propos (court)</label>
          <textarea name="aboutShort" defaultValue={settings.aboutShort} />
        </div>
        <div className="admin-field md:col-span-2">
          <label>À propos (long)</label>
          <textarea name="aboutLong" className="min-h-[10rem]" defaultValue={settings.aboutLong} />
        </div>
        <div className="admin-field">
          <label>Meta titre</label>
          <input name="metaTitle" defaultValue={settings.metaTitle} />
        </div>
        <div className="admin-field">
          <label>Meta description</label>
          <input name="metaDescription" defaultValue={settings.metaDescription} />
        </div>
        <div className="admin-field">
          <label>Hero image (URL)</label>
          <input name="heroImage" defaultValue={settings.heroImage} />
        </div>
        <div className="admin-field">
          <label>Hero vidéo (URL)</label>
          <input name="heroVideo" defaultValue={settings.heroVideo} />
        </div>
        <div className="admin-field">
          <label>Facebook</label>
          <input name="socialFacebook" defaultValue={settings.socialFacebook} />
        </div>
        <div className="admin-field">
          <label>Instagram</label>
          <input name="socialInstagram" defaultValue={settings.socialInstagram} />
        </div>
        <div className="admin-field">
          <label>YouTube</label>
          <input name="socialYoutube" defaultValue={settings.socialYoutube} />
        </div>
        <div className="admin-field">
          <label>X</label>
          <input name="socialX" defaultValue={settings.socialX} />
        </div>
        <div className="admin-field">
          <label>TikTok</label>
          <input name="socialTiktok" defaultValue={settings.socialTiktok} />
        </div>
        <label className="admin-check admin-field">
          <input type="checkbox" name="whatsappEnabled" defaultChecked={settings.whatsappEnabled} />
          WhatsApp activé
        </label>
      </div>
      {state.message ? (
        <p className={`mb-2 text-sm ${state.ok ? "text-emerald-300" : "text-red-300"}`}>
          {state.message}
        </p>
      ) : null}
      <SubmitButton>Enregistrer les paramètres</SubmitButton>
    </form>
  );
}

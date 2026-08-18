"use client";

import { useActionState } from "react";
import { saveSettings } from "@/actions/admin/settings";
import { AdminHint } from "@/components/admin/AdminHint";
import { MediaField } from "@/components/admin/MediaField";
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
  heroAlt?: string;
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
          <AdminHint>Nom affiché dans l’onglet du navigateur et le pied de page.</AdminHint>
        </div>
        <div className="admin-field">
          <label>Téléphone</label>
          <input name="phone" defaultValue={settings.phone} />
          <AdminHint>Numéro public (contact, WhatsApp si activé).</AdminHint>
        </div>
        <div className="admin-field md:col-span-2">
          <label>Accroche</label>
          <input name="tagline" defaultValue={settings.tagline} />
          <AdminHint>Phrase sous le logo, sur la page d’accueil.</AdminHint>
        </div>
        <div className="admin-field">
          <label>Email</label>
          <input name="email" defaultValue={settings.email} />
          <AdminHint>Email public affiché sur Contact.</AdminHint>
        </div>
        <div className="admin-field">
          <label>Adresse</label>
          <input name="address" defaultValue={settings.address} />
          <AdminHint>Adresse affichée en bas de page et sur Contact.</AdminHint>
        </div>
        <div className="admin-field md:col-span-2">
          <label>À propos (court)</label>
          <textarea name="aboutShort" defaultValue={settings.aboutShort} />
          <AdminHint>Résumé d’identité. Accueil et en-tête de la page À propos.</AdminHint>
        </div>
        <div className="admin-field md:col-span-2">
          <label>À propos (long)</label>
          <textarea name="aboutLong" className="min-h-[10rem]" defaultValue={settings.aboutLong} />
          <AdminHint>Texte long si la page « qui sommes-nous » n’a pas encore de contenu.</AdminHint>
        </div>
        <div className="admin-field">
          <label>Meta titre</label>
          <input name="metaTitle" defaultValue={settings.metaTitle} />
          <AdminHint>Titre SEO par défaut (Google, partage).</AdminHint>
        </div>
        <div className="admin-field">
          <label>Meta description</label>
          <input name="metaDescription" defaultValue={settings.metaDescription} />
          <AdminHint>Description SEO du site, ~150 caractères.</AdminHint>
        </div>
        <MediaField
          name="heroImage"
          label="Image du hero"
          defaultValue={settings.heroImage}
          kind="image"
          folder="settings"
          altName="heroAlt"
          defaultAlt={settings.heroAlt || ""}
          hint="Fond de la première page. Fichier ou lien. Ignoré si une vidéo hero est définie."
        />
        <MediaField
          name="heroVideo"
          label="Vidéo du hero"
          defaultValue={settings.heroVideo}
          kind="video"
          folder="settings"
          hint="Fond animé de l’accueil. YouTube / fichier MP4. Se joue en sourdine."
        />
        <div className="admin-field">
          <label>Facebook</label>
          <input name="socialFacebook" defaultValue={settings.socialFacebook} />
          <AdminHint>URL complète de la page Facebook.</AdminHint>
        </div>
        <div className="admin-field">
          <label>Instagram</label>
          <input name="socialInstagram" defaultValue={settings.socialInstagram} />
          <AdminHint>URL complète du compte Instagram.</AdminHint>
        </div>
        <div className="admin-field">
          <label>YouTube</label>
          <input name="socialYoutube" defaultValue={settings.socialYoutube} />
          <AdminHint>URL de la chaîne YouTube.</AdminHint>
        </div>
        <div className="admin-field">
          <label>X</label>
          <input name="socialX" defaultValue={settings.socialX} />
          <AdminHint>URL du compte X (Twitter).</AdminHint>
        </div>
        <div className="admin-field">
          <label>TikTok</label>
          <input name="socialTiktok" defaultValue={settings.socialTiktok} />
          <AdminHint>URL du compte TikTok.</AdminHint>
        </div>
        <div className="admin-field">
          <label className="admin-check">
            <input type="checkbox" name="whatsappEnabled" defaultChecked={settings.whatsappEnabled} />
            WhatsApp activé
          </label>
          <AdminHint>Affiche un bouton WhatsApp (utilise le téléphone ci-dessus).</AdminHint>
        </div>
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

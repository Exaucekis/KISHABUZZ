import Link from "next/link";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { AdminPageIntro } from "@/components/admin/AdminHint";
import { getSettings } from "@/lib/data";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Paramètres" };

export default async function AdminSettingsPage() {
  const [settings, pages] = await Promise.all([
    getSettings(),
    prisma.pageContent.findMany({ orderBy: { key: "asc" } }),
  ]);

  return (
    <div>
      <AdminPageIntro
        title="Paramètres"
        hint="Identité du site : nom, accroche, hero, réseaux. Enregistrez pour appliquer partout."
      />
      <SettingsForm settings={settings} />

      <section className="mt-8">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-[family-name:var(--font-syne)] text-xl font-bold">Contenus de pages</h2>
            <p className="admin-hint">Aperçu. Pour modifier, ouvrez Pages.</p>
          </div>
          <Link href="/admin/pages" className="admin-btn admin-btn-ghost text-xs">
            Gérer les pages
          </Link>
        </div>
        <div className="admin-card overflow-x-auto p-0">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Clé</th>
                <th>Titre</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((p) => (
                <tr key={p.id}>
                  <td>
                    <code className="text-xs">{p.key}</code>
                  </td>
                  <td>{p.title || "—"}</td>
                </tr>
              ))}
              {!pages.length ? (
                <tr>
                  <td colSpan={2} className="py-6 text-center text-[#9aa3b5]">
                    Aucune entrée PageContent.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

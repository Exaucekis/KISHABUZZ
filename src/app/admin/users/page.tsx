import { UsersManager } from "@/components/admin/UsersManager";
import { requireSuperAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Utilisateurs" };

export default async function AdminUsersPage() {
  const session = await requireSuperAdmin();
  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return (
    <div>
      <h1 className="mb-2 font-[family-name:var(--font-syne)] text-2xl font-bold">Utilisateurs</h1>
      <p className="mb-6 text-sm text-[#9aa3b5]">
        Le superadmin nomme les admins et gère tous les comptes, y compris les utilisateurs simples.
      </p>
      <UsersManager users={users} currentUserId={session.user.id} />
    </div>
  );
}

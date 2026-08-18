import { UsersManager } from "@/components/admin/UsersManager";
import { AdminPageIntro } from "@/components/admin/AdminHint";
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
      <AdminPageIntro
        title="Utilisateurs"
        hint="Le superadmin crée les comptes et choisit le rôle. USER = site seul. Staff = accès CMS."
      />
      <UsersManager users={users} currentUserId={session.user.id} />
    </div>
  );
}

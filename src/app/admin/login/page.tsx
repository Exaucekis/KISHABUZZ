import { Suspense } from "react";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata = {
  title: "Connexion admin",
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <p className="text-xs uppercase tracking-[0.22em] text-[#9aa3b5]">Administration</p>
        <h1 className="mt-2 font-[family-name:var(--font-syne)] text-3xl font-bold">
          KISHA BUZZ
        </h1>
      </div>
      <Suspense fallback={<div className="admin-card w-full max-w-md p-6">Chargement…</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}

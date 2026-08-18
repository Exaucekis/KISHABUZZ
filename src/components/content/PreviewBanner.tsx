import Link from "next/link";
import { statusLabel } from "@/lib/utils";

export function PreviewBanner({
  status,
  editHref,
}: {
  status: string;
  editHref: string;
}) {
  return (
    <div className="mb-6 rounded-md border border-amber-500/35 bg-[#2a1a08] px-4 py-3 text-sm text-amber-100">
      <p>
        <span className="font-semibold">Aperçu</span> — {statusLabel(status)}. Invisible du
        public.
      </p>
      <p className="mt-1">
        <Link href={editHref} className="underline underline-offset-2 hover:text-white">
          Retour à l’édition
        </Link>
      </p>
    </div>
  );
}

import { ArenaSubNav } from "@/components/arena/ArenaSubNav";
import "../../arena-culture.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function ArenaCultureLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="arena-space min-h-full">
      <div className="h-16 sm:h-[4.25rem]" aria-hidden />
      <ArenaSubNav />
      {children}
    </div>
  );
}

"use client";

import { usePathname } from "next/navigation";
import { ArenaAlertSignup } from "@/components/arena/ArenaAlertSignup";

export function ArenaAlertSignupGate() {
  const pathname = usePathname();
  if (pathname.includes("/alertes/desinscription")) return null;
  return <ArenaAlertSignup />;
}

import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Espace organisateur",
  robots: { index: false, follow: false },
};

export default function OrganizerLayout({ children }: { children: ReactNode }) {
  return children;
}

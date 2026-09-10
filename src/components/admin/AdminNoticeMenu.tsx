"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { markAdminNoticesRead } from "@/actions/admin/notices";
import { formatDate } from "@/lib/utils";

export type AdminNoticeDto = {
  id: string;
  title: string;
  body: string;
  href: string;
  read: boolean;
  createdAt: string;
};

export function AdminNoticeMenu({ notices }: { notices: AdminNoticeDto[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(() => notices.filter((item) => !item.read).length);
  const [pending, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setUnread(notices.filter((item) => !item.read).length));
    return () => window.cancelAnimationFrame(frame);
  }, [notices]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) {
      setUnread(0);
      startTransition(async () => {
        await markAdminNoticesRead();
        router.refresh();
      });
    }
  }

  return (
    <div className="admin-notice-menu" ref={rootRef}>
      <button
        type="button"
        className="admin-notice-bell"
        aria-label={unread ? `${unread} notification${unread > 1 ? "s" : ""}` : "Notifications"}
        aria-expanded={open}
        onClick={toggle}
      >
        <Bell className="h-5 w-5" aria-hidden />
        {unread > 0 ? <span className="admin-notice-count">{unread > 9 ? "9+" : unread}</span> : null}
      </button>
      {open ? (
        <div className="admin-notice-panel" role="menu">
          <p className="admin-notice-panel-title">Notifications{pending ? "…" : ""}</p>
          {notices.length ? (
            <ul>
              {notices.map((item) => (
                <li key={item.id}>
                  <Link href={item.href} className="admin-notice-item" onClick={() => setOpen(false)}>
                    <span className="admin-notice-item-title">{item.title}</span>
                    {item.body ? <span className="admin-notice-item-body">{item.body}</span> : null}
                    <span className="admin-notice-item-date">
                      {formatDate(item.createdAt, "d MMM HH:mm")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="admin-notice-empty">Aucune notification pour le moment.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

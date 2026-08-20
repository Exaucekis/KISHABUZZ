"use client";

import { useRef, useState, type ReactNode } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export function AdminConfirmForm({
  action,
  title,
  description,
  confirmLabel = "Supprimer",
  label,
  className,
  children,
}: {
  action: (formData: FormData) => void | Promise<void>;
  title: string;
  description: string;
  confirmLabel?: string;
  label: string;
  className?: string;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <>
      <form ref={formRef} action={action} className={className}>
        {children}
        <button type="button" className="admin-btn admin-btn-danger text-xs" onClick={() => setOpen(true)}>
          {label}
        </button>
      </form>
      <ConfirmDialog
        open={open}
        variant="danger"
        title={title}
        description={description}
        confirmLabel={confirmLabel}
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false);
          formRef.current?.requestSubmit();
        }}
      />
    </>
  );
}

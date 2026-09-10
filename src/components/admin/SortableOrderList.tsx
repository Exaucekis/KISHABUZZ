"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { moveIndex } from "@/lib/reorder";
import type { AdminActionState } from "@/lib/admin";

export type SortableItem = {
  id: string;
  label: string;
  hint?: string;
};

export function SortableOrderList({
  items,
  onReorder,
  empty = "Rien à classer pour le moment.",
}: {
  items: SortableItem[];
  onReorder: (ids: string[]) => Promise<AdminActionState>;
  empty?: string;
}) {
  const router = useRouter();
  const [rows, setRows] = useState(items);
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(true);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const savedKey = useRef(items.map((item) => item.id).join("|"));
  const rowsRef = useRef(items);

  useEffect(() => {
    rowsRef.current = items;
    savedKey.current = items.map((item) => item.id).join("|");
    const frame = window.requestAnimationFrame(() => setRows(items));
    return () => window.cancelAnimationFrame(frame);
  }, [items]);

  function persist(next: SortableItem[]) {
    const ids = next.map((item) => item.id);
    const key = ids.join("|");
    if (key === savedKey.current) return;
    startTransition(async () => {
      const result = await onReorder(ids);
      setOk(result.ok);
      setMessage(result.message);
      if (result.ok) {
        savedKey.current = key;
        router.refresh();
      } else {
        setRows(items);
        rowsRef.current = items;
      }
    });
  }

  function move(from: number, to: number) {
    const next = moveIndex(rowsRef.current, from, to);
    rowsRef.current = next;
    setRows(next);
    persist(next);
  }

  if (!items.length) {
    return <p className="text-sm text-[#9aa3b5]">{empty}</p>;
  }

  return (
    <div className="sortable-list admin-card">
      <p className="sortable-list-title">Ordre d’affichage</p>
      <p className="admin-hint">
        Glissez la poignée, ou utilisez les flèches. L’ordre est enregistré tout de suite.
      </p>
      <ul className="sortable-rows">
        {rows.map((row, index) => (
          <li
            key={row.id}
            data-sort-id={row.id}
            className={`sortable-row${draggingId === row.id ? " is-dragging" : ""}`}
          >
            <button
              type="button"
              className="sortable-handle"
              aria-label={`Déplacer ${row.label}`}
              disabled={pending}
              onPointerDown={(event) => {
                if (event.button !== 0) return;
                event.preventDefault();
                event.currentTarget.setPointerCapture(event.pointerId);
                setDraggingId(row.id);
              }}
              onPointerMove={(event) => {
                if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
                const list = event.currentTarget.closest(".sortable-rows");
                if (!list) return;
                const rowEls = [...list.querySelectorAll<HTMLElement>("[data-sort-id]")];
                const over = rowEls.find((el) => {
                  const box = el.getBoundingClientRect();
                  return event.clientY >= box.top && event.clientY <= box.bottom;
                });
                const overId = over?.dataset.sortId;
                if (!overId || overId === row.id) return;
                const next = moveIndex(
                  rowsRef.current,
                  rowsRef.current.findIndex((item) => item.id === row.id),
                  rowsRef.current.findIndex((item) => item.id === overId)
                );
                rowsRef.current = next;
                setRows(next);
              }}
              onPointerUp={(event) => {
                if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                  event.currentTarget.releasePointerCapture(event.pointerId);
                }
                setDraggingId(null);
                persist(rowsRef.current);
              }}
              onPointerCancel={(event) => {
                if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                  event.currentTarget.releasePointerCapture(event.pointerId);
                }
                setDraggingId(null);
                setRows(items);
                rowsRef.current = items;
              }}
            >
              <GripVertical size={18} />
            </button>
            <div className="sortable-meta">
              <span className="sortable-label">{row.label}</span>
              {row.hint ? <span className="sortable-hint">{row.hint}</span> : null}
            </div>
            <div className="sortable-arrows">
              <button
                type="button"
                className="sortable-arrow"
                aria-label={`Monter ${row.label}`}
                disabled={pending || index === 0}
                onClick={() => move(index, index - 1)}
              >
                <ChevronUp size={16} />
              </button>
              <button
                type="button"
                className="sortable-arrow"
                aria-label={`Descendre ${row.label}`}
                disabled={pending || index === rows.length - 1}
                onClick={() => move(index, index + 1)}
              >
                <ChevronDown size={16} />
              </button>
            </div>
          </li>
        ))}
      </ul>
      {pending ? <p className="sortable-status">Enregistrement…</p> : null}
      {message ? (
        <p className={`sortable-status ${ok ? "is-ok" : "is-err"}`}>{message}</p>
      ) : null}
    </div>
  );
}

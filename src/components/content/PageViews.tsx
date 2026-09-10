"use client";

import { useEffect, useState } from "react";
import { recordPageView } from "@/actions/views";
import { formatViews, hasRecentView, markView, type ViewKind } from "@/lib/page-views";

export function PageViews({
  kind,
  id,
  initial,
  record = true,
}: {
  kind: ViewKind;
  id: string;
  initial: number;
  record?: boolean;
}) {
  const [count, setCount] = useState(initial);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setCount(initial));
    return () => window.cancelAnimationFrame(frame);
  }, [initial]);

  useEffect(() => {
    if (!record || !id) return;
    if (hasRecentView(kind, id)) return;
    markView(kind, id);
    void recordPageView(kind, id).then((result) => {
      if (result.ok) setCount((current) => current + 1);
    });
  }, [kind, id, record]);

  return <span>{formatViews(count)}</span>;
}

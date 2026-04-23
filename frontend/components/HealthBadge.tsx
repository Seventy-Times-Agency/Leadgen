"use client";

import { useEffect, useState } from "react";

/**
 * Pings the backend /health endpoint once on mount and renders a tiny
 * badge showing whether the DB + app are reachable. Gives the user
 * immediate visual confirmation that Railway ⇄ Vercel plumbing works.
 */
type Status = "loading" | "healthy" | "unhealthy" | "unreachable";

export function HealthBadge() {
  const [status, setStatus] = useState<Status>("loading");
  const [commit, setCommit] = useState<string>("");

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      setStatus("unreachable");
      return;
    }
    fetch(`${apiUrl.replace(/\/$/, "")}/health`, { cache: "no-store" })
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        setCommit(body.commit ?? "");
        setStatus(res.ok && body.db ? "healthy" : "unhealthy");
      })
      .catch(() => setStatus("unreachable"));
  }, []);

  const color =
    status === "healthy"
      ? "text-emerald-400 border-emerald-800 bg-emerald-950/40"
      : status === "loading"
        ? "text-neutral-400 border-neutral-800 bg-neutral-900"
        : "text-red-400 border-red-900 bg-red-950/30";

  const label =
    status === "loading"
      ? "checking backend…"
      : status === "healthy"
        ? `backend healthy · ${commit || "unknown"}`
        : status === "unhealthy"
          ? "backend reachable but unhealthy"
          : "backend unreachable — set NEXT_PUBLIC_API_URL";

  return (
    <div
      className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-mono ${color}`}
    >
      <span className="size-2 rounded-full bg-current" />
      {label}
    </div>
  );
}

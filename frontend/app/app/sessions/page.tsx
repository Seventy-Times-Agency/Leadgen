"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { Icon } from "@/components/Icon";
import { SessionRow } from "@/components/app/SessionRow";
import { type SearchSummary, getSearches } from "@/lib/api";

export default function SessionsListPage() {
  const [sessions, setSessions] = useState<SearchSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSearches()
      .then(setSessions)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  return (
    <>
      <Topbar
        title="Sessions"
        subtitle="Every search you have launched"
        right={
          <Link href="/app/search" className="btn">
            <Icon name="plus" size={14} />
            New search
          </Link>
        }
      />
      <div className="page">
        {error && (
          <div
            className="card"
            style={{
              padding: 14,
              color: "var(--cold)",
              borderColor: "var(--cold)",
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}
        {sessions && sessions.length === 0 && !error && (
          <div
            className="card"
            style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}
          >
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>
              No searches yet
            </div>
            <div style={{ fontSize: 13, marginTop: 6 }}>
              Launch your first from the sidebar — it takes ~90 seconds.
            </div>
          </div>
        )}
        {sessions && sessions.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sessions.map((s) => (
              <SessionRow key={s.id} session={s} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

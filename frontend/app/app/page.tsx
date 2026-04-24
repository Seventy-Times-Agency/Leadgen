"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { SearchStatusPill } from "@/components/SearchStatusPill";
import { type SearchSummary, listSearches, readAuth } from "@/lib/api";
import { formatRelative } from "@/lib/format";

export default function DashboardPage() {
  const [searches, setSearches] = useState<SearchSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const creds = readAuth();
    if (!creds) return;
    listSearches(creds, 10)
      .then(setSearches)
      .catch((e: { detail?: string }) => {
        setError(e.detail ?? "Failed to load searches.");
      });
  }, []);

  const totalLeads = (searches ?? []).reduce(
    (acc, s) => acc + (s.leads_count ?? 0),
    0
  );
  const hotLeads = (searches ?? []).reduce(
    (acc, s) => acc + (s.hot_leads_count ?? 0),
    0
  );
  const avg =
    (searches ?? []).filter((s) => s.avg_score != null).length === 0
      ? null
      : Math.round(
          (searches ?? [])
            .filter((s) => s.avg_score != null)
            .reduce((acc, s) => acc + (s.avg_score ?? 0), 0) /
            (searches ?? []).filter((s) => s.avg_score != null).length
        );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>
            Workspace
          </div>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            Dashboard
          </h1>
        </div>
        <Link href="/app/search" className="btn">
          + New search
        </Link>
      </header>

      {/* KPI strip */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
        }}
      >
        <KpiCard
          label="Searches"
          value={searches == null ? null : String(searches.length)}
          sub="last 10"
        />
        <KpiCard
          label="Leads collected"
          value={searches == null ? null : String(totalLeads)}
          sub="across all sessions"
        />
        <KpiCard
          label="Hot leads"
          value={searches == null ? null : String(hotLeads)}
          sub="ready for outreach"
          accent="var(--hot)"
        />
        <KpiCard
          label="Avg AI score"
          value={searches == null ? null : avg == null ? "—" : `${avg}/100`}
          sub="across enriched leads"
          accent="var(--accent)"
        />
      </section>

      {/* Recent searches */}
      <section>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>
            Recent searches
          </h2>
          <Link
            href="/app/searches"
            style={{ fontSize: 13, color: "var(--accent)" }}
          >
            View all →
          </Link>
        </div>

        {error && (
          <div
            className="card"
            style={{ borderColor: "var(--cold)", color: "var(--cold)" }}
          >
            {error}
          </div>
        )}

        {!error && searches == null && (
          <div className="card">
            <div
              className="skeleton"
              style={{ width: "60%", height: 16, marginBottom: 12 }}
            />
            <div className="skeleton" style={{ width: "40%", height: 12 }} />
          </div>
        )}

        {searches != null && searches.length === 0 && (
          <EmptyState />
        )}

        {searches != null && searches.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {searches.map((s) => (
              <SearchRow key={s.id} search={s} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | null;
  sub: string;
  accent?: string;
}) {
  return (
    <div className="card">
      <div className="eyebrow" style={{ marginBottom: 10 }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          color: accent ?? "var(--text)",
          minHeight: 38,
        }}
      >
        {value ?? <span className="skeleton" style={{ width: 60, height: 28 }} />}
      </div>
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
        {sub}
      </div>
    </div>
  );
}

function SearchRow({ search }: { search: SearchSummary }) {
  return (
    <Link
      href={`/app/searches/${search.id}`}
      className="card card-hover"
      style={{
        display: "grid",
        gridTemplateColumns: "1.5fr 1fr 100px 120px 110px",
        gap: 16,
        alignItems: "center",
        padding: "16px 20px",
      }}
    >
      <div>
        <div style={{ fontWeight: 600, fontSize: 15 }}>{search.niche}</div>
        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
          {search.region}
        </div>
      </div>
      <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
        {formatRelative(search.created_at)}
      </div>
      <div className="mono" style={{ fontSize: 14 }}>
        {search.leads_count} leads
      </div>
      <div className="mono" style={{ fontSize: 14, color: "var(--hot)" }}>
        {search.hot_leads_count ?? 0} hot
      </div>
      <SearchStatusPill status={search.status} />
    </Link>
  );
}

function EmptyState() {
  return (
    <div
      className="card"
      style={{ padding: 48, textAlign: "center", position: "relative", overflow: "hidden" }}
    >
      <div className="mesh-bg" style={{ opacity: 0.6 }} />
      <div style={{ position: "relative" }}>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
          No searches yet.
        </div>
        <div
          style={{
            fontSize: 14,
            color: "var(--text-muted)",
            marginBottom: 20,
          }}
        >
          Run your first one — describe the niche and the region.
        </div>
        <Link href="/app/search" className="btn">
          Start a search →
        </Link>
      </div>
    </div>
  );
}

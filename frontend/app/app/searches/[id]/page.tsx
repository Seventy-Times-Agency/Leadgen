"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { SearchStatusPill } from "@/components/SearchStatusPill";
import {
  type AuthCreds,
  type LeadOut,
  type SearchDetail,
  downloadExcel,
  getSearch,
  readAuth,
  subscribeProgress,
} from "@/lib/api";
import { formatDuration, formatRelative } from "@/lib/format";

export default function SearchDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const [creds, setCreds] = useState<AuthCreds | null>(null);
  const [data, setData] = useState<SearchDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const [livePhase, setLivePhase] = useState<{
    title: string;
    subtitle: string;
  } | null>(null);
  const [done, setDone] = useState(0);
  const [total, setTotal] = useState(0);

  const sseUnsub = useRef<(() => void) | null>(null);

  const refresh = useCallback(
    async (c: AuthCreds, sid: string) => {
      try {
        const detail = await getSearch(c, sid);
        setData(detail);
        return detail;
      } catch (e) {
        const err = e as { detail?: string; status?: number };
        setError(err.detail ?? "Failed to load search.");
        return null;
      }
    },
    []
  );

  useEffect(() => {
    const c = readAuth();
    if (!c || !id) return;
    setCreds(c);
    refresh(c, id).then((detail) => {
      if (!detail) return;
      if (detail.status === "running" || detail.status === "pending") {
        sseUnsub.current = subscribeProgress(c, id, {
          onPhase: (title, subtitle) => setLivePhase({ title, subtitle }),
          onUpdate: (d, t) => {
            setDone(d);
            setTotal(t);
          },
          onDone: () => {
            // Final fetch once the stream closes.
            refresh(c, id);
          },
        });
      }
    });
    return () => {
      sseUnsub.current?.();
    };
  }, [id, refresh]);

  if (error) {
    return (
      <div
        className="card"
        style={{ borderColor: "var(--cold)", color: "var(--cold)" }}
      >
        {error}
      </div>
    );
  }
  if (!data) {
    return (
      <div className="card">
        <div
          className="skeleton"
          style={{ width: "60%", height: 16, marginBottom: 12 }}
        />
        <div className="skeleton" style={{ width: "40%", height: 12 }} />
      </div>
    );
  }

  const stats = data.stats ?? {};
  const progressPct = total > 0 ? Math.round((done / total) * 100) : 0;
  const isRunning = data.status === "running" || data.status === "pending";

  const handleExcel = async () => {
    if (!creds || !id) return;
    setDownloading(true);
    try {
      const filename = `leads_${data.niche}_${data.region}.xlsx`.replace(
        /[^a-z0-9_.-]/gi,
        "_"
      );
      await downloadExcel(creds, id, filename);
    } catch (e) {
      const err = e as { detail?: string };
      setError(err.detail ?? "Excel export failed.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <header
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div>
          <button
            type="button"
            onClick={() => router.push("/app/searches")}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              color: "var(--text-muted)",
              padding: 0,
              marginBottom: 10,
            }}
          >
            ← All sessions
          </button>
          <h1
            style={{
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            {data.niche}
          </h1>
          <div
            style={{
              fontSize: 14,
              color: "var(--text-muted)",
              marginTop: 6,
              display: "flex",
              gap: 12,
              alignItems: "center",
            }}
          >
            <span>{data.region}</span>
            <span>·</span>
            <span>created {formatRelative(data.created_at)}</span>
            <span>·</span>
            <span>
              took {formatDuration(data.created_at, data.finished_at)}
            </span>
            <SearchStatusPill status={data.status} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/app/search" className="btn btn-ghost">
            + New search
          </Link>
          <button
            type="button"
            className="btn"
            onClick={handleExcel}
            disabled={downloading || data.leads.length === 0}
          >
            {downloading ? "Preparing…" : "Download Excel"}
          </button>
        </div>
      </header>

      {isRunning && (
        <div className="card" style={{ padding: 20 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>
            Live progress
          </div>
          {livePhase ? (
            <>
              <div
                style={{ fontWeight: 600, marginBottom: 4 }}
                dangerouslySetInnerHTML={{
                  __html: stripHtml(livePhase.title),
                }}
              />
              <div
                style={{ fontSize: 13, color: "var(--text-muted)" }}
                dangerouslySetInnerHTML={{
                  __html: stripHtml(livePhase.subtitle),
                }}
              />
            </>
          ) : (
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
              Connecting to live stream…
            </div>
          )}
          {total > 0 && (
            <div style={{ marginTop: 14 }}>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div
                className="mono"
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  marginTop: 6,
                }}
              >
                {done}/{total} · {progressPct}%
              </div>
            </div>
          )}
        </div>
      )}

      {data.error && data.status === "failed" && (
        <div
          className="card"
          style={{ borderColor: "var(--cold)", color: "var(--cold)" }}
        >
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Search failed</div>
          <div style={{ fontSize: 13 }}>{data.error}</div>
        </div>
      )}

      {/* Stats strip */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14,
        }}
      >
        <Stat label="Total" value={data.leads_count} />
        <Stat
          label="Avg score"
          value={
            data.avg_score != null
              ? `${Math.round(data.avg_score)}/100`
              : "—"
          }
        />
        <Stat
          label="Hot"
          value={data.hot_leads_count ?? 0}
          accent="var(--hot)"
        />
        <Stat
          label="With website"
          value={
            stats.with_website != null
              ? `${stats.with_website}/${stats.total ?? data.leads_count}`
              : "—"
          }
        />
      </section>

      {/* Insights */}
      {data.insights && (
        <section
          className="card"
          style={{
            background: "var(--accent-soft)",
            border:
              "1px solid color-mix(in srgb, var(--accent) 25%, transparent)",
            padding: 24,
          }}
        >
          <div className="eyebrow" style={{ marginBottom: 10 }}>
            What this means for sales
          </div>
          <div
            style={{
              fontSize: 14.5,
              lineHeight: 1.6,
              color: "var(--text)",
              whiteSpace: "pre-wrap",
            }}
          >
            {data.insights}
          </div>
        </section>
      )}

      {/* Leads list */}
      <section>
        <h2 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 14px" }}>
          Leads ({data.leads.length})
        </h2>
        {data.leads.length === 0 ? (
          <div
            className="card"
            style={{ padding: 28, textAlign: "center", color: "var(--text-muted)" }}
          >
            {isRunning
              ? "No leads yet — they'll show up once enrichment completes."
              : "No leads were found for this query."}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {data.leads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent?: string;
}) {
  return (
    <div className="card">
      <div className="eyebrow" style={{ marginBottom: 8 }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          color: accent ?? "var(--text)",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function LeadCard({ lead }: { lead: LeadOut }) {
  const tag = scoreTag(lead.score_ai);
  return (
    <div className="card card-hover">
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 8,
        }}
      >
        <div style={{ fontWeight: 600, fontSize: 16 }}>{lead.name}</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {lead.score_ai != null && (
            <span
              className={`chip chip-${tag}`}
              style={{ textTransform: "capitalize" }}
            >
              {tag} · {Math.round(lead.score_ai)}
            </span>
          )}
          {lead.rating != null && (
            <span className="chip">
              ★ {lead.rating}
              {lead.reviews_count ? ` (${lead.reviews_count})` : ""}
            </span>
          )}
        </div>
      </div>

      {lead.summary && (
        <div
          style={{
            fontSize: 14,
            color: "var(--text-muted)",
            lineHeight: 1.55,
            marginBottom: 12,
          }}
        >
          {lead.summary}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginBottom: 12,
        }}
      >
        {lead.advice && (
          <Block label="How to open" body={lead.advice} accent="var(--accent)" />
        )}
        {lead.weaknesses && lead.weaknesses.length > 0 && (
          <Block
            label="Weaknesses"
            body={lead.weaknesses.slice(0, 4).join(" · ")}
          />
        )}
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 14,
          fontSize: 13,
          color: "var(--text-muted)",
        }}
      >
        {lead.category && <span>{lead.category}</span>}
        {lead.address && <span>📍 {lead.address}</span>}
        {lead.phone && <span>📞 {lead.phone}</span>}
        {lead.website && (
          <a
            href={lead.website}
            target="_blank"
            rel="noreferrer"
            style={{ color: "var(--accent)" }}
          >
            {lead.website}
          </a>
        )}
      </div>

      {lead.red_flags && lead.red_flags.length > 0 && (
        <div
          style={{
            marginTop: 12,
            padding: "10px 12px",
            borderRadius: 10,
            background: "color-mix(in srgb, var(--cold) 6%, transparent)",
            border: "1px solid color-mix(in srgb, var(--cold) 20%, transparent)",
            fontSize: 13,
            color: "var(--cold)",
          }}
        >
          ⚠ {lead.red_flags.join(" · ")}
        </div>
      )}
    </div>
  );
}

function Block({
  label,
  body,
  accent,
}: {
  label: string;
  body: string;
  accent?: string;
}) {
  return (
    <div
      style={{
        padding: 12,
        borderRadius: 10,
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
      }}
    >
      <div
        className="eyebrow"
        style={{ marginBottom: 6, color: accent ?? "var(--text-dim)" }}
      >
        {label}
      </div>
      <div style={{ fontSize: 13.5, lineHeight: 1.5, color: "var(--text)" }}>
        {body}
      </div>
    </div>
  );
}

function scoreTag(score: number | null): "hot" | "warm" | "cold" {
  if (score == null) return "cold";
  if (score >= 75) return "hot";
  if (score >= 50) return "warm";
  return "cold";
}

function stripHtml(s: string): string {
  return s.replace(/<\/?[^>]+>/g, "");
}

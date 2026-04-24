"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { Icon } from "@/components/Icon";
import { SessionRow } from "@/components/app/SessionRow";
import {
  type DashboardStats,
  type Lead,
  type SearchSummary,
  getAllLeads,
  getSearches,
  getStats,
  tempOf,
} from "@/lib/api";
import { DEMO_USER } from "@/lib/demoUser";

export default function DashboardPage() {
  const [sessions, setSessions] = useState<SearchSummary[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [hotLeads, setHotLeads] = useState<Lead[]>([]);
  const [sessionTitles, setSessionTitles] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [s, st, ls] = await Promise.all([
          getSearches(),
          getStats(),
          getAllLeads({ limit: 50 }),
        ]);
        if (cancelled) return;
        setSessions(s);
        setStats(st);
        const byScore = [...ls.leads]
          .filter((l) => tempOf(l.score_ai) === "hot")
          .sort((a, b) => (b.score_ai ?? 0) - (a.score_ai ?? 0))
          .slice(0, 3);
        setHotLeads(byScore);
        const titles: Record<string, string> = {};
        for (const [id, meta] of Object.entries(ls.sessions_by_id)) {
          titles[id] = `${meta.niche} · ${meta.region}`;
        }
        setSessionTitles(titles);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const greeting = new Date().getHours() < 12 ? "morning" : "afternoon";
  const running = sessions.filter((s) => s.status === "running");

  return (
    <>
      <Topbar
        title={`Good ${greeting}, ${DEMO_USER.name}`}
        subtitle="Here's what's happening in your workspace."
        right={
          <Link href="/app/search" className="btn">
            <Icon name="plus" size={15} />
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
              marginBottom: 20,
              borderColor: "var(--cold)",
              color: "var(--cold)",
            }}
          >
            Can&apos;t reach the backend — {error}. Check NEXT_PUBLIC_API_URL.
          </div>
        )}

        {/* Hero stat strip */}
        <div
          style={{
            position: "relative",
            padding: "32px 28px",
            borderRadius: 16,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            overflow: "hidden",
            marginBottom: 24,
          }}
        >
          <div className="mesh-bg" style={{ opacity: 0.4 }} />
          <div
            style={{
              position: "relative",
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 20,
            }}
          >
            {[
              {
                n: stats?.sessions_total ?? 0,
                l: "Sessions run",
                sub: `${running.length} active now`,
              },
              {
                n: stats?.leads_total ?? 0,
                l: "Leads analyzed",
                sub: "across all sessions",
              },
              {
                n: stats?.hot_total ?? 0,
                l: "Hot leads",
                sub: "ready for outreach",
                color: "var(--hot)",
              },
              {
                n: stats ? stats.warm_total + stats.cold_total : 0,
                l: "Warm + cold",
                sub: "worth a second pass",
                color: "var(--accent)",
              },
            ].map((s) => (
              <div key={s.l}>
                <div
                  style={{
                    fontSize: 44,
                    fontWeight: 700,
                    letterSpacing: "-0.03em",
                    color: s.color || "var(--text)",
                  }}
                >
                  {s.n}
                </div>
                <div className="eyebrow" style={{ marginTop: 4 }}>{s.l}</div>
                <div
                  style={{
                    fontSize: 12.5,
                    color: "var(--text-muted)",
                    marginTop: 4,
                  }}
                >
                  {s.sub}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active + quick actions */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.6fr 1fr",
            gap: 20,
            marginBottom: 24,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <div>
                <div className="eyebrow">Recent sessions</div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 600,
                    letterSpacing: "-0.01em",
                    marginTop: 4,
                  }}
                >
                  Your searches
                </div>
              </div>
              <Link
                href="/app/sessions"
                style={{ fontSize: 13, color: "var(--accent)" }}
              >
                View all →
              </Link>
            </div>
            {sessions.length === 0 && !error ? (
              <EmptyHint
                title="No searches yet"
                body="Launch your first search from the sidebar — it takes about 90 seconds."
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {sessions.slice(0, 4).map((s) => (
                  <SessionRow key={s.id} session={s} />
                ))}
              </div>
            )}
          </div>

          <div>
            <div style={{ marginBottom: 14 }}>
              <div className="eyebrow">Start now</div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                  marginTop: 4,
                }}
              >
                Quick actions
              </div>
            </div>
            <Link
              href="/app/search"
              className="card card-hover"
              style={{
                display: "block",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                background: "linear-gradient(135deg, var(--surface), var(--surface-2))",
              }}
            >
              <Icon name="sparkles" size={22} style={{ color: "var(--accent)" }} />
              <div style={{ fontSize: 16, fontWeight: 600, marginTop: 12, marginBottom: 6 }}>
                Launch a new search
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                  lineHeight: 1.5,
                }}
              >
                Describe your target niche and region. Lumen will handle the rest.
              </div>
            </Link>
            <Link
              href="/app/leads"
              className="card card-hover"
              style={{ display: "block", cursor: "pointer", marginTop: 10 }}
            >
              <Icon name="list" size={22} style={{ color: "var(--text-muted)" }} />
              <div style={{ fontSize: 16, fontWeight: 600, marginTop: 12, marginBottom: 6 }}>
                Open the lead base
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
                Search, filter and organize every lead you&apos;ve collected.
              </div>
            </Link>
          </div>
        </div>

        {/* Hot leads */}
        {hotLeads.length > 0 && (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <div>
                <div className="eyebrow">Hot this week</div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 600,
                    letterSpacing: "-0.01em",
                    marginTop: 4,
                  }}
                >
                  Top-scoring leads
                </div>
              </div>
              <Link
                href="/app/leads"
                style={{ fontSize: 13, color: "var(--accent)" }}
              >
                Open CRM →
              </Link>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 14,
              }}
            >
              {hotLeads.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/app/sessions/${lead.query_id}`}
                  className="card card-hover"
                  style={{ display: "block", cursor: "pointer" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      marginBottom: 10,
                    }}
                  >
                    <div className="chip chip-hot">
                      <span className="status-dot hot" />
                      hot
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 22,
                        fontWeight: 700,
                        color: "var(--hot)",
                      }}
                    >
                      {Math.round(lead.score_ai ?? 0)}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      letterSpacing: "-0.005em",
                      marginBottom: 4,
                    }}
                  >
                    {lead.name}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--text-muted)",
                      marginBottom: 12,
                    }}
                  >
                    {sessionTitles[lead.query_id] ?? lead.address ?? ""}
                  </div>
                  {lead.summary && (
                    <div
                      style={{
                        fontSize: 13,
                        color: "var(--text-muted)",
                        lineHeight: 1.5,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {lead.summary}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function EmptyHint({ title, body }: { title: string; body: string }) {
  return (
    <div
      className="card"
      style={{
        padding: "32px 24px",
        textAlign: "center",
        color: "var(--text-muted)",
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>
        {title}
      </div>
      <div style={{ fontSize: 13, marginTop: 6 }}>{body}</div>
    </div>
  );
}

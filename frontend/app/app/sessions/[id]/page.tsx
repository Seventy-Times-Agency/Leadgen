"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { Icon } from "@/components/Icon";
import { LeadCard } from "@/components/app/LeadCard";
import { LeadDetailModal } from "@/components/app/LeadDetailModal";
import {
  type Lead,
  type LeadTemp,
  type SearchSummary,
  getSearch,
  getSearchLeads,
  tempOf,
} from "@/lib/api";

type Filter = "all" | LeadTemp;

export default function SessionDetailPage() {
  const params = useParams<{ id: string }>();
  const searchId = params.id;

  const [session, setSession] = useState<SearchSummary | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [active, setActive] = useState<Lead | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [s, ls] = await Promise.all([
          getSearch(searchId),
          getSearchLeads(searchId),
        ]);
        if (cancelled) return;
        setSession(s);
        setLeads(ls);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [searchId]);

  const tempCounts = useMemo(() => {
    const counts: Record<LeadTemp, number> = { hot: 0, warm: 0, cold: 0 };
    for (const l of leads) counts[tempOf(l.score_ai)]++;
    return counts;
  }, [leads]);

  const filtered = useMemo(
    () => (filter === "all" ? leads : leads.filter((l) => tempOf(l.score_ai) === filter)),
    [filter, leads],
  );

  const insights =
    session?.status === "done" && session.leads_count > 0
      ? `Session run for ${session.niche} in ${session.region}. Prioritize the ${tempCounts.hot} hot leads — they have the strongest signals in reviews + site quality.`
      : null;

  return (
    <>
      <Topbar
        crumbs={[
          { label: "Workspace", href: "/app" },
          { label: "Sessions", href: "/app/sessions" },
          { label: session?.niche ?? "…" },
        ]}
        right={
          <button className="btn btn-sm" type="button" disabled>
            <Icon name="download" size={14} /> Excel
          </button>
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

        {session && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto auto auto auto",
                gap: 16,
                marginBottom: 24,
                alignItems: "center",
              }}
            >
              <div>
                <div className="eyebrow" style={{ marginBottom: 6 }}>
                  <Icon
                    name="mapPin"
                    size={11}
                    style={{ verticalAlign: "-2px", marginRight: 4 }}
                  />
                  {session.region}
                </div>
                <div
                  style={{
                    fontSize: 38,
                    fontWeight: 700,
                    letterSpacing: "-0.025em",
                    lineHeight: 1.05,
                  }}
                >
                  {session.niche}
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                  <span className="chip">{session.status}</span>
                  <span className="chip">{session.source}</span>
                </div>
              </div>
              {[
                { n: session.leads_count, l: "total", c: "var(--text)" },
                { n: tempCounts.hot, l: "hot", c: "var(--hot)" },
                { n: tempCounts.warm, l: "warm", c: "#B45309" },
                { n: tempCounts.cold, l: "cold", c: "var(--cold)" },
              ].map((s) => (
                <div key={s.l} style={{ textAlign: "right", minWidth: 70 }}>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 700,
                      color: s.c,
                      fontFamily: "var(--font-mono)",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {s.n}
                  </div>
                  <div className="eyebrow" style={{ fontSize: 10 }}>{s.l}</div>
                </div>
              ))}
            </div>

            {insights && (
              <div
                className="card"
                style={{
                  padding: "20px 24px",
                  marginBottom: 20,
                  background:
                    "linear-gradient(135deg, var(--surface), color-mix(in srgb, var(--accent) 4%, var(--surface)))",
                  border:
                    "1px solid color-mix(in srgb, var(--accent) 20%, var(--border))",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: "var(--accent-soft)",
                      display: "grid",
                      placeItems: "center",
                      color: "var(--accent)",
                      flexShrink: 0,
                    }}
                  >
                    <Icon name="sparkles" size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      className="eyebrow"
                      style={{ marginBottom: 4, color: "var(--accent)" }}
                    >
                      AI market insight
                    </div>
                    <div
                      style={{
                        fontSize: 15,
                        lineHeight: 1.55,
                        color: "var(--text)",
                        maxWidth: 820,
                      }}
                    >
                      {insights}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <div className="seg">
                {(["all", "hot", "warm", "cold"] as const).map((k) => (
                  <button
                    key={k}
                    className={filter === k ? "active" : ""}
                    onClick={() => setFilter(k)}
                    type="button"
                  >
                    {k !== "all" && (
                      <span
                        className={"status-dot " + k}
                        style={{ marginRight: 6 }}
                      />
                    )}
                    {k === "all" ? `All · ${leads.length}` : `${k} · ${tempCounts[k]}`}
                  </button>
                ))}
              </div>
            </div>

            {leads.length === 0 && session.status !== "running" && (
              <div
                className="card"
                style={{
                  padding: 32,
                  textAlign: "center",
                  color: "var(--text-muted)",
                }}
              >
                No leads stored for this session yet. If it just completed, refresh
                in a couple seconds.
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: 14,
              }}
            >
              {filtered.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onClick={() => setActive(lead)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {active && (
        <LeadDetailModal
          lead={active}
          onClose={() => setActive(null)}
          onUpdated={(updated) => {
            setLeads((prev) =>
              prev.map((l) => (l.id === updated.id ? updated : l)),
            );
          }}
        />
      )}
    </>
  );
}

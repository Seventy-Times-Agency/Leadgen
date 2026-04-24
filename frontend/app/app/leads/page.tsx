"use client";

import { useEffect, useMemo, useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Icon } from "@/components/Icon";
import { LeadCard } from "@/components/app/LeadCard";
import { LeadDetailModal } from "@/components/app/LeadDetailModal";
import {
  type Lead,
  type LeadListResponse,
  type LeadStatus,
  getAllLeads,
  tempOf,
} from "@/lib/api";

type View = "list" | "kanban" | "grid";
type Filter = "all" | LeadStatus;

const STATUS_ORDER: LeadStatus[] = [
  "new",
  "contacted",
  "replied",
  "won",
  "archived",
];

export default function LeadsCRMPage() {
  const [data, setData] = useState<LeadListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>("list");
  const [filter, setFilter] = useState<Filter>("all");
  const [active, setActive] = useState<Lead | null>(null);

  useEffect(() => {
    getAllLeads({ limit: 500 })
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  const sessions = data?.sessions_by_id ?? {};
  const leads = data?.leads ?? [];

  const filtered = useMemo(
    () => (filter === "all" ? leads : leads.filter((l) => l.lead_status === filter)),
    [filter, leads],
  );

  const statusCounts = useMemo(() => {
    const counts: Record<LeadStatus, number> = {
      new: 0,
      contacted: 0,
      replied: 0,
      won: 0,
      archived: 0,
    };
    for (const l of leads) counts[l.lead_status]++;
    return counts;
  }, [leads]);

  const updateLocalLead = (updated: Lead) => {
    setData((d) =>
      d
        ? {
            ...d,
            leads: d.leads.map((l) => (l.id === updated.id ? updated : l)),
          }
        : d,
    );
  };

  return (
    <>
      <Topbar
        title="All leads"
        subtitle={`${leads.length} leads across ${
          Object.keys(sessions).length
        } sessions`}
        right={
          <button className="btn btn-ghost btn-sm" type="button" disabled>
            <Icon name="download" size={14} /> Export
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

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
            gap: 12,
          }}
        >
          <div className="seg">
            <button
              type="button"
              className={filter === "all" ? "active" : ""}
              onClick={() => setFilter("all")}
            >
              all · {leads.length}
            </button>
            {STATUS_ORDER.map((s) => (
              <button
                key={s}
                type="button"
                className={filter === s ? "active" : ""}
                onClick={() => setFilter(s)}
              >
                {s} · {statusCounts[s]}
              </button>
            ))}
          </div>
          <div className="seg">
            <button
              type="button"
              className={view === "list" ? "active" : ""}
              onClick={() => setView("list")}
            >
              <Icon name="list" size={14} />
            </button>
            <button
              type="button"
              className={view === "kanban" ? "active" : ""}
              onClick={() => setView("kanban")}
            >
              <Icon name="kanban" size={14} />
            </button>
            <button
              type="button"
              className={view === "grid" ? "active" : ""}
              onClick={() => setView("grid")}
            >
              <Icon name="grid" size={14} />
            </button>
          </div>
        </div>

        {leads.length === 0 && !error && (
          <div
            className="card"
            style={{
              padding: 32,
              textAlign: "center",
              color: "var(--text-muted)",
            }}
          >
            No leads yet. Run your first search from the sidebar.
          </div>
        )}

        {view === "list" && filtered.length > 0 && (
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th />
                  <th>Lead</th>
                  <th>Session</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Last touched</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => {
                  const session = sessions[l.query_id];
                  const score = Math.round(l.score_ai ?? 0);
                  const temp = tempOf(l.score_ai);
                  return (
                    <tr
                      key={l.id}
                      style={{ cursor: "pointer" }}
                      onClick={() => setActive(l)}
                    >
                      <td style={{ width: 24 }}>
                        <span className={"status-dot " + temp} />
                      </td>
                      <td>
                        <div style={{ fontSize: 13.5, fontWeight: 600 }}>
                          {l.name}
                        </div>
                        <div
                          style={{ fontSize: 11.5, color: "var(--text-muted)" }}
                        >
                          {l.address}
                        </div>
                      </td>
                      <td>
                        {session ? (
                          <span className="chip" style={{ fontSize: 11 }}>
                            {session.niche} · {session.region}
                          </span>
                        ) : (
                          <span style={{ color: "var(--text-dim)" }}>—</span>
                        )}
                      </td>
                      <td>
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontWeight: 700,
                            color:
                              score >= 75
                                ? "var(--hot)"
                                : score >= 50
                                  ? "#B45309"
                                  : "var(--cold)",
                          }}
                        >
                          {score}
                        </span>
                      </td>
                      <td>
                        <span className="chip" style={{ fontSize: 11 }}>
                          {l.lead_status}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        {l.last_touched_at ? relative(l.last_touched_at) : "—"}
                      </td>
                      <td>
                        <Icon
                          name="chevronRight"
                          size={14}
                          style={{ color: "var(--text-dim)" }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {view === "kanban" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 14,
            }}
          >
            {STATUS_ORDER.map((col) => {
              const items = leads.filter((l) => l.lead_status === col);
              return (
                <div
                  key={col}
                  style={{
                    background: "var(--surface-2)",
                    borderRadius: 12,
                    padding: 12,
                    minHeight: 400,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 12,
                      padding: "0 4px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        textTransform: "capitalize",
                      }}
                    >
                      {col}
                    </div>
                    <div
                      className="chip"
                      style={{ fontSize: 11, background: "var(--surface)" }}
                    >
                      {items.length}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {items.map((l) => {
                      const score = Math.round(l.score_ai ?? 0);
                      const temp = tempOf(l.score_ai);
                      return (
                        <div
                          key={l.id}
                          className="card"
                          style={{ padding: 12, cursor: "pointer" }}
                          onClick={() => setActive(l)}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: 6,
                            }}
                          >
                            <span className={"status-dot " + temp} />
                            <span
                              style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: 12,
                                fontWeight: 700,
                                color: score >= 75 ? "var(--hot)" : "#B45309",
                              }}
                            >
                              {score}
                            </span>
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                            {l.name}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                            {l.address}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {view === "grid" && filtered.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 14,
            }}
          >
            {filtered.map((l) => (
              <LeadCard key={l.id} lead={l} onClick={() => setActive(l)} />
            ))}
          </div>
        )}
      </div>

      {active && (
        <LeadDetailModal
          lead={active}
          onClose={() => setActive(null)}
          onUpdated={updateLocalLead}
        />
      )}
    </>
  );
}

function relative(ts: string): string {
  const then = new Date(ts).getTime();
  if (Number.isNaN(then)) return "—";
  const diff = Date.now() - then;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

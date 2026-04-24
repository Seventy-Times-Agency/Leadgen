"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Icon } from "@/components/Icon";

interface HealthSummary {
  status: string;
  db: boolean;
  commit: string;
}

export default function SettingsPage() {
  const [health, setHealth] = useState<HealthSummary | null>(null);
  const [queueEnabled, setQueueEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "";
    if (!base) return;
    const root = base.replace(/\/$/, "");
    fetch(`${root}/health`)
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth(null));
    fetch(`${root}/api/v1/queue/status`)
      .then((r) => r.json())
      .then((b) => setQueueEnabled(b.queue_enabled))
      .catch(() => setQueueEnabled(null));
  }, []);

  const integrations: Array<{ name: string; status: "connected" | "pending"; detail?: string }> = [
    { name: "Google Places", status: "connected", detail: "GOOGLE_PLACES_API_KEY" },
    { name: "Anthropic (Claude)", status: "connected", detail: "ANTHROPIC_API_KEY" },
    { name: "Telegram bot", status: "connected", detail: "BOT_TOKEN" },
    {
      name: "Redis job queue",
      status: queueEnabled ? "connected" : "pending",
      detail: queueEnabled
        ? "arq worker processes searches"
        : "inline asyncio fallback — enable REDIS_URL to scale",
    },
    { name: "Email delivery", status: "pending", detail: "planned with login" },
  ];

  return (
    <>
      <Topbar title="Settings" subtitle="Workspace configuration" />
      <div className="page" style={{ maxWidth: 720 }}>
        <div className="card" style={{ padding: 24, marginBottom: 14 }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>Workspace</div>
          <KV label="Workspace name" value="Leadgen (demo)" />
          <div style={{ marginTop: 16 }}>
            <KV label="Auth" value="Open demo — login lands next milestone" />
          </div>
        </div>

        <div className="card" style={{ padding: 24, marginBottom: 14 }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>Backend status</div>
          <KV
            label="API health"
            value={
              health
                ? `${health.status} · db=${health.db ? "ok" : "down"}`
                : "reachable? check NEXT_PUBLIC_API_URL"
            }
          />
          <div style={{ marginTop: 16 }}>
            <KV
              label="Deployed commit"
              value={health?.commit ?? "unknown"}
              mono
            />
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>Integrations</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {integrations.map((i, k) => (
              <div
                key={i.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 0",
                  borderBottom:
                    k < integrations.length - 1
                      ? "1px solid var(--border)"
                      : "none",
                }}
              >
                <div>
                  <div style={{ fontSize: 14 }}>{i.name}</div>
                  {i.detail && (
                    <div style={{ fontSize: 11.5, color: "var(--text-dim)" }}>
                      {i.detail}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    className="status-dot"
                    style={{
                      background:
                        i.status === "connected"
                          ? "var(--hot)"
                          : "var(--text-dim)",
                    }}
                  />
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {i.status === "connected" ? "connected" : "not configured"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <a
          href="/prototype/index.html"
          className="btn btn-ghost"
          style={{ marginTop: 20 }}
        >
          <Icon name="eye" size={14} />
          View the Figma-style prototype
        </a>
      </div>
    </>
  );
}

function KV({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="eyebrow" style={{ marginBottom: 6 }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 14,
          fontFamily: mono ? "var(--font-mono)" : undefined,
        }}
      >
        {value}
      </div>
    </div>
  );
}

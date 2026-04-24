import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Two-column auth shell ported from prototype/auth.jsx. Used by the
 * /login and /register pages, which are currently placeholders — the
 * "open demo" mode means any visitor can land straight on /app.
 */
export function AuthShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        background: "var(--bg)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "40px 56px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "linear-gradient(135deg, var(--accent), #6a7bff)",
              display: "grid",
              placeItems: "center",
              color: "white",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            L
          </div>
          <Link href="/" style={{ fontWeight: 700, fontSize: 15 }}>
            Leadgen
          </Link>
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
          <div style={{ width: "100%", maxWidth: 400 }}>
            <h1
              style={{
                fontSize: 44,
                fontWeight: 700,
                letterSpacing: "-0.03em",
                lineHeight: 1.02,
                margin: "0 0 12px",
              }}
            >
              {title}
            </h1>
            {children}
          </div>
        </div>
        <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
          © 2026 Leadgen · Team access only
        </div>
      </div>

      <div
        style={{
          position: "relative",
          overflow: "hidden",
          background: "var(--surface)",
          borderLeft: "1px solid var(--border)",
        }}
      >
        <div className="mesh-bg">
          <div className="blob3" />
        </div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: 56,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          <div className="eyebrow" style={{ marginBottom: 16 }}>
            Inside
          </div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
              color: "var(--text)",
              maxWidth: 380,
            }}
          >
            50 AI-scored prospects. Every search. Personalized to what{" "}
            <span style={{ fontStyle: "italic", color: "var(--text-muted)" }}>
              you
            </span>{" "}
            sell.
          </div>
          <div
            style={{
              display: "flex",
              gap: 14,
              marginTop: 32,
              color: "var(--text-muted)",
              fontSize: 13,
            }}
          >
            <span>Google Places</span> · <span>Claude Haiku</span> ·{" "}
            <span>Live enrichment</span>
          </div>
        </div>
      </div>
    </div>
  );
}

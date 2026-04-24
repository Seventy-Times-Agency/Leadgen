"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { PREVIEW_LEADS } from "@/lib/mockLeads";

/**
 * Public marketing landing. Ported from frontend/public/prototype/landing.jsx
 * so the live site matches the signed-off design.
 *
 * Keeps inline styles (matching the prototype) rather than rewriting to
 * Tailwind — preserves exact spacing/typography while the rest of the site
 * is still being ported.
 */
export default function HomePage() {
  const [niche, setNiche] = useState("");
  const [region, setRegion] = useState("");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Nav */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "color-mix(in srgb, var(--bg) 85%, transparent)",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "16px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <LogoMark />
            <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em" }}>
              Leadgen
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link href="/prototype/index.html" className="btn btn-ghost btn-sm">
              Open prototype
            </Link>
            <Link href="/prototype/index.html#/register" className="btn btn-sm">
              Request access
            </Link>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section style={{ position: "relative", padding: "80px 32px 120px", overflow: "hidden" }}>
        <div className="mesh-bg">
          <div className="blob3" />
        </div>
        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", textAlign: "center" }}>
          <div className="eyebrow" style={{ marginBottom: 28 }}>
            <span className="status-dot live" style={{ marginRight: 8 }} />
            B2B lead intelligence — live in 90 seconds
          </div>
          <h1
            style={{
              fontSize: "clamp(52px, 8vw, 112px)",
              fontWeight: 700,
              letterSpacing: "-0.045em",
              lineHeight: 0.95,
              margin: "0 0 32px",
              textWrap: "balance",
            } as CSSProperties}
          >
            The first{" "}
            <span
              style={{
                background: "linear-gradient(120deg, var(--accent), #EC4899, #F59E0B)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              50 prospects
            </span>
            <br />
            that actually
            <br />
            fit your service.
          </h1>
          <p
            style={{
              fontSize: 19,
              color: "var(--text-muted)",
              maxWidth: 620,
              margin: "0 auto 40px",
              lineHeight: 1.55,
              textWrap: "balance",
            } as CSSProperties}
          >
            Describe who you&apos;re selling to. We pull every match from Google Places,
            scan their sites and reviews, and hand you an AI-scored list with a custom
            pitch for each one.
          </p>

          {/* Live search bar */}
          <div
            style={{
              maxWidth: 720,
              margin: "0 auto 20px",
              display: "grid",
              gridTemplateColumns: "1fr 220px auto",
              gap: 8,
              padding: 8,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <input
              className="input"
              placeholder="roofing companies"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              style={{ border: "none", background: "transparent", fontSize: 16, padding: "14px 16px" }}
            />
            <input
              className="input"
              placeholder="New York"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              style={{
                border: "none",
                borderLeft: "1px solid var(--border)",
                background: "transparent",
                fontSize: 16,
                padding: "14px 16px",
                borderRadius: 0,
              }}
            />
            <Link
              href="/prototype/index.html#/register"
              className="btn btn-lg"
              style={{ justifyContent: "center" }}
            >
              Run search <Icon name="arrow" size={16} />
            </Link>
          </div>
          <div style={{ fontSize: 12.5, color: "var(--text-dim)" }}>
            Try it with your own niche — we&apos;ll show you what we&apos;d find
          </div>
        </div>

        {/* Hero preview */}
        <div style={{ maxWidth: 1100, margin: "80px auto 0", position: "relative" }}>
          <LandingPreview />
        </div>
      </section>

      {/* Stats */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 32px 100px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 0,
            border: "1px solid var(--border)",
            borderRadius: 16,
            background: "var(--surface)",
            overflow: "hidden",
          }}
        >
          {[
            { num: "90s", label: "Avg. search time" },
            { num: "50", label: "Leads per query" },
            { num: "87%", label: "Contact-info accuracy" },
            { num: "12×", label: "Faster than manual" },
          ].map((s, i) => (
            <div
              key={s.label}
              style={{
                padding: "28px 24px",
                borderRight: i < 3 ? "1px solid var(--border)" : "none",
              }}
            >
              <div
                style={{
                  fontSize: 42,
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  color: "var(--accent)",
                }}
              >
                {s.num}
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--text-dim)",
                  marginTop: 4,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px 120px" }}>
        <div className="eyebrow" style={{ marginBottom: 14 }}>
          How it works
        </div>
        <h2
          style={{
            fontSize: 56,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1.02,
            margin: "0 0 64px",
            maxWidth: 780,
          }}
        >
          From niche to{" "}
          <span style={{ fontStyle: "italic", fontWeight: 400, color: "var(--text-muted)" }}>
            outreach-ready
          </span>{" "}
          list, without the grunt work.
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {[
            {
              n: "01",
              t: "Describe your target",
              d: "Type a niche and a region. That's it — no filter matrix, no form fatigue. Our assistant can help you narrow it too.",
            },
            {
              n: "02",
              t: "We search, enrich, score",
              d: "We pull matches from Google Places, visit every site, grab socials and reviews, and pass each lead through Claude for a personalized score.",
            },
            {
              n: "03",
              t: "Work them in your CRM",
              d: "Every lead gets an AI-written pitch tailored to your offer. Mark status, add notes, hand off to your team, export to Excel.",
            },
          ].map((s) => (
            <div key={s.n} className="card" style={{ padding: "28px 24px", position: "relative" }}>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--text-dim)",
                  marginBottom: 20,
                }}
              >
                {s.n}
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                  marginBottom: 10,
                }}
              >
                {s.t}
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.55, color: "var(--text-muted)" }}>{s.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          padding: "80px 32px",
          borderTop: "1px solid var(--border)",
          background: "var(--surface)",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <h2
            style={{
              fontSize: 64,
              fontWeight: 700,
              letterSpacing: "-0.04em",
              lineHeight: 0.98,
              margin: "0 0 24px",
            }}
          >
            Stop prospecting.
            <br />
            <span style={{ fontStyle: "italic", fontWeight: 400, color: "var(--text-muted)" }}>
              Start closing.
            </span>
          </h2>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 36 }}>
            <Link href="/prototype/index.html#/register" className="btn btn-lg">
              Request team access <Icon name="arrow" size={16} />
            </Link>
            <Link href="/prototype/index.html" className="btn btn-ghost btn-lg">
              Explore the prototype
            </Link>
          </div>
        </div>
      </section>

      <footer
        style={{
          padding: "30px 32px",
          borderTop: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12.5,
          color: "var(--text-dim)",
        }}
      >
        <div>© 2026 Leadgen. Built for agencies.</div>
        <div style={{ display: "flex", gap: 20 }}>
          <a>Privacy</a>
          <a>Terms</a>
          <a>Contact</a>
        </div>
      </footer>
    </div>
  );
}

function LogoMark() {
  return (
    <div
      style={{
        width: 26,
        height: 26,
        borderRadius: 7,
        background: "linear-gradient(135deg, var(--accent), #6a7bff)",
        display: "grid",
        placeItems: "center",
        color: "white",
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      L
    </div>
  );
}

function LandingPreview() {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 20,
        overflow: "hidden",
        boxShadow: "0 40px 100px -20px rgba(15, 15, 20, 0.18)",
        transform: "perspective(1800px) rotateX(3deg)",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid var(--border)",
          background: "var(--surface-2)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF5F57" }} />
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FEBC2E" }} />
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#28C840" }} />
        </div>
        <div
          style={{
            flex: 1,
            textAlign: "center",
            fontSize: 12,
            color: "var(--text-muted)",
            fontFamily: "var(--font-mono)",
          }}
        >
          leadgen.app/sessions/roofing-nyc
        </div>
      </div>
      <div
        style={{
          padding: 28,
          display: "grid",
          gridTemplateColumns: "200px 1fr",
          gap: 20,
          minHeight: 420,
        }}
      >
        <div>
          <div className="eyebrow" style={{ marginBottom: 14, fontSize: 9 }}>
            Session
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Roofing · NYC</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>
            48 leads analyzed
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12 }}>
            <PreviewStatLine label="Hot" count={9} temp="hot" />
            <PreviewStatLine label="Warm" count={22} temp="warm" />
            <PreviewStatLine label="Cold" count={17} temp="cold" />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {PREVIEW_LEADS.map((l) => (
            <div
              key={l.id}
              style={{
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "12px 14px",
                display: "grid",
                gridTemplateColumns: "auto 1fr auto auto",
                alignItems: "center",
                gap: 14,
              }}
            >
              <span className={"status-dot " + l.temp} />
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13.5,
                    fontWeight: 600,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {l.name}
                </div>
                <div
                  style={{
                    fontSize: 11.5,
                    color: "var(--text-muted)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {l.address}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  color: "var(--text-muted)",
                  fontSize: 12,
                }}
              >
                <Icon name="star" size={12} /> {l.rating}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  fontWeight: 600,
                  color:
                    l.score >= 75
                      ? "var(--hot)"
                      : l.score >= 50
                        ? "var(--warm)"
                        : "var(--cold)",
                }}
              >
                {l.score}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PreviewStatLine({
  label,
  count,
  temp,
}: {
  label: string;
  count: number;
  temp: "hot" | "warm" | "cold";
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span style={{ color: "var(--text-muted)" }}>
        <span className={"status-dot " + temp} style={{ marginRight: 6 }} />
        {label}
      </span>
      <span className="mono">{count}</span>
    </div>
  );
}

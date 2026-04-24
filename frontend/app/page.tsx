"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const STATS = [
  { num: "90s", label: "Avg. search time" },
  { num: "50", label: "Leads per query" },
  { num: "87%", label: "Contact-info accuracy" },
  { num: "12×", label: "Faster than manual" },
];

const STEPS = [
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
    t: "Work them as a list",
    d: "Every lead gets an AI-written pitch tailored to your offer. Sort by score, open the details, export the full base to Excel.",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [niche, setNiche] = useState("");
  const [region, setRegion] = useState("");

  const startSearch = () => {
    const qs = new URLSearchParams();
    if (niche.trim()) qs.set("niche", niche.trim());
    if (region.trim()) qs.set("region", region.trim());
    const query = qs.toString();
    router.push(`/login${query ? `?${query}` : ""}`);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Top nav */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background:
            "color-mix(in srgb, var(--bg) 85%, transparent)",
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
          <Link href="/" className="sidebar-logo">
            <span className="sidebar-logo-mark">L</span>
            <span>Leadgen</span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link href="/login" className="btn btn-ghost btn-sm">
              Sign in
            </Link>
            <Link href="/login" className="btn btn-sm">
              Open workspace
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        style={{
          position: "relative",
          padding: "80px 32px 120px",
          overflow: "hidden",
        }}
      >
        <div className="mesh-bg" style={{ inset: "-80px -80px auto -80px", height: 620 }} />
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            position: "relative",
            textAlign: "center",
          }}
        >
          <div
            className="eyebrow"
            style={{
              marginBottom: 28,
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span className="status-dot live" />
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
            }}
          >
            The first{" "}
            <span
              style={{
                background:
                  "linear-gradient(120deg, var(--accent), #ec4899, #f59e0b)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
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
            }}
          >
            Describe who you're selling to. We pull every match from Google
            Places, scan their sites and reviews, and hand you an AI-scored
            list with a custom pitch for each one.
          </p>

          {/* Live search bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              startSearch();
            }}
            style={{
              maxWidth: 720,
              margin: "0 auto 18px",
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
              style={{
                border: "none",
                background: "transparent",
                fontSize: 16,
                padding: "14px 16px",
              }}
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
            <button type="submit" className="btn btn-lg">
              Run search →
            </button>
          </form>
          <div style={{ fontSize: 12.5, color: "var(--text-dim)" }}>
            Try it with your own niche — we'll show you what we'd find
          </div>
        </div>

        {/* Fake dashboard preview */}
        <div
          style={{
            maxWidth: 1100,
            margin: "80px auto 0",
            position: "relative",
            padding: "0 32px",
          }}
        >
          <LandingPreview />
        </div>
      </section>

      {/* Stats row */}
      <section
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "20px 32px 100px",
        }}
      >
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
          {STATS.map((s, i) => (
            <div
              key={s.label}
              style={{
                padding: "28px 24px",
                borderRight: i < STATS.length - 1 ? "1px solid var(--border)" : "none",
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
      <section
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 32px 120px",
        }}
      >
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
          <span
            style={{
              fontStyle: "italic",
              fontWeight: 400,
              color: "var(--text-muted)",
            }}
          >
            outreach-ready
          </span>{" "}
          list, without the grunt work.
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
          }}
        >
          {STEPS.map((s) => (
            <div key={s.n} className="card" style={{ padding: "28px 24px" }}>
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
              <div
                style={{
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: "var(--text-muted)",
                }}
              >
                {s.d}
              </div>
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
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            textAlign: "center",
            position: "relative",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(42px, 7vw, 64px)",
              fontWeight: 700,
              letterSpacing: "-0.04em",
              lineHeight: 0.98,
              margin: "0 0 24px",
            }}
          >
            Stop prospecting.
            <br />
            <span
              style={{
                fontStyle: "italic",
                fontWeight: 400,
                color: "var(--text-muted)",
              }}
            >
              Start closing.
            </span>
          </h2>
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              marginTop: 36,
            }}
          >
            <Link href="/login" className="btn btn-lg">
              Open workspace →
            </Link>
            <a
              href="https://t.me/seventytimes_leadgen_bot"
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost btn-lg"
            >
              Or use the Telegram bot
            </a>
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
          <span>Seventy Times Agency</span>
        </div>
      </footer>
    </div>
  );
}

function LandingPreview() {
  const leads = [
    { name: "Apex Urban Roofing", address: "Brooklyn, NY", rating: 4.7, score: 88, temp: "hot" },
    { name: "Hudson Valley Roofers", address: "Yonkers, NY", rating: 4.5, score: 78, temp: "hot" },
    { name: "Bronx Skyline Roof Co.", address: "Bronx, NY", rating: 4.2, score: 62, temp: "warm" },
    { name: "Queens Rooftop LLC", address: "Queens, NY", rating: 3.9, score: 41, temp: "cold" },
  ];
  const color = (t: string) =>
    t === "hot" ? "var(--hot)" : t === "warm" ? "var(--warm)" : "var(--cold)";

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
          minHeight: 360,
        }}
      >
        <div>
          <div className="eyebrow" style={{ marginBottom: 14, fontSize: 9 }}>
            Session
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
            Roofing · NYC
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>
            48 leads analyzed
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12 }}>
            {[
              { label: "Hot", value: 9, dot: "hot" },
              { label: "Warm", value: 22, dot: "warm" },
              { label: "Cold", value: 17, dot: "cold" },
            ].map((r) => (
              <div
                key={r.label}
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <span style={{ color: "var(--text-muted)" }}>
                  <span
                    className={`status-dot ${r.dot}`}
                    style={{ marginRight: 6 }}
                  />
                  {r.label}
                </span>
                <span className="mono">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {leads.map((l) => (
            <div
              key={l.name}
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
              <span className={`status-dot ${l.temp}`} />
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13.5,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {l.name}
                </div>
                <div
                  style={{
                    fontSize: 11.5,
                    color: "var(--text-muted)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
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
                ★ {l.rating}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  fontWeight: 600,
                  color: color(l.temp),
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

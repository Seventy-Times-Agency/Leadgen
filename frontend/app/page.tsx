import Link from "next/link";

import { HealthBadge } from "@/components/HealthBadge";

const FEATURES = [
  {
    title: "Google Maps + reviews, parsed",
    body: "Pulls every matching company in the region with rating, reviews, phone and website — straight from Google Places.",
  },
  {
    title: "AI scoring per lead",
    body: "Every site is read by Claude, scored 0–100 against what you sell, and tagged hot / warm / cold so you skip the dead weight.",
  },
  {
    title: "Outreach advice baked in",
    body: "For every hot lead you get a one-line opener, a list of weak spots to use as hooks, and red flags to avoid. Excel export included.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Describe the niche",
    body: 'Type "roofing companies in New York" or "design studios in Berlin". Free-form, multilingual.',
  },
  {
    n: "02",
    title: "Watch it work, live",
    body: "Real-time progress: discovery → website fetch → AI analysis. Usually 60–120 seconds end to end.",
  },
  {
    n: "03",
    title: "Get a ready base",
    body: "50 scored prospects with summaries, weak spots, contacts and an outreach-ready Excel sheet.",
  },
];

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Top nav */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          backdropFilter: "blur(20px)",
          background: "color-mix(in srgb, var(--bg) 86%, transparent)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            maxWidth: 1180,
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
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <HealthBadge />
            <Link href="/login" className="btn btn-ghost btn-sm">
              Sign in
            </Link>
            <Link href="/login?mode=register" className="btn btn-sm">
              Open the app
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        style={{
          position: "relative",
          padding: "100px 32px 80px",
          maxWidth: 1180,
          margin: "0 auto",
        }}
      >
        <div className="mesh-bg" style={{ inset: "-40px -40px auto -40px", height: 540 }} />
        <div
          style={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: 60,
            alignItems: "center",
          }}
        >
          <div>
            <div className="eyebrow" style={{ marginBottom: 18 }}>
              Seventy Times Agency · Lead Generator
            </div>
            <h1
              style={{
                fontSize: 64,
                fontWeight: 700,
                letterSpacing: "-0.035em",
                lineHeight: 1.02,
                margin: "0 0 20px",
              }}
            >
              Qualified B2B leads,{" "}
              <span style={{ color: "var(--accent)" }}>in under two minutes.</span>
            </h1>
            <p
              style={{
                fontSize: 19,
                lineHeight: 1.55,
                color: "var(--text-muted)",
                margin: "0 0 32px",
                maxWidth: 540,
              }}
            >
              Describe what you're looking for. The system pulls matching
              companies from Google Maps, reads their websites and reviews,
              scores each one with Claude and hands back a ready-to-contact
              base with outreach advice.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <Link href="/login?mode=register" className="btn btn-lg">
                Start a search →
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
            <div
              style={{
                marginTop: 36,
                display: "flex",
                gap: 18,
                color: "var(--text-muted)",
                fontSize: 13,
              }}
            >
              <span>Google Places</span>
              <span>·</span>
              <span>Claude Haiku 4.5</span>
              <span>·</span>
              <span>Live enrichment</span>
            </div>
          </div>

          <div
            className="card"
            style={{
              background:
                "linear-gradient(135deg, var(--surface), var(--surface-2))",
              padding: 28,
              boxShadow: "var(--shadow-lg)",
              border: "1px solid var(--border-strong)",
            }}
          >
            <div className="eyebrow" style={{ marginBottom: 14 }}>
              Sample output
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 16 }}>
                Roofing co · Brooklyn
              </div>
              <span className="chip chip-hot">hot · 88</span>
            </div>
            <div
              style={{
                color: "var(--text-muted)",
                fontSize: 13,
                marginBottom: 18,
                lineHeight: 1.5,
              }}
            >
              Family-run, 4.7★ on Google · slow Wix site · no booking flow ·
              great fit for a redesign + lead form.
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 18,
              }}
            >
              <div className="chip chip-accent">redesign opportunity</div>
              <div className="chip chip-accent">slow page speed</div>
              <div className="chip">no online booking</div>
              <div className="chip">good reviews</div>
            </div>

            <div
              style={{
                padding: 14,
                borderRadius: 10,
                background: "var(--accent-soft)",
                border: "1px solid color-mix(in srgb, var(--accent) 25%, transparent)",
                fontSize: 13,
                lineHeight: 1.55,
                color: "var(--text)",
              }}
            >
              <b>How to open:</b> reference their 4.7★ reviews and propose a
              50% faster homepage with a 1-click quote form. Mention you've
              done it for two other Brooklyn contractors.
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "60px 32px",
          borderTop: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 18,
          }}
        >
          {FEATURES.map((f) => (
            <div key={f.title} className="card">
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 10 }}>
                {f.title}
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: "var(--text-muted)",
                  lineHeight: 1.55,
                }}
              >
                {f.body}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "60px 32px",
        }}
      >
        <div className="eyebrow" style={{ marginBottom: 12 }}>
          How it works
        </div>
        <h2
          style={{
            fontSize: 36,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            margin: "0 0 36px",
          }}
        >
          From a one-liner to a hot list, in three steps.
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 18,
          }}
        >
          {STEPS.map((s) => (
            <div key={s.n} className="card">
              <div
                className="mono"
                style={{
                  fontSize: 13,
                  color: "var(--accent)",
                  marginBottom: 10,
                }}
              >
                {s.n}
              </div>
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>
                {s.title}
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: "var(--text-muted)",
                  lineHeight: 1.55,
                }}
              >
                {s.body}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "60px 32px 120px",
        }}
      >
        <div
          className="card"
          style={{
            position: "relative",
            overflow: "hidden",
            padding: 56,
            textAlign: "center",
            background: "linear-gradient(135deg, var(--surface), var(--surface-2))",
            border: "1px solid var(--border-strong)",
          }}
        >
          <div className="mesh-bg" style={{ opacity: 0.6 }} />
          <div style={{ position: "relative" }}>
            <h2
              style={{
                fontSize: 38,
                fontWeight: 700,
                letterSpacing: "-0.025em",
                margin: "0 0 14px",
              }}
            >
              Stop scrolling Maps. Start sending pitches.
            </h2>
            <p
              style={{
                fontSize: 17,
                color: "var(--text-muted)",
                margin: "0 auto 28px",
                maxWidth: 520,
                lineHeight: 1.55,
              }}
            >
              Open the workspace, paste your team API key, and run your first
              search. Five free searches, no card.
            </p>
            <Link href="/login?mode=register" className="btn btn-lg">
              Open the workspace →
            </Link>
          </div>
        </div>
      </section>

      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "28px 32px",
          color: "var(--text-muted)",
          fontSize: 13,
          display: "flex",
          justifyContent: "space-between",
          maxWidth: 1180,
          margin: "0 auto",
        }}
      >
        <span>© 2026 Seventy Times Agency · Built for our team and yours.</span>
        <span>Made with Claude · FastAPI · Next.js</span>
      </footer>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { Icon } from "@/components/Icon";
import { DEMO_USER } from "@/lib/demoUser";
import { createSearch } from "@/lib/api";
import { useProgress } from "@/lib/useProgress";

type Phase = "compose" | "running" | "done";

interface ChatMsg {
  role: "bot" | "user";
  text: string;
}

const GREETING =
  "Hi — I'm Lumen, your Leadgen copilot. Tell me who you're looking for and I'll build you a list in ~90 seconds.";
const QUICK_PROMPTS = [
  "Roofing contractors in New York",
  "Coffee shops in Astana",
  "Interior designers in Berlin",
  "Orthodontic clinics in London",
];

export default function NewSearchPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("compose");
  const [niche, setNiche] = useState("");
  const [region, setRegion] = useState("");
  const [profession, setProfession] = useState(
    "web design & dev for small businesses",
  );
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: "bot", text: GREETING },
  ]);
  const [draft, setDraft] = useState("");
  const [searchId, setSearchId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const parseNicheRegion = (
    text: string,
  ): { niche: string; region: string } | null => {
    const m = text.match(/(.+?)\s+(?:in|at|around|near)\s+(.+)/i);
    if (m) return { niche: m[1].trim(), region: m[2].trim() };
    const parts = text.split(/,\s*/);
    if (parts.length === 2) {
      return { niche: parts[0].trim(), region: parts[1].trim() };
    }
    return null;
  };

  const handleMessage = (text: string) => {
    if (!text.trim()) return;
    const next = [...messages, { role: "user" as const, text }];
    setMessages(next);
    setDraft("");
    const parsed = parseNicheRegion(text);
    if (parsed) {
      setNiche(parsed.niche);
      setRegion(parsed.region);
      setMessages((m) => [
        ...m,
        {
          role: "bot",
          text: `Got it — **${parsed.niche}** in **${parsed.region}**. Click Launch when ready, or tweak the form on the right.`,
        },
      ]);
    } else {
      setMessages((m) => [
        ...m,
        {
          role: "bot",
          text: 'Tell me the niche and the region, e.g. "roofing companies in New York".',
        },
      ]);
    }
  };

  const launch = async () => {
    if (!niche || !region) return;
    setSubmitError(null);
    try {
      const resp = await createSearch({
        niche,
        region,
        profession: profession || undefined,
      });
      setSearchId(resp.id);
      setPhase("running");
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : String(e));
    }
  };

  if (phase === "compose") {
    return (
      <>
        <Topbar
          crumbs={[
            { label: "Workspace", href: "/app" },
            { label: "New search" },
          ]}
          right={
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => router.push("/app")}
              type="button"
            >
              Cancel
            </button>
          }
        />
        <div
          className="page"
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: 24,
            maxWidth: 1200,
          }}
        >
          <div
            className="card"
            style={{
              padding: 0,
              display: "flex",
              flexDirection: "column",
              height: "calc(100vh - 140px)",
              minHeight: 520,
            }}
          >
            <div
              style={{
                padding: "18px 22px",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--accent), #EC4899)",
                  display: "grid",
                  placeItems: "center",
                  color: "white",
                }}
              >
                <Icon name="sparkles" size={16} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Lumen</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  <span
                    className="status-dot live"
                    style={{ marginRight: 6, width: 6, height: 6 }}
                  />
                  Your search copilot
                </div>
              </div>
            </div>

            <div
              ref={chatRef}
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "20px 22px",
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              {messages.map((m, i) => (
                <ChatBubble key={i} msg={m} />
              ))}
              {messages.length <= 2 && (
                <div style={{ marginTop: 8 }}>
                  <div
                    className="eyebrow"
                    style={{ marginBottom: 10, fontSize: 10 }}
                  >
                    Try one of these
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {QUICK_PROMPTS.map((p) => (
                      <button
                        key={p}
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleMessage(p)}
                        style={{ justifyContent: "flex-start" }}
                      >
                        <Icon name="arrow" size={13} />
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div
              style={{
                padding: "14px 16px",
                borderTop: "1px solid var(--border)",
                display: "flex",
                gap: 8,
              }}
            >
              <input
                className="input"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleMessage(draft);
                }}
                placeholder="Describe who you're looking for…"
              />
              <button
                type="button"
                className="btn btn-icon"
                onClick={() => handleMessage(draft)}
                style={{
                  background: "var(--accent)",
                  color: "white",
                  width: 40,
                  height: 40,
                }}
              >
                <Icon name="send" size={16} />
              </button>
            </div>
          </div>

          {/* Right — structured form */}
          <div>
            <div className="eyebrow" style={{ marginBottom: 6 }}>
              Search parameters
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 600,
                letterSpacing: "-0.02em",
                marginBottom: 4,
              }}
            >
              Or set it manually
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--text-muted)",
                marginBottom: 24,
              }}
            >
              Lumen auto-fills these as you chat.
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <FormField label="Niche">
                <input
                  className="input"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="roofing companies"
                />
              </FormField>
              <FormField label="Region">
                <input
                  className="input"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="New York, NY"
                />
              </FormField>
              <FormField label="Your offer (for AI scoring)">
                <textarea
                  className="textarea"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  rows={3}
                  placeholder="e.g. I build SEO-optimized websites for local contractors"
                />
                <div
                  style={{
                    fontSize: 11.5,
                    color: "var(--text-dim)",
                    marginTop: 6,
                  }}
                >
                  Claude uses this to personalize every score and pitch.
                </div>
              </FormField>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "14px 16px",
                  background: "var(--surface-2)",
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                }}
              >
                <Icon name="zap" size={18} style={{ color: "var(--warm)" }} />
                <div
                  style={{
                    fontSize: 12.5,
                    color: "var(--text-muted)",
                    flex: 1,
                  }}
                >
                  Up to 50 leads · 60–120 seconds · live progress below.
                </div>
              </div>

              {submitError && (
                <div style={{ fontSize: 13, color: "var(--cold)" }}>
                  {submitError}
                </div>
              )}

              <button
                type="button"
                className="btn btn-lg"
                disabled={!niche || !region}
                onClick={launch}
                style={{
                  justifyContent: "center",
                  marginTop: 8,
                  opacity: !niche || !region ? 0.5 : 1,
                }}
              >
                <Icon name="sparkles" size={16} /> Launch search
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (phase === "running" && searchId) {
    return <RunningView searchId={searchId} niche={niche} region={region} onDone={() => setPhase("done")} />;
  }

  return <DoneView searchId={searchId!} niche={niche} region={region} />;
}

function ChatBubble({ msg }: { msg: ChatMsg }) {
  const isBot = msg.role === "bot";
  const parts = msg.text.split("**");
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        flexDirection: isBot ? "row" : "row-reverse",
      }}
    >
      {isBot ? (
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--accent), #EC4899)",
            display: "grid",
            placeItems: "center",
            color: "white",
            flexShrink: 0,
          }}
        >
          <Icon name="sparkles" size={13} />
        </div>
      ) : (
        <div className="avatar avatar-sm" style={{ background: DEMO_USER.color }}>
          {DEMO_USER.initials}
        </div>
      )}
      <div
        style={{
          maxWidth: "78%",
          padding: "10px 14px",
          background: isBot ? "var(--surface-2)" : "var(--accent)",
          color: isBot ? "var(--text)" : "white",
          border: isBot ? "1px solid var(--border)" : "none",
          borderRadius: 14,
          borderTopLeftRadius: isBot ? 4 : 14,
          borderTopRightRadius: isBot ? 14 : 4,
          fontSize: 13.5,
          lineHeight: 1.5,
        }}
      >
        {parts.map((part, i) =>
          i % 2 === 1 ? <b key={i}>{part}</b> : <span key={i}>{part}</span>,
        )}
      </div>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "var(--text-muted)",
          marginBottom: 6,
          display: "block",
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function RunningView({
  searchId,
  niche,
  region,
  onDone,
}: {
  searchId: string;
  niche: string;
  region: string;
  onDone: () => void;
}) {
  const progress = useProgress(searchId);
  const router = useRouter();

  useEffect(() => {
    if (progress.closed) {
      // Short grace period so the final phase render is visible.
      const t = setTimeout(onDone, 800);
      return () => clearTimeout(t);
    }
  }, [progress.closed, onDone]);

  const pct =
    progress.total > 0
      ? Math.round((progress.done / progress.total) * 100)
      : progress.phaseTitle
        ? 15
        : 0;

  return (
    <>
      <Topbar
        crumbs={[
          { label: "Workspace", href: "/app" },
          { label: "Search in progress" },
        ]}
      />
      <div className="page" style={{ maxWidth: 900 }}>
        <div
          className="card"
          style={{ padding: "40px 44px", position: "relative", overflow: "hidden" }}
        >
          <div className="mesh-bg" style={{ opacity: 0.5 }} />
          <div className="hud-corner tl" />
          <div className="hud-corner tr" />
          <div className="hud-corner bl" />
          <div className="hud-corner br" />
          <div style={{ position: "relative" }}>
            <div className="eyebrow" style={{ marginBottom: 14 }}>
              <span className="status-dot live" style={{ marginRight: 8 }} />
              {progress.closed ? "Complete" : "Searching"}
            </div>
            <div
              style={{
                fontSize: 36,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                lineHeight: 1.05,
                marginBottom: 12,
                maxWidth: 600,
              }}
            >
              {niche}{" "}
              <span style={{ fontStyle: "italic", fontWeight: 400, color: "var(--text-muted)" }}>
                in
              </span>{" "}
              {region}
            </div>
            <div
              style={{
                fontSize: 14,
                color: "var(--text-muted)",
                marginBottom: 32,
              }}
            >
              {progress.phaseSubtitle || "This usually takes 60–120 seconds. Stay on the page — you'll see lead cards appear as they're scored."}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 40, alignItems: "center" }}>
              <ProgressRing percent={pct} label={progress.done ? `${progress.done}/${progress.total}` : ""} />
              <div
                style={{
                  padding: "16px 18px",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  background: "var(--surface-2)",
                }}
              >
                <div className="eyebrow" style={{ marginBottom: 8 }}>
                  Current phase
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                  dangerouslySetInnerHTML={{
                    __html: progress.phaseTitle || "Booting the pipeline…",
                  }}
                />
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--text-muted)",
                    marginBottom: 14,
                  }}
                >
                  {progress.phaseSubtitle || " "}
                </div>
                {!progress.closed && <div className="shimmer-line" style={{ width: 90 }} />}
              </div>
            </div>

            {progress.finishText && (
              <div
                style={{
                  marginTop: 28,
                  padding: "16px 18px",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  background: "var(--surface)",
                  fontSize: 14,
                  color: "var(--text)",
                }}
                dangerouslySetInnerHTML={{ __html: progress.finishText }}
              />
            )}

            {progress.error && (
              <div
                style={{
                  marginTop: 20,
                  padding: 14,
                  border: "1px solid color-mix(in srgb, var(--cold) 30%, transparent)",
                  borderRadius: 10,
                  color: "var(--cold)",
                  fontSize: 13,
                }}
              >
                {progress.error}.{" "}
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => router.push(`/app/sessions/${searchId}`)}
                >
                  Open session anyway
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function ProgressRing({ percent, label }: { percent: number; label: string }) {
  const R = 90;
  const C = 2 * Math.PI * R;
  return (
    <div style={{ position: "relative", width: 220, height: 220, margin: "0 auto" }}>
      <svg width="220" height="220" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="110" cy="110" r={R} fill="none" stroke="var(--border)" strokeWidth="2" />
        <circle
          cx="110"
          cy="110"
          r={R}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C - (C * percent) / 100}
          style={{ transition: "stroke-dashoffset .4s" }}
        />
        {Array.from({ length: 60 }).map((_, i) => {
          const angle = (i / 60) * 2 * Math.PI;
          const r1 = R + 10;
          const r2 = R + 16;
          return (
            <line
              key={i}
              x1={110 + Math.cos(angle) * r1}
              y1={110 + Math.sin(angle) * r1}
              x2={110 + Math.cos(angle) * r2}
              y2={110 + Math.sin(angle) * r2}
              stroke="var(--border-strong)"
              strokeWidth={i % 5 === 0 ? 1.5 : 0.6}
            />
          );
        })}
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 44,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "var(--accent)",
            }}
          >
            {percent}%
          </div>
          {label && (
            <div className="eyebrow" style={{ fontSize: 10, marginTop: 2 }}>
              {label}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DoneView({
  searchId,
  niche,
  region,
}: {
  searchId: string;
  niche: string;
  region: string;
}) {
  const router = useRouter();
  return (
    <>
      <Topbar
        crumbs={[
          { label: "Workspace", href: "/app" },
          { label: "Search complete" },
        ]}
      />
      <div className="page" style={{ maxWidth: 900 }}>
        <div
          className="card"
          style={{
            padding: "40px 44px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div className="mesh-bg" />
          <div style={{ position: "relative" }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "var(--hot)",
                display: "grid",
                placeItems: "center",
                margin: "0 auto 20px",
                color: "white",
              }}
            >
              <Icon name="check" size={32} />
            </div>
            <div
              style={{
                fontSize: 36,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                marginBottom: 12,
              }}
            >
              {niche} · {region} — ready.
            </div>
            <div
              style={{
                fontSize: 15,
                color: "var(--text-muted)",
                marginBottom: 32,
              }}
            >
              Each lead was scored against your profile with a custom pitch.
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button
                type="button"
                className="btn btn-lg"
                onClick={() => router.push(`/app/sessions/${searchId}`)}
              >
                Open results <Icon name="arrow" size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

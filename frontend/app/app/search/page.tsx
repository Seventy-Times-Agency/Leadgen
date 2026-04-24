"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

import {
  type ApiError,
  type AuthCreds,
  createSearch,
  readAuth,
  subscribeProgress,
} from "@/lib/api";

type Phase = "compose" | "running" | "done" | "failed";

interface ProgressLine {
  kind: "phase" | "update" | "finish";
  title?: string;
  subtitle?: string;
  done?: number;
  total?: number;
  text?: string;
  ts: number;
}

function NewSearchInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [creds, setCreds] = useState<AuthCreds | null>(null);

  const [niche, setNiche] = useState(params?.get("niche") ?? "");
  const [region, setRegion] = useState(params?.get("region") ?? "");
  const [language, setLanguage] = useState("en");

  const [phase, setPhase] = useState<Phase>("compose");
  const [error, setError] = useState<string | null>(null);
  const [searchId, setSearchId] = useState<string | null>(null);
  const [lines, setLines] = useState<ProgressLine[]>([]);
  const [done, setDone] = useState(0);
  const [total, setTotal] = useState(0);
  const [finishedText, setFinishedText] = useState<string | null>(null);

  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    setCreds(readAuth());
    return () => {
      unsubRef.current?.();
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creds) return;
    setError(null);
    if (niche.trim().length < 2 || region.trim().length < 2) {
      setError("Niche and region must each be at least 2 characters.");
      return;
    }
    setPhase("running");
    setLines([]);
    setDone(0);
    setTotal(0);
    setFinishedText(null);
    try {
      const res = await createSearch(creds, {
        niche: niche.trim(),
        region: region.trim(),
        language_code: language,
      });
      setSearchId(res.id);
      unsubRef.current = subscribeProgress(creds, res.id, {
        onPhase: (title, subtitle) =>
          setLines((prev) => [
            ...prev,
            { kind: "phase", title, subtitle, ts: Date.now() },
          ]),
        onUpdate: (d, t) => {
          setDone(d);
          setTotal(t);
        },
        onFinish: (text) => {
          setFinishedText(text);
          setLines((prev) => [
            ...prev,
            { kind: "finish", text, ts: Date.now() },
          ]);
        },
        onDone: () => {
          setPhase("done");
        },
        onError: () => {
          // SSE closes when the search finishes; treat as recoverable
          // unless we never made it past compose.
        },
      });
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.detail ?? "Failed to start search.");
      setPhase("failed");
    }
  };

  const progressPct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <header>
        <div className="eyebrow" style={{ marginBottom: 8 }}>
          New search
        </div>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          Describe your target.
        </h1>
        <p
          style={{
            fontSize: 15,
            color: "var(--text-muted)",
            margin: "6px 0 0",
          }}
        >
          Free-form niche + region. The system picks 50 candidates from Google
          Maps, enriches the best, and scores each against what you sell.
        </p>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.1fr 1fr",
          gap: 24,
          alignItems: "start",
        }}
      >
        <form onSubmit={submit} className="card" style={{ padding: 28 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
                Niche
              </label>
              <input
                className="input"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="roofing companies, design studios, dental clinics…"
                disabled={phase === "running"}
              />
            </div>
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
                Region
              </label>
              <input
                className="input"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="New York, Berlin, Almaty…"
                disabled={phase === "running"}
              />
            </div>
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
                Result language
              </label>
              <select
                className="select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={phase === "running"}
              >
                <option value="en">English</option>
                <option value="uk">Українська</option>
                <option value="de">Deutsch</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="pt">Português</option>
                <option value="pl">Polski</option>
                <option value="kk">Қазақша</option>
              </select>
            </div>

            {error && (
              <div style={{ fontSize: 13, color: "var(--cold)" }}>{error}</div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
              <button
                type="submit"
                className="btn btn-lg"
                disabled={phase === "running"}
              >
                {phase === "running" ? "Running…" : "Run search →"}
              </button>
              {phase === "done" && searchId && (
                <button
                  type="button"
                  className="btn btn-ghost btn-lg"
                  onClick={() => router.push(`/app/searches/${searchId}`)}
                >
                  Open results →
                </button>
              )}
            </div>
          </div>
        </form>

        <div className="card" style={{ padding: 24, minHeight: 360 }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            Live progress
          </div>

          {phase === "compose" && (
            <div
              style={{
                color: "var(--text-muted)",
                fontSize: 14,
                lineHeight: 1.55,
              }}
            >
              Once you press <b>Run search</b>, you'll see Google Maps
              discovery, website + reviews enrichment, and AI scoring stream
              in here in real time.
            </div>
          )}

          {phase !== "compose" && (
            <>
              {total > 0 && (
                <div style={{ marginBottom: 18 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 12,
                      color: "var(--text-muted)",
                      marginBottom: 6,
                    }}
                  >
                    <span>Enrichment</span>
                    <span className="mono">
                      {done}/{total} · {progressPct}%
                    </span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              )}

              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {lines.length === 0 && (
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    Connecting…
                  </div>
                )}
                {lines.map((l, i) => (
                  <ProgressItem key={i} line={l} />
                ))}
              </div>

              {phase === "done" && finishedText && (
                <div
                  style={{
                    marginTop: 18,
                    padding: 14,
                    borderRadius: 10,
                    background: "color-mix(in srgb, var(--hot) 8%, transparent)",
                    border:
                      "1px solid color-mix(in srgb, var(--hot) 25%, transparent)",
                    fontSize: 13.5,
                    color: "var(--text)",
                    lineHeight: 1.55,
                  }}
                  dangerouslySetInnerHTML={{
                    __html: stripHtmlTags(finishedText),
                  }}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ProgressItem({ line }: { line: ProgressLine }) {
  if (line.kind === "phase") {
    return (
      <div
        style={{
          padding: "10px 12px",
          borderRadius: 10,
          background: "var(--surface-2)",
          fontSize: 14,
        }}
      >
        <div
          style={{ fontWeight: 600 }}
          dangerouslySetInnerHTML={{ __html: stripHtmlTags(line.title ?? "") }}
        />
        {line.subtitle && (
          <div
            style={{ color: "var(--text-muted)", fontSize: 12.5, marginTop: 2 }}
            dangerouslySetInnerHTML={{
              __html: stripHtmlTags(line.subtitle ?? ""),
            }}
          />
        )}
      </div>
    );
  }
  return null;
}

/**
 * The bot writes progress in HTML (Telegram parse_mode=HTML). The web
 * shows it as plain text — strip tags but keep the message.
 */
function stripHtmlTags(s: string): string {
  return s.replace(/<\/?[^>]+>/g, "");
}

export default function NewSearchPage() {
  return (
    <Suspense
      fallback={
        <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Loading…</div>
      }
    >
      <NewSearchInner />
    </Suspense>
  );
}

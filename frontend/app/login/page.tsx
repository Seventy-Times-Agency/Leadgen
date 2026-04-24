"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { type AuthCreds, readAuth, writeAuth } from "@/lib/api";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const isRegister = params?.get("mode") === "register";

  const [apiKey, setApiKey] = useState("");
  const [userId, setUserId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [profession, setProfession] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const existing = readAuth();
    if (existing) {
      router.replace("/app");
    }
  }, [router]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedKey = apiKey.trim();
    const trimmedId = userId.trim();
    const parsedId = Number.parseInt(trimmedId, 10);
    if (!trimmedKey) {
      setError("Paste your team API key.");
      return;
    }
    if (!Number.isFinite(parsedId)) {
      setError("User id must be a number (your Telegram id works).");
      return;
    }
    const creds: AuthCreds = {
      apiKey: trimmedKey,
      userId: parsedId,
      displayName: displayName.trim() || undefined,
      profession: profession.trim() || undefined,
    };
    writeAuth(creds);
    router.replace("/app");
  };

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
        <Link href="/" className="sidebar-logo">
          <span className="sidebar-logo-mark">L</span>
          <span>Leadgen</span>
        </Link>

        <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
          <div style={{ width: "100%", maxWidth: 420 }}>
            <h1
              style={{
                fontSize: 40,
                fontWeight: 700,
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
                margin: "0 0 12px",
              }}
            >
              {isRegister ? "Open your workspace." : "Welcome back."}
            </h1>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: 15,
                margin: "0 0 28px",
              }}
            >
              {isRegister
                ? "Paste your team API key and pick a numeric id (your Telegram id works). The first search auto-creates your account."
                : "Paste your team API key to continue. Same shared key as the Telegram bot."}
            </p>

            <form
              onSubmit={submit}
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
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
                  Team API key
                </label>
                <input
                  className="input"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="WEB_API_KEY from Railway vars"
                  autoFocus
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
                  User id
                </label>
                <input
                  className="input"
                  inputMode="numeric"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="e.g. your Telegram numeric id"
                />
              </div>
              {isRegister && (
                <>
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
                      Your name (optional)
                    </label>
                    <input
                      className="input"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Denys"
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
                      What you sell (optional)
                    </label>
                    <input
                      className="input"
                      value={profession}
                      onChange={(e) => setProfession(e.target.value)}
                      placeholder="web design & dev for small businesses"
                    />
                  </div>
                </>
              )}

              {error && (
                <div style={{ fontSize: 13, color: "var(--cold)" }}>{error}</div>
              )}

              <button
                className="btn btn-lg"
                type="submit"
                style={{ marginTop: 8 }}
              >
                {isRegister ? "Open workspace" : "Sign in"} →
              </button>
            </form>

            <div
              style={{
                marginTop: 20,
                fontSize: 13.5,
                color: "var(--text-muted)",
              }}
            >
              {isRegister ? (
                <>
                  Already have access?{" "}
                  <Link
                    href="/login"
                    style={{ color: "var(--accent)", fontWeight: 500 }}
                  >
                    Sign in
                  </Link>
                </>
              ) : (
                <>
                  New teammate?{" "}
                  <Link
                    href="/login?mode=register"
                    style={{ color: "var(--accent)", fontWeight: 500 }}
                  >
                    Open workspace
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
          © 2026 Seventy Times Agency · Team access only
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
        <div className="mesh-bg" />
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
              maxWidth: 380,
            }}
          >
            50 AI-scored prospects. Every search. Personalized to what{" "}
            <span
              style={{ fontStyle: "italic", color: "var(--text-muted)" }}
            >
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
            <span>Google Places</span>·<span>Claude Haiku</span>·
            <span>Live enrichment</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            color: "var(--text-muted)",
          }}
        >
          Loading…
        </div>
      }
    >
      <LoginInner />
    </Suspense>
  );
}

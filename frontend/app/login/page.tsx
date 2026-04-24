"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { nameToUserId, readAuth, writeAuth } from "@/lib/api";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const initialNiche = params?.get("niche") ?? "";
  const initialRegion = params?.get("region") ?? "";

  const [name, setName] = useState("");
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
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError("Your name needs at least two characters.");
      return;
    }
    writeAuth({
      userId: nameToUserId(trimmed),
      displayName: trimmed,
    });
    // If we were sent here with a prefilled search, hop straight into it.
    if (initialNiche || initialRegion) {
      const qs = new URLSearchParams();
      if (initialNiche) qs.set("niche", initialNiche);
      if (initialRegion) qs.set("region", initialRegion);
      router.replace(`/app/search?${qs.toString()}`);
      return;
    }
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
                fontSize: 44,
                fontWeight: 700,
                letterSpacing: "-0.03em",
                lineHeight: 1.02,
                margin: "0 0 12px",
              }}
            >
              Welcome in.
            </h1>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: 15,
                margin: "0 0 28px",
              }}
            >
              Type your name to open the workspace. No password, no invite
              code — your workspace follows your name.
            </p>

            <form
              onSubmit={submit}
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
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
                  Your name
                </label>
                <input
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Denys"
                  autoFocus
                />
              </div>

              {error && (
                <div style={{ fontSize: 13, color: "var(--cold)" }}>
                  {error}
                </div>
              )}

              <button
                className="btn btn-lg"
                type="submit"
                style={{ marginTop: 10 }}
              >
                Enter workspace →
              </button>
            </form>

            <div
              style={{
                marginTop: 28,
                padding: "12px 14px",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                fontSize: 12.5,
                color: "var(--text-muted)",
                lineHeight: 1.5,
              }}
            >
              Same name across browsers keeps your search history. Change the
              name and you get a fresh workspace.
            </div>
          </div>
        </div>

        <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
          © 2026 Seventy Times Agency · Leadgen
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

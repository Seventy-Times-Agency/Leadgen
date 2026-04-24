"use client";

import { useEffect, useState } from "react";

import { type AuthCreds, readAuth, writeAuth } from "@/lib/api";

export default function ProfilePage() {
  const [creds, setCreds] = useState<AuthCreds | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [profession, setProfession] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const c = readAuth();
    if (!c) return;
    setCreds(c);
    setDisplayName(c.displayName ?? "");
    setProfession(c.profession ?? "");
  }, []);

  if (!creds) return null;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    writeAuth({
      ...creds,
      displayName: displayName.trim() || undefined,
      profession: profession.trim() || undefined,
    });
    setCreds({
      ...creds,
      displayName: displayName.trim() || undefined,
      profession: profession.trim() || undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
        maxWidth: 640,
      }}
    >
      <header>
        <div className="eyebrow" style={{ marginBottom: 8 }}>
          Profile
        </div>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          Your workspace
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 6 }}>
          These values get sent with every search so the AI scores leads
          against the right offer.
        </p>
      </header>

      <form onSubmit={save} className="card" style={{ padding: 28 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="User id">
            <input
              className="input"
              value={creds.userId}
              disabled
              style={{ background: "var(--surface-2)" }}
            />
          </Field>
          <Field label="Display name">
            <input
              className="input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Denys"
            />
          </Field>
          <Field label="What you sell">
            <input
              className="input"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              placeholder="web design & dev for small businesses"
            />
          </Field>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 6,
            }}
          >
            <button type="submit" className="btn">
              Save
            </button>
            {saved && (
              <span style={{ fontSize: 13, color: "var(--hot)" }}>
                Saved locally.
              </span>
            )}
          </div>
        </div>
      </form>

      <div
        className="card"
        style={{
          padding: 20,
          fontSize: 13,
          color: "var(--text-muted)",
          lineHeight: 1.6,
        }}
      >
        <b style={{ color: "var(--text)" }}>Heads up:</b> profile fields are
        cached in your browser and re-sent on every search. They get persisted
        on the server the first time they're sent, but you can keep them in
        sync from here without contacting the API.
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "block" }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "var(--text-muted)",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      {children}
    </label>
  );
}

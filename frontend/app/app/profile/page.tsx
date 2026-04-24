"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  type AuthCreds,
  clearAuth,
  nameToUserId,
  readAuth,
  writeAuth,
} from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const [creds, setCreds] = useState<AuthCreds | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [profession, setProfession] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const c = readAuth();
    if (!c) return;
    setCreds(c);
    setDisplayName(c.displayName);
    setProfession(c.profession ?? "");
  }, []);

  if (!creds) return null;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = displayName.trim();
    if (trimmed.length < 2) return;
    // Name change rewrites user_id so the workspace follows the name,
    // matching the login contract: "Same name = same workspace".
    const nextUserId =
      trimmed.toLowerCase() === creds.displayName.toLowerCase()
        ? creds.userId
        : nameToUserId(trimmed);
    const next: AuthCreds = {
      userId: nextUserId,
      displayName: trimmed,
      profession: profession.trim() || undefined,
      apiKey: creds.apiKey,
    };
    writeAuth(next);
    setCreds(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const signOut = () => {
    clearAuth();
    router.replace("/");
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
          "What you sell" is sent with every search so the AI scores leads
          against the right offer.
        </p>
      </header>

      <form onSubmit={save} className="card" style={{ padding: 28 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="Your name">
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
                Saved.
              </span>
            )}
            <button
              type="button"
              onClick={signOut}
              className="btn btn-ghost"
              style={{ marginLeft: "auto" }}
            >
              Sign out
            </button>
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
        <b style={{ color: "var(--text)" }}>Heads up:</b> your workspace is
        keyed on your name. Change the name and you'll start a fresh
        workspace with no history — your old sessions stay where they were.
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

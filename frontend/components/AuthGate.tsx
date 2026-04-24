"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { type AuthCreds, readAuth } from "@/lib/api";

/**
 * Client-side gate: bounces unauthenticated users to /login and exposes
 * the parsed credentials to children once we know who they are.
 *
 * Auth lives in localStorage (single shared API key + telegram user
 * id). We don't have server-side sessions yet, so the redirect happens
 * on mount — a half-second flash of "loading…" is the cost.
 */
export function AuthGate({
  children,
}: {
  children: (creds: AuthCreds) => React.ReactNode;
}) {
  const router = useRouter();
  const [creds, setCreds] = useState<AuthCreds | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const auth = readAuth();
    if (!auth) {
      router.replace("/login");
      return;
    }
    setCreds(auth);
    setChecked(true);
  }, [router]);

  if (!checked || !creds) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "grid",
          placeItems: "center",
          color: "var(--text-muted)",
          fontSize: 13,
        }}
      >
        Authenticating…
      </div>
    );
  }

  return <>{children(creds)}</>;
}

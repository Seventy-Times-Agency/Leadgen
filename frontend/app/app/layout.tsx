"use client";

import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { RequireAuth } from "@/components/RequireAuth";
import { AssistantWidget } from "@/components/AssistantWidget";
import { VerifyEmailBanner } from "@/components/VerifyEmailBanner";
import { ProfileNudgeBanner } from "@/components/ProfileNudgeBanner";
import { useActiveTint } from "@/lib/tint";

/**
 * Shell layout for all authenticated-area pages (/app/*).
 *
 * RequireAuth gates the subtree on a localStorage user record; an
 * unauthenticated visitor is redirected to /login before any of the
 * dashboard / search / CRM pages mount.
 *
 * VerifyEmailBanner sits at the top of the workspace until the
 * email is confirmed (search creation is blocked server-side too).
 *
 * ProfileNudgeBanner gently asks the user to flesh out their profile
 * (or do it with Henry) — it's the path the strict 6-step onboarding
 * used to enforce, only soft and skippable.
 *
 * AssistantWidget mounts here so Henry's floating bubble follows
 * the user across every workspace page.
 *
 * The active workspace tint (subtle background colour) is applied
 * via the ``data-tint`` attribute on the main area; CSS in
 * ``globals.css`` handles the actual colour rules.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  const tint = useActiveTint();
  return (
    <RequireAuth>
      <div className="app-layout">
        <Sidebar />
        <main className="main-area" data-tint={tint}>
          <VerifyEmailBanner />
          <ProfileNudgeBanner />
          {children}
        </main>
      </div>
      <AssistantWidget />
    </RequireAuth>
  );
}

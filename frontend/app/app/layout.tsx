import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";

/**
 * Shell layout for all authenticated-area pages (/app/*).
 *
 * Auth is intentionally absent for now — the user asked for an open demo
 * while the site is still being built out. A session check will drop in
 * here (server component) once login lands.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-area">{children}</main>
    </div>
  );
}

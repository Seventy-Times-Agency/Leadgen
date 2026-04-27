/**
 * Workspace background tints.
 *
 * The user wanted personal and team workspaces to feel visually
 * distinct without screaming for attention — three subtle presets
 * that nudge the body background just enough to tell you which
 * "universe" you're in. Each user picks per workspace and the choice
 * is persisted client-side; nothing on the server.
 *
 * - ``default`` — current cream / paper, nothing changes
 * - ``green``   — barely-green; reads as "personal / focus"
 * - ``dark``    — slightly cooler; reads as "corporate"
 * - ``orange``  — warm peach; reads as "team / energy"
 *
 * The actual colour rules live in ``globals.css`` under
 * ``.main-area[data-tint="…"]``. This module just owns the
 * persistence + a hook so layout components can react to changes.
 */

import { useEffect, useState } from "react";

import {
  getActiveWorkspace,
  subscribeWorkspace,
  type Workspace,
} from "./workspace";

export type WorkspaceTint = "default" | "green" | "dark" | "orange";

export const WORKSPACE_TINTS: WorkspaceTint[] = [
  "default",
  "green",
  "dark",
  "orange",
];

const STORAGE_KEY_PREFIX = "convioo.tint";
const EVENT_NAME = "convioo.tint";

function storageKeyFor(workspace: Workspace): string {
  return workspace.kind === "team"
    ? `${STORAGE_KEY_PREFIX}.team.${workspace.team_id}`
    : `${STORAGE_KEY_PREFIX}.personal`;
}

export function getWorkspaceTint(workspace: Workspace): WorkspaceTint {
  if (typeof window === "undefined") return "default";
  const raw = window.localStorage.getItem(storageKeyFor(workspace));
  if (raw && (WORKSPACE_TINTS as string[]).includes(raw)) {
    return raw as WorkspaceTint;
  }
  return "default";
}

export function setWorkspaceTint(
  workspace: Workspace,
  tint: WorkspaceTint,
): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKeyFor(workspace), tint);
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export function subscribeTint(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => listener();
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}

/** React hook: returns the active tint, re-rendering on workspace
 *  switch or on tint change. */
export function useActiveTint(): WorkspaceTint {
  const [tint, setTint] = useState<WorkspaceTint>("default");
  useEffect(() => {
    const compute = () => setTint(getWorkspaceTint(getActiveWorkspace()));
    compute();
    const offWorkspace = subscribeWorkspace(compute);
    const offTint = subscribeTint(compute);
    return () => {
      offWorkspace();
      offTint();
    };
  }, []);
  return tint;
}

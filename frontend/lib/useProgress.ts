"use client";

import { useEffect, useState } from "react";
import { progressStreamUrl } from "@/lib/api";

/**
 * Subscribe to the SSE progress stream for a given search.
 *
 * Mirrors the event schema emitted by BrokerProgressSink on the backend:
 *   phase   → { title, subtitle }
 *   update  → { done, total }
 *   finish  → { text }
 *   done    → (sentinel event; stream closes)
 */

export interface ProgressState {
  phaseTitle: string;
  phaseSubtitle: string;
  done: number;
  total: number;
  finishText: string | null;
  closed: boolean;
  error: string | null;
}

const INITIAL: ProgressState = {
  phaseTitle: "",
  phaseSubtitle: "",
  done: 0,
  total: 0,
  finishText: null,
  closed: false,
  error: null,
};

export function useProgress(searchId: string | null): ProgressState {
  const [state, setState] = useState<ProgressState>(INITIAL);

  useEffect(() => {
    if (!searchId) return;
    const url = progressStreamUrl(searchId);
    if (!url) {
      setState((s) => ({ ...s, error: "NEXT_PUBLIC_API_URL is not set" }));
      return;
    }

    const es = new EventSource(url);

    const onPhase = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        setState((s) => ({
          ...s,
          phaseTitle: data.title ?? "",
          phaseSubtitle: data.subtitle ?? "",
        }));
      } catch {
        // ignore malformed payloads
      }
    };
    const onUpdate = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        setState((s) => ({ ...s, done: data.done ?? 0, total: data.total ?? 0 }));
      } catch {
        // ignore
      }
    };
    const onFinish = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        setState((s) => ({ ...s, finishText: data.text ?? "" }));
      } catch {
        setState((s) => ({ ...s, finishText: "" }));
      }
    };
    const onDone = () => {
      setState((s) => ({ ...s, closed: true }));
      es.close();
    };
    const onError = () => {
      // EventSource reconnects automatically within its retry window.
      // We only surface the error after the stream is explicitly closed.
      if (es.readyState === EventSource.CLOSED) {
        setState((s) => ({ ...s, error: "connection closed", closed: true }));
      }
    };

    es.addEventListener("phase", onPhase);
    es.addEventListener("update", onUpdate);
    es.addEventListener("finish", onFinish);
    es.addEventListener("done", onDone);
    es.addEventListener("error", onError);

    return () => {
      es.removeEventListener("phase", onPhase);
      es.removeEventListener("update", onUpdate);
      es.removeEventListener("finish", onFinish);
      es.removeEventListener("done", onDone);
      es.removeEventListener("error", onError);
      es.close();
    };
  }, [searchId]);

  return state;
}

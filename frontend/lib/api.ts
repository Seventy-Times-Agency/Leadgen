/**
 * Thin client around the FastAPI backend on Railway.
 *
 * Auth is "shared agency key" for now: the user pastes the WEB_API_KEY
 * once on /login, plus a numeric user_id (their Telegram id, since the
 * bot already keys everything on it). Both live in localStorage. Real
 * per-user auth (magic link) lands when public sign-up opens.
 */

export type SearchStatus = "pending" | "running" | "done" | "failed";

export interface SearchSummary {
  id: string;
  user_id: number;
  niche: string;
  region: string;
  status: SearchStatus;
  created_at: string;
  finished_at: string | null;
  leads_count: number;
  avg_score: number | null;
  hot_leads_count: number | null;
  error: string | null;
  insights?: string | null;
}

export interface LeadOut {
  id: string;
  name: string;
  website: string | null;
  phone: string | null;
  address: string | null;
  category: string | null;
  rating: number | null;
  reviews_count: number | null;
  latitude: number | null;
  longitude: number | null;
  enriched: boolean;
  score_ai: number | null;
  tags: string[] | null;
  summary: string | null;
  advice: string | null;
  strengths: string[] | null;
  weaknesses: string[] | null;
  red_flags: string[] | null;
  social_links: Record<string, string> | null;
  reviews_summary: string | null;
}

export interface SearchDetail extends SearchSummary {
  stats: Record<string, number> | null;
  leads: LeadOut[];
}

export interface SearchCreatePayload {
  user_id: number;
  niche: string;
  region: string;
  language_code?: string | null;
  display_name?: string | null;
  profession?: string | null;
}

export interface SearchCreateResponse {
  id: string;
  queued: boolean;
  running: boolean;
}

export interface ApiError {
  status: number;
  detail: string;
}

const STORAGE_KEY_API = "leadgen.apiKey";
const STORAGE_KEY_USER = "leadgen.userId";
const STORAGE_KEY_NAME = "leadgen.displayName";
const STORAGE_KEY_PROF = "leadgen.profession";

export function getApiBase(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not set. Configure it in Vercel env."
    );
  }
  return url.replace(/\/$/, "");
}

export interface AuthCreds {
  apiKey: string;
  userId: number;
  displayName?: string;
  profession?: string;
}

export function readAuth(): AuthCreds | null {
  if (typeof window === "undefined") return null;
  const apiKey = window.localStorage.getItem(STORAGE_KEY_API);
  const userIdRaw = window.localStorage.getItem(STORAGE_KEY_USER);
  if (!apiKey || !userIdRaw) return null;
  const userId = Number.parseInt(userIdRaw, 10);
  if (!Number.isFinite(userId)) return null;
  return {
    apiKey,
    userId,
    displayName: window.localStorage.getItem(STORAGE_KEY_NAME) ?? undefined,
    profession: window.localStorage.getItem(STORAGE_KEY_PROF) ?? undefined,
  };
}

export function writeAuth(creds: AuthCreds): void {
  window.localStorage.setItem(STORAGE_KEY_API, creds.apiKey);
  window.localStorage.setItem(STORAGE_KEY_USER, String(creds.userId));
  if (creds.displayName) {
    window.localStorage.setItem(STORAGE_KEY_NAME, creds.displayName);
  }
  if (creds.profession) {
    window.localStorage.setItem(STORAGE_KEY_PROF, creds.profession);
  }
}

export function clearAuth(): void {
  window.localStorage.removeItem(STORAGE_KEY_API);
  window.localStorage.removeItem(STORAGE_KEY_USER);
  window.localStorage.removeItem(STORAGE_KEY_NAME);
  window.localStorage.removeItem(STORAGE_KEY_PROF);
}

async function request<T>(
  path: string,
  init: RequestInit & { apiKey: string }
): Promise<T> {
  const { apiKey, headers, ...rest } = init;
  const res = await fetch(`${getApiBase()}${path}`, {
    ...rest,
    headers: {
      "X-API-Key": apiKey,
      "Content-Type": "application/json",
      ...(headers ?? {}),
    },
  });
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      detail = body.detail ?? detail;
    } catch {
      // ignore
    }
    const err: ApiError = { status: res.status, detail };
    throw err;
  }
  if (res.status === 204) return undefined as T;
  const ct = res.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) {
    return (await res.text()) as unknown as T;
  }
  return (await res.json()) as T;
}

export async function pingHealth(): Promise<{
  status: string;
  db: boolean;
  commit: string;
}> {
  const res = await fetch(`${getApiBase()}/health`, { cache: "no-store" });
  if (!res.ok) throw new Error(`health ${res.status}`);
  return res.json();
}

export async function listSearches(
  creds: AuthCreds,
  limit = 20
): Promise<SearchSummary[]> {
  const params = new URLSearchParams({
    user_id: String(creds.userId),
    limit: String(limit),
  });
  return request<SearchSummary[]>(`/api/v1/searches?${params}`, {
    apiKey: creds.apiKey,
  });
}

export async function createSearch(
  creds: AuthCreds,
  payload: Omit<SearchCreatePayload, "user_id">
): Promise<SearchCreateResponse> {
  const body: SearchCreatePayload = {
    user_id: creds.userId,
    display_name: creds.displayName ?? null,
    profession: creds.profession ?? null,
    ...payload,
  };
  return request<SearchCreateResponse>("/api/v1/searches", {
    apiKey: creds.apiKey,
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function getSearch(
  creds: AuthCreds,
  id: string
): Promise<SearchDetail> {
  return request<SearchDetail>(`/api/v1/searches/${id}`, {
    apiKey: creds.apiKey,
  });
}

export async function getSearchLeads(
  creds: AuthCreds,
  id: string
): Promise<LeadOut[]> {
  return request<LeadOut[]>(`/api/v1/searches/${id}/leads`, {
    apiKey: creds.apiKey,
  });
}

export function searchExcelUrl(creds: AuthCreds, id: string): string {
  // Excel download is a direct link; the browser sends the X-API-Key
  // via fetch+blob, not via <a href>, so callers should fetch + Blob it.
  void creds;
  return `${getApiBase()}/api/v1/searches/${id}/excel`;
}

export async function downloadExcel(
  creds: AuthCreds,
  id: string,
  filename: string
): Promise<void> {
  const res = await fetch(searchExcelUrl(creds, id), {
    headers: { "X-API-Key": creds.apiKey },
  });
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      detail = body.detail ?? detail;
    } catch {
      // ignore
    }
    throw { status: res.status, detail } as ApiError;
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export interface ProgressEvent {
  kind: "phase" | "update" | "finish" | "done";
  title?: string;
  subtitle?: string;
  done?: number;
  total?: number;
  text?: string;
}

export function progressUrl(creds: AuthCreds, id: string): string {
  const params = new URLSearchParams({ api_key: creds.apiKey });
  return `${getApiBase()}/api/v1/searches/${id}/progress?${params}`;
}

export function subscribeProgress(
  creds: AuthCreds,
  id: string,
  handlers: {
    onPhase?: (title: string, subtitle: string) => void;
    onUpdate?: (done: number, total: number) => void;
    onFinish?: (text: string) => void;
    onDone?: () => void;
    onError?: (err: Event) => void;
  }
): () => void {
  const src = new EventSource(progressUrl(creds, id));
  src.addEventListener("phase", (e) => {
    const data = JSON.parse((e as MessageEvent).data);
    handlers.onPhase?.(data.title ?? "", data.subtitle ?? "");
  });
  src.addEventListener("update", (e) => {
    const data = JSON.parse((e as MessageEvent).data);
    handlers.onUpdate?.(data.done ?? 0, data.total ?? 0);
  });
  src.addEventListener("finish", (e) => {
    const data = JSON.parse((e as MessageEvent).data);
    handlers.onFinish?.(data.text ?? "");
  });
  src.addEventListener("done", () => {
    handlers.onDone?.();
    src.close();
  });
  src.onerror = (e) => {
    handlers.onError?.(e);
  };
  return () => src.close();
}

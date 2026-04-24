import type { SearchStatus } from "@/lib/api";

const LABEL: Record<SearchStatus, string> = {
  pending: "Pending",
  running: "Running",
  done: "Done",
  failed: "Failed",
};

export function SearchStatusPill({ status }: { status: SearchStatus }) {
  return <span className={`status-pill status-${status}`}>{LABEL[status]}</span>;
}

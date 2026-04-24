import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";
import { Icon } from "@/components/Icon";

export default function LoginPage() {
  return (
    <AuthShell title="Welcome back.">
      <div style={{ color: "var(--text-muted)", marginBottom: 28, fontSize: 15 }}>
        Sign in is coming with the next milestone. For the demo, jump straight in.
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Link
          href="/app"
          className="btn btn-lg"
          style={{ justifyContent: "center" }}
        >
          Enter the workspace <Icon name="arrow" size={15} />
        </Link>
        <Link
          href="/"
          className="btn btn-ghost btn-lg"
          style={{ justifyContent: "center" }}
        >
          Back to home
        </Link>
      </div>
      <div
        style={{
          marginTop: 32,
          padding: 12,
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          fontSize: 12,
          color: "var(--text-muted)",
        }}
      >
        <b>Demo note:</b> the public demo runs without accounts. Telegram
        login + email magic-link will ship before the public launch.
      </div>
    </AuthShell>
  );
}

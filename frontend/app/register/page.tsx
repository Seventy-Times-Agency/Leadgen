import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";
import { Icon } from "@/components/Icon";

export default function RegisterPage() {
  return (
    <AuthShell title="Join your team.">
      <div style={{ color: "var(--text-muted)", marginBottom: 28, fontSize: 15 }}>
        Account signup unlocks when auth ships. The demo workspace is open to
        anyone with the link.
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Link
          href="/app"
          className="btn btn-lg"
          style={{ justifyContent: "center" }}
        >
          Open the demo workspace <Icon name="arrow" size={15} />
        </Link>
        <Link
          href="/"
          className="btn btn-ghost btn-lg"
          style={{ justifyContent: "center" }}
        >
          Back to home
        </Link>
      </div>
    </AuthShell>
  );
}

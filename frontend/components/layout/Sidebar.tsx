"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/Icon";
import { DEMO_USER, type WebUser } from "@/lib/demoUser";

interface NavEntry {
  key: string;
  label: string;
  icon: IconName;
}

interface NavSection {
  section: string;
}

type NavItem = NavEntry | NavSection;

const NAV: NavItem[] = [
  { section: "Workspace" },
  { key: "/app", label: "Dashboard", icon: "home" },
  { key: "/app/search", label: "New search", icon: "sparkles" },
  { key: "/app/sessions", label: "Sessions", icon: "folder" },
  { key: "/app/leads", label: "All leads", icon: "list" },
  { section: "Team" },
  { key: "/app/team", label: "Team", icon: "users" },
  { key: "/app/profile", label: "My profile", icon: "user" },
  { key: "/app/settings", label: "Settings", icon: "settings" },
];

export function Sidebar({ user = DEMO_USER }: { user?: WebUser }) {
  const pathname = usePathname();

  const isActive = (key: string) => {
    if (key === "/app") return pathname === "/app";
    return pathname === key || pathname.startsWith(key + "/");
  };

  return (
    <aside className="sidebar">
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 12px 20px" }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "linear-gradient(135deg, var(--accent), #6a7bff)",
            display: "grid",
            placeItems: "center",
            color: "white",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          L
        </div>
        <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em" }}>Leadgen</div>
        <div className="chip" style={{ marginLeft: "auto", fontSize: 10, padding: "2px 7px" }}>
          beta
        </div>
      </div>

      {NAV.map((item, i) =>
        "section" in item ? (
          <div key={`sec-${i}`} className="nav-section">
            {item.section}
          </div>
        ) : (
          <Link
            key={item.key}
            href={item.key}
            className={"nav-item" + (isActive(item.key) ? " active" : "")}
          >
            <Icon name={item.icon} size={17} />
            <span>{item.label}</span>
          </Link>
        ),
      )}

      <div style={{ marginTop: "auto", paddingTop: 20 }}>
        <div
          className="card"
          style={{
            padding: 14,
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="avatar" style={{ background: user.color }}>
              {user.initials}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user.name}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{user.role}</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

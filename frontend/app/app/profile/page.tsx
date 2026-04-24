"use client";

import { Topbar } from "@/components/layout/Topbar";
import { Icon } from "@/components/Icon";
import { DEMO_USER } from "@/lib/demoUser";

export default function ProfilePage() {
  return (
    <>
      <Topbar title="My profile" subtitle="How AI scores leads for you" />
      <div className="page" style={{ maxWidth: 720 }}>
        <div className="card" style={{ padding: 28, marginBottom: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 24,
            }}
          >
            <div
              className="avatar avatar-lg"
              style={{
                background: DEMO_USER.color,
                width: 72,
                height: 72,
                fontSize: 26,
              }}
            >
              {DEMO_USER.initials}
            </div>
            <div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: "-0.01em",
                }}
              >
                {DEMO_USER.name}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                {DEMO_USER.role}
              </div>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ marginLeft: "auto" }}
              disabled
              title="Profile editing unlocks when auth lands"
            >
              <Icon name="pencil" size={13} /> Edit
            </button>
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}
          >
            <Field label="Business size" value="Small team (2–10)" />
            <Field label="Home region" value="Kyiv, Ukraine" />
            <Field label="Profession / offer" value="Web design & dev for local SMB" />
            <Field label="Target niches" value="Contractors, clinics, studios" />
          </div>
        </div>
        <div
          className="card"
          style={{ padding: 20, background: "var(--surface-2)" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Icon name="sparkles" size={16} style={{ color: "var(--accent)" }} />
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
              Your profile personalizes every AI score and pitch. Editing is
              coming with login — for now the demo uses the defaults above.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="eyebrow" style={{ marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 14 }}>{value}</div>
    </div>
  );
}

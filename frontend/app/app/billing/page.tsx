"use client";

import { Topbar } from "@/components/layout/Topbar";
import { Icon, type IconName } from "@/components/Icon";
import { useLocale, type TranslationKey } from "@/lib/i18n";

/**
 * Subscription plans surface.
 *
 * Visual + textual only for now: the user explicitly asked for four
 * cards (Free / Personal Pro / Team Standard / Team Pro) so we can
 * iterate on copy and limits before we wire any real billing. The
 * "В разработке" badge and the disabled CTA make it obvious nothing
 * is purchasable yet — Convioo is still a free demo.
 *
 * Once Stripe / Telegram Stars lands we'll plug the CTAs into a
 * checkout flow without changing the tier definitions.
 */

interface PlanFeature {
  labelKey: TranslationKey;
  /** Whether this feature is included on the plan. ``false`` ones
   *  render greyed-out so the user can compare quickly. */
  included: boolean;
}

interface Plan {
  id: "free" | "personal_pro" | "team_standard" | "team_pro";
  highlight?: boolean;
  icon: IconName;
  accent: string;
}

const PLANS: Plan[] = [
  { id: "free", icon: "sparkles", accent: "var(--text-muted)" },
  {
    id: "personal_pro",
    icon: "zap",
    accent: "var(--accent)",
    highlight: true,
  },
  { id: "team_standard", icon: "users", accent: "#16A34A" },
  { id: "team_pro", icon: "star", accent: "#EA580C" },
];

const FEATURES: Record<Plan["id"], PlanFeature[]> = {
  free: [
    { labelKey: "billing.feat.searchesFree", included: true },
    { labelKey: "billing.feat.leadsPerSession", included: true },
    { labelKey: "billing.feat.aiScore", included: true },
    { labelKey: "billing.feat.henryConsult", included: true },
    { labelKey: "billing.feat.crmBasic", included: true },
    { labelKey: "billing.feat.exportCsv", included: false },
    { labelKey: "billing.feat.dailyDigest", included: false },
    { labelKey: "billing.feat.teams", included: false },
    { labelKey: "billing.feat.customFields", included: false },
    { labelKey: "billing.feat.apiAccess", included: false },
  ],
  personal_pro: [
    { labelKey: "billing.feat.searchesPro", included: true },
    { labelKey: "billing.feat.leadsPerSession", included: true },
    { labelKey: "billing.feat.aiScore", included: true },
    { labelKey: "billing.feat.henryConsult", included: true },
    { labelKey: "billing.feat.crmBasic", included: true },
    { labelKey: "billing.feat.exportCsv", included: true },
    { labelKey: "billing.feat.dailyDigest", included: true },
    { labelKey: "billing.feat.outreachTemplates", included: true },
    { labelKey: "billing.feat.unlimitedHistory", included: true },
    { labelKey: "billing.feat.teams", included: false },
  ],
  team_standard: [
    { labelKey: "billing.feat.team5", included: true },
    { labelKey: "billing.feat.searchesTeamStandard", included: true },
    { labelKey: "billing.feat.sharedCrm", included: true },
    { labelKey: "billing.feat.dedupTeam", included: true },
    { labelKey: "billing.feat.henryTeam", included: true },
    { labelKey: "billing.feat.activityFeed", included: true },
    { labelKey: "billing.feat.weeklyCheckin", included: true },
    { labelKey: "billing.feat.exportCsv", included: true },
    { labelKey: "billing.feat.customFields", included: false },
    { labelKey: "billing.feat.apiAccess", included: false },
  ],
  team_pro: [
    { labelKey: "billing.feat.team25", included: true },
    { labelKey: "billing.feat.searchesTeamPro", included: true },
    { labelKey: "billing.feat.sharedCrm", included: true },
    { labelKey: "billing.feat.dedupTeam", included: true },
    { labelKey: "billing.feat.henryTeam", included: true },
    { labelKey: "billing.feat.activityFeed", included: true },
    { labelKey: "billing.feat.weeklyCheckin", included: true },
    { labelKey: "billing.feat.kanbanPipeline", included: true },
    { labelKey: "billing.feat.customFields", included: true },
    { labelKey: "billing.feat.searchAlerts", included: true },
    { labelKey: "billing.feat.apiAccess", included: true },
    { labelKey: "billing.feat.prioritySupport", included: true },
  ],
};

export default function BillingPage() {
  const { t } = useLocale();
  return (
    <>
      <Topbar
        title={t("billing.title")}
        subtitle={t("billing.subtitle")}
        right={
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: 999,
              background:
                "color-mix(in srgb, var(--warm) 18%, var(--surface))",
              color: "#92400E",
              border:
                "1px solid color-mix(in srgb, var(--warm) 40%, var(--border))",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {t("billing.devBadge")}
          </span>
        }
      />
      <div className="page" style={{ maxWidth: 1240 }}>
        <div
          style={{
            padding: "16px 20px",
            borderRadius: 12,
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            marginBottom: 24,
            fontSize: 13.5,
            color: "var(--text-muted)",
            lineHeight: 1.55,
          }}
        >
          {t("billing.demoNotice")}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
          }}
        >
          {PLANS.map((p) => {
            const features = FEATURES[p.id];
            return (
              <PlanCard
                key={p.id}
                plan={p}
                features={features}
              />
            );
          })}
        </div>

        <div
          className="card"
          style={{ padding: 20, marginTop: 24 }}
        >
          <div className="eyebrow" style={{ marginBottom: 8 }}>
            {t("billing.teamGate.title")}
          </div>
          <div
            style={{
              fontSize: 13,
              color: "var(--text-muted)",
              lineHeight: 1.55,
            }}
          >
            {t("billing.teamGate.body")}
          </div>
        </div>
      </div>
    </>
  );
}

function PlanCard({
  plan,
  features,
}: {
  plan: Plan;
  features: PlanFeature[];
}) {
  const { t } = useLocale();
  const id = plan.id;
  return (
    <div
      className="card"
      style={{
        padding: "22px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        borderColor: plan.highlight
          ? "color-mix(in srgb, var(--accent) 50%, var(--border))"
          : undefined,
        boxShadow: plan.highlight
          ? "0 8px 24px color-mix(in srgb, var(--accent) 18%, transparent)"
          : undefined,
        background: plan.highlight
          ? "linear-gradient(180deg, color-mix(in srgb, var(--accent) 5%, var(--surface)), var(--surface))"
          : undefined,
        position: "relative",
      }}
    >
      {plan.highlight && (
        <span
          style={{
            position: "absolute",
            top: -10,
            right: 16,
            fontSize: 10,
            fontWeight: 700,
            padding: "3px 9px",
            borderRadius: 999,
            background: "var(--accent)",
            color: "white",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {t("billing.popular")}
        </span>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: `color-mix(in srgb, ${plan.accent} 14%, var(--surface))`,
            color: plan.accent,
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <Icon name={plan.icon} size={16} />
        </div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: "-0.01em",
          }}
        >
          {t(`billing.plan.${id}.name` as TranslationKey)}
        </div>
      </div>

      <div
        style={{
          fontSize: 13,
          color: "var(--text-muted)",
          lineHeight: 1.55,
          minHeight: 38,
        }}
      >
        {t(`billing.plan.${id}.tagline` as TranslationKey)}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 6,
          padding: "10px 12px",
          borderRadius: 10,
          background: "var(--surface-2)",
        }}
      >
        <span
          style={{
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          {t(`billing.plan.${id}.price` as TranslationKey)}
        </span>
        <span style={{ fontSize: 12, color: "var(--text-dim)" }}>
          {t(`billing.plan.${id}.period` as TranslationKey)}
        </span>
      </div>

      <button
        type="button"
        className="btn btn-sm"
        disabled
        style={{
          opacity: 0.55,
          cursor: "not-allowed",
          justifyContent: "center",
        }}
      >
        {t("billing.cta")}
      </button>

      <div
        style={{
          height: 1,
          background: "var(--border)",
          margin: "4px 0 0",
        }}
      />

      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {features.map((f) => (
          <li
            key={f.labelKey}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              fontSize: 12.5,
              color: f.included ? "var(--text)" : "var(--text-dim)",
              opacity: f.included ? 1 : 0.55,
              lineHeight: 1.45,
            }}
          >
            <Icon
              name={f.included ? "check" : "x"}
              size={12}
              style={{
                color: f.included ? "var(--hot)" : "var(--text-dim)",
                marginTop: 2,
                flexShrink: 0,
              }}
            />
            <span>{t(f.labelKey)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

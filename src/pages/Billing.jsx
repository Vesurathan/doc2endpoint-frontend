import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import {
  createCheckoutSession,
  createPortalSession,
  getSubscriptionDetails,
} from "../api/billing";
import client from "../api/client";

// ─── Plan metadata ────────────────────────────────────────────────────────────

const PLAN_LIMITS = {
  free:    { datasets: 2,      calls: 1_000,    keys: 1 },
  premium: { datasets: 20,     calls: 50_000,   keys: 5 },
  pro:     { datasets: Infinity, calls: Infinity, keys: Infinity },
};

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    priceLabel: "$0",
    period: "forever",
    accentColor: "#64748b",
    features: ["2 datasets", "Excel & CSV only", "5 MB file limit", "1,000 API calls / month", "1 API key"],
  },
  {
    id: "premium",
    name: "Premium",
    price: 29,
    priceLabel: "$29",
    period: "/ month",
    accentColor: "#818cf8",
    badge: "7-day free trial",
    features: ["20 datasets", "Excel, PDF, CSV, Word", "50 MB file limit", "50,000 API calls / month", "5 API keys", "Full agent history", "Email support"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 79,
    priceLabel: "$79",
    period: "/ month",
    accentColor: "#f59e0b",
    badge: "7-day free trial",
    features: ["Unlimited datasets", "All file types + OCR", "100 MB+ file limit", "Unlimited API calls", "Unlimited API keys", "Priority support", "Custom domain"],
  },
];

// ─── Helper components ────────────────────────────────────────────────────────

function StatusPill({ status }) {
  const MAP = {
    free:      { label: "Free plan",  cls: "badge-ghost" },
    active:    { label: "Active",     cls: "badge-success" },
    trialing:  { label: "Trial",      cls: "badge-info" },
    past_due:  { label: "Past due",   cls: "badge-warning" },
    canceled:  { label: "Cancelled",  cls: "badge-error" },
    unpaid:    { label: "Unpaid",     cls: "badge-error" },
  };
  const s = MAP[status] || MAP.free;
  return <span className={`badge badge-sm font-semibold ${s.cls}`}>{s.label}</span>;
}

function UsageBar({ label, used, limit, color = "bg-primary" }) {
  const isUnlimited = limit === Infinity;
  const pct = isUnlimited ? 0 : Math.min(100, Math.round((used / limit) * 100));
  const danger = pct >= 90;
  const warning = pct >= 70 && pct < 90;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-base-content">{label}</span>
        <span className={`text-xs font-mono ${danger ? "text-error" : "text-base-content/50"}`}>
          {isUnlimited ? (
            <span className="text-success font-semibold">Unlimited</span>
          ) : (
            <>{used.toLocaleString()} / {limit.toLocaleString()}</>
          )}
        </span>
      </div>
      {!isUnlimited && (
        <div className="w-full bg-base-300 rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              danger ? "bg-error" : warning ? "bg-warning" : color
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 className="text-xs font-bold uppercase tracking-widest text-base-content/40 mb-4">
      {children}
    </h2>
  );
}

function CheckIcon({ color }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color }}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Billing() {
  const { user } = useAuth();
  const currentPlan = user?.plan || "free";
  const limits = PLAN_LIMITS[currentPlan] || PLAN_LIMITS.free;

  const [sub, setSub] = useState(null);       // Stripe subscription details
  const [usage, setUsage] = useState(null);   // analytics summary
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    Promise.all([
      getSubscriptionDetails(),
      client.get("/analytics/summary"),
    ])
      .then(([subRes, usageRes]) => {
        setSub(subRes.data);
        setUsage(usageRes.data);
      })
      .catch(() => setError("Failed to load billing details."))
      .finally(() => setLoading(false));
  }, []);

  // ── Stripe actions ───────────────────────────────────────────────────────────

  const handleUpgrade = async (planId) => {
    setActionError(null);
    setCheckoutLoading(planId);
    try {
      const res = await createCheckoutSession(planId);
      window.location.href = res.data.url;
    } catch (err) {
      setActionError(err.response?.data?.detail || "Failed to start checkout. Please try again.");
      setCheckoutLoading(null);
    }
  };

  const handlePortal = async () => {
    setActionError(null);
    setPortalLoading(true);
    try {
      const res = await createPortalSession();
      window.location.href = res.data.url;
    } catch (err) {
      setActionError(err.response?.data?.detail || "Failed to open billing portal.");
      setPortalLoading(false);
    }
  };

  // ── Derived values ───────────────────────────────────────────────────────────

  const renewalDate = sub?.current_period_end
    ? new Date(sub.current_period_end * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;

  const trialEnd = sub?.trial_end
    ? new Date(sub.trial_end * 1000)
    : null;

  const trialDaysLeft = trialEnd
    ? Math.max(0, Math.ceil((trialEnd - Date.now()) / 86_400_000))
    : null;

  const status = sub?.status || "free";
  const cancelAtPeriodEnd = sub?.cancel_at_period_end || false;

  const datasetsUsed = usage?.dataset_count ?? 0;
  const callsUsed = usage?.calls_this_month ?? 0;
  const keysUsed = usage?.api_key_count ?? 0;

  // ── Loading / error states ───────────────────────────────────────────────────

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="alert alert-error max-w-lg mx-auto mt-10">{error}</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-base-content">Billing & Subscription</h1>
          <p className="text-sm mt-1 text-base-content/50">
            Manage your plan, track usage, and update payment details.
          </p>
        </div>

        {/* Action error */}
        {actionError && (
          <div className="alert alert-error mb-6 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            {actionError}
          </div>
        )}

        {/* ── 1. Current subscription status ──────────────────────────────── */}
        <section className="rounded-2xl border border-base-300 bg-base-100 overflow-hidden mb-6">
          <div className="px-6 py-5 border-b border-base-300 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-base-content capitalize">{currentPlan} Plan</p>
                <p className="text-xs text-base-content/50">
                  {sub?.amount > 0
                    ? `$${sub.amount.toFixed(0)} / ${sub.interval}`
                    : "No charge"}
                </p>
              </div>
            </div>
            <StatusPill status={status} />
          </div>

          <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Renewal / billing date */}
            <div>
              <p className="text-xs text-base-content/40 uppercase tracking-wider mb-1">
                {cancelAtPeriodEnd ? "Access until" : "Next billing date"}
              </p>
              <p className="font-semibold text-base-content">
                {renewalDate || "—"}
              </p>
              {cancelAtPeriodEnd && (
                <p className="text-xs text-warning mt-1">Cancels at period end</p>
              )}
            </div>

            {/* Trial countdown */}
            <div>
              <p className="text-xs text-base-content/40 uppercase tracking-wider mb-1">Trial</p>
              <p className="font-semibold text-base-content">
                {status === "trialing" && trialDaysLeft !== null
                  ? `${trialDaysLeft} day${trialDaysLeft !== 1 ? "s" : ""} remaining`
                  : status === "free" ? "—" : "Ended"}
              </p>
              {status === "trialing" && (
                <p className="text-xs text-base-content/40 mt-1">
                  Card charged {trialEnd?.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              )}
            </div>

            {/* Quick actions */}
            <div className="flex flex-col gap-2 sm:items-end justify-center">
              {currentPlan !== "free" && sub?.status !== "canceled" && (
                <button
                  className="btn btn-sm btn-outline w-full sm:w-auto"
                  onClick={handlePortal}
                  disabled={portalLoading}
                >
                  {portalLoading
                    ? <span className="loading loading-spinner loading-xs"></span>
                    : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Manage billing
                      </>
                    )}
                </button>
              )}
              {currentPlan === "free" && (
                <Link to="/dashboard/settings" className="btn btn-sm btn-primary w-full sm:w-auto">
                  Upgrade plan
                </Link>
              )}
              {cancelAtPeriodEnd && (
                <button
                  className="btn btn-sm btn-ghost text-error w-full sm:w-auto"
                  onClick={handlePortal}
                  disabled={portalLoading}
                >
                  Reactivate subscription
                </button>
              )}
            </div>
          </div>

          {/* Past due / cancelled warning */}
          {(status === "past_due" || status === "unpaid") && (
            <div className="px-6 pb-5">
              <div className="rounded-lg bg-warning/10 border border-warning/30 px-4 py-3 flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-warning shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-warning">Payment issue detected</p>
                  <p className="text-xs text-base-content/60 mt-0.5">
                    Your last payment failed. Please update your payment method to keep access to your plan.
                  </p>
                  <button className="btn btn-warning btn-xs mt-2" onClick={handlePortal} disabled={portalLoading}>
                    {portalLoading ? <span className="loading loading-spinner loading-xs"></span> : "Update payment method"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ── 2. Usage this billing period ────────────────────────────────── */}
        <section className="rounded-2xl border border-base-300 bg-base-100 p-6 mb-6">
          <SectionTitle>Usage this month</SectionTitle>
          <div className="flex flex-col gap-5">
            <UsageBar
              label="Datasets"
              used={datasetsUsed}
              limit={limits.datasets}
              color="bg-primary"
            />
            <UsageBar
              label="API calls"
              used={callsUsed}
              limit={limits.calls}
              color="bg-secondary"
            />
            <UsageBar
              label="Active API keys"
              used={keysUsed}
              limit={limits.keys}
              color="bg-accent"
            />
          </div>

          {/* Upgrade nudge when close to limit */}
          {currentPlan === "free" && (
            datasetsUsed >= 1 || callsUsed >= 700 || keysUsed >= 1
          ) && (
            <div className="mt-5 rounded-xl bg-primary/5 border border-primary/20 px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
              <p className="text-sm text-base-content/70">
                <span className="font-semibold text-base-content">Running low?</span>{" "}
                Upgrade to Premium for 20 datasets and 50,000 API calls / month.
              </p>
              <button
                className="btn btn-primary btn-sm shrink-0"
                onClick={() => handleUpgrade("premium")}
                disabled={checkoutLoading !== null}
              >
                {checkoutLoading === "premium"
                  ? <span className="loading loading-spinner loading-xs"></span>
                  : "Upgrade — 7-day free trial"}
              </button>
            </div>
          )}
        </section>

        {/* ── 3. Plan comparison ──────────────────────────────────────────── */}
        <section className="rounded-2xl border border-base-300 bg-base-100 p-6 mb-6">
          <SectionTitle>Plans</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLANS.map((plan) => {
              const isCurrent = currentPlan === plan.id;
              const isUpgrade =
                (currentPlan === "free" && plan.id !== "free") ||
                (currentPlan === "premium" && plan.id === "pro");
              const isDowngrade =
                (currentPlan === "pro" && plan.id !== "pro") ||
                (currentPlan === "premium" && plan.id === "free");

              return (
                <div
                  key={plan.id}
                  className={`rounded-xl border p-5 flex flex-col gap-4 transition-all ${
                    isCurrent
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-base-300 hover:border-base-content/20"
                  }`}
                >
                  {/* Header */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-base-content" style={{ color: isCurrent ? undefined : plan.accentColor }}>
                        {plan.name}
                      </span>
                      {isCurrent && <span className="badge badge-primary badge-sm">Current</span>}
                      {plan.badge && !isCurrent && (
                        <span className="badge badge-outline badge-sm text-xs" style={{ borderColor: plan.accentColor, color: plan.accentColor }}>
                          {plan.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-2xl font-extrabold text-base-content">
                      {plan.priceLabel}
                      <span className="text-xs font-normal text-base-content/40 ml-1">{plan.period}</span>
                    </p>
                  </div>

                  {/* Features */}
                  <ul className="flex flex-col gap-1.5 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-base-content/70">
                        <CheckIcon color={isCurrent ? "#6366f1" : plan.accentColor} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="mt-auto pt-2">
                    {isCurrent && plan.id === "free" && (
                      <div className="text-xs text-center text-base-content/40 py-1">Your current plan</div>
                    )}
                    {isCurrent && plan.id !== "free" && (
                      <button
                        className="btn btn-outline btn-sm w-full"
                        onClick={handlePortal}
                        disabled={portalLoading}
                      >
                        {portalLoading
                          ? <span className="loading loading-spinner loading-xs"></span>
                          : "Manage / Cancel"}
                      </button>
                    )}
                    {isUpgrade && (
                      <button
                        className="btn btn-primary btn-sm w-full"
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={checkoutLoading !== null}
                      >
                        {checkoutLoading === plan.id
                          ? <span className="loading loading-spinner loading-xs"></span>
                          : `Upgrade to ${plan.name}`}
                      </button>
                    )}
                    {isDowngrade && sub?.status !== "canceled" && (
                      <button
                        className="btn btn-ghost btn-sm w-full text-base-content/50"
                        onClick={handlePortal}
                        disabled={portalLoading}
                      >
                        {portalLoading
                          ? <span className="loading loading-spinner loading-xs"></span>
                          : "Downgrade"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 4. Billing actions ───────────────────────────────────────────── */}
        {currentPlan !== "free" && (
          <section className="rounded-2xl border border-base-300 bg-base-100 p-6 mb-6">
            <SectionTitle>Billing actions</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

              <ActionCard
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                }
                title="Update payment"
                desc="Change your card or billing details."
                onClick={handlePortal}
                loading={portalLoading}
              />

              <ActionCard
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
                title="View invoices"
                desc="Download past receipts and invoices."
                onClick={handlePortal}
                loading={portalLoading}
              />

              <ActionCard
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                }
                title="Cancel subscription"
                desc="Cancel anytime — access remains until period ends."
                onClick={handlePortal}
                loading={portalLoading}
                danger
              />

            </div>
            <p className="text-xs text-base-content/40 mt-4 text-center">
              All billing actions open the Stripe Customer Portal — your payment data is handled securely by Stripe and never touches our servers.
            </p>
          </section>
        )}

        {/* ── 5. FAQ ───────────────────────────────────────────────────────── */}
        <section className="rounded-2xl border border-base-300 bg-base-100 p-6">
          <SectionTitle>Frequently asked</SectionTitle>
          <div className="flex flex-col divide-y divide-base-300">
            {[
              {
                q: "When am I charged?",
                a: "Your 7-day free trial starts the moment you subscribe. Your card is charged on day 8 unless you cancel before then.",
              },
              {
                q: "Can I switch plans?",
                a: "Yes — upgrade or downgrade anytime via the Stripe Customer Portal. Upgrades take effect immediately (prorated). Downgrades take effect at the end of your billing period.",
              },
              {
                q: "What happens when I cancel?",
                a: "You keep full access until the end of your current billing period. After that, your account moves to the Free plan — your data stays, but you'll be subject to Free plan limits.",
              },
              {
                q: "Do you offer refunds?",
                a: "We don't offer refunds on subscription charges, but the 7-day free trial gives you full access to evaluate the product before any charge.",
              },
              {
                q: "Is my payment info secure?",
                a: "Yes. Card data is handled exclusively by Stripe, a PCI Level 1 certified provider. Doc2Endpoint never sees or stores your card number.",
              },
            ].map(({ q, a }) => (
              <details key={q} className="py-4 group">
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <span className="text-sm font-medium text-base-content">{q}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 text-base-content/40 transition-transform group-open:rotate-180 shrink-0"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="mt-2 text-sm text-base-content/60 leading-relaxed pr-6">{a}</p>
              </details>
            ))}
          </div>
        </section>

      </div>
    </DashboardLayout>
  );
}

// ─── ActionCard ───────────────────────────────────────────────────────────────

function ActionCard({ icon, title, desc, onClick, loading, danger }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`rounded-xl border p-4 text-left flex flex-col gap-2 transition-all w-full ${
        danger
          ? "border-error/30 hover:border-error/60 hover:bg-error/5"
          : "border-base-300 hover:border-base-content/20 hover:bg-base-200/50"
      }`}
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${danger ? "bg-error/10 text-error" : "bg-base-200 text-base-content"}`}>
        {loading ? <span className="loading loading-spinner loading-xs"></span> : icon}
      </div>
      <div>
        <p className={`text-sm font-semibold ${danger ? "text-error" : "text-base-content"}`}>{title}</p>
        <p className="text-xs text-base-content/50 mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </button>
  );
}

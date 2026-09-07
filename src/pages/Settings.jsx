import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { useDialog } from "../context/DialogContext";
import { createCheckoutSession, createPortalSession, getBillingStatus } from "../api/billing";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ─── Plan definitions ─────────────────────────────────────────────────────────

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    color: "#64748b",
    borderColor: "#64748b40",
    bg: "bg-base-200",
    features: [
      "2 datasets",
      "Excel & CSV only",
      "5MB file size limit",
      "1,000 API calls / month",
      "1 API key",
      "Community support",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: "$29",
    period: "/ month",
    color: "#818cf8",
    borderColor: "#818cf840",
    bg: "bg-indigo-950/30",
    badge: "7-day free trial",
    features: [
      "20 datasets",
      "Excel, PDF, CSV, Word",
      "50MB file size limit",
      "50,000 API calls / month",
      "5 API keys",
      "Full agent conversation history",
      "Email support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$79",
    period: "/ month",
    color: "#f59e0b",
    borderColor: "#f59e0b40",
    bg: "bg-amber-950/20",
    badge: "7-day free trial",
    features: [
      "Unlimited datasets",
      "All document types + OCR",
      "100MB+ file size limit",
      "Unlimited API calls",
      "Unlimited API keys",
      "Full agent history",
      "Priority support",
      "Custom domain for APIs",
    ],
  },
];

// ─── UI helpers ───────────────────────────────────────────────────────────────

function SectionCard({ title, children }) {
  return (
    <div className="rounded-xl border border-base-300 bg-base-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-base-300">
        <h2 className="text-sm font-semibold text-base-content uppercase tracking-wide" style={{ letterSpacing: "0.06em" }}>
          {title}
        </h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-base-content">{label}</label>
      {hint && <p className="text-xs text-base-content/50">{hint}</p>}
      {children}
    </div>
  );
}

function CheckIcon({ color }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color }}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Settings() {
  const { user, loginUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Billing
  const [checkoutLoading, setCheckoutLoading] = useState(null); // "premium" | "pro" | null
  const [portalLoading, setPortalLoading] = useState(false);
  const [billingError, setBillingError] = useState(null);
  const [hasSubscription, setHasSubscription] = useState(false);

  // Show success banner if coming back from Stripe
  const upgradedPlan = searchParams.get("plan");
  const upgraded = searchParams.get("upgraded") === "true";
  const cancelled = searchParams.get("upgraded") === "false";

  // Profile form
  const [profile, setProfile] = useState({ full_name: user?.full_name || "", email: user?.email || "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);

  // Password form
  const [pwd, setPwd] = useState({ current_password: "", new_password: "", confirm: "" });
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMsg, setPwdMsg] = useState(null);

  // Delete account
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { confirm, alert } = useDialog();

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const currentPlan = user?.plan || "free";
  const isGoogleAccount = user?.has_password === false;

  // Fetch billing status on mount
  useEffect(() => {
    getBillingStatus()
      .then((res) => setHasSubscription(res.data.has_subscription))
      .catch(() => {});
  }, []);

  // ── Billing actions ──────────────────────────────────────────────────────────

  const handleUpgrade = async (planId) => {
    setBillingError(null);
    setCheckoutLoading(planId);
    try {
      const res = await createCheckoutSession(planId);
      window.location.href = res.data.url; // redirect to Stripe Checkout
    } catch (err) {
      setBillingError(
        err.response?.data?.detail ||
        "Unable to open checkout. Please try again or contact support."
      );
      setCheckoutLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    setBillingError(null);
    setPortalLoading(true);
    try {
      const res = await createPortalSession();
      window.location.href = res.data.url; // redirect to Stripe Customer Portal
    } catch (err) {
      setBillingError(
        err.response?.data?.detail ||
        "Unable to open billing portal. Please try again."
      );
      setPortalLoading(false);
    }
  };

  // ── Profile ──────────────────────────────────────────────────────────────────

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      const res = await axios.patch(`${API}/auth/me`, { full_name: profile.full_name }, { headers });
      loginUser(token, res.data);
      setProfileMsg({ type: "success", text: "Profile updated successfully." });
    } catch (err) {
      setProfileMsg({ type: "error", text: err.response?.data?.detail || "Failed to update profile." });
    } finally {
      setProfileSaving(false);
    }
  };

  // ── Password ─────────────────────────────────────────────────────────────────

  const changePassword = async (e) => {
    e.preventDefault();
    setPwdMsg(null);
    if (pwd.new_password !== pwd.confirm) {
      setPwdMsg({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (pwd.new_password.length < 8) {
      setPwdMsg({ type: "error", text: "Password must be at least 8 characters." });
      return;
    }
    setPwdSaving(true);
    try {
      const endpoint = isGoogleAccount ? `${API}/auth/set-password` : `${API}/auth/change-password`;
      await axios.post(endpoint, {
        current_password: pwd.current_password || "",
        new_password: pwd.new_password,
      }, { headers });
      setPwdMsg({
        type: "success",
        text: isGoogleAccount
          ? "Password set! You can now sign in with email too."
          : "Password changed successfully.",
      });
      setPwd({ current_password: "", new_password: "", confirm: "" });
    } catch (err) {
      setPwdMsg({ type: "error", text: err.response?.data?.detail || "Failed to update password." });
    } finally {
      setPwdSaving(false);
    }
  };

  // ── Delete account ───────────────────────────────────────────────────────────

  const deleteAccount = async () => {
    if (deleteConfirm !== user?.email) return;
    const ok = await confirm({
      title: "Delete your account?",
      message: "Every dataset, API key and live endpoint you own will be permanently destroyed. This cannot be undone.",
      confirmText: "Delete my account",
      danger: true,
    });
    if (!ok) return;
    setDeleteLoading(true);
    try {
      await axios.delete(`${API}/auth/me`, { headers });
      localStorage.removeItem("token");
      navigate("/");
    } catch (err) {
      await alert({
        title: "Could not delete account",
        message: err.response?.data?.detail || "Something went wrong. Please try again.",
        danger: true,
      });
      setDeleteLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-base-content">Settings</h1>
          <p className="text-sm mt-1 text-base-content/50">Manage your account preferences and subscription.</p>
        </div>

        {/* ── Stripe return banners ─────────────────────────────────────── */}
        {upgraded && (
          <div className="alert alert-success mb-6 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold">
                {upgradedPlan
                  ? `You're now on the ${upgradedPlan.charAt(0).toUpperCase() + upgradedPlan.slice(1)} plan!`
                  : "Subscription activated!"}
              </p>
              <p className="text-sm opacity-80">Your 7-day free trial has started. No charge until the trial ends.</p>
            </div>
          </div>
        )}
        {cancelled && (
          <div className="alert alert-info mb-6 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">Checkout cancelled — you have not been charged.</p>
          </div>
        )}

        <div className="flex flex-col gap-6">

          {/* ── Subscription Plan ─────────────────────────────────────────── */}
          <SectionCard title="Subscription Plan">
            {billingError && (
              <div className="alert alert-error text-sm mb-4 py-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {billingError}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              {PLANS.map((plan) => {
                const isCurrent = currentPlan === plan.id;
                const isDowngrade = (
                  (currentPlan === "pro" && plan.id === "premium") ||
                  (currentPlan !== "free" && plan.id === "free")
                );

                return (
                  <div
                    key={plan.id}
                    className={`rounded-xl border p-5 transition-all ${
                      isCurrent
                        ? "border-primary/50 bg-primary/5"
                        : "border-base-300 hover:border-base-content/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      {/* Plan info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span
                            className="font-bold text-base"
                            style={{ color: isCurrent ? undefined : plan.color }}
                          >
                            {plan.name}
                          </span>
                          {isCurrent && (
                            <span className="badge badge-primary badge-sm">Current plan</span>
                          )}
                          {plan.badge && !isCurrent && (
                            <span className="badge badge-outline badge-sm" style={{ borderColor: plan.color, color: plan.color }}>
                              {plan.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-2xl font-extrabold text-base-content mb-3">
                          {plan.price}
                          <span className="text-sm font-normal text-base-content/50 ml-1">{plan.period}</span>
                        </p>
                        <ul className="flex flex-col gap-1">
                          {plan.features.map((f) => (
                            <li key={f} className="flex items-center gap-2 text-sm text-base-content/70">
                              <CheckIcon color={isCurrent ? "currentColor" : plan.color} />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* CTA */}
                      <div className="shrink-0 flex flex-col gap-2 mt-1">
                        {isCurrent && plan.id !== "free" && (
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={handleManageSubscription}
                            disabled={portalLoading}
                          >
                            {portalLoading
                              ? <span className="loading loading-spinner loading-xs"></span>
                              : "Manage subscription"}
                          </button>
                        )}
                        {isCurrent && plan.id === "free" && (
                          <span className="text-sm text-base-content/40 font-medium">Active</span>
                        )}
                        {!isCurrent && !isDowngrade && (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleUpgrade(plan.id)}
                            disabled={checkoutLoading !== null}
                          >
                            {checkoutLoading === plan.id
                              ? <span className="loading loading-spinner loading-xs"></span>
                              : `Upgrade to ${plan.name}`}
                          </button>
                        )}
                        {!isCurrent && isDowngrade && hasSubscription && (
                          <button
                            className="btn btn-sm btn-ghost text-base-content/50"
                            onClick={handleManageSubscription}
                            disabled={portalLoading}
                          >
                            {portalLoading
                              ? <span className="loading loading-spinner loading-xs"></span>
                              : "Downgrade"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {currentPlan !== "free" && (
              <p className="text-xs text-base-content/40 mt-4 text-center">
                To cancel or change your plan, click <strong>Manage subscription</strong> above — you can cancel anytime with no penalty.
                Full billing details and invoice history are on the{" "}
                <Link to="/dashboard/billing" className="text-primary hover:underline">Billing page</Link>.
              </p>
            )}
          </SectionCard>

          {/* ── Profile ───────────────────────────────────────────────────── */}
          <SectionCard title="Profile">
            <form onSubmit={saveProfile} className="flex flex-col gap-4">
              {profileMsg && (
                <div className={`alert ${profileMsg.type === "success" ? "alert-success" : "alert-error"} text-sm py-2`}>
                  {profileMsg.text}
                </div>
              )}
              <Field label="Full name">
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  required
                />
              </Field>
              <Field label="Email address" hint="Your login email. Contact support to change it.">
                <input
                  type="email"
                  className="input input-bordered w-full opacity-60"
                  value={profile.email}
                  disabled
                />
              </Field>
              <div className="flex justify-end">
                <button type="submit" className="btn btn-primary btn-sm" disabled={profileSaving}>
                  {profileSaving ? <span className="loading loading-spinner loading-xs"></span> : "Save changes"}
                </button>
              </div>
            </form>
          </SectionCard>

          {/* ── Password ──────────────────────────────────────────────────── */}
          <SectionCard title={isGoogleAccount ? "Set a Password" : "Change Password"}>
            {isGoogleAccount && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-base-200 mb-4">
                <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                  <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                  <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
                <p className="text-sm text-base-content/70">
                  You signed up with Google. You can optionally add a password to also sign in with email.
                </p>
              </div>
            )}
            <form onSubmit={changePassword} className="flex flex-col gap-4">
              {pwdMsg && (
                <div className={`alert ${pwdMsg.type === "success" ? "alert-success" : "alert-error"} text-sm py-2`}>
                  {pwdMsg.text}
                </div>
              )}
              {!isGoogleAccount && (
                <Field label="Current password">
                  <input
                    type="password"
                    className="input input-bordered w-full"
                    placeholder="Enter current password"
                    value={pwd.current_password}
                    onChange={(e) => setPwd({ ...pwd, current_password: e.target.value })}
                    required={!isGoogleAccount}
                  />
                </Field>
              )}
              <Field label="New password">
                <input
                  type="password"
                  className="input input-bordered w-full"
                  placeholder="Min. 8 characters"
                  value={pwd.new_password}
                  onChange={(e) => setPwd({ ...pwd, new_password: e.target.value })}
                  required
                />
              </Field>
              <Field label="Confirm new password">
                <input
                  type="password"
                  className="input input-bordered w-full"
                  placeholder="Repeat new password"
                  value={pwd.confirm}
                  onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
                  required
                />
              </Field>
              <div className="flex justify-end">
                <button type="submit" className="btn btn-primary btn-sm" disabled={pwdSaving}>
                  {pwdSaving
                    ? <span className="loading loading-spinner loading-xs"></span>
                    : isGoogleAccount ? "Set password" : "Update password"}
                </button>
              </div>
            </form>
          </SectionCard>

          {/* ── Danger Zone ───────────────────────────────────────────────── */}
          <SectionCard title="Danger Zone">
            <div className="flex flex-col gap-4">
              <p className="text-sm text-base-content/60">
                Permanently delete your account and all associated datasets, API keys, and data.
                This action <strong className="text-base-content">cannot be undone</strong>.
                {currentPlan !== "free" && (
                  <span className="block mt-1 text-warning">
                    You have an active subscription — cancel it first via <strong>Manage subscription</strong> to avoid further charges.
                  </span>
                )}
              </p>
              <div className="rounded-lg border border-error/30 bg-error/5 p-4 flex flex-col gap-3">
                <p className="text-sm text-error font-medium">
                  Type your email address to confirm deletion:
                </p>
                <input
                  type="email"
                  className="input input-bordered input-error input-sm w-full max-w-xs"
                  placeholder={user?.email}
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                />
                <button
                  onClick={deleteAccount}
                  disabled={deleteConfirm !== user?.email || deleteLoading}
                  className="btn btn-error btn-sm self-start"
                >
                  {deleteLoading
                    ? <span className="loading loading-spinner loading-xs"></span>
                    : "Delete my account"}
                </button>
              </div>
            </div>
          </SectionCard>

        </div>
      </div>
    </DashboardLayout>
  );
}

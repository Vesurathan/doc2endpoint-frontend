import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { getSystemStats } from "../../api/admin";

const QUICK_LINKS = [
  {
    to: "/admin/users",
    label: "Manage Users",
    desc: "View, edit plans, deactivate accounts",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    to: "/admin/datasets",
    label: "Manage Datasets",
    desc: "Browse and delete all platform datasets",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
      </svg>
    ),
  },
  {
    to: "/admin/api-keys",
    label: "Manage API Keys",
    desc: "View and revoke keys across all users",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
  },
  {
    to: "/admin/analytics",
    label: "Platform Analytics",
    desc: "Usage trends, top users, growth charts",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
      </svg>
    ),
  },
];

const PLAN_COLOR = { free: "#64748b", premium: "#6366f1", pro: "#f59e0b" };

function StatCard({ label, value, sub, color = "#6366f1", icon }) {
  return (
    <div className="rounded-xl p-5" style={{ background: "#1e293b", border: "1px solid #2d3f55" }}>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: color + "1a", color }}>
          {icon}
        </div>
        <div>
          <div className="text-2xl font-semibold text-white tracking-tight">{value ?? "—"}</div>
          <div className="text-sm mt-0.5" style={{ color: "#94a3b8" }}>{label}</div>
          {sub && <div className="text-xs mt-0.5" style={{ color: "#475569" }}>{sub}</div>}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSystemStats().then((r) => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  const planBreakdown = stats?.users?.by_plan || {};
  const totalUsers = stats?.users?.total || 1;

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-white">System Overview</h1>
        <p className="text-sm mt-1" style={{ color: "#64748b" }}>
          Platform-wide metrics — all users, datasets, and API activity.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <span className="loading loading-spinner loading-md" style={{ color: "#6366f1" }}></span>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              label="Total Users"
              value={stats?.users?.total?.toLocaleString()}
              sub={`${stats?.users?.active} active · ${stats?.users?.new_this_week} new this week`}
              color="#6366f1"
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
            />
            <StatCard
              label="Total Datasets"
              value={stats?.datasets?.total?.toLocaleString()}
              sub={`${stats?.datasets?.active} live · ${(stats?.datasets?.total_rows_stored || 0).toLocaleString()} rows`}
              color="#10b981"
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg>}
            />
            <StatCard
              label="API Calls (month)"
              value={stats?.api_calls?.this_month?.toLocaleString()}
              sub={`${(stats?.api_calls?.total || 0).toLocaleString()} total all time`}
              color="#f59e0b"
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
            />
            <StatCard
              label="Active API Keys"
              value={stats?.api_keys?.active?.toLocaleString()}
              color="#ec4899"
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Plan distribution */}
            <div className="rounded-xl p-5" style={{ background: "#1e293b", border: "1px solid #2d3f55" }}>
              <h2 className="text-sm font-semibold text-white mb-5 uppercase tracking-wide" style={{ letterSpacing: "0.06em" }}>
                Users by Plan
              </h2>
              <div className="flex flex-col gap-4">
                {["free", "premium", "pro"].map((plan) => {
                  const count = planBreakdown[plan] || 0;
                  const pct = Math.round((count / totalUsers) * 100);
                  return (
                    <div key={plan}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm capitalize" style={{ color: "#cbd5e1" }}>{plan}</span>
                        <span className="text-sm font-medium text-white">
                          {count.toLocaleString()}
                          <span className="text-xs font-normal ml-1.5" style={{ color: "#475569" }}>{pct}%</span>
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full w-full" style={{ background: "#0f172a" }}>
                        <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: PLAN_COLOR[plan] }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick navigation */}
            <div className="rounded-xl p-5" style={{ background: "#1e293b", border: "1px solid #2d3f55" }}>
              <h2 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide" style={{ letterSpacing: "0.06em" }}>
                Quick Navigation
              </h2>
              <div className="flex flex-col gap-1">
                {QUICK_LINKS.map((q) => (
                  <Link
                    key={q.to}
                    to={q.to}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group"
                    style={{ color: "#94a3b8" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#263045")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <span style={{ color: "#6366f1" }}>{q.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{q.label}</p>
                      <p className="text-xs truncate" style={{ color: "#475569" }}>{q.desc}</p>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

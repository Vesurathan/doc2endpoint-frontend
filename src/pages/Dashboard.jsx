import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { getSummary, getCallsOverTime } from "../api/analytics";
import { listDatasets } from "../api/datasets";

const DOC_TYPE_ICON = {
  excel: { bg: "bg-success/10", color: "text-success", path: "M3 10h18M3 6h18M3 14h18M3 18h18M8 6v12" },
  csv:   { bg: "bg-info/10",    color: "text-info",    path: "M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" },
  pdf:   { bg: "bg-error/10",   color: "text-error",   path: "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" },
  docx:  { bg: "bg-secondary/10", color: "text-secondary", path: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
  image: { bg: "bg-warning/10", color: "text-warning", path: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
};

function DocMiniIcon({ docType }) {
  const t = DOC_TYPE_ICON[docType];
  if (!t) return (
    <div className="w-8 h-8 rounded-lg bg-base-300 flex items-center justify-center shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    </div>
  );
  return (
    <div className={`w-8 h-8 rounded-lg ${t.bg} flex items-center justify-center shrink-0`}>
      <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 ${t.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={t.path} />
      </svg>
    </div>
  );
}

function MiniBar({ data }) {
  if (!data || data.length === 0) return null;
  const last7 = data.slice(-7);
  const max = Math.max(...last7.map((d) => d.calls), 1);
  return (
    <div className="flex items-end gap-0.5 h-8">
      {last7.map((d) => (
        <div
          key={d.date}
          className="flex-1 bg-primary/60 rounded-sm"
          style={{ height: `${Math.max((d.calls / max) * 100, 4)}%` }}
          title={`${d.date}: ${d.calls}`}
        />
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const firstName = user?.full_name?.split(" ")[0] || "there";

  const [summary, setSummary] = useState(null);
  const [chart, setChart] = useState([]);
  const [datasets, setDatasets] = useState([]);

  useEffect(() => {
    getSummary().then((r) => setSummary(r.data)).catch(() => {});
    getCallsOverTime(7).then((r) => setChart(r.data.data)).catch(() => {});
    listDatasets().then((r) => setDatasets(r.data.slice(0, 5))).catch(() => {});
  }, []);

  const stats = [
    {
      label: "Datasets",
      value: summary?.dataset_count ?? "—",
      sub: `${summary?.active_dataset_count ?? 0} active`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
        </svg>
      ),
    },
    {
      label: "API Calls (this month)",
      value: summary?.calls_this_month?.toLocaleString() ?? "—",
      sub: `${summary?.calls_total?.toLocaleString() ?? 0} total`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      extra: <MiniBar data={chart} />,
    },
    {
      label: "Active API Keys",
      value: summary?.api_key_count ?? "—",
      sub: "across all datasets",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
      ),
    },
  ];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-base-content">Good morning, {firstName}</h1>
          <p className="text-base-content/50 text-sm mt-1">Here's what's happening with your APIs.</p>
        </div>
        <Link to="/dashboard/datasets/new" className="btn btn-primary gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Dataset
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body py-4 px-5">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                  {s.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-2xl font-bold text-base-content">{s.value}</div>
                  <p className="text-xs text-base-content/50">{s.label}</p>
                  <p className="text-xs text-base-content/30 mt-0.5">{s.sub}</p>
                </div>
              </div>
              {s.extra && <div className="mt-3">{s.extra}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Recent datasets */}
      <div className="card bg-base-100 border border-base-300 shadow-sm mb-5">
        <div className="card-body py-4 px-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-base-content">Recent Datasets</h2>
            <Link to="/dashboard/datasets" className="text-xs text-primary hover:underline">View all</Link>
          </div>

          {datasets.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-base-content/30 text-sm mb-4">No datasets yet</p>
              <Link to="/dashboard/datasets/new" className="btn btn-primary btn-sm">Upload your first document</Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {datasets.map((ds) => (
                <Link
                  key={ds.id}
                  to={`/dashboard/datasets/${ds.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-base-200 transition-colors"
                >
                  <DocMiniIcon docType={ds.doc_type} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-base-content truncate">{ds.name}</p>
                    <p className="text-xs text-base-content/40">{ds.row_count?.toLocaleString()} rows · {ds.doc_type?.toUpperCase()}</p>
                  </div>
                  <span className={`badge badge-sm ${ds.status === "active" ? "badge-success" : ds.status === "reviewing" ? "badge-warning" : "badge-ghost"}`}>
                    {ds.status === "active" ? "Live" : ds.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            to: "/dashboard/datasets/new",
            label: "Upload a document",
            desc: "Start a new dataset from any file",
            bg: "bg-primary/10", color: "text-primary",
            icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12",
          },
          {
            to: "/dashboard/api-keys",
            label: "Manage API keys",
            desc: "Create or revoke access keys",
            bg: "bg-warning/10", color: "text-warning",
            icon: "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z",
          },
          {
            to: "/dashboard/analytics",
            label: "View analytics",
            desc: "See usage stats and recent calls",
            bg: "bg-success/10", color: "text-success",
            icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
          },
        ].map((q) => (
          <Link key={q.to} to={q.to} className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md hover:border-primary/30 transition-all">
            <div className="card-body py-4 px-5 flex-row items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${q.bg} flex items-center justify-center shrink-0`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${q.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={q.icon} />
                </svg>
              </div>
              <div>
                <p className="font-medium text-base-content text-sm">{q.label}</p>
                <p className="text-xs text-base-content/40">{q.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </DashboardLayout>
  );
}

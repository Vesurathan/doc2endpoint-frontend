import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { getSummary, getCallsOverTime, getByDataset, getRecentCalls } from "../api/analytics";

function BarChart({ data }) {
  if (!data || data.length === 0) return <p className="text-sm text-base-content/30 text-center py-8">No data yet</p>;
  const max = Math.max(...data.map((d) => d.calls), 1);
  const last14 = data.slice(-14);

  return (
    <div className="flex items-end gap-1 h-28 w-full">
      {last14.map((d) => {
        const pct = max === 0 ? 0 : (d.calls / max) * 100;
        const date = new Date(d.date);
        const label = date.toLocaleDateString("en", { month: "short", day: "numeric" });
        return (
          <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative" title={`${label}: ${d.calls} calls`}>
            <div
              className="w-full bg-primary rounded-t transition-all group-hover:bg-primary/80"
              style={{ height: `${Math.max(pct, 2)}%` }}
            />
            {d.calls > 0 && (
              <span className="absolute -top-5 text-xs text-base-content/60 opacity-0 group-hover:opacity-100 whitespace-nowrap">
                {d.calls}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

const STATUS_COLOR = {
  200: "text-success",
  201: "text-success",
  400: "text-warning",
  401: "text-error",
  403: "text-error",
  404: "text-warning",
  500: "text-error",
};

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [chart, setChart] = useState([]);
  const [byDataset, setByDataset] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSummary(), getCallsOverTime(30), getByDataset(), getRecentCalls(15)])
      .then(([s, c, bd, rc]) => {
        setSummary(s.data);
        setChart(c.data.data);
        setByDataset(bd.data.data);
        setRecent(rc.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-base-content">Analytics</h1>
        <p className="text-base-content/50 text-sm mt-1">API usage across all your datasets.</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Calls this month", value: summary?.calls_this_month?.toLocaleString() ?? "0",
            bg: "bg-primary/10", color: "text-primary",
            path: "M13 10V3L4 14h7v7l9-11h-7z",
          },
          {
            label: "Total calls", value: summary?.calls_total?.toLocaleString() ?? "0",
            bg: "bg-info/10", color: "text-info",
            path: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
          },
          {
            label: "Active datasets", value: summary?.active_dataset_count ?? "0",
            bg: "bg-success/10", color: "text-success",
            path: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4",
          },
          {
            label: "API keys", value: summary?.api_key_count ?? "0",
            bg: "bg-warning/10", color: "text-warning",
            path: "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z",
          },
        ].map((s) => (
          <div key={s.label} className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body py-4 px-5">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-2`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${s.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={s.path} />
                </svg>
              </div>
              <div className="text-2xl font-bold text-base-content">{s.value}</div>
              <div className="text-xs text-base-content/50">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Calls chart */}
        <div className="lg:col-span-2 card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-base-content">API Calls (last 30 days)</h2>
              <span className="text-xs text-base-content/40">Last 14 days shown</span>
            </div>
            <BarChart data={chart} />
            {chart.length > 0 && (
              <div className="flex justify-between mt-2">
                <span className="text-xs text-base-content/30">{chart[chart.length - 14]?.date}</span>
                <span className="text-xs text-base-content/30">{chart[chart.length - 1]?.date}</span>
              </div>
            )}
          </div>
        </div>

        {/* Top datasets */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body">
            <h2 className="font-semibold text-base-content mb-4">Top Datasets</h2>
            {byDataset.length === 0 ? (
              <p className="text-sm text-base-content/30 text-center py-8">No API calls yet</p>
            ) : (
              <div className="flex flex-col gap-3">
                {byDataset.map((d, i) => {
                  const maxCalls = byDataset[0]?.calls || 1;
                  const pct = (d.calls / maxCalls) * 100;
                  return (
                    <div key={d.id}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-base-content truncate max-w-[70%]">{d.name}</span>
                        <span className="text-base-content/50 text-xs">{d.calls.toLocaleString()}</span>
                      </div>
                      <progress className="progress progress-primary h-1.5 w-full" value={pct} max="100"></progress>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent calls */}
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body">
          <h2 className="font-semibold text-base-content mb-4">Recent API Calls</h2>
          {recent.length === 0 ? (
            <p className="text-sm text-base-content/30 text-center py-8">No recent calls</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr className="border-base-200">
                    <th>Status</th>
                    <th>Path</th>
                    <th>Dataset</th>
                    <th>Key</th>
                    <th>Time</th>
                    <th>When</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((r) => (
                    <tr key={r.id} className="border-base-200 hover text-sm">
                      <td>
                        <span className={`font-mono font-bold ${STATUS_COLOR[r.status_code] || "text-base-content"}`}>
                          {r.status_code}
                        </span>
                      </td>
                      <td className="font-mono text-xs text-base-content/70 max-w-xs truncate">{r.path}</td>
                      <td className="text-base-content/60">{r.dataset_name}</td>
                      <td className="text-base-content/40 text-xs">{r.key_name}</td>
                      <td className="text-base-content/40 text-xs">{r.response_time_ms}ms</td>
                      <td className="text-base-content/40 text-xs whitespace-nowrap">
                        {new Date(r.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

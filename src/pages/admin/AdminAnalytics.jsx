import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { getAdminCallsOverTime, getNewUsersOverTime, getTopUsers } from "../../api/admin";

function DarkBar({ data, valueKey, color = "#6366f1" }) {
  if (!data || data.length === 0)
    return <p className="text-sm text-center py-8" style={{ color: "#475569" }}>No data yet</p>;
  const last14 = data.slice(-14);
  const max = Math.max(...last14.map((d) => d[valueKey] || 0), 1);
  return (
    <div className="flex items-end gap-1 h-28 w-full">
      {last14.map((d, i) => {
        const pct = (d[valueKey] / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center group relative" style={{ height: "100%", justifyContent: "flex-end" }}>
            <div
              className="w-full rounded-t transition-all"
              style={{ height: `${Math.max(pct, 2)}%`, background: color, opacity: 0.8 }}
              title={`${d.date}: ${d[valueKey]}`}
            />
            {d[valueKey] > 0 && (
              <span className="absolute -top-5 text-xs opacity-0 group-hover:opacity-100 whitespace-nowrap" style={{ color: "#94a3b8" }}>
                {d[valueKey]}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function AdminAnalytics() {
  const [calls, setCalls] = useState([]);
  const [newUsers, setNewUsers] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAdminCallsOverTime(30), getNewUsersOverTime(30), getTopUsers(10)])
      .then(([c, u, t]) => { setCalls(c.data.data); setNewUsers(u.data.data); setTopUsers(t.data.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <span className="loading loading-spinner loading-lg" style={{ color: "#6366f1" }}></span>
        </div>
      </AdminLayout>
    );
  }

  const totalCalls = calls.reduce((s, d) => s + d.calls, 0);
  const totalNewUsers = newUsers.reduce((s, d) => s + d.count, 0);

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Platform Analytics</h1>
        <p className="text-sm mt-1" style={{ color: "#64748b" }}>Last 30 days — platform-wide usage and growth.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          { label: "API Calls (30 days)", value: totalCalls.toLocaleString(), color: "#6366f1" },
          { label: "New Users (30 days)", value: totalNewUsers.toLocaleString(), color: "#10b981" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-5" style={{ background: "#1e293b", border: "1px solid #334155" }}>
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-sm mt-1" style={{ color: "#64748b" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <div className="rounded-2xl p-5" style={{ background: "#1e293b", border: "1px solid #334155" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">API Calls</h2>
            <span className="text-xs" style={{ color: "#475569" }}>Last 14 days shown</span>
          </div>
          <DarkBar data={calls} valueKey="calls" color="#6366f1" />
          <div className="flex justify-between mt-2">
            <span className="text-xs" style={{ color: "#334155" }}>{calls[calls.length - 14]?.date}</span>
            <span className="text-xs" style={{ color: "#334155" }}>{calls[calls.length - 1]?.date}</span>
          </div>
        </div>

        <div className="rounded-2xl p-5" style={{ background: "#1e293b", border: "1px solid #334155" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">New Users</h2>
            <span className="text-xs" style={{ color: "#475569" }}>Last 14 days shown</span>
          </div>
          <DarkBar data={newUsers} valueKey="count" color="#10b981" />
          <div className="flex justify-between mt-2">
            <span className="text-xs" style={{ color: "#334155" }}>{newUsers[newUsers.length - 14]?.date}</span>
            <span className="text-xs" style={{ color: "#334155" }}>{newUsers[newUsers.length - 1]?.date}</span>
          </div>
        </div>
      </div>

      {/* Top users table */}
      <div className="rounded-2xl overflow-x-auto" style={{ background: "#1e293b", border: "1px solid #334155" }}>
        <div className="px-5 py-4" style={{ borderBottom: "1px solid #334155" }}>
          <h2 className="font-semibold text-white">Top Users by API Calls</h2>
        </div>
        {topUsers.length === 0 ? (
          <p className="text-center py-10 text-sm" style={{ color: "#475569" }}>No API calls recorded yet</p>
        ) : (
          <table className="table w-full">
            <thead>
              <tr style={{ background: "#0f172a", borderColor: "#334155" }}>
                {["#", "User", "Plan", "Total Calls", "Usage"].map((h) => (
                  <th key={h} style={{ color: "#64748b", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topUsers.map((u, i) => {
                const maxCalls = topUsers[0]?.calls || 1;
                const pct = (u.calls / maxCalls) * 100;
                return (
                  <tr key={u.id} style={{ borderColor: "#334155" }}>
                    <td style={{ color: "#475569", fontSize: "13px" }}>#{i + 1}</td>
                    <td>
                      <p className="text-sm font-medium text-white">{u.full_name}</p>
                      <p className="text-xs" style={{ color: "#475569" }}>{u.email}</p>
                    </td>
                    <td>
                      <span className="text-xs capitalize font-medium" style={{ color: u.plan === "pro" ? "#f59e0b" : u.plan === "premium" ? "#818cf8" : "#64748b" }}>
                        {u.plan}
                      </span>
                    </td>
                    <td className="font-bold text-white">{u.calls.toLocaleString()}</td>
                    <td style={{ minWidth: "120px" }}>
                      <div className="h-1.5 rounded-full w-full" style={{ background: "#0f172a" }}>
                        <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: "#6366f1" }}></div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}

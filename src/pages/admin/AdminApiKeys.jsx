import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { listAdminKeys, revokeAdminKey } from "../../api/admin";

export default function AdminApiKeys() {
  const [keys, setKeys] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState(null);

  const load = (p = 1) => {
    setLoading(true);
    listAdminKeys({ page: p, limit: 25 })
      .then((r) => { setKeys(r.data.data); setTotal(r.data.total); setPages(Math.ceil(r.data.total / 25)); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleRevoke = async (key) => {
    if (!confirm(`Revoke API key "${key.name}" for ${key.user_email}? Any apps using this key will break immediately.`)) return;
    setRevoking(key.id);
    try {
      await revokeAdminKey(key.id);
      setKeys((prev) => prev.map((k) => k.id === key.id ? { ...k, is_active: false } : k));
    } finally {
      setRevoking(null);
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">API Keys</h1>
          <p className="text-sm mt-1" style={{ color: "#64748b" }}>{total.toLocaleString()} keys across all users</p>
        </div>
      </div>

      <div className="rounded-2xl overflow-x-auto" style={{ background: "#1e293b", border: "1px solid #334155" }}>
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <span className="loading loading-spinner" style={{ color: "#6366f1" }}></span>
          </div>
        ) : keys.length === 0 ? (
          <div className="text-center py-16" style={{ color: "#475569" }}>No API keys found</div>
        ) : (
          <table className="table w-full">
            <thead>
              <tr style={{ background: "#0f172a", borderColor: "#334155" }}>
                {["Name", "Key prefix", "Owner", "Status", "Last Used", "Created", ""].map((h) => (
                  <th key={h} style={{ color: "#64748b", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => (
                <tr key={k.id} style={{ borderColor: "#334155" }}>
                  <td className="font-medium text-white text-sm">{k.name}</td>
                  <td><code className="text-xs font-mono" style={{ color: "#94a3b8" }}>{k.key_prefix}••••</code></td>
                  <td style={{ color: "#94a3b8", fontSize: "13px" }}>{k.user_email}</td>
                  <td>
                    <span className="text-xs font-semibold" style={{ color: k.is_active ? "#10b981" : "#475569" }}>
                      {k.is_active ? "Active" : "Revoked"}
                    </span>
                  </td>
                  <td style={{ color: "#475569", fontSize: "12px" }}>
                    {k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : "Never"}
                  </td>
                  <td style={{ color: "#475569", fontSize: "12px" }}>{new Date(k.created_at).toLocaleDateString()}</td>
                  <td>
                    {k.is_active && (
                      <button
                        onClick={() => handleRevoke(k)}
                        disabled={revoking === k.id}
                        className="btn btn-ghost btn-xs"
                        style={{ color: "#ef4444" }}
                      >
                        {revoking === k.id ? <span className="loading loading-spinner loading-xs"></span> : "Revoke"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-5">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => { setPage(p); load(p); }}
              className="btn btn-sm"
              style={{ background: p === page ? "#6366f1" : "#1e293b", color: p === page ? "#fff" : "#64748b", borderColor: "#334155" }}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

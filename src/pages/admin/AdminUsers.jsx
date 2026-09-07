import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { listAdminUsers, updateAdminUser, deleteAdminUser } from "../../api/admin";
import { useDialog } from "../../context/DialogContext";

const PLAN_COLOR = {
  free: { bg: "#1e293b", text: "#64748b", border: "#334155" },
  premium: { bg: "#1e1b4b", text: "#818cf8", border: "#3730a3" },
  pro: { bg: "#1c1409", text: "#f59e0b", border: "#92400e" },
};

function PlanBadge({ plan }) {
  const s = PLAN_COLOR[plan] || PLAN_COLOR.free;
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold capitalize" style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}>
      {plan}
    </span>
  );
}

function UserDrawer({ user, onClose, onUpdate }) {
  const [plan, setPlan] = useState(user.plan);
  const [isActive, setIsActive] = useState(user.is_active);
  const [isAdmin, setIsAdmin] = useState(user.is_admin);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { confirm } = useDialog();

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await updateAdminUser(user.id, { plan, is_active: isActive, is_admin: isAdmin });
      onUpdate(res.data);
      onClose();
    } catch (e) {
      setError(e.response?.data?.detail || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const ok = await confirm({
      title: "Delete this user?",
      message: `${user.email} will be permanently removed, along with their datasets, API keys and usage history. This cannot be undone.`,
      confirmText: "Delete user",
      danger: true,
    });
    if (!ok) return;
    try {
      await deleteAdminUser(user.id);
      onUpdate(null);
      onClose();
    } catch (e) {
      setError(e.response?.data?.detail || "Delete failed");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/50" onClick={onClose}></div>
      <div className="w-96 flex flex-col h-full overflow-y-auto" style={{ background: "#1e293b", borderLeft: "1px solid #334155" }}>
        <div className="p-5 flex items-center justify-between" style={{ borderBottom: "1px solid #334155" }}>
          <h2 className="font-bold text-white">Edit User</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 flex flex-col gap-5 flex-1">
          {/* User info */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white" style={{ background: "#6366f1" }}>
              {user.full_name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-white">{user.full_name}</p>
              <p className="text-sm" style={{ color: "#64748b" }}>{user.email}</p>
              <p className="text-xs mt-0.5" style={{ color: "#475569" }}>Joined {new Date(user.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          {/* Plan */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: "#64748b" }}>Plan</label>
            <div className="flex gap-2">
              {["free", "premium", "pro"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPlan(p)}
                  className="flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all"
                  style={{
                    background: plan === p ? "#6366f1" : "#0f172a",
                    color: plan === p ? "#fff" : "#64748b",
                    border: `1px solid ${plan === p ? "#6366f1" : "#334155"}`,
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-col gap-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-medium text-white">Account Active</p>
                <p className="text-xs" style={{ color: "#475569" }}>Inactive users cannot log in or make API calls</p>
              </div>
              <input type="checkbox" className="toggle toggle-success" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            </label>
            <div style={{ height: "1px", background: "#334155" }}></div>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-medium text-white">Admin Access</p>
                <p className="text-xs" style={{ color: "#475569" }}>Grants access to this admin portal</p>
              </div>
              <input type="checkbox" className="toggle" style={{ "--tglbg": "#6366f1" }} checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} />
            </label>
          </div>
        </div>

        <div className="p-5 flex flex-col gap-2" style={{ borderTop: "1px solid #334155" }}>
          <button onClick={save} disabled={saving} className="btn btn-primary w-full" style={{ background: "#6366f1", borderColor: "#6366f1" }}>
            {saving ? <span className="loading loading-spinner loading-sm"></span> : "Save Changes"}
          </button>
          <button onClick={handleDelete} className="btn btn-ghost w-full text-red-400 hover:text-red-300">
            Delete User
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = (p = page, s = search, pf = planFilter) => {
    setLoading(true);
    listAdminUsers({ page: p, search: s, plan: pf, limit: 20 })
      .then((r) => { setUsers(r.data.data); setTotal(r.data.total); setPages(r.data.pages); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(1, search, planFilter); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load(1, search, planFilter);
  };

  const handleUpdate = (updated) => {
    if (!updated) { setUsers((prev) => prev.filter((u) => u.id !== selected.id)); }
    else { setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u))); }
    setSelected(null);
  };

  const s = (style) => ({ style });

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-sm mt-1" style={{ color: "#64748b" }}>{total.toLocaleString()} users on the platform</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-0">
          <input
            type="text"
            placeholder="Search by name or email…"
            className="input input-sm flex-1"
            style={{ background: "#1e293b", borderColor: "#334155", color: "#e2e8f0" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-sm" style={{ background: "#6366f1", color: "#fff", border: "none" }}>Search</button>
        </form>
        <select
          className="select select-sm"
          style={{ background: "#1e293b", borderColor: "#334155", color: "#94a3b8" }}
          value={planFilter}
          onChange={(e) => { setPlanFilter(e.target.value); setPage(1); load(1, search, e.target.value); }}
        >
          <option value="">All plans</option>
          <option value="free">Free</option>
          <option value="premium">Premium</option>
          <option value="pro">Pro</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-x-auto" style={{ background: "#1e293b", border: "1px solid #334155" }}>
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <span className="loading loading-spinner" style={{ color: "#6366f1" }}></span>
          </div>
        ) : (
          <table className="table w-full">
            <thead>
              <tr style={{ background: "#0f172a", borderColor: "#334155" }}>
                {["User", "Plan", "Status", "Admin", "Joined", ""].map((h) => (
                  <th key={h} style={{ color: "#64748b", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="cursor-pointer hover" style={{ borderColor: "#334155" }} onClick={() => setSelected(u)}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "#6366f1" }}>
                        {u.full_name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{u.full_name}</p>
                        <p className="text-xs" style={{ color: "#475569" }}>{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td><PlanBadge plan={u.plan} /></td>
                  <td>
                    <span className="text-xs font-medium" style={{ color: u.is_active ? "#10b981" : "#ef4444" }}>
                      {u.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    {u.is_admin && <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "#312e81", color: "#a5b4fc" }}>Admin</span>}
                  </td>
                  <td style={{ color: "#475569", fontSize: "13px" }}>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "#475569" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-5">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => { setPage(p); load(p, search, planFilter); }}
              className="btn btn-sm"
              style={{ background: p === page ? "#6366f1" : "#1e293b", color: p === page ? "#fff" : "#64748b", borderColor: "#334155" }}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {selected && <UserDrawer user={selected} onClose={() => setSelected(null)} onUpdate={handleUpdate} />}
    </AdminLayout>
  );
}

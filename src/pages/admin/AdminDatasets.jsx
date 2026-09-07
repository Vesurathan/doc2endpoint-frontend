import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { listAdminDatasets, deleteAdminDataset } from "../../api/admin";
import { useDialog } from "../../context/DialogContext";

const STATUS_STYLE = {
  active: { color: "#10b981", label: "Live" },
  reviewing: { color: "#f59e0b", label: "Reviewing" },
  extracting: { color: "#6366f1", label: "Extracting" },
  failed: { color: "#ef4444", label: "Failed" },
  uploading: { color: "#64748b", label: "Uploading" },
};

const DOC_COLOR = {
  excel: { bg: "#052e16", text: "#4ade80", label: "XLSX" },
  csv:   { bg: "#0c1a2e", text: "#60a5fa", label: "CSV"  },
  pdf:   { bg: "#2d0a0a", text: "#f87171", label: "PDF"  },
  docx:  { bg: "#0e1a3a", text: "#818cf8", label: "DOCX" },
  image: { bg: "#1c1409", text: "#fbbf24", label: "IMG"  },
};

function DocTypeBadge({ type }) {
  const s = DOC_COLOR[type] || { bg: "#1e293b", text: "#64748b", label: type?.toUpperCase() || "—" };
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold font-mono tracking-wide" style={{ background: s.bg, color: s.text }}>
      {s.label}
    </span>
  );
}

export default function AdminDatasets() {
  const [datasets, setDatasets] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const { confirm, alert } = useDialog();

  const load = (p = 1, s = search, sf = statusFilter) => {
    setLoading(true);
    listAdminDatasets({ page: p, search: s, status: sf, limit: 20 })
      .then((r) => { setDatasets(r.data.data); setTotal(r.data.total); setPages(r.data.pages); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (ds) => {
    const ok = await confirm({
      title: `Delete "${ds.name}"?`,
      message: "This drops the Postgres table and all of its rows, and the live API endpoint will stop responding. This cannot be undone.",
      confirmText: "Delete dataset",
      danger: true,
    });
    if (!ok) return;
    setDeleting(ds.id);
    try {
      await deleteAdminDataset(ds.id);
      setDatasets((prev) => prev.filter((d) => d.id !== ds.id));
      setTotal((t) => t - 1);
    } catch (e) {
      await alert({ title: "Delete failed", message: e.response?.data?.detail || "Something went wrong. Please try again.", danger: true });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Datasets</h1>
          <p className="text-sm mt-1" style={{ color: "#64748b" }}>{total.toLocaleString()} datasets across all users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <form onSubmit={(e) => { e.preventDefault(); setPage(1); load(1, search, statusFilter); }} className="flex gap-2 flex-1 min-w-0">
          <input
            type="text"
            placeholder="Search by dataset name…"
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
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); load(1, search, e.target.value); }}
        >
          <option value="">All statuses</option>
          <option value="active">Live</option>
          <option value="reviewing">Reviewing</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-x-auto" style={{ background: "#1e293b", border: "1px solid #334155" }}>
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <span className="loading loading-spinner" style={{ color: "#6366f1" }}></span>
          </div>
        ) : datasets.length === 0 ? (
          <div className="text-center py-16" style={{ color: "#475569" }}>No datasets found</div>
        ) : (
          <table className="table w-full">
            <thead>
              <tr style={{ background: "#0f172a", borderColor: "#334155" }}>
                {["Dataset", "Owner", "Type", "Rows", "Status", "API Table", "Created", ""].map((h) => (
                  <th key={h} style={{ color: "#64748b", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {datasets.map((ds) => {
                const s = STATUS_STYLE[ds.status] || STATUS_STYLE.uploading;
                return (
                  <tr key={ds.id} style={{ borderColor: "#334155" }}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="text-sm font-medium text-white">{ds.name}</p>
                          <p className="text-xs" style={{ color: "#475569" }}>{ds.original_filename || ""}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="text-sm" style={{ color: "#94a3b8" }}>{ds.user_name}</p>
                      <p className="text-xs" style={{ color: "#475569" }}>{ds.user_email}</p>
                    </td>
                    <td><DocTypeBadge type={ds.doc_type} /></td>
                    <td style={{ color: "#94a3b8", fontSize: "13px" }}>{ds.row_count?.toLocaleString()}</td>
                    <td><span className="text-xs font-semibold" style={{ color: s.color }}>{s.label}</span></td>
                    <td>
                      {ds.table_name && (
                        <code className="text-xs font-mono" style={{ color: "#10b981" }}>{ds.table_name}</code>
                      )}
                    </td>
                    <td style={{ color: "#475569", fontSize: "12px" }}>{new Date(ds.created_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        onClick={() => handleDelete(ds)}
                        disabled={deleting === ds.id}
                        className="btn btn-ghost btn-xs"
                        style={{ color: "#ef4444" }}
                      >
                        {deleting === ds.id ? <span className="loading loading-spinner loading-xs"></span> : "Delete"}
                      </button>
                    </td>
                  </tr>
                );
              })}
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
              onClick={() => { setPage(p); load(p, search, statusFilter); }}
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

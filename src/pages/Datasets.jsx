import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { listDatasets } from "../api/datasets";

const STATUS_STYLE = {
  active: { badge: "badge-success", label: "Live" },
  reviewing: { badge: "badge-warning", label: "Reviewing" },
  extracting: { badge: "badge-info", label: "Extracting" },
  failed: { badge: "badge-error", label: "Failed" },
  uploading: { badge: "badge-ghost", label: "Uploading" },
};

// SVG icon + accent colour per doc type
const DOC_TYPE_ICON = {
  excel: (
    <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10h18M3 6h18M3 14h18M3 18h18M8 6v12" />
      </svg>
    </div>
  ),
  csv: (
    <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
      </svg>
    </div>
  ),
  pdf: (
    <div className="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    </div>
  ),
  docx: (
    <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    </div>
  ),
  image: (
    <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
  ),
};

const DocTypeIconFallback = () => (
  <div className="w-12 h-12 rounded-xl bg-base-300 flex items-center justify-center shrink-0">
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  </div>
);

export default function Datasets() {
  const navigate = useNavigate();
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listDatasets()
      .then((res) => setDatasets(res.data))
      .catch(() => setError("Failed to load datasets"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-base-content">Datasets</h1>
          <p className="text-base-content/50 text-sm mt-1">Manage your uploaded documents and their APIs.</p>
        </div>
        <Link to="/dashboard/datasets/new" className="btn btn-primary gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Dataset
        </Link>
      </div>

      {error && (
        <div className="alert alert-error mb-6 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : datasets.length === 0 ? (
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body items-center text-center py-16 gap-4">
            <div className="w-16 h-16 bg-base-200 rounded-2xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                </svg>
              </div>
            <div>
              <h2 className="text-lg font-semibold text-base-content">No datasets yet</h2>
              <p className="text-base-content/50 text-sm mt-1 max-w-sm">
                Upload your first document to create a dataset and get a live API.
              </p>
            </div>
            <Link to="/dashboard/datasets/new" className="btn btn-primary">Upload a document</Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {datasets.map((ds) => {
            const s = STATUS_STYLE[ds.status] || STATUS_STYLE.uploading;
            return (
              <div
                key={ds.id}
                className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/dashboard/datasets/${ds.id}`)}
              >
                <div className="card-body py-4 px-5 flex-row items-center gap-4">
                  {DOC_TYPE_ICON[ds.doc_type] || <DocTypeIconFallback />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-base-content truncate">{ds.name}</h3>
                      <span className={`badge badge-sm ${s.badge}`}>{s.label}</span>
                    </div>
                    <p className="text-xs text-base-content/40 mt-0.5">
                      {ds.original_filename} · {ds.row_count?.toLocaleString()} rows ·{" "}
                      {new Date(ds.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {ds.status === "active" && ds.table_name && (
                    <div className="hidden md:block text-right shrink-0">
                      <p className="text-xs text-base-content/40 mb-0.5">API endpoint</p>
                      <code className="text-xs text-success font-mono">/api/v1/{ds.table_name}</code>
                    </div>
                  )}
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-base-content/30 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}

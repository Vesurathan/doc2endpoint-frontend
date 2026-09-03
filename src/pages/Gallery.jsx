import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getPublicGallery } from "../api/datasets";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const DOC_COLOR = {
  excel: { bg: "#052e16", text: "#4ade80", label: "XLSX" },
  csv:   { bg: "#0c1a2e", text: "#60a5fa", label: "CSV" },
  pdf:   { bg: "#2d0a0a", text: "#f87171", label: "PDF" },
  docx:  { bg: "#0e1a3a", text: "#818cf8", label: "DOCX" },
  image: { bg: "#1c1409", text: "#fbbf24", label: "IMG" },
};

function DocBadge({ type }) {
  const s = DOC_COLOR[type] || { bg: "#1e293b", text: "#64748b", label: (type || "").toUpperCase() };
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold font-mono" style={{ background: s.bg, color: s.text }}>
      {s.label}
    </span>
  );
}

function TypeBadge({ type }) {
  const colors = { string: "badge-ghost", integer: "badge-info", number: "badge-info", boolean: "badge-warning", datetime: "badge-secondary" };
  return <span className={`badge badge-xs ${colors[type] || "badge-ghost"}`}>{type}</span>;
}

function DatasetCard({ ds, onCopy }) {
  const [copied, setCopied] = useState(false);
  const copyEndpoint = () => {
    navigator.clipboard.writeText(`${API_BASE}/api/v1/${ds.table_name}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 flex flex-col overflow-hidden hover:border-primary/40 transition-colors">
      {/* Header */}
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <DocBadge type={ds.doc_type} />
              <span className="text-xs text-base-content/40">{ds.row_count?.toLocaleString()} rows</span>
            </div>
            <h3 className="font-semibold text-base-content truncate">{ds.name}</h3>
            {ds.public_description && (
              <p className="text-sm text-base-content/60 mt-1 line-clamp-2">{ds.public_description}</p>
            )}
          </div>
        </div>

        {/* Schema preview */}
        <div className="mt-4">
          <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wider mb-2">Columns</p>
          <div className="flex flex-wrap gap-1">
            {ds.columns?.slice(0, 6).map((col) => (
              <span key={col.name} className="flex items-center gap-1 px-2 py-0.5 rounded bg-base-200 text-xs font-mono">
                {col.name}
                <TypeBadge type={col.type} />
              </span>
            ))}
            {ds.columns?.length > 6 && (
              <span className="px-2 py-0.5 rounded bg-base-200 text-xs text-base-content/40">+{ds.columns.length - 6} more</span>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-base-300 px-5 py-3 flex items-center justify-between bg-base-200/40">
        <div className="flex items-center gap-2 min-w-0">
          <code className="text-xs font-mono text-primary truncate max-w-40">/api/v1/{ds.table_name}</code>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-base-content/40 hidden sm:block">{ds.owner}</span>
          <button
            onClick={copyEndpoint}
            className="btn btn-ghost btn-xs gap-1"
            title="Copy endpoint URL"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Gallery() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [datasets, setDatasets] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [docType, setDocType] = useState("");
  const [offset, setOffset] = useState(0);
  const LIMIT = 12;

  const load = (s = search, dt = docType, off = 0) => {
    setLoading(true);
    getPublicGallery({ search: s, doc_type: dt, limit: LIMIT, offset: off })
      .then((r) => { setDatasets(r.data.data); setTotal(r.data.total); setOffset(off); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const pages = Math.ceil(total / LIMIT);
  const currentPage = Math.floor(offset / LIMIT) + 1;

  return (
    <div className="min-h-screen bg-base-200">
      {/* Nav */}
      <header className="bg-base-100 border-b border-base-300 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary-content" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="font-bold text-base-content">Doc2Endpoint</span>
            </Link>
            <nav className="hidden md:flex items-center gap-4 text-sm text-base-content/60">
              <Link to="/gallery" className="text-primary font-medium">Gallery</Link>
              <Link to="/docs" className="hover:text-base-content">Docs</Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <button onClick={() => navigate("/dashboard")} className="btn btn-primary btn-sm">Dashboard</button>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">Sign in</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Get free API key</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-base-content mb-3">Public API Gallery</h1>
          <p className="text-lg text-base-content/60 max-w-xl mx-auto">
            Browse free, open datasets shared by the Doc2Endpoint community.
            Register for a free API key and start querying in seconds.
          </p>
          {!user && (
            <Link to="/register" className="btn btn-primary mt-5">
              Get a free API key
            </Link>
          )}
        </div>

        {/* Filters */}
        <form
          className="flex gap-3 mb-8 flex-wrap"
          onSubmit={(e) => { e.preventDefault(); load(search, docType, 0); }}
        >
          <div className="relative flex-1 min-w-48">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search datasets…"
              className="input input-sm input-bordered w-full pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="select select-sm select-bordered"
            value={docType}
            onChange={(e) => { setDocType(e.target.value); load(search, e.target.value, 0); }}
          >
            <option value="">All types</option>
            <option value="excel">Excel</option>
            <option value="csv">CSV</option>
            <option value="pdf">PDF</option>
            <option value="docx">Word</option>
          </select>
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>

        {/* Stats bar */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-base-content/50">
            <span className="font-semibold text-base-content">{total.toLocaleString()}</span> public datasets
          </p>
          {user && (
            <button
              onClick={() => navigate("/dashboard/datasets")}
              className="btn btn-outline btn-xs gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Share your dataset
            </button>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : datasets.length === 0 ? (
          <div className="text-center py-20 text-base-content/40">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
            <p className="font-medium">No public datasets yet.</p>
            <p className="text-sm mt-1">Be the first to share one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {datasets.map((ds) => <DatasetCard key={ds.id} ds={ds} />)}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            <button className="btn btn-ghost btn-sm" disabled={currentPage <= 1} onClick={() => load(search, docType, offset - LIMIT)}>
              ← Prev
            </button>
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => load(search, docType, (p - 1) * LIMIT)}
                className={`btn btn-sm ${p === currentPage ? "btn-primary" : "btn-ghost"}`}
              >
                {p}
              </button>
            ))}
            <button className="btn btn-ghost btn-sm" disabled={currentPage >= pages} onClick={() => load(search, docType, offset + LIMIT)}>
              Next →
            </button>
          </div>
        )}

        {/* CTA for non-users */}
        {!user && (
          <div className="mt-16 rounded-2xl bg-primary/5 border border-primary/20 p-8 text-center">
            <h2 className="text-xl font-bold text-base-content mb-2">Ready to use these APIs?</h2>
            <p className="text-base-content/60 mb-5">Create a free account and get your API key in 30 seconds.</p>
            <div className="flex justify-center gap-3">
              <Link to="/register" className="btn btn-primary">Create free account</Link>
              <Link to="/docs" className="btn btn-ghost">Read the docs</Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

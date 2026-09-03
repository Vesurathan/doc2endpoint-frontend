import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { getDataset, getMessages, sendMessage, confirmSchema, previewDataset, getOpenApiSpec, getDatasetLogs, getPublicOpenApiUrl, setCustomEndpoint } from "../api/datasets";
import DatasetSettings from "../components/DatasetSettings";
import SchemaEditor from "../components/SchemaEditor";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const TYPE_BADGE = {
  string: "badge-ghost",
  integer: "badge-info",
  number: "badge-info",
  boolean: "badge-warning",
  datetime: "badge-secondary",
};

// ─── Schema Sidebar ───────────────────────────────────────────────────────────

function SchemaPanel({ columns, datasetName, status }) {
  const exposed = columns.filter((c) => c.expose !== false);
  const hidden = columns.filter((c) => c.expose === false);
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wider mb-2">Dataset name</p>
        <p className="font-semibold text-base-content">{datasetName || "Untitled"}</p>
      </div>
      <div>
        <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wider mb-2">
          Columns ({exposed.length} exposed{hidden.length > 0 ? `, ${hidden.length} hidden` : ""})
        </p>
        <div className="flex flex-col gap-1.5">
          {exposed.map((col) => (
            <div key={col.name} className="flex items-center justify-between gap-2 bg-base-200 rounded-lg px-3 py-2">
              <span className="text-sm text-base-content font-mono truncate">{col.name}</span>
              <span className={`badge badge-sm ${TYPE_BADGE[col.type] || "badge-ghost"} shrink-0`}>{col.type}</span>
            </div>
          ))}
          {hidden.map((col) => (
            <div key={col.name} className="flex items-center justify-between gap-2 bg-base-200/50 rounded-lg px-3 py-2 opacity-40">
              <span className="text-sm text-base-content font-mono truncate line-through">{col.name}</span>
              <span className="badge badge-sm badge-ghost shrink-0">hidden</span>
            </div>
          ))}
        </div>
      </div>
      {status === "active" && (
        <div className="alert alert-success text-sm py-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          API is live!
        </div>
      )}
    </div>
  );
}

// ─── Chat Message ─────────────────────────────────────────────────────────────

function Message({ role, content }) {
  const isUser = role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${isUser ? "bg-primary text-primary-content" : "bg-base-300 text-base-content"}`}>
        {isUser ? "You" : "AI"}
      </div>
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${isUser ? "bg-primary text-primary-content rounded-tr-sm" : "bg-base-200 text-base-content rounded-tl-sm"}`}>
        {content}
      </div>
    </div>
  );
}

// ─── Playground Tab ───────────────────────────────────────────────────────────

// Map each column's flag/type to a display group
const COL_GROUPS = [
  { key: "ids",      label: "Identifiers", flags: ["identifier"],                          icon: "M7 20l4-16m2 16l4-16M6 9h14M4 15h14" },
  { key: "numbers",  label: "Numeric",     flags: ["count","metric","currency"],            icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M12 7h.01M9 7h.01" },
  { key: "cats",     label: "Categories",  flags: ["enum","boolean"],                       icon: "M4 6h16M4 10h16M4 14h16M4 18h16" },
  { key: "dates",    label: "Dates",       flags: ["date"],         types: ["datetime"],    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { key: "text",     label: "Text",        flags: ["text","url","location"],                icon: "M4 6h16M4 12h8m-8 6h16" },
  { key: "personal", label: "Personal",    flags: ["pii","sensitive"],                      icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  { key: "other",    label: "Other",       flags: [],                                       icon: "M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" },
];

function groupColumns(columns) {
  const assigned = new Set();
  const result = [];
  for (const g of COL_GROUPS) {
    const cols = columns.filter((c) => {
      if (assigned.has(c.name)) return false;
      const flag = c.flag || "";
      const type = c.type || "string";
      if (g.flags.includes(flag)) return true;
      if (g.types?.includes(type) && !flag) return true;
      return false;
    });
    cols.forEach((c) => assigned.add(c.name));
    if (cols.length) result.push({ ...g, columns: cols });
  }
  // Remaining columns → "Other"
  const rest = columns.filter((c) => !assigned.has(c.name));
  if (rest.length) {
    const other = result.find((g) => g.key === "other");
    if (other) other.columns.push(...rest);
    else result.push({ ...COL_GROUPS.at(-1), columns: rest });
  }
  return result;
}

function Playground({ dataset, columns }) {
  const [filters, setFilters]       = useState({});
  const [sortBy, setSortBy]         = useState("id");
  const [sortDir, setSortDir]       = useState("asc");
  const [limit, setLimit]           = useState(20);
  const [page, setPage]             = useState(1);
  const [results, setResults]       = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [copied, setCopied]         = useState(false);

  const activeFilters = Object.entries(filters).filter(([, v]) => v !== "");
  const activeCount   = activeFilters.length;

  const setFilter = (col, val) =>
    setFilters((f) => ({ ...f, [col]: val }));

  const clearFilter = (col) =>
    setFilters((f) => { const n = { ...f }; delete n[col]; return n; });

  const buildParams = (p = page) => ({
    page: p, limit, order_by: sortBy, order: sortDir,
    ...Object.fromEntries(activeFilters),
  });

  const runQuery = async (p = 1) => {
    setLoading(true); setError(""); setPage(p);
    try {
      const res = await previewDataset(dataset.id, buildParams(p));
      setResults(res.data);
    } catch (e) {
      setError(e.response?.data?.detail || "Query failed.");
    } finally { setLoading(false); }
  };

  const buildCurl = () => {
    const params = new URLSearchParams({
      order_by: sortBy, order: sortDir, limit, page,
      ...Object.fromEntries(activeFilters),
    });
    return `curl -H "X-API-Key: YOUR_KEY" \\\n  "${API_BASE}/api/v1/${dataset.table_name}?${params}"`;
  };

  const copyCurl = () => {
    navigator.clipboard.writeText(buildCurl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resultCols = results?.data?.[0] ? Object.keys(results.data[0]) : [];

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">

      {/* ── Controls bar ─────────────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center gap-2 px-4 py-2.5 border-b border-base-300 bg-base-200/40">
        <span className="text-xs text-base-content/40 shrink-0">Sort</span>
        <select className="select select-xs select-bordered bg-base-100 max-w-[130px]"
          value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="id">id</option>
          {columns.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
        </select>
        <select className="select select-xs select-bordered bg-base-100 shrink-0"
          value={sortDir} onChange={(e) => setSortDir(e.target.value)}>
          <option value="asc">↑ Asc</option>
          <option value="desc">↓ Desc</option>
        </select>
        <select className="select select-xs select-bordered bg-base-100 shrink-0"
          value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
          {[10, 20, 50, 100].map((n) => <option key={n} value={n}>{n} rows</option>)}
        </select>
        <span className="flex-1" />
        {activeCount > 0 && (
          <span className="text-xs text-primary font-medium shrink-0">
            {activeCount} filter{activeCount > 1 ? "s" : ""} active
          </span>
        )}
        <button className="btn btn-ghost btn-xs gap-1 shrink-0" onClick={copyCurl}>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {copied ? "Copied!" : "cURL"}
        </button>
        <button className="btn btn-primary btn-xs gap-1 shrink-0"
          onClick={() => runQuery(1)} disabled={loading}>
          {loading
            ? <span className="loading loading-spinner loading-xs" />
            : <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>}
          Run Query
        </button>
      </div>

      {/* ── Filters — all columns visible in a scrollable grid ───────────────── */}
      <div className="shrink-0 border-b border-base-300 overflow-y-auto" style={{ maxHeight: "240px" }}>
        <div className="flex items-center justify-between px-4 pt-2.5 pb-1">
          <span className="text-xs font-semibold text-base-content/40 uppercase tracking-wider">Filters</span>
          {activeCount > 0 && (
            <button className="btn btn-xs btn-ghost text-error" onClick={() => setFilters({})}>
              Clear all ({activeCount})
            </button>
          )}
        </div>
        <div className="px-4 pb-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-2">
          {columns.map((col) => {
            const val = filters[col.name] || "";
            const isActive = val !== "";
            return (
              <div key={col.name} className="flex flex-col gap-0.5 min-w-0">
                <label className="flex items-center gap-1">
                  <span className="text-xs font-mono text-base-content/50 truncate" title={col.name}>
                    {col.name}
                  </span>
                  {isActive && (
                    <button
                      className="shrink-0 text-base-content/30 hover:text-error transition-colors text-xs leading-none"
                      onClick={() => clearFilter(col.name)}
                      title="Clear">
                      ×
                    </button>
                  )}
                </label>
                <input
                  type={col.type === "integer" || col.type === "number" ? "number" : "text"}
                  className={`input input-xs w-full font-mono transition-all ${
                    isActive
                      ? "input-primary bg-primary/5 border-primary/40"
                      : "input-bordered bg-base-100"
                  }`}
                  placeholder={col.type === "string" ? "%like% or value" : "value"}
                  value={val}
                  onChange={(e) => setFilter(col.name, e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && runQuery(1)}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Results area ────────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">

        {error && (
          <div className="shrink-0 alert alert-error text-xs py-2 mx-4 mt-3 rounded-lg">{error}</div>
        )}

        {!results && !error && !loading && (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-base-content/30">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm">Configure filters above, then click <strong>Run Query</strong></p>
          </div>
        )}

        {results && (
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">

            {/* Status + pagination bar */}
            <div className="shrink-0 flex items-center justify-between px-4 py-2 border-b border-base-300">
              <p className="text-xs text-base-content/50">
                <span className="font-semibold text-base-content">{results.total.toLocaleString()}</span> records
                {results.pages > 1 &&
                  <span className="ml-1">— page <span className="font-semibold text-base-content">{results.page}</span> of {results.pages}</span>}
              </p>
              {results.pages > 1 && (
                <div className="flex items-center gap-0.5">
                  <button className="btn btn-ghost btn-xs" disabled={page <= 1}
                    onClick={() => runQuery(page - 1)}>‹</button>
                  {Array.from({ length: Math.min(results.pages, 7) }, (_, i) => i + 1).map((p) => (
                    <button key={p}
                      className={`btn btn-xs ${p === results.page ? "btn-primary" : "btn-ghost"}`}
                      onClick={() => runQuery(p)}>{p}</button>
                  ))}
                  {results.pages > 7 &&
                    <span className="text-xs text-base-content/30 px-1">…{results.pages}</span>}
                  <button className="btn btn-ghost btn-xs" disabled={page >= results.pages}
                    onClick={() => runQuery(page + 1)}>›</button>
                </div>
              )}
            </div>

            {/* Table — absolutely positioned so it can NEVER push controls out of place.
                The relative parent gives it its bounds; overflow-auto handles scrolling. */}
            {results.data.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-base-content/40 text-sm">
                No records match your filters.
              </div>
            ) : (
              <div className="flex-1 relative">
                <div className="absolute inset-0 overflow-auto">
                  <table className="table table-xs table-pin-rows"
                    style={{ width: "max-content", minWidth: "100%" }}>
                    <thead>
                      <tr className="bg-base-200">
                        {resultCols.map((k) => (
                          <th key={k} className="font-mono text-xs whitespace-nowrap px-3 py-2 sticky top-0 bg-base-200 z-10">{k}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {results.data.map((row, i) => (
                        <tr key={i} className="hover">
                          {resultCols.map((k) => (
                            <td key={k} className="font-mono text-xs px-3 py-1.5 whitespace-nowrap max-w-52 truncate"
                              title={String(row[k] ?? "")}>
                              {row[k] === null || row[k] === undefined
                                ? <span className="opacity-30 italic">null</span>
                                : String(row[k])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── cURL preview ─────────────────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-base-300 px-4 py-2 bg-base-200/40">
        <p className="text-xs text-base-content/40 mb-1 font-semibold uppercase tracking-wide">API call</p>
        <code className="text-xs font-mono text-base-content/60 break-all whitespace-pre-wrap leading-relaxed">
          {buildCurl()}
        </code>
      </div>
    </div>
  );
}

// ─── OpenAPI Tab ──────────────────────────────────────────────────────────────

function OpenAPITab({ dataset, onPublishGpt }) {
  const [loading, setLoading] = useState(false);
  const [previewSpec, setPreviewSpec] = useState(null);
  const [copied, setCopied] = useState(false);

  const downloadSpec = async () => {
    setLoading(true);
    try {
      const res = await getOpenApiSpec(dataset.id);
      const json = JSON.stringify(res.data, null, 2);
      setPreviewSpec(json);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${dataset.name.replace(/\s+/g, "_")}_openapi.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Failed to generate spec. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const copySpec = async () => {
    if (!previewSpec) {
      const res = await getOpenApiSpec(dataset.id);
      const json = JSON.stringify(res.data, null, 2);
      setPreviewSpec(json);
      navigator.clipboard.writeText(json);
    } else {
      navigator.clipboard.writeText(previewSpec);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 p-5 overflow-y-auto flex-1 min-h-0">
      {/* Header card */}
      <div className="flex items-start justify-between gap-4 p-5 rounded-xl border border-base-300 bg-base-200/40">
        <div>
          <h3 className="font-semibold text-base-content mb-1">OpenAPI 3.0 Specification</h3>
          <p className="text-sm text-base-content/60 leading-relaxed">
            Machine-readable API spec for <strong>{dataset.name}</strong>. Import it into Postman,
            Insomnia, Swagger UI, or use with any OpenAPI code generator.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button className="btn btn-ghost btn-sm gap-1" onClick={copySpec}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {copied ? "Copied!" : "Copy"}
          </button>
          <button className="btn btn-primary btn-sm gap-1" onClick={downloadSpec} disabled={loading}>
            {loading
              ? <span className="loading loading-spinner loading-xs" />
              : <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            }
            Download JSON
          </button>
        </div>
      </div>

      {/* GPT Actions banner */}
      <div className="flex items-center gap-4 p-4 rounded-xl border border-primary/20 bg-primary/5">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-base-content">Use this dataset in ChatGPT</p>
          <p className="text-xs text-base-content/50 mt-0.5">
            Publish your spec as a GPT Action — let ChatGPT query your data in plain English.
          </p>
        </div>
        <button
          className="btn btn-primary btn-sm shrink-0 gap-1.5"
          onClick={onPublishGpt}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Publish as GPT Action
        </button>
      </div>

      {/* Compatible tools */}
      <div>
        <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wider mb-3">Compatible tools</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { name: "Postman",    desc: "Import → Raw text / File",          color: "#ef6c00" },
            { name: "Insomnia",   desc: "Import → From File → OpenAPI 3.0",  color: "#6366f1" },
            { name: "Swagger UI", desc: "Paste URL or upload JSON spec",      color: "#85ea2d" },
            { name: "OpenAPI Generator", desc: "Generate client SDKs in 50+ languages", color: "#10b981" },
          ].map((tool) => (
            <div key={tool.name} className="flex items-start gap-3 p-3 rounded-lg border border-base-300 bg-base-100">
              <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: tool.color }} />
              <div>
                <p className="text-sm font-medium text-base-content">{tool.name}</p>
                <p className="text-xs text-base-content/50 mt-0.5">{tool.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Spec preview */}
      {previewSpec ? (
        <div>
          <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wider mb-2">Spec preview</p>
          <pre className="text-xs font-mono bg-base-200 rounded-xl p-4 overflow-auto max-h-72 text-base-content/70 leading-relaxed">
            {previewSpec.slice(0, 3000)}{previewSpec.length > 3000 ? "\n…" : ""}
          </pre>
        </div>
      ) : (
        <button className="btn btn-ghost btn-sm self-start" onClick={async () => {
          const res = await getOpenApiSpec(dataset.id);
          setPreviewSpec(JSON.stringify(res.data, null, 2));
        }}>
          Preview spec
        </button>
      )}
    </div>
  );
}

// ─── Endpoints Tab ────────────────────────────────────────────────────────────

function EndpointsTab({ dataset, columns, onGetKey, onEndpointChanged }) {
  const [copied, setCopied] = useState(null);
  const [slug, setSlug]     = useState(dataset.custom_endpoint || "");
  const [saving, setSaving] = useState(false);
  const [slugError, setSlugError] = useState("");
  const [slugSuccess, setSlugSuccess] = useState(false);

  // The URL segment currently in use
  const activeSlug = dataset.custom_endpoint || dataset.table_name;

  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const endpoints = [
    { label: "List all records",  url: `GET ${API_BASE}/api/v1/${activeSlug}` },
    { label: "Filter by column",  url: `GET ${API_BASE}/api/v1/${activeSlug}?${columns[0]?.name || "column"}=value` },
    { label: "Get single record", url: `GET ${API_BASE}/api/v1/${activeSlug}/1` },
    { label: "Inspect schema",    url: `GET ${API_BASE}/api/v1/${activeSlug}/schema` },
  ];

  const saveSlug = async () => {
    setSlugError("");
    setSlugSuccess(false);
    const trimmed = slug.trim().toLowerCase();

    if (trimmed && !/^[a-z0-9][a-z0-9_-]{1,63}$/.test(trimmed)) {
      setSlugError("Use 2–64 chars: lowercase letters, digits, hyphens, underscores. Must start with a letter or digit.");
      return;
    }

    setSaving(true);
    try {
      await setCustomEndpoint(dataset.id, trimmed || null);
      setSlugSuccess(true);
      setTimeout(() => setSlugSuccess(false), 3000);
      if (onEndpointChanged) onEndpointChanged(trimmed || null);
    } catch (e) {
      setSlugError(e.response?.data?.detail || "Failed to save endpoint.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-5 overflow-y-auto flex-1 min-h-0">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-base-content">Your API endpoints</h3>
          <p className="text-sm text-base-content/50 mt-0.5">All requests require an <code className="text-xs bg-base-200 px-1 rounded">X-API-Key</code> header.</p>
        </div>
        <button onClick={onGetKey} className="btn btn-success btn-sm gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          Get API Key
        </button>
      </div>

      {/* ── Custom endpoint editor ─────────────────────────────────────────── */}
      <div className="rounded-xl border border-base-300 bg-base-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-base-200 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <span className="text-sm font-semibold text-base-content">Custom endpoint path</span>
          {dataset.custom_endpoint && (
            <span className="badge badge-primary badge-sm">Custom</span>
          )}
        </div>
        <div className="px-4 py-4 flex flex-col gap-3">
          <p className="text-xs text-base-content/50">
            By default your API lives at <code className="bg-base-200 px-1 rounded text-xs">/api/v1/{dataset.table_name}</code>.
            Set a custom slug below to use a different path — both will continue to work.
          </p>
          <div className="flex items-center gap-2">
            <div className="flex items-center flex-1 min-w-0 border border-base-300 rounded-lg overflow-hidden bg-base-200/50 focus-within:border-primary transition-colors">
              <span className="text-xs font-mono text-base-content/40 pl-3 pr-1 shrink-0 select-none whitespace-nowrap">
                /api/v1/
              </span>
              <input
                type="text"
                className="flex-1 min-w-0 bg-transparent outline-none py-2 pr-3 text-sm font-mono text-base-content placeholder-base-content/30"
                placeholder={dataset.table_name}
                value={slug}
                onChange={(e) => { setSlug(e.target.value); setSlugError(""); setSlugSuccess(false); }}
                onKeyDown={(e) => e.key === "Enter" && saveSlug()}
              />
              {slug && (
                <button
                  className="px-2 text-base-content/30 hover:text-base-content/60 transition-colors text-lg leading-none"
                  onClick={() => { setSlug(""); setSlugError(""); setSlugSuccess(false); }}
                  title="Clear">
                  ×
                </button>
              )}
            </div>
            <button
              className={`btn btn-sm shrink-0 ${slugSuccess ? "btn-success" : "btn-primary"}`}
              onClick={saveSlug}
              disabled={saving}>
              {saving
                ? <span className="loading loading-spinner loading-xs" />
                : slugSuccess
                  ? <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  : "Save"}
            </button>
            {dataset.custom_endpoint && (
              <button
                className="btn btn-sm btn-ghost text-error"
                title="Remove custom endpoint"
                onClick={() => { setSlug(""); saveSlug(); }}
                disabled={saving}>
                Reset
              </button>
            )}
          </div>
          {slugError && <p className="text-xs text-error">{slugError}</p>}
          {slugSuccess && (
            <p className="text-xs text-success">
              {slug
                ? `Endpoint updated — API now also reachable at /api/v1/${slug}`
                : "Custom endpoint removed — using default path."}
            </p>
          )}
        </div>
      </div>

      {/* ── Live endpoint list ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        {endpoints.map((ep, i) => (
          <div key={i} className="rounded-xl border border-base-300 bg-base-200/40 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-base-300">
              <p className="text-xs font-medium text-base-content/60">{ep.label}</p>
              <button className="btn btn-ghost btn-xs gap-1 text-xs" onClick={() => copy(ep.url, i)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {copied === i ? "Copied!" : "Copy"}
              </button>
            </div>
            <code className="block px-4 py-2.5 text-xs font-mono text-base-content break-all">{ep.url}</code>
          </div>
        ))}
      </div>

      {/* ── Query params reference ─────────────────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wider mb-3">Query parameters</p>
        <div className="rounded-xl border border-base-300 overflow-hidden">
          <table className="table table-xs w-full">
            <thead>
              <tr className="bg-base-200">
                <th>Param</th><th>Example</th><th>Description</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["page",      "?page=2",                              "Page number (default 1)"],
                ["limit",     "?limit=50",                            "Rows per page (max 1000)"],
                ["order_by",  `?order_by=${columns[0]?.name || "col"}`, "Column to sort by"],
                ["order",     "?order=desc",                          "asc or desc"],
                ["col=val",   `?${columns[0]?.name || "col"}=value`,  "Exact match filter"],
                ["col__like", `?${columns[0]?.name || "col"}__like=part`, "Contains (strings)"],
                ["col__gte",  "?amount__gte=100",                     "Greater than or equal"],
                ["col__lte",  "?amount__lte=500",                     "Less than or equal"],
              ].map(([p, ex, desc]) => (
                <tr key={p}>
                  <td><code className="text-xs font-mono text-primary">{p}</code></td>
                  <td><code className="text-xs font-mono text-base-content/60">{ex}</code></td>
                  <td className="text-xs text-base-content/60">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Logs Tab ─────────────────────────────────────────────────────────────────

const STATUS_BADGE = {
  200: "badge-success",
  404: "badge-warning",
  403: "badge-error",
  500: "badge-error",
};

function LogsTab({ dataset }) {
  const [logs, setLogs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(0);
  const limit = 50;

  const load = (p = 0, status = filterStatus) => {
    setLoading(true);
    getDatasetLogs(dataset.id, {
      offset: p * limit,
      limit,
      ...(status ? { status: parseInt(status) } : {}),
    })
      .then((r) => { setLogs(r.data); setPage(p); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(0); }, [dataset.id]);

  const applyFilter = () => load(0);
  const totalPages = logs ? Math.max(1, Math.ceil(logs.total / limit)) : 1;

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* Filter bar */}
      <div className="px-5 py-3 border-b border-base-300 bg-base-200/40 flex items-center gap-3 flex-wrap shrink-0">
        <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wider">Activity Log</p>
        <select
          className="select select-xs select-bordered bg-base-100 ml-auto"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="200">200 OK</option>
          <option value="403">403 Forbidden</option>
          <option value="404">404 Not found</option>
          <option value="500">500 Error</option>
        </select>
        <button className="btn btn-xs btn-primary" onClick={applyFilter} disabled={loading}>
          Filter
        </button>
        <button className="btn btn-xs btn-ghost" onClick={() => { setFilterStatus(""); load(0, ""); }}>
          Reset
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <span className="loading loading-spinner loading-md text-primary" />
          </div>
        ) : !logs || logs.logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-base-content/30">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm">No API calls logged yet.</p>
            <p className="text-xs">Calls will appear here once someone queries your API.</p>
          </div>
        ) : (
          <table className="table table-xs w-full">
            <thead className="sticky top-0 bg-base-100 z-10">
              <tr className="bg-base-200 text-base-content/50">
                <th className="font-semibold">Time</th>
                <th className="font-semibold">Status</th>
                <th className="font-semibold">IP</th>
                <th className="font-semibold">Path</th>
                <th className="font-semibold">Query</th>
                <th className="font-semibold text-right">ms</th>
                <th className="font-semibold">Key</th>
              </tr>
            </thead>
            <tbody>
              {logs.logs.map((log) => (
                <tr key={log.id} className="hover border-base-200">
                  <td className="text-xs text-base-content/50 whitespace-nowrap font-mono">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td>
                    <span className={`badge badge-xs ${STATUS_BADGE[log.status_code] || "badge-ghost"}`}>
                      {log.status_code}
                    </span>
                  </td>
                  <td className="font-mono text-xs text-base-content/60">
                    {log.ip_address || "—"}
                  </td>
                  <td className="font-mono text-xs text-base-content/70 max-w-40 truncate" title={log.path}>
                    {log.path}
                  </td>
                  <td className="font-mono text-xs text-base-content/50 max-w-48 truncate" title={log.query_string || ""}>
                    {log.query_string || <span className="opacity-30">—</span>}
                  </td>
                  <td className="text-right font-mono text-xs">
                    <span className={log.response_ms > 500 ? "text-warning" : log.response_ms > 1000 ? "text-error" : "text-base-content/50"}>
                      {log.response_ms}
                    </span>
                  </td>
                  <td className="text-xs text-base-content/40 font-mono max-w-28 truncate" title={log.api_key_name || ""}>
                    {log.api_key_prefix
                      ? <>{log.api_key_prefix}<span className="opacity-30">…</span></>
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination + summary */}
      {logs && logs.total > 0 && (
        <div className="border-t border-base-300 px-5 py-3 bg-base-100 flex items-center justify-between gap-3 shrink-0">
          <p className="text-xs text-base-content/40">
            {logs.total.toLocaleString()} total requests
            {filterStatus && ` with status ${filterStatus}`}
          </p>
          {totalPages > 1 && (
            <div className="flex gap-1">
              <button className="btn btn-xs btn-ghost" disabled={page === 0} onClick={() => load(page - 1)}>‹</button>
              <span className="btn btn-xs btn-ghost pointer-events-none">{page + 1} / {totalPages}</span>
              <button className="btn btn-xs btn-ghost" disabled={page >= totalPages - 1} onClick={() => load(page + 1)}>›</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── GPT Actions Modal ────────────────────────────────────────────────────────

function GptActionsModal({ dataset, onClose }) {
  const specUrl = getPublicOpenApiUrl(dataset.id);
  const [copied, setCopied] = useState(null);

  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const CopyBtn = ({ text, id }) => (
    <button
      className="btn btn-ghost btn-xs gap-1 shrink-0"
      onClick={() => copy(text, id)}
    >
      {copied === id ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
      {copied === id ? "Copied!" : "Copy"}
    </button>
  );

  const steps = [
    {
      n: 1,
      title: "Open ChatGPT and create a new GPT",
      body: <>Go to <strong>chatgpt.com → Explore GPTs → Create</strong>, then click the <strong>Configure</strong> tab.</>,
    },
    {
      n: 2,
      title: "Add an Action",
      body: <>Scroll down to <strong>Actions</strong> and click <strong>Create new action</strong>. Choose <strong>Import from URL</strong>.</>,
    },
    {
      n: 3,
      title: "Paste your spec URL",
      body: (
        <div className="flex items-center gap-2 mt-1 bg-base-200 rounded-lg px-3 py-2 font-mono text-xs break-all">
          <span className="flex-1">{specUrl}</span>
          <CopyBtn text={specUrl} id="specUrl" />
        </div>
      ),
    },
    {
      n: 4,
      title: "Add authentication",
      body: (
        <>
          Under <strong>Authentication</strong>, choose <strong>API Key</strong> and set:
          <div className="mt-2 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 bg-base-200 rounded-lg px-3 py-1.5 font-mono text-xs">
              <span className="text-base-content/50 w-24 shrink-0">Auth type</span>
              <span className="flex-1">Custom</span>
              <CopyBtn text="Custom" id="authType" />
            </div>
            <div className="flex items-center gap-2 bg-base-200 rounded-lg px-3 py-1.5 font-mono text-xs">
              <span className="text-base-content/50 w-24 shrink-0">Header name</span>
              <span className="flex-1">X-API-Key</span>
              <CopyBtn text="X-API-Key" id="headerName" />
            </div>
            <div className="flex items-center gap-2 bg-base-200 rounded-lg px-3 py-1.5 font-mono text-xs">
              <span className="text-base-content/50 w-24 shrink-0">API key</span>
              <span className="flex-1 text-base-content/40 italic">your d2e_… key</span>
            </div>
          </div>
        </>
      ),
    },
    {
      n: 5,
      title: "Save and test",
      body: <>Click <strong>Save</strong>, then try asking your GPT: <em className="text-primary">"Show me the first 5 records"</em> or <em className="text-primary">"Find all entries where status is active."</em></>,
    },
  ];

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight">Publish as GPT Action</h3>
            <p className="text-sm text-base-content/50 mt-0.5">
              Let ChatGPT query <strong>{dataset.name}</strong> in natural language.
            </p>
          </div>
        </div>

        {/* What users can ask */}
        <div className="mb-5 p-3 rounded-xl bg-primary/5 border border-primary/15">
          <p className="text-xs font-semibold text-primary mb-2 uppercase tracking-wider">Example prompts your GPT will answer</p>
          <div className="flex flex-col gap-1">
            {[
              `"Show me all records where status is active"`,
              `"How many rows are in this dataset?"`,
              `"Find the top 10 entries sorted by price"`,
            ].map((p) => (
              <p key={p} className="text-xs text-base-content/60 font-mono bg-base-100 rounded px-2 py-1">{p}</p>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-4">
          {steps.map((s) => (
            <div key={s.n} className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-content flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {s.n}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-base-content mb-1">{s.title}</p>
                <div className="text-sm text-base-content/60 leading-relaxed">{s.body}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Note */}
        <div className="mt-5 p-3 rounded-xl bg-base-200 text-xs text-base-content/50 leading-relaxed">
          <strong>Note:</strong> The spec URL is public (no login required) so ChatGPT can read your API's shape.
          Your actual data remains protected — every query still requires a valid API key.
        </div>

        <div className="modal-action">
          <button className="btn btn-primary btn-sm" onClick={onClose}>Done</button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DatasetChat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [dataset, setDataset] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("chat");
  const [forceChat, setForceChat] = useState(false);
  const [showGptModal, setShowGptModal] = useState(false);
  const bottomRef = useRef();

  useEffect(() => {
    Promise.all([getDataset(id), getMessages(id)])
      .then(([dsRes, msgRes]) => {
        setDataset(dsRes.data);
        setMessages(msgRes.data);
      })
      .catch(() => setError("Failed to load dataset"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (activeTab === "chat") {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeTab]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    setMessages((prev) => [...prev, { role: "user", content: text, id: Date.now() }]);
    try {
      const res = await sendMessage(id, text);
      setMessages((prev) => [...prev, { role: "assistant", content: res.data.reply, id: Date.now() + 1 }]);
      setDataset((prev) => ({
        ...prev,
        confirmed_schema: { ...prev.confirmed_schema, columns: res.data.updated_columns },
      }));
    } catch {
      setError("Failed to send message. Try again.");
    } finally {
      setSending(false);
    }
  };

  const handleConfirm = async (columns = null) => {
    setConfirming(true);
    setError("");
    try {
      const res = await confirmSchema(id, columns);
      setDataset(res.data);
      setActiveTab("endpoints");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Schema confirmed! Your API is now live. Switch to the Endpoints tab to see your URLs, or use the Playground to run live queries.",
          id: Date.now(),
        },
      ]);
    } catch (err) {
      setError(err.response?.data?.detail || "Confirmation failed.");
    } finally {
      setConfirming(false);
    }
  };

  const columns = dataset?.confirmed_schema?.columns || dataset?.extracted_schema?.columns || [];
  const exposedCols = columns.filter((c) => c.expose !== false);
  const isActive = dataset?.status === "active";
  const isPaidUser = user?.plan === "premium" || user?.plan === "pro";

  // Determine which review UI to show:
  //   "editor" → SchemaEditor (heuristics confident enough, or free plan)
  //   "chat"   → AI chat (ambiguous schema + paid user + not forced-back to editor)
  const datasetAiMode = dataset?.ai_mode || dataset?.extracted_schema?.ai_mode || "chat";
  const showEditor = !isActive && !forceChat && (datasetAiMode === "editor" || !isPaidUser);
  const showChat = !isActive && !showEditor;

  // Tab label changes based on mode
  const reviewTabLabel = showEditor ? "Schema Editor" : "Chat";
  const TABS = [
    { id: "chat", label: reviewTabLabel },
    ...(isActive ? [
      { id: "endpoints",  label: "Endpoints" },
      { id: "playground", label: "Playground" },
      { id: "openapi",    label: "OpenAPI" },
      { id: "logs",       label: "Logs" },
      { id: "settings",   label: "Settings" },
    ] : []),
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex-1 flex items-center justify-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Top bar — fixed height, never scrolls */}
      <div className="shrink-0 mb-3">
        <button onClick={() => navigate("/dashboard/datasets")} className="btn btn-ghost btn-sm gap-1 -ml-2 text-base-content/50">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Datasets
        </button>
      </div>

      {error && (
        <div className="alert alert-error mb-3 text-sm shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          {error}
        </div>
      )}

      {/* Main panel — fills all remaining vertical space in the layout */}
      <div className="flex gap-5 flex-1 min-h-0">

        {/* Left — Schema sidebar */}
        <div className="w-64 shrink-0 bg-base-100 border border-base-300 rounded-2xl p-5 overflow-y-auto hidden lg:block">
          <p className="text-xs font-bold text-base-content/40 uppercase tracking-wider mb-4">Live Schema</p>
          {columns.length > 0 ? (
            <SchemaPanel columns={columns} datasetName={dataset?.name} status={dataset?.status} />
          ) : (
            <p className="text-sm text-base-content/40">No schema detected yet.</p>
          )}
        </div>

        {/* Right — Tabbed panel. min-w-0 stops flex-1 from growing past available space */}
        <div className="flex-1 min-w-0 bg-base-100 border border-base-300 rounded-2xl flex flex-col overflow-hidden">

          {/* Header — never shrinks, always visible */}
          <div className="border-b border-base-300 px-5 pt-4 pb-0 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-semibold text-base-content">{dataset?.name || "Dataset"}</h2>
                <p className="text-xs text-base-content/40">
                  {dataset?.row_count?.toLocaleString()} rows · {dataset?.doc_type?.toUpperCase()} ·{" "}
                  <span className={`font-medium ${isActive ? "text-success" : "text-warning"}`}>
                    {isActive ? "Live" : "Reviewing"}
                  </span>
                </p>
              </div>
              {/* Header confirm button only shown for chat mode (editor has its own footer button) */}
              {dataset?.status === "reviewing" && showChat && (
                <button className="btn btn-success btn-sm gap-1" onClick={() => handleConfirm(null)} disabled={confirming}>
                  {confirming
                    ? <span className="loading loading-spinner loading-xs" />
                    : <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  }
                  Confirm & Create API
                </button>
              )}
              {isActive && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-sm text-success font-medium">API Live</span>
                </div>
              )}
            </div>

            {/* Tab bar — scrolls horizontally if tabs overflow */}
            <div className="flex gap-0 overflow-x-auto scrollbar-none">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-base-content/50 hover:text-base-content"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-hidden flex flex-col">

            {/* ── Review tab: Schema Editor OR AI Chat ── */}
            {activeTab === "chat" && (
              <>
                {/* ── Schema Editor mode ── */}
                {showEditor && (
                  <SchemaEditor
                    columns={columns}
                    onConfirm={handleConfirm}
                    onSwitchToChat={isPaidUser ? () => setForceChat(true) : undefined}
                    confirming={confirming}
                    isActive={isActive}
                    isPaidUser={isPaidUser}
                  />
                )}

                {/* ── AI Chat mode ── */}
                {showChat && (
                  <>
                    <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
                      {messages.length === 0 && (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-base-content/30 text-sm">Waiting for the AI agent…</p>
                        </div>
                      )}
                      {messages.map((m) => <Message key={m.id} role={m.role} content={m.content} />)}
                      {sending && (
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-base-300 flex items-center justify-center shrink-0 text-xs font-bold">AI</div>
                          <div className="bg-base-200 rounded-2xl rounded-tl-sm px-4 py-3">
                            <span className="loading loading-dots loading-sm text-base-content/40" />
                          </div>
                        </div>
                      )}
                      <div ref={bottomRef} />
                    </div>

                    {dataset?.status === "reviewing" && (
                      <div className="border-t border-base-300 p-4">
                        {/* Switch back to editor hint */}
                        <div className="flex items-center gap-2 mb-2">
                          <button
                            onClick={() => setForceChat(false)}
                            className="btn btn-ghost btn-xs gap-1 text-base-content/40"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to editor
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            className="input input-bordered flex-1 text-sm"
                            placeholder='e.g. "Rename amount to price" or "Hide the id column"'
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                            disabled={sending}
                          />
                          <button className="btn btn-primary btn-square" onClick={handleSend} disabled={!input.trim() || sending}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-xs text-base-content/30 mt-2 text-center">
                          Tell the agent any changes, then click <strong>Confirm & Create API</strong> when ready.
                        </p>
                      </div>
                    )}

                    {isActive && (
                      <div className="border-t border-base-300 p-3 bg-success/5 text-center">
                        <p className="text-xs text-base-content/50">
                          API is live — use the{" "}
                          <button className="text-primary font-medium hover:underline" onClick={() => setActiveTab("endpoints")}>Endpoints</button>
                          {" "}or{" "}
                          <button className="text-primary font-medium hover:underline" onClick={() => setActiveTab("playground")}>Playground</button>
                          {" "}tabs to explore.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* ── Endpoints tab ── */}
            {activeTab === "endpoints" && (
              <EndpointsTab
                dataset={dataset}
                columns={exposedCols}
                onGetKey={() => navigate("/dashboard/api-keys")}
                onEndpointChanged={(slug) =>
                  setDataset((prev) => ({ ...prev, custom_endpoint: slug || null }))
                }
              />
            )}

            {/* ── Playground tab ── */}
            {activeTab === "playground" && (
              <Playground dataset={dataset} columns={exposedCols} />
            )}

            {/* ── OpenAPI tab ── */}
            {activeTab === "openapi" && (
              <OpenAPITab dataset={dataset} onPublishGpt={() => setShowGptModal(true)} />
            )}

            {/* ── Logs tab ── */}
            {activeTab === "logs" && (
              <LogsTab dataset={dataset} />
            )}

            {/* ── Settings tab ── */}
            {activeTab === "settings" && (
              <DatasetSettings
                dataset={dataset}
                onUpdate={(updated) => setDataset((prev) => ({ ...prev, ...updated }))}
              />
            )}
          </div>
        </div>
      </div>

      {/* GPT Actions modal */}
      {showGptModal && (
        <GptActionsModal dataset={dataset} onClose={() => setShowGptModal(false)} />
      )}
    </DashboardLayout>
  );
}

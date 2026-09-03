import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { listKeys, createKey, revokeKey } from "../api/apiKeys";
import { listDatasets } from "../api/datasets";

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="btn btn-ghost btn-xs gap-1">
      {copied ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

// ─── Row filter builder ───────────────────────────────────────────────────────

function RowFilterBuilder({ filters, onChange, columns }) {
  const addRow = () => onChange([...filters, { col: "", val: "" }]);
  const remove = (i) => onChange(filters.filter((_, idx) => idx !== i));
  const update = (i, field, value) => {
    const next = [...filters];
    next[i] = { ...next[i], [field]: value };
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-2">
      {filters.length === 0 && (
        <p className="text-xs text-base-content/40 italic">
          No filters — this key can read all rows.
        </p>
      )}
      {filters.map((f, i) => (
        <div key={i} className="flex gap-2 items-center">
          {columns.length > 0 ? (
            <select
              className="select select-xs select-bordered flex-1 bg-base-100 font-mono"
              value={f.col}
              onChange={(e) => update(i, "col", e.target.value)}
            >
              <option value="">— column —</option>
              {columns.map((c) => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              className="input input-xs input-bordered flex-1 font-mono bg-base-100"
              placeholder="column name"
              value={f.col}
              onChange={(e) => update(i, "col", e.target.value)}
            />
          )}
          <span className="text-base-content/30 text-sm">=</span>
          <input
            type="text"
            className="input input-xs input-bordered flex-1 font-mono bg-base-100"
            placeholder="value"
            value={f.val}
            onChange={(e) => update(i, "val", e.target.value)}
          />
          <button
            className="btn btn-ghost btn-xs text-error px-1"
            onClick={() => remove(i)}
            title="Remove filter"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
      <button className="btn btn-ghost btn-xs self-start gap-1 text-primary" onClick={addRow}>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add filter
      </button>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ApiKeys() {
  const [keys, setKeys] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyDataset, setNewKeyDataset] = useState("");
  const [rowFilters, setRowFilters] = useState([]);   // [{ col, val }]
  const [creating, setCreating] = useState(false);
  const [justCreated, setJustCreated] = useState(null);
  const [error, setError] = useState("");

  const load = () =>
    Promise.all([listKeys(), listDatasets()])
      .then(([k, d]) => {
        setKeys(k.data);
        setDatasets(d.data.filter((ds) => ds.status === "active"));
      })
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  // Columns available for the selected dataset (for the row filter column picker)
  const selectedDataset = datasets.find((d) => d.id === parseInt(newKeyDataset));
  const selectedCols = selectedDataset?.confirmed_schema?.columns?.filter((c) => c.expose !== false) || [];

  const handleCreate = async () => {
    if (!newKeyName.trim()) return;
    setCreating(true);
    setError("");

    // Convert [{col, val}] to {col: val} object, skip incomplete rows
    const filtersObj = rowFilters.reduce((acc, { col, val }) => {
      if (col && val !== "") acc[col] = val;
      return acc;
    }, {});

    try {
      const res = await createKey({
        name: newKeyName.trim(),
        dataset_id: newKeyDataset ? parseInt(newKeyDataset) : null,
        row_filters: Object.keys(filtersObj).length > 0 ? filtersObj : null,
      });
      setJustCreated(res.data);
      setShowModal(false);
      setNewKeyName("");
      setNewKeyDataset("");
      setRowFilters([]);
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create key");
    } finally {
      setCreating(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setError("");
    setNewKeyName("");
    setNewKeyDataset("");
    setRowFilters([]);
  };

  const handleRevoke = async (id) => {
    if (!confirm("Revoke this API key? Any apps using it will stop working immediately.")) return;
    await revokeKey(id);
    load();
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-base-content">API Keys</h1>
          <p className="text-base-content/50 text-sm mt-1">
            Manage keys used to authenticate requests to your generated APIs.
          </p>
        </div>
        <button className="btn btn-primary gap-2" onClick={() => setShowModal(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New API Key
        </button>
      </div>

      {/* Newly created key banner */}
      {justCreated?.full_key && (
        <div className="alert alert-success mb-6 flex-col items-start gap-2">
          <div className="flex items-center gap-2 font-semibold">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            API Key Created — Copy it now, you won't see it again.
          </div>
          <div className="flex items-center gap-2 w-full bg-success/20 rounded-lg px-3 py-2">
            <code className="text-sm font-mono flex-1 break-all">{justCreated.full_key}</code>
            <CopyButton text={justCreated.full_key} />
          </div>
          {justCreated.row_filters && Object.keys(justCreated.row_filters).length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Row scope:</span>
              {Object.entries(justCreated.row_filters).map(([k, v]) => (
                <code key={k} className="text-xs bg-success/20 rounded px-2 py-0.5 font-mono">
                  {k} = {v}
                </code>
              ))}
            </div>
          )}
          <button className="btn btn-ghost btn-xs" onClick={() => setJustCreated(null)}>Dismiss</button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : keys.length === 0 ? (
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body items-center text-center py-16 gap-4">
            <div className="w-16 h-16 bg-warning/10 rounded-2xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
            <div>
              <h2 className="text-lg font-semibold text-base-content">No API keys yet</h2>
              <p className="text-base-content/50 text-sm mt-1 max-w-sm">
                Create an API key to start making requests to your generated endpoints.
              </p>
            </div>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              Create your first key
            </button>
          </div>
        </div>
      ) : (
        <div className="card bg-base-100 border border-base-300 shadow-sm overflow-x-auto">
          <table className="table">
            <thead>
              <tr className="border-base-200">
                <th>Name</th>
                <th>Key</th>
                <th>Dataset</th>
                <th>Row scope</th>
                <th>Last used</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => {
                const ds = datasets.find((d) => d.id === k.dataset_id);
                const filters = k.row_filters || {};
                const filterCount = Object.keys(filters).length;
                return (
                  <tr key={k.id} className="border-base-200 hover">
                    <td className="font-medium text-base-content">{k.name}</td>
                    <td>
                      <code className="text-xs font-mono text-base-content/60 bg-base-200 px-2 py-0.5 rounded">
                        {k.key_prefix}••••••••••••
                      </code>
                    </td>
                    <td className="text-sm text-base-content/60">
                      {ds
                        ? ds.name
                        : k.dataset_id
                        ? "Unknown"
                        : <span className="badge badge-ghost badge-sm">All datasets</span>}
                    </td>
                    <td>
                      {filterCount === 0 ? (
                        <span className="text-xs text-base-content/30">All rows</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(filters).map(([col, val]) => (
                            <span
                              key={col}
                              className="badge badge-sm badge-info gap-1 font-mono text-xs"
                              title={`WHERE ${col} = "${val}"`}
                            >
                              {col}={val}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="text-sm text-base-content/50">
                      {k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : "Never"}
                    </td>
                    <td>
                      <span className={`badge badge-sm ${k.is_active ? "badge-success" : "badge-ghost"}`}>
                        {k.is_active ? "Active" : "Revoked"}
                      </span>
                    </td>
                    <td>
                      {k.is_active && (
                        <button
                          className="btn btn-ghost btn-xs text-error"
                          onClick={() => handleRevoke(k.id)}
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Usage instructions */}
      <div className="card bg-base-100 border border-base-300 mt-6">
        <div className="card-body py-4 px-5">
          <h3 className="font-semibold text-base-content mb-3">Using your API key</h3>
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-xs text-base-content/50 mb-1">Via header (recommended)</p>
              <div className="mockup-code text-xs">
                <pre><code>{`curl https://yourapp.com/api/v1/<table_name> \\
  -H "X-API-Key: d2e_your_key_here"`}</code></pre>
              </div>
            </div>
            <div>
              <p className="text-xs text-base-content/50 mb-1">Via query parameter</p>
              <div className="mockup-code text-xs">
                <pre><code>{`curl https://yourapp.com/api/v1/<table_name>?api_key=d2e_your_key_here`}</code></pre>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 rounded-xl bg-info/10 border border-info/20 text-xs text-base-content/60 leading-relaxed">
            <strong className="text-info">Row-level access control:</strong> When you create a key with row filters
            (e.g. <code className="font-mono bg-base-200 px-1 rounded">region = US</code>), every query using that key
            will automatically return only matching rows — callers cannot override this filter.
            Useful for sharing scoped API keys with different teams or customers.
          </div>
        </div>
      </div>

      {/* Create Key Modal */}
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-lg">
            <h3 className="font-bold text-lg mb-1">Create API Key</h3>
            <p className="text-sm text-base-content/50 mb-4">
              Optionally restrict this key to a specific dataset and/or row-level filters.
            </p>
            {error && <div className="alert alert-error text-sm mb-4">{error}</div>}

            <div className="flex flex-col gap-4">
              {/* Name */}
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text font-medium">Key name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  placeholder="e.g. Production, Partner API, EU Region"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  autoFocus
                />
              </div>

              {/* Dataset */}
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text font-medium">Dataset access</span>
                  <span className="label-text-alt text-base-content/40">Optional</span>
                </label>
                <select
                  className="select select-bordered"
                  value={newKeyDataset}
                  onChange={(e) => { setNewKeyDataset(e.target.value); setRowFilters([]); }}
                >
                  <option value="">All my datasets</option>
                  {datasets.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                <label className="label pt-1">
                  <span className="label-text-alt text-base-content/40">
                    Restrict this key to a single dataset for better security.
                  </span>
                </label>
              </div>

              {/* Row Filters */}
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text font-medium">Row-level filters</span>
                  <span className="label-text-alt text-base-content/40">Optional</span>
                </label>
                <div className="p-3 rounded-xl border border-base-300 bg-base-200/40">
                  <RowFilterBuilder
                    filters={rowFilters}
                    onChange={setRowFilters}
                    columns={selectedCols}
                  />
                </div>
                <label className="label pt-1">
                  <span className="label-text-alt text-base-content/40">
                    Queries using this key will only return rows matching all filters.
                  </span>
                </label>
              </div>
            </div>

            <div className="modal-action">
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={handleCreate}
                disabled={!newKeyName.trim() || creating}
              >
                {creating
                  ? <span className="loading loading-spinner loading-sm"></span>
                  : "Create Key"}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={closeModal}></div>
        </div>
      )}
    </DashboardLayout>
  );
}

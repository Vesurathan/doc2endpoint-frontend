/**
 * DatasetSettings — the "Settings" tab inside DatasetChat for active datasets.
 * Covers: Gallery visibility, Webhooks, Scheduled Sync, Upload New Version.
 */
import { useRef, useState } from "react";
import {
  setVisibility, setWebhook, testWebhook,
  setSyncConfig, triggerSync, uploadVersion,
} from "../api/datasets";

// ─── Shared helpers ───────────────────────────────────────────────────────────

function Card({ title, description, children }) {
  return (
    <div className="rounded-xl border border-base-300 bg-base-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-base-300">
        <h3 className="font-semibold text-base-content text-sm">{title}</h3>
        {description && <p className="text-xs text-base-content/50 mt-0.5">{description}</p>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function StatusMsg({ msg }) {
  if (!msg) return null;
  return (
    <div className={`alert ${msg.type === "success" ? "alert-success" : "alert-error"} text-sm py-2 mt-3`}>
      {msg.text}
    </div>
  );
}

// ─── Gallery Visibility ───────────────────────────────────────────────────────

function GallerySection({ dataset, onUpdate }) {
  const [isPublic, setIsPublic] = useState(dataset.is_public || false);
  const [desc, setDesc] = useState(dataset.public_description || "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await setVisibility(dataset.id, { is_public: isPublic, public_description: desc });
      onUpdate(res.data);
      setMsg({ type: "success", text: isPublic ? "Dataset published to the public gallery!" : "Dataset removed from public gallery." });
    } catch (e) {
      setMsg({ type: "error", text: e.response?.data?.detail || "Failed to update visibility." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card
      title="Public Gallery"
      description="Share this dataset with the Doc2Endpoint community. Anyone with a free API key can query it."
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <label className="flex items-center gap-3 cursor-pointer mb-4">
            <input
              type="checkbox"
              className="toggle toggle-primary toggle-sm"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            <span className="text-sm font-medium text-base-content">
              {isPublic ? "Listed in public gallery" : "Private (not listed)"}
            </span>
          </label>
          {isPublic && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-base-content/60">Short description (optional)</label>
              <textarea
                className="textarea textarea-bordered textarea-sm w-full text-sm resize-none"
                rows={2}
                placeholder="Describe what this dataset contains…"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                maxLength={300}
              />
              <p className="text-xs text-base-content/30 text-right">{desc.length}/300</p>
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-end mt-3">
        <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>
          {saving ? <span className="loading loading-spinner loading-xs" /> : "Save"}
        </button>
      </div>
      <StatusMsg msg={msg} />
    </Card>
  );
}

// ─── Webhooks ─────────────────────────────────────────────────────────────────

function WebhookSection({ dataset, onUpdate }) {
  const [url, setUrl] = useState(dataset.webhook_url || "");
  const [secret, setSecret] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [msg, setMsg] = useState(null);

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await setWebhook(dataset.id, { webhook_url: url, webhook_secret: secret });
      onUpdate(res.data);
      setSecret("");
      setMsg({ type: "success", text: url ? "Webhook saved." : "Webhook removed." });
    } catch (e) {
      setMsg({ type: "error", text: e.response?.data?.detail || "Failed to save webhook." });
    } finally {
      setSaving(false);
    }
  };

  const test = async () => {
    setTesting(true);
    setMsg(null);
    try {
      await testWebhook(dataset.id);
      setMsg({ type: "success", text: "Test webhook delivered successfully!" });
    } catch (e) {
      setMsg({ type: "error", text: e.response?.data?.detail || "Webhook test failed." });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card
      title="Webhook"
      description="Doc2Endpoint will POST a JSON payload to this URL whenever your dataset is updated or synced."
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-base-content/60">Endpoint URL</label>
          <input
            type="url"
            className="input input-bordered input-sm w-full font-mono"
            placeholder="https://your-app.com/webhooks/docapi"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-base-content/60">
            Secret (optional) — sent as <code className="bg-base-200 px-1 rounded">X-Doc2Endpoint-Signature</code>
          </label>
          <input
            type="text"
            className="input input-bordered input-sm w-full font-mono"
            placeholder="Leave blank to keep current secret"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-2 mt-4 justify-end">
        {dataset.webhook_url && (
          <button className="btn btn-ghost btn-sm" onClick={test} disabled={testing}>
            {testing ? <span className="loading loading-spinner loading-xs" /> : "Send test"}
          </button>
        )}
        <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>
          {saving ? <span className="loading loading-spinner loading-xs" /> : "Save webhook"}
        </button>
      </div>

      {dataset.webhook_url && !msg && (
        <div className="mt-3 p-3 rounded-lg bg-base-200 text-xs font-mono text-base-content/60 break-all">
          {dataset.webhook_url}
        </div>
      )}

      <StatusMsg msg={msg} />

      {/* Events reference */}
      <div className="mt-4">
        <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wider mb-2">Events fired</p>
        <div className="flex flex-col gap-1">
          {[
            ["dataset.synced",           "Scheduled or manual sync completed"],
            ["dataset.version_uploaded", "New version file uploaded"],
            ["dataset.test",             "Test event from this page"],
          ].map(([evt, desc]) => (
            <div key={evt} className="flex gap-3 text-xs">
              <code className="text-primary font-mono w-48 shrink-0">{evt}</code>
              <span className="text-base-content/50">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

// ─── Scheduled Sync ───────────────────────────────────────────────────────────

function SyncSection({ dataset, onUpdate }) {
  const [url, setUrl] = useState(dataset.sync_url || "");
  const [hours, setHours] = useState(dataset.sync_interval_hours || 24);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [msg, setMsg] = useState(null);

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await setSyncConfig(dataset.id, { sync_url: url, sync_interval_hours: Number(hours) });
      onUpdate(res.data);
      setMsg({ type: "success", text: url ? `Sync configured — every ${hours} hour(s).` : "Sync disabled." });
    } catch (e) {
      setMsg({ type: "error", text: e.response?.data?.detail || "Failed to save sync config." });
    } finally {
      setSaving(false);
    }
  };

  const syncNow = async () => {
    setSyncing(true);
    setMsg(null);
    try {
      const res = await triggerSync(dataset.id);
      onUpdate({ ...dataset, row_count: res.data.row_count, last_synced_at: res.data.synced_at });
      setMsg({ type: "success", text: `Sync complete — ${res.data.row_count.toLocaleString()} rows loaded.` });
    } catch (e) {
      setMsg({ type: "error", text: e.response?.data?.detail || "Sync failed." });
    } finally {
      setSyncing(false);
    }
  };

  const formatDate = (iso) => iso ? new Date(iso).toLocaleString() : "Never";

  return (
    <Card
      title="Scheduled Sync"
      description="Connect a live URL (Google Sheet CSV export, Dropbox, or any direct CSV/XLSX link). Doc2Endpoint re-fetches and replaces data automatically."
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-base-content/60">Source URL</label>
          <input
            type="url"
            className="input input-bordered input-sm w-full font-mono text-xs"
            placeholder="https://docs.google.com/spreadsheets/.../export?format=csv"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <p className="text-xs text-base-content/30">
            Google Sheets: File → Share → Publish to web → CSV format → copy link
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-base-content/60">Sync every</label>
          <div className="flex items-center gap-2">
            <select
              className="select select-bordered select-sm"
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
            >
              {[1, 2, 6, 12, 24, 48, 168].map((h) => (
                <option key={h} value={h}>
                  {h === 1 ? "1 hour" : h === 168 ? "1 week" : h < 24 ? `${h} hours` : `${h / 24} day${h / 24 > 1 ? "s" : ""}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {dataset.last_synced_at && (
          <p className="text-xs text-base-content/40">
            Last synced: <span className="text-base-content/60">{formatDate(dataset.last_synced_at)}</span>
          </p>
        )}
      </div>

      <div className="flex gap-2 mt-4 justify-end">
        {dataset.sync_url && (
          <button className="btn btn-ghost btn-sm gap-1" onClick={syncNow} disabled={syncing}>
            {syncing
              ? <span className="loading loading-spinner loading-xs" />
              : <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            }
            Sync now
          </button>
        )}
        <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>
          {saving ? <span className="loading loading-spinner loading-xs" /> : url ? "Save sync config" : "Disable sync"}
        </button>
      </div>

      <StatusMsg msg={msg} />
    </Card>
  );
}

// ─── Upload New Version ───────────────────────────────────────────────────────

function VersionUploadSection({ dataset, onUpdate }) {
  const fileRef = useRef();
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState("replace");
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [progress, setProgress] = useState(null);

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    setMsg(null);
    setProgress("Uploading…");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("mode", mode);
      const res = await uploadVersion(dataset.id, fd);
      onUpdate(res.data);
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      setProgress(null);
      setMsg({ type: "success", text: res.data.message });
    } catch (e) {
      setProgress(null);
      setMsg({ type: "error", text: e.response?.data?.detail || "Upload failed." });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card
      title="Upload New Version"
      description="Push fresh data into this dataset without changing its API endpoint or schema."
    >
      <div className="flex flex-col gap-4">
        {/* Mode selector */}
        <div className="flex gap-3">
          {[
            { value: "replace", label: "Replace all rows", desc: "Wipes existing data and loads the new file" },
            { value: "append",  label: "Append rows",      desc: "Adds new rows to the end of existing data" },
          ].map((opt) => (
            <label
              key={opt.value}
              className={`flex-1 p-3 rounded-xl border cursor-pointer transition-colors ${mode === opt.value ? "border-primary bg-primary/5" : "border-base-300 hover:border-base-content/20"}`}
            >
              <input type="radio" className="hidden" value={opt.value} checked={mode === opt.value} onChange={() => setMode(opt.value)} />
              <p className="text-sm font-semibold text-base-content">{opt.label}</p>
              <p className="text-xs text-base-content/50 mt-0.5">{opt.desc}</p>
            </label>
          ))}
        </div>

        {/* File picker */}
        <div
          className="border-2 border-dashed border-base-300 rounded-xl p-6 text-center cursor-pointer hover:border-primary/40 transition-colors"
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); setFile(e.dataTransfer.files[0]); }}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={(e) => setFile(e.target.files[0])}
          />
          {file ? (
            <div className="flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm font-medium text-base-content">{file.name}</p>
              <p className="text-xs text-base-content/40">({(file.size / 1024).toFixed(1)} KB)</p>
            </div>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mx-auto mb-2 text-base-content/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <p className="text-sm text-base-content/60">Drop a CSV or Excel file here, or click to browse</p>
            </>
          )}
        </div>

        {progress && (
          <div className="flex items-center gap-2 text-sm text-base-content/60">
            <span className="loading loading-spinner loading-xs" />
            {progress}
          </div>
        )}

        <div className="flex justify-end">
          <button
            className="btn btn-primary btn-sm gap-1"
            onClick={upload}
            disabled={!file || uploading}
          >
            {uploading
              ? <span className="loading loading-spinner loading-xs" />
              : <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            }
            {mode === "replace" ? "Replace data" : "Append data"}
          </button>
        </div>
      </div>

      <StatusMsg msg={msg} />
    </Card>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function DatasetSettings({ dataset, onUpdate }) {
  return (
    <div className="flex flex-col gap-5 p-5 overflow-y-auto flex-1 min-h-0">
      <GallerySection dataset={dataset} onUpdate={onUpdate} />
      <WebhookSection dataset={dataset} onUpdate={onUpdate} />
      <SyncSection    dataset={dataset} onUpdate={onUpdate} />
      <VersionUploadSection dataset={dataset} onUpdate={onUpdate} />
    </div>
  );
}

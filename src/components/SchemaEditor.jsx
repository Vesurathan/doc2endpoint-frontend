/**
 * SchemaEditor — editable schema review UI shown when ai_mode === "editor"
 * or when the user is on the Free plan.
 *
 * Props:
 *   columns          — array of column objects (from extracted_schema or confirmed_schema)
 *   onConfirm(cols)  — called with final columns when user clicks "Confirm & Create API"
 *   onSwitchToChat() — optional; shown for paid users to switch to AI chat instead
 *   confirming       — bool, disables confirm button while request is in-flight
 *   isActive         — bool, hides editor when API is already live
 *   isPaidUser       — bool, shows "Ask AI instead" button
 */

import { useState } from "react";

const TYPE_OPTIONS = ["string", "integer", "number", "boolean", "datetime"];

const FLAG_BADGE = {
  sensitive:  "badge-error",
  pii:        "badge-warning",
  identifier: "badge-info",
  date:       "badge-secondary",
  currency:   "badge-success",
  count:      "badge-ghost",
  metric:     "badge-ghost",
  boolean:    "badge-ghost",
  enum:       "badge-ghost",
  text:       "badge-ghost",
  url:        "badge-ghost",
  location:   "badge-ghost",
};

const TYPE_BADGE = {
  string:   "badge-ghost",
  integer:  "badge-info",
  number:   "badge-info",
  boolean:  "badge-warning",
  datetime: "badge-secondary",
};

function safeApiName(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    || "column";
}

export default function SchemaEditor({
  columns = [],
  onConfirm,
  onSwitchToChat,
  confirming = false,
  isActive = false,
  isPaidUser = false,
}) {
  const [cols, setCols] = useState(() =>
    columns.map((c) => ({
      ...c,
      // Ensure each col has a working `name` for the editor
      name: c.name || safeApiName(c.original_name || "column"),
      expose: c.expose !== false,
    }))
  );
  const [errors, setErrors] = useState({});

  const update = (idx, field, value) => {
    setCols((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
    // Clear error on edit
    if (errors[`${idx}_name`]) {
      setErrors((prev) => { const e = { ...prev }; delete e[`${idx}_name`]; return e; });
    }
  };

  const validate = () => {
    const errs = {};
    cols.forEach((col, idx) => {
      if (!col.name || !/^[a-z][a-z0-9_]*$/.test(col.name)) {
        errs[`${idx}_name`] = "Use lowercase letters, digits, underscores (start with a letter)";
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleConfirm = () => {
    if (!validate()) return;
    onConfirm(cols);
  };

  const allExposed = cols.filter((c) => c.expose).length;
  const allHidden  = cols.length - allExposed;

  if (isActive) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 h-full text-center p-6">
        <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="font-semibold text-base-content">Your API is live!</p>
        <p className="text-sm text-base-content/50">Switch to the Endpoints tab to explore your API.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header info bar */}
      <div className="px-5 py-3 border-b border-base-300 bg-base-200/40 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
          <span className="text-sm font-medium text-base-content">
            Review your schema — {allExposed} column{allExposed !== 1 ? "s" : ""} will be exposed
            {allHidden > 0 && `, ${allHidden} hidden`}
          </span>
        </div>
        {isPaidUser && onSwitchToChat && (
          <button
            onClick={onSwitchToChat}
            className="btn btn-ghost btn-xs gap-1 text-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Ask AI instead
          </button>
        )}
      </div>

      {/* Hint */}
      <div className="px-5 pt-3 pb-1">
        <p className="text-xs text-base-content/40">
          Edit column names, change types, and toggle which columns appear in your API. Click{" "}
          <strong>Confirm & Create API</strong> when you're satisfied.
        </p>
      </div>

      {/* Column table — scrollable */}
      <div className="flex-1 overflow-y-auto px-5 pb-3">
        <div className="flex flex-col gap-2 mt-2">
          {cols.map((col, idx) => (
            <div
              key={idx}
              className={`rounded-xl border transition-all ${
                col.expose ? "border-base-300 bg-base-100" : "border-base-300/50 bg-base-200/40 opacity-60"
              }`}
            >
              {/* Top row */}
              <div className="flex items-center gap-3 px-4 py-3">
                {/* Expose toggle */}
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm checkbox-primary"
                  checked={col.expose}
                  onChange={(e) => update(idx, "expose", e.target.checked)}
                  title={col.expose ? "Exposed in API — click to hide" : "Hidden — click to expose"}
                />

                {/* Original name (read-only) */}
                <div className="flex flex-col min-w-0 w-32 shrink-0">
                  <span className="text-xs text-base-content/40 truncate" title={col.original_name}>
                    {col.original_name}
                  </span>
                  <span className="text-xs text-base-content/30">original</span>
                </div>

                {/* Arrow */}
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-base-content/20 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>

                {/* API name (editable) */}
                <div className="flex flex-col flex-1 min-w-0">
                  <input
                    type="text"
                    className={`input input-xs input-bordered font-mono bg-base-100 w-full ${
                      errors[`${idx}_name`] ? "input-error" : ""
                    }`}
                    value={col.name}
                    onChange={(e) => update(idx, "name", e.target.value)}
                    onBlur={(e) => {
                      // Auto-slugify on blur
                      const safe = safeApiName(e.target.value || col.original_name);
                      update(idx, "name", safe);
                    }}
                    placeholder="api_field_name"
                  />
                  {errors[`${idx}_name`] && (
                    <span className="text-xs text-error mt-0.5">{errors[`${idx}_name`]}</span>
                  )}
                </div>

                {/* Type selector */}
                <select
                  className="select select-xs select-bordered bg-base-100 w-28 shrink-0"
                  value={col.type}
                  onChange={(e) => update(idx, "type", e.target.value)}
                >
                  {TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>

                {/* Type badge */}
                <span className={`badge badge-sm ${TYPE_BADGE[col.type] || "badge-ghost"} shrink-0 hidden sm:inline-flex`}>
                  {col.type}
                </span>

                {/* Flag badge */}
                {col.flag && (
                  <span className={`badge badge-sm ${FLAG_BADGE[col.flag] || "badge-ghost"} shrink-0 hidden md:inline-flex`}>
                    {col.flag}
                  </span>
                )}

                {/* Hidden label */}
                {!col.expose && (
                  <span className="badge badge-sm badge-ghost shrink-0">hidden</span>
                )}
              </div>

              {/* Hint row (if any) */}
              {col.hint && (
                <div className="px-4 pb-2.5 flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-base-content/30 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs text-base-content/40 leading-relaxed">{col.hint}</span>
                </div>
              )}

              {/* Sample values row */}
              {col.sample_values?.length > 0 && (
                <div className="px-4 pb-2.5 flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs text-base-content/30">samples:</span>
                  {col.sample_values.slice(0, 4).map((v, i) => (
                    <code key={i} className="text-xs bg-base-200 rounded px-1.5 py-0.5 text-base-content/50 font-mono truncate max-w-[120px]">
                      {String(v)}
                    </code>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer actions */}
      <div className="border-t border-base-300 px-5 py-4 bg-base-100 flex items-center justify-between gap-3 flex-wrap shrink-0">
        <div className="text-xs text-base-content/40">
          {allExposed} of {cols.length} columns will appear in API responses
        </div>
        <div className="flex gap-2">
          {!isPaidUser && (
            <div className="flex items-center gap-1.5 text-xs text-base-content/40">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              AI chat on Premium+
            </div>
          )}
          <button
            className="btn btn-success btn-sm gap-1.5"
            onClick={handleConfirm}
            disabled={confirming}
          >
            {confirming ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            Confirm & Create API
          </button>
        </div>
      </div>
    </div>
  );
}

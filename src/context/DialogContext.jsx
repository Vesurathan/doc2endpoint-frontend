import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

/**
 * Promise-based replacements for window.confirm / window.alert, rendered as
 * daisyUI modals so they match the rest of the app.
 *
 *   const { confirm, alert } = useDialog();
 *   if (!(await confirm({ title: "Delete?", message: "...", danger: true }))) return;
 *   await alert({ title: "Failed", message: err.message });
 */
const DialogContext = createContext(null);

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("useDialog must be used inside <DialogProvider>");
  return ctx;
}

export function DialogProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const [busy, setBusy] = useState(false);
  const resolver = useRef(null);

  const open = useCallback((opts) => {
    setBusy(false);
    setDialog(opts);
    return new Promise((resolve) => { resolver.current = resolve; });
  }, []);

  const confirm = useCallback(
    ({ title = "Are you sure?", message = "", confirmText = "Confirm", cancelText = "Cancel", danger = false } = {}) =>
      open({ kind: "confirm", title, message, confirmText, cancelText, danger }),
    [open],
  );

  const alert = useCallback(
    ({ title = "Notice", message = "", confirmText = "OK", danger = false } = {}) =>
      open({ kind: "alert", title, message, confirmText, danger }),
    [open],
  );

  const close = (result) => {
    setDialog(null);
    resolver.current?.(result);
    resolver.current = null;
  };

  const onConfirm = async () => {
    // Guard against a double-click firing the action twice
    if (busy) return;
    setBusy(true);
    close(true);
  };

  // Escape cancels, matching native confirm()
  useEffect(() => {
    if (!dialog) return;
    const onKey = (e) => { if (e.key === "Escape") close(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dialog]);

  return (
    <DialogContext.Provider value={{ confirm, alert }}>
      {children}

      {dialog && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <div className="flex gap-4">
              <div className={`shrink-0 rounded-full p-3 h-fit ${dialog.danger ? "bg-error/10" : "bg-primary/10"}`}>
                {dialog.danger ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>

              <div className="min-w-0">
                <h3 className="font-bold text-lg">{dialog.title}</h3>
                {dialog.message && (
                  <p className="text-sm text-base-content/60 mt-1 whitespace-pre-line break-words">
                    {dialog.message}
                  </p>
                )}
              </div>
            </div>

            <div className="modal-action">
              {dialog.kind === "confirm" && (
                <button className="btn btn-ghost" onClick={() => close(false)} disabled={busy}>
                  {dialog.cancelText}
                </button>
              )}
              <button
                className={`btn ${dialog.danger ? "btn-error" : "btn-primary"}`}
                onClick={dialog.kind === "confirm" ? onConfirm : () => close(true)}
                disabled={busy}
                autoFocus
              >
                {dialog.confirmText}
              </button>
            </div>
          </div>

          {/* Backdrop dismisses as a cancel */}
          <div className="modal-backdrop" onClick={() => close(false)} />
        </div>
      )}
    </DialogContext.Provider>
  );
}

import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { uploadDataset } from "../api/datasets";

const DOC_TYPES = [
  {
    id: "excel",
    label: "Excel",
    ext: ".xlsx, .xls",
    accept: ".xlsx,.xls",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 0v10m0-10a2 2 0 012 2h2a2 2 0 012-2" />
      </svg>
    ),
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/30",
  },
  {
    id: "csv",
    label: "CSV",
    ext: ".csv",
    accept: ".csv",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
    color: "text-info",
    bg: "bg-info/10",
    border: "border-info/30",
  },
  {
    id: "pdf",
    label: "PDF",
    ext: ".pdf",
    accept: ".pdf",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    color: "text-error",
    bg: "bg-error/10",
    border: "border-error/30",
  },
  {
    id: "docx",
    label: "Word",
    ext: ".docx, .doc",
    accept: ".docx,.doc",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/30",
  },
  {
    id: "image",
    label: "Image / Receipt",
    ext: ".jpg, .png, .webp",
    accept: ".jpg,.jpeg,.png,.webp,.tiff",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/30",
  },
];

const STEPS = ["Choose type", "Upload file", "Processing"];

export default function NewDataset() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [docType, setDocType] = useState(null);
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef();

  const selectedType = DOC_TYPES.find((d) => d.id === docType);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) setFile(dropped);
    },
    []
  );

  const handleUpload = async () => {
    if (!file || !docType) return;
    setError("");
    setUploading(true);
    setStep(2);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("doc_type", docType);
    formData.append("name", name || file.name.replace(/\.[^.]+$/, ""));

    try {
      const res = await uploadDataset(formData);
      navigate(`/dashboard/datasets/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.detail || "Upload failed. Please try again.");
      setStep(1);
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button onClick={() => navigate("/dashboard")} className="btn btn-ghost btn-sm gap-1 mb-4 -ml-2 text-base-content/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-2xl font-bold text-base-content">New Dataset</h1>
          <p className="text-base-content/50 text-sm mt-1">Upload a document and we'll extract the data and create a live API.</p>
        </div>

        {/* Steps */}
        <ul className="steps steps-horizontal w-full mb-10">
          {STEPS.map((s, i) => (
            <li key={s} className={`step text-xs ${i <= step ? "step-primary" : ""}`}>
              {s}
            </li>
          ))}
        </ul>

        {error && (
          <div className="alert alert-error mb-6 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            {error}
          </div>
        )}

        {/* Step 0 — Choose document type */}
        {step === 0 && (
          <div>
            <h2 className="text-lg font-semibold text-base-content mb-1">What type of document are you uploading?</h2>
            <p className="text-base-content/50 text-sm mb-6">We'll use the right extraction method for your file type.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {DOC_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setDocType(t.id); setStep(1); }}
                  className={`card border-2 p-4 text-left hover:shadow-md transition-all cursor-pointer ${
                    docType === t.id ? `${t.border} ${t.bg}` : "border-base-300 bg-base-100 hover:border-base-400"
                  }`}
                >
                  <div className={`${t.color} mb-3`}>{t.icon}</div>
                  <div className="font-semibold text-base-content text-sm">{t.label}</div>
                  <div className="text-xs text-base-content/40 mt-0.5">{t.ext}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1 — Upload */}
        {step === 1 && selectedType && (
          <div>
            <button onClick={() => setStep(0)} className="btn btn-ghost btn-sm gap-1 mb-5 -ml-2 text-base-content/50">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Change type
            </button>

            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium mb-6 ${selectedType.bg} ${selectedType.color}`}>
              {selectedType.icon && <span className="w-4 h-4">{selectedType.icon}</span>}
              {selectedType.label} selected
            </div>

            {/* Dataset name */}
            <div className="form-control mb-5">
              <label className="label pb-1"><span className="label-text font-medium">Dataset name</span></label>
              <input
                type="text"
                placeholder={`e.g. Q1 Sales, Customer Invoices`}
                className="input input-bordered w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Drop zone */}
            <div
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors ${
                dragging ? "border-primary bg-primary/5" : file ? "border-success bg-success/5" : "border-base-300 hover:border-primary/50"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept={selectedType.accept}
                onChange={(e) => setFile(e.target.files[0])}
              />
              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center text-success">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="font-semibold text-base-content">{file.name}</p>
                  <p className="text-sm text-base-content/50">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button className="btn btn-ghost btn-xs mt-1 text-base-content/40" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-base-200 rounded-xl flex items-center justify-center text-base-content/30">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-base-content">Drop your {selectedType.label} here</p>
                    <p className="text-sm text-base-content/50 mt-1">or click to browse • Max 100MB</p>
                  </div>
                  <p className="text-xs text-base-content/30">{selectedType.ext}</p>
                </div>
              )}
            </div>

            <button
              className="btn btn-primary w-full mt-5 gap-2"
              disabled={!file || uploading}
              onClick={handleUpload}
            >
              {uploading ? (
                <><span className="loading loading-spinner loading-sm"></span> Uploading…</>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Upload & Extract
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 2 — Processing */}
        {step === 2 && (
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body items-center text-center py-16 gap-5">
              <span className="loading loading-spinner loading-lg text-primary"></span>
              <div>
                <h2 className="text-lg font-semibold text-base-content">Extracting your data…</h2>
                <p className="text-base-content/50 text-sm mt-1">
                  Reading <strong>{file?.name}</strong> and detecting the schema.
                  <br />This usually takes a few seconds.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

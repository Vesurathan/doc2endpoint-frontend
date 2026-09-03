import { Link } from "react-router-dom";

const features = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    ),
    title: "Upload any file",
    desc: "Excel, PDF, CSV, Word, scanned images — all supported.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
      </svg>
    ),
    title: "AI confirms the schema",
    desc: "Chat with the agent to rename columns and fix types.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: "Live REST API in minutes",
    desc: "Filtering, pagination, and docs generated automatically.",
  },
];

/**
 * Split-screen auth wrapper.
 *
 * Left  — brand panel (hidden on mobile)
 * Right — form area (full-width on mobile, half on desktop)
 *
 * Props
 *   heading   string  e.g. "Welcome back"
 *   sub       string  e.g. "Sign in to your account"
 *   children  node    the form card + footer link
 */
export default function AuthLayout({ heading, sub, children }) {
  return (
    <div className="min-h-screen flex">

      {/* ── Left brand panel ─────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] flex-col justify-between p-10 relative overflow-hidden bg-primary">

        {/* Decorative blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-focus/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-16 w-80 h-80 bg-primary-focus/20 rounded-full blur-3xl pointer-events-none" />

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-primary-content/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-primary-content" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-2xl font-extrabold text-primary-content tracking-tight">Doc2Endpoint</span>
        </Link>

        {/* Hero copy */}
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-content/60 mb-3">
            No-code API platform
          </p>
          <h2 className="text-4xl font-extrabold text-primary-content leading-tight mb-4">
            Turn documents<br />into live APIs.
          </h2>
          <p className="text-primary-content/70 text-base leading-relaxed mb-10 max-w-xs">
            Upload a file, confirm the schema with our AI agent, and get
            production-ready REST endpoints — in under 5 minutes.
          </p>

          {/* Feature list */}
          <div className="flex flex-col gap-5">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-4">
                <div className="w-9 h-9 shrink-0 bg-primary-content/15 rounded-xl flex items-center justify-center text-primary-content backdrop-blur-sm">
                  {f.icon}
                </div>
                <div>
                  <p className="font-semibold text-primary-content text-sm">{f.title}</p>
                  <p className="text-primary-content/60 text-xs mt-0.5 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom trust line */}
        <p className="text-xs text-primary-content/40 relative z-10">
          © {new Date().getFullYear()} Doc2Endpoint · Secure · No credit card needed for free plan
        </p>
      </div>

      {/* ── Right form panel ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen bg-base-100 overflow-y-auto">

        {/* Mobile logo (shows only below lg) */}
        <div className="lg:hidden px-6 pt-8 pb-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary-content" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-base-content">Doc2Endpoint</span>
          </Link>
        </div>

        {/* Centred form content */}
        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">

            {/* Heading */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-base-content">{heading}</h1>
              <p className="text-base-content/50 mt-1 text-sm">{sub}</p>
            </div>

            {children}
          </div>
        </div>
      </div>

    </div>
  );
}

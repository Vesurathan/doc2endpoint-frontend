import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const features = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    ),
    title: "Upload Any Document",
    desc: "Excel, PDF, CSV, Word, receipts, scanned images — we handle them all. Just upload and let the system do the work.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
      </svg>
    ),
    title: "AI-Powered Schema Detection",
    desc: "Our AI agent reads your document, detects columns and data types, and has a conversation with you to confirm or correct the schema.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: "Instant REST APIs",
    desc: "Once confirmed, your data is immediately available as live REST API endpoints — with filtering, pagination, and full documentation.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
    title: "Secure API Keys",
    desc: "Each dataset gets its own API key. Control access, rotate keys, set rate limits, and monitor usage from your dashboard.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Usage Analytics",
    desc: "Track API call volume, popular endpoints, and error rates. Know exactly how your data is being used.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    title: "Auto-Generated Docs",
    desc: "Every dataset gets its own interactive API documentation page. Share it with your team or developers instantly.",
  },
];

const steps = [
  { step: "01", title: "Upload your file", desc: "Choose your document type and upload. We support Excel, PDF, CSV, Word, and images up to 100MB." },
  { step: "02", title: "Chat with the AI agent", desc: "Our agent presents the detected schema. You confirm, rename columns, or correct data types in plain English." },
  { step: "03", title: "Get your API", desc: "Hit confirm and your live API endpoints are provisioned instantly — with a key, base URL, and docs ready to go." },
  { step: "04", title: "Plug it into your system", desc: "Use the API in your app, dashboard, or any tool that speaks HTTP. No more manual exports." },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    badge: null,
    features: [
      "2 datasets",
      "Excel & CSV only",
      "5MB file size limit",
      "1,000 API calls / month",
      "1 API key",
      "Community support",
    ],
    cta: "Get started free",
    ctaStyle: "btn-outline",
    highlight: false,
  },
  {
    name: "Premium",
    price: "$29",
    period: "per month",
    badge: "7-day free trial",
    features: [
      "20 datasets",
      "Excel, PDF, CSV, Word",
      "50MB file size limit",
      "50,000 API calls / month",
      "5 API keys",
      "Full agent conversation history",
      "Email support",
    ],
    cta: "Start free trial",
    ctaStyle: "btn-primary",
    highlight: true,
  },
  {
    name: "Pro",
    price: "$79",
    period: "per month",
    badge: "7-day free trial",
    features: [
      "Unlimited datasets",
      "All document types + OCR",
      "100MB+ file size limit",
      "Unlimited API calls",
      "Unlimited API keys",
      "Full agent history",
      "Priority support",
      "Custom domain for APIs",
    ],
    cta: "Start free trial",
    ctaStyle: "btn-neutral",
    highlight: false,
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-base-100">
      <Navbar />

      {/* Hero */}
      <section className="py-20 px-4 lg:px-8 text-center max-w-5xl mx-auto">
        <div className="badge badge-primary badge-outline mb-6 py-3 px-4 font-medium">
          Turn documents into APIs — no code required
        </div>
        <h1 className="text-5xl lg:text-6xl font-extrabold text-base-content leading-tight mb-6">
          Your files. <span className="text-primary">Live APIs.</span>
          <br /> In minutes.
        </h1>
        <p className="text-xl text-base-content/60 max-w-2xl mx-auto mb-10">
          Upload Excel sheets, PDFs, receipts, or any document. Our AI agent
          extracts the data, confirms the schema with you, and instantly
          provisions REST API endpoints — ready to plug into any system.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register" className="btn btn-primary btn-lg px-8">
            Start for free
          </Link>
          <a href="#how-it-works" className="btn btn-outline btn-lg px-8">
            See how it works
          </a>
        </div>

        {/* Mock API preview */}
        <div className="mt-16 mockup-code text-left max-w-2xl mx-auto shadow-xl text-sm">
          <pre data-prefix="$"><code>GET /api/v1/invoices?month=April&status=paid</code></pre>
          <pre data-prefix=" " className="text-success"><code>{"{"}</code></pre>
          <pre data-prefix=" " className="text-success"><code>{"  \"data\": ["}</code></pre>
          <pre data-prefix=" " className="text-success"><code>{'    { "invoice_id": "INV-001", "amount": 1200, "status": "paid" },'}</code></pre>
          <pre data-prefix=" " className="text-success"><code>{'    { "invoice_id": "INV-002", "amount": 850, "status": "paid" }'}</code></pre>
          <pre data-prefix=" " className="text-success"><code>{"  ],"}</code></pre>
          <pre data-prefix=" " className="text-success"><code>{'  "total": 2, "page": 1'}</code></pre>
          <pre data-prefix=" " className="text-success"><code>{"}"}</code></pre>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 lg:px-8 bg-base-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-base-content mb-4">Everything you need</h2>
            <p className="text-lg text-base-content/60 max-w-xl mx-auto">
              From raw files to production-ready APIs — all in one platform.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="card bg-base-100 shadow-sm border border-base-300 hover:shadow-md transition-shadow">
                <div className="card-body">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                    {f.icon}
                  </div>
                  <h3 className="card-title text-base-content">{f.title}</h3>
                  <p className="text-base-content/60 text-sm">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-4 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-base-content mb-4">How it works</h2>
            <p className="text-lg text-base-content/60 max-w-xl mx-auto">
              Four steps from file to live API. Takes under 5 minutes.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {steps.map((s) => (
              <div key={s.step} className="flex gap-5">
                <div className="w-14 h-14 shrink-0 bg-primary text-primary-content rounded-2xl flex items-center justify-center font-bold text-lg">
                  {s.step}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-base-content mb-1">{s.title}</h3>
                  <p className="text-base-content/60 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 lg:px-8 bg-base-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-base-content mb-4">Simple pricing</h2>
            <p className="text-lg text-base-content/60 max-w-xl mx-auto">
              Start free. Upgrade when you need more. No hidden fees.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`card bg-base-100 border ${plan.highlight ? "border-primary shadow-lg shadow-primary/10 scale-105" : "border-base-300"}`}
              >
                <div className="card-body gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-base-content">{plan.name}</h3>
                    {plan.badge && (
                      <span className="badge badge-primary badge-sm">{plan.badge}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-4xl font-extrabold text-base-content">{plan.price}</span>
                    <span className="text-base-content/50 ml-2 text-sm">/{plan.period}</span>
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2 text-sm text-base-content/70">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <div className="card-actions mt-2">
                    <Link to="/register" className={`btn ${plan.ctaStyle} btn-block`}>
                      {plan.cta}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-base-content mb-4">
            Ready to turn your documents into APIs?
          </h2>
          <p className="text-lg text-base-content/60 mb-8">
            Join thousands of teams who stopped exporting spreadsheets and
            started building with live data.
          </p>
          <Link to="/register" className="btn btn-primary btn-lg px-10">
            Get started — it&apos;s free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-base-200 text-base-content/60 border-t border-base-300 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary-content" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-bold text-base-content">Doc2Endpoint</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <Link to="/gallery"  className="hover:text-base-content transition-colors">Gallery</Link>
            <Link to="/docs"    className="hover:text-base-content transition-colors">Documentation</Link>
            <Link to="/privacy" className="hover:text-base-content transition-colors">Privacy Policy</Link>
            <Link to="/terms"   className="hover:text-base-content transition-colors">Terms of Service</Link>
            <a href="mailto:support@doc2endpoint.com" className="hover:text-base-content transition-colors">Contact</a>
          </div>
          <p className="text-xs">© 2026 Doc2Endpoint. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

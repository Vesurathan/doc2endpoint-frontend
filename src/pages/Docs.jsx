import { useState } from "react";
import { Link } from "react-router-dom";

const API_BASE = "http://localhost:8000";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function CodeBlock({ code, lang = "bash" }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group rounded-xl overflow-hidden border border-base-300 my-3">
      <div className="flex items-center justify-between px-4 py-2 bg-base-300/60 border-b border-base-300">
        <span className="text-xs font-mono text-base-content/40 uppercase tracking-wide">{lang}</span>
        <button onClick={copy} className="text-xs text-base-content/40 hover:text-base-content gap-1 flex items-center transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm font-mono text-base-content/80 bg-base-200 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function Param({ name, type, required, children }) {
  return (
    <div className="flex gap-4 py-3 border-b border-base-300 last:border-0">
      <div className="w-44 shrink-0">
        <code className="text-sm font-mono text-primary">{name}</code>
        <div className="flex gap-1 mt-1">
          <span className="text-xs text-base-content/40 font-mono">{type}</span>
          {required && <span className="text-xs text-error font-medium">required</span>}
        </div>
      </div>
      <p className="text-sm text-base-content/70 leading-relaxed">{children}</p>
    </div>
  );
}

function Section({ id, title, children }) {
  return (
    <section id={id} className="mb-14 scroll-mt-20">
      <h2 className="text-2xl font-bold text-base-content mb-6 pb-3 border-b border-base-300">{title}</h2>
      {children}
    </section>
  );
}

function SubSection({ title, children }) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-base-content mb-4">{title}</h3>
      {children}
    </div>
  );
}

const NAV = [
  { id: "quickstart",    label: "Quick Start" },
  { id: "auth",          label: "Authentication" },
  { id: "endpoints",     label: "Endpoints" },
  { id: "filtering",     label: "Filtering & Sorting" },
  { id: "response",      label: "Response Format" },
  { id: "errors",        label: "Error Codes" },
  { id: "examples",      label: "Code Examples" },
  { id: "rate-limits",   label: "Rate Limits" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Docs() {
  const [activeSection, setActiveSection] = useState("quickstart");

  return (
    <div className="min-h-screen bg-base-200">

      {/* Top nav */}
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
            <span className="text-base-content/30">/</span>
            <span className="text-sm font-medium text-base-content">Developer Docs</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/register" className="btn btn-primary btn-sm">Get Started Free</Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex">

        {/* Left sidebar */}
        <aside className="w-60 shrink-0 py-8 pr-6 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto hidden lg:block">
          <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wider px-3 mb-3">On this page</p>
          <nav className="flex flex-col gap-0.5">
            {NAV.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setActiveSection(item.id)}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeSection === item.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-base-content/60 hover:text-base-content hover:bg-base-300/50"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="mt-8 mx-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
            <p className="text-xs font-semibold text-base-content mb-1">Need help?</p>
            <p className="text-xs text-base-content/60 mb-2">Open an issue or email support.</p>
            <a href="mailto:support@doc2endpoint.com" className="text-xs text-primary hover:underline">support@doc2endpoint.com</a>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 py-8 px-6 max-w-3xl">

          {/* Hero */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-base-content mb-3">API Reference</h1>
            <p className="text-lg text-base-content/60 leading-relaxed">
              Turn any spreadsheet, PDF, or document into a live REST API in under 60 seconds.
              This reference covers authentication, endpoints, filtering, and code examples.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-success/15 text-success">REST API</span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary">JSON responses</span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-warning/15 text-warning">API key auth</span>
            </div>
          </div>

          {/* ── Quick Start ── */}
          <Section id="quickstart" title="Quick Start">
            <p className="text-base-content/70 mb-4 leading-relaxed">
              Get from zero to a live API in three steps — no code required.
            </p>

            <div className="flex flex-col gap-4 mb-6">
              {[
                { n: "1", title: "Upload your document", desc: "Go to Datasets → New Dataset. Upload an Excel, CSV, PDF, Word doc, or image." },
                { n: "2", title: "Confirm the schema",   desc: "Chat with the AI agent to rename columns, hide sensitive fields, or adjust types. Click Confirm & Create API." },
                { n: "3", title: "Generate an API key",  desc: "Go to API Keys → Create Key. Copy your key and start querying." },
              ].map((step) => (
                <div key={step.n} className="flex gap-4 p-4 rounded-xl border border-base-300 bg-base-100">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center font-bold shrink-0">{step.n}</div>
                  <div>
                    <p className="font-semibold text-base-content">{step.title}</p>
                    <p className="text-sm text-base-content/60 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-sm text-base-content/60 mb-2">Your first API call:</p>
            <CodeBlock lang="bash" code={`curl -H "X-API-Key: d2e_your_key_here" \\
  "${API_BASE}/api/v1/your_table_name"`} />
          </Section>

          {/* ── Authentication ── */}
          <Section id="auth" title="Authentication">
            <p className="text-base-content/70 mb-4 leading-relaxed">
              All API requests require authentication via an API key. Keys are created in your dashboard
              under <strong>API Keys</strong>.
            </p>

            <SubSection title="Via HTTP Header (recommended)">
              <p className="text-sm text-base-content/60 mb-2">Pass your key in the <code className="bg-base-200 px-1 rounded text-xs">X-API-Key</code> header:</p>
              <CodeBlock lang="bash" code={`curl -H "X-API-Key: d2e_your_key_here" \\
  "${API_BASE}/api/v1/your_table_name"`} />
            </SubSection>

            <SubSection title="Via Query Parameter">
              <p className="text-sm text-base-content/60 mb-2">Append <code className="bg-base-200 px-1 rounded text-xs">?api_key=</code> to the URL (less secure — avoid in production):</p>
              <CodeBlock lang="bash" code={`curl "${API_BASE}/api/v1/your_table_name?api_key=d2e_your_key_here"`} />
            </SubSection>

            <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 text-sm text-base-content/70">
              <strong className="text-base-content">Security note:</strong> Treat API keys like passwords. Never commit them to version control. Use environment variables or a secrets manager.
            </div>
          </Section>

          {/* ── Endpoints ── */}
          <Section id="endpoints" title="Endpoints">
            <p className="text-base-content/70 mb-6">
              Each confirmed dataset gets three endpoints under <code className="bg-base-200 px-1 rounded text-sm">/api/v1/&#123;table&#125;</code>.
            </p>

            <SubSection title="List records">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-success/20 text-success font-mono">GET</span>
                <code className="text-sm font-mono text-base-content">/api/v1/&#123;table&#125;</code>
              </div>
              <p className="text-sm text-base-content/60 mb-3">Returns a paginated, filterable list of all records in the dataset.</p>
              <CodeBlock lang="bash" code={`curl -H "X-API-Key: d2e_your_key" \\
  "${API_BASE}/api/v1/ds_1_customers_abc12345?page=1&limit=50"`} />
            </SubSection>

            <SubSection title="Get single record">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-success/20 text-success font-mono">GET</span>
                <code className="text-sm font-mono text-base-content">/api/v1/&#123;table&#125;/&#123;id&#125;</code>
              </div>
              <p className="text-sm text-base-content/60 mb-3">Returns a single record by its <code className="bg-base-200 px-1 rounded text-xs">id</code>.</p>
              <CodeBlock lang="bash" code={`curl -H "X-API-Key: d2e_your_key" \\
  "${API_BASE}/api/v1/ds_1_customers_abc12345/42"`} />
            </SubSection>

            <SubSection title="Inspect schema">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-success/20 text-success font-mono">GET</span>
                <code className="text-sm font-mono text-base-content">/api/v1/&#123;table&#125;/schema</code>
              </div>
              <p className="text-sm text-base-content/60 mb-3">Returns column definitions, types, and row count for the dataset.</p>
              <CodeBlock lang="bash" code={`curl -H "X-API-Key: d2e_your_key" \\
  "${API_BASE}/api/v1/ds_1_customers_abc12345/schema"`} />
            </SubSection>
          </Section>

          {/* ── Filtering & Sorting ── */}
          <Section id="filtering" title="Filtering & Sorting">
            <p className="text-base-content/70 mb-6 leading-relaxed">
              All filters are passed as query parameters. Multiple filters are ANDed together.
            </p>

            <div className="rounded-xl border border-base-300 overflow-hidden mb-6">
              <div className="bg-base-200/60 px-4 py-2 border-b border-base-300">
                <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Available parameters</p>
              </div>
              <div className="divide-y divide-base-300 px-4">
                <Param name="page" type="integer">Page number, starting at 1. Default: <code className="bg-base-200 px-1 rounded text-xs">1</code></Param>
                <Param name="limit" type="integer">Records per page. Max <code className="bg-base-200 px-1 rounded text-xs">1000</code>. Default: <code className="bg-base-200 px-1 rounded text-xs">100</code></Param>
                <Param name="order_by" type="string">Column name to sort results by. Default: <code className="bg-base-200 px-1 rounded text-xs">id</code></Param>
                <Param name="order" type="string"><code className="bg-base-200 px-1 rounded text-xs">asc</code> or <code className="bg-base-200 px-1 rounded text-xs">desc</code>. Default: <code className="bg-base-200 px-1 rounded text-xs">asc</code></Param>
                <Param name="col=value" type="any">Exact match on column <code className="bg-base-200 px-1 rounded text-xs">col</code>. Works on all types.</Param>
                <Param name="col__like" type="string">Case-insensitive partial match. <code className="bg-base-200 px-1 rounded text-xs">?name__like=john</code> matches "John Smith", "Johnson", etc.</Param>
                <Param name="col__gte" type="number | date">Greater than or equal. Works on numeric and datetime columns.</Param>
                <Param name="col__lte" type="number | date">Less than or equal. Works on numeric and datetime columns.</Param>
              </div>
            </div>

            <SubSection title="Examples">
              <CodeBlock lang="bash" code={`# Exact match
curl -H "X-API-Key: KEY" "${API_BASE}/api/v1/TABLE?status=active"

# Partial match (ILIKE)
curl -H "X-API-Key: KEY" "${API_BASE}/api/v1/TABLE?name__like=smith"

# Range filter
curl -H "X-API-Key: KEY" "${API_BASE}/api/v1/TABLE?amount__gte=100&amount__lte=500"

# Combined filters + sort
curl -H "X-API-Key: KEY" \\
  "${API_BASE}/api/v1/TABLE?category=Electronics&order_by=price&order=desc&limit=25"`} />
            </SubSection>
          </Section>

          {/* ── Response Format ── */}
          <Section id="response" title="Response Format">
            <SubSection title="List endpoint">
              <p className="text-sm text-base-content/60 mb-3">All list responses follow this envelope:</p>
              <CodeBlock lang="json" code={`{
  "data": [
    { "id": 1, "name": "Acme Corp", "amount": 4200.00, "status": "paid" },
    { "id": 2, "name": "Globex",    "amount": 1850.50, "status": "pending" }
  ],
  "total": 120,
  "page": 1,
  "limit": 100,
  "pages": 2
}`} />
            </SubSection>

            <SubSection title="Single record endpoint">
              <CodeBlock lang="json" code={`{
  "data": {
    "id": 42,
    "name": "Acme Corp",
    "amount": 4200.00,
    "status": "paid",
    "created_at": "2024-03-15T10:30:00"
  }
}`} />
            </SubSection>

            <SubSection title="Schema endpoint">
              <CodeBlock lang="json" code={`{
  "dataset": "Customer Invoices",
  "table": "ds_1_customer_invoices_abc12345",
  "columns": [
    { "name": "name",       "type": "string",  "description": "Customer company name" },
    { "name": "amount",     "type": "number",  "description": "Invoice amount in USD" },
    { "name": "status",     "type": "string",  "description": "Payment status" },
    { "name": "created_at", "type": "datetime","description": "Invoice creation date" }
  ],
  "row_count": 120
}`} />
            </SubSection>
          </Section>

          {/* ── Error Codes ── */}
          <Section id="errors" title="Error Codes">
            <div className="rounded-xl border border-base-300 overflow-hidden">
              <table className="table w-full">
                <thead>
                  <tr className="bg-base-200">
                    <th className="text-xs font-semibold uppercase tracking-wide">Status</th>
                    <th className="text-xs font-semibold uppercase tracking-wide">Meaning</th>
                    <th className="text-xs font-semibold uppercase tracking-wide">Common cause</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["200", "OK",                    "Request succeeded"],
                    ["400", "Bad Request",           "Invalid filter value or parameter"],
                    ["401", "Unauthorized",          "Missing X-API-Key header or ?api_key= param"],
                    ["403", "Forbidden",             "Invalid, inactive, or wrong-dataset API key"],
                    ["404", "Not Found",             "Table doesn't exist or record ID not found"],
                    ["500", "Internal Server Error", "Query execution error — contact support"],
                  ].map(([code, status, cause]) => (
                    <tr key={code}>
                      <td><code className={`text-sm font-mono font-bold ${code.startsWith("2") ? "text-success" : code.startsWith("4") ? "text-warning" : "text-error"}`}>{code}</code></td>
                      <td className="text-sm font-medium text-base-content">{status}</td>
                      <td className="text-sm text-base-content/60">{cause}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-sm text-base-content/60 mt-4">All error responses include a <code className="bg-base-200 px-1 rounded text-xs">detail</code> field with a human-readable message:</p>
            <CodeBlock lang="json" code={`{ "detail": "Invalid or inactive API key." }`} />
          </Section>

          {/* ── Code Examples ── */}
          <Section id="examples" title="Code Examples">
            <SubSection title="JavaScript / fetch">
              <CodeBlock lang="javascript" code={`const API_KEY = process.env.DOC2ENDPOINT_KEY;
const TABLE   = "ds_1_invoices_abc12345";
const BASE    = "${API_BASE}";

async function listRecords(filters = {}) {
  const params = new URLSearchParams({ limit: 100, ...filters });
  const res = await fetch(\`\${BASE}/api/v1/\${TABLE}?\${params}\`, {
    headers: { "X-API-Key": API_KEY },
  });
  if (!res.ok) throw new Error(\`API error \${res.status}\`);
  return res.json();
}

// Usage
const { data, total } = await listRecords({ status: "paid", order_by: "amount", order: "desc" });
console.log(\`Found \${total} paid invoices\`);`} />
            </SubSection>

            <SubSection title="Python / requests">
              <CodeBlock lang="python" code={`import os, requests

API_KEY = os.environ["DOC2ENDPOINT_KEY"]
TABLE   = "ds_1_invoices_abc12345"
BASE    = "${API_BASE}"

def list_records(**filters):
    resp = requests.get(
        f"{BASE}/api/v1/{TABLE}",
        headers={"X-API-Key": API_KEY},
        params={"limit": 100, **filters},
    )
    resp.raise_for_status()
    return resp.json()

# Usage
result = list_records(status="paid", order_by="amount", order="desc")
print(f"Found {result['total']} paid invoices")
for row in result["data"]:
    print(row["name"], row["amount"])`} />
            </SubSection>

            <SubSection title="Python / fetch all pages">
              <CodeBlock lang="python" code={`import requests

def fetch_all(table, api_key, base="${API_BASE}", **filters):
    """Generator that yields every record across all pages."""
    page = 1
    while True:
        resp = requests.get(
            f"{base}/api/v1/{table}",
            headers={"X-API-Key": api_key},
            params={"page": page, "limit": 1000, **filters},
        )
        resp.raise_for_status()
        body = resp.json()
        yield from body["data"]
        if page >= body["pages"]:
            break
        page += 1

# Usage
for record in fetch_all("ds_1_invoices_abc12345", api_key="d2e_..."):
    print(record)`} />
            </SubSection>

            <SubSection title="curl">
              <CodeBlock lang="bash" code={`TABLE="ds_1_invoices_abc12345"
KEY="d2e_your_key_here"
BASE="${API_BASE}"

# List with filters
curl -s -H "X-API-Key: $KEY" \\
  "$BASE/api/v1/$TABLE?status=paid&order_by=amount&order=desc&limit=25" | jq .

# Get single record
curl -s -H "X-API-Key: $KEY" "$BASE/api/v1/$TABLE/42" | jq .

# Check schema
curl -s -H "X-API-Key: $KEY" "$BASE/api/v1/$TABLE/schema" | jq .columns`} />
            </SubSection>

            <SubSection title="Node.js / axios">
              <CodeBlock lang="javascript" code={`import axios from "axios";

const client = axios.create({
  baseURL: "${API_BASE}",
  headers: { "X-API-Key": process.env.DOC2ENDPOINT_KEY },
});

// List records with filtering
const { data } = await client.get("/api/v1/ds_1_invoices_abc12345", {
  params: { status: "paid", amount__gte: 1000, order_by: "created_at", order: "desc" },
});

console.log(data.data);   // array of records
console.log(data.total);  // total count across all pages`} />
            </SubSection>
          </Section>

          {/* ── Rate Limits ── */}
          <Section id="rate-limits" title="Rate Limits">
            <div className="rounded-xl border border-base-300 overflow-hidden mb-6">
              <table className="table w-full">
                <thead>
                  <tr className="bg-base-200">
                    <th className="text-xs font-semibold uppercase tracking-wide">Plan</th>
                    <th className="text-xs font-semibold uppercase tracking-wide">API calls / month</th>
                    <th className="text-xs font-semibold uppercase tracking-wide">Max rows / response</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Free",    "1,000",    "1,000"],
                    ["Premium", "50,000",   "1,000"],
                    ["Pro",     "Unlimited","1,000"],
                  ].map(([plan, calls, rows]) => (
                    <tr key={plan}>
                      <td className="font-medium text-base-content">{plan}</td>
                      <td className="text-base-content/70">{calls}</td>
                      <td className="text-base-content/70">{rows}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-sm text-base-content/60 leading-relaxed">
              Rate limits are counted per API key, per calendar month (UTC). Usage resets on the 1st of each month.
              Current usage is visible in your <Link to="/dashboard/analytics" className="text-primary hover:underline">Analytics dashboard</Link>.
              Exceeding the limit returns a <code className="bg-base-200 px-1 rounded text-xs">429 Too Many Requests</code> response.
            </p>
          </Section>

          {/* Footer */}
          <div className="border-t border-base-300 pt-8 mt-8 flex items-center justify-between text-sm text-base-content/50">
            <div className="flex gap-4">
              <Link to="/terms" className="hover:text-base-content">Terms</Link>
              <Link to="/privacy" className="hover:text-base-content">Privacy</Link>
              <a href="mailto:support@doc2endpoint.com" className="hover:text-base-content">support@doc2endpoint.com</a>
            </div>
            <p>Doc2Endpoint — v1.0</p>
          </div>
        </main>
      </div>
    </div>
  );
}

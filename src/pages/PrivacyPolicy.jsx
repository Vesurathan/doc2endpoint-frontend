import { Link } from "react-router-dom";

function Section({ title, children }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold text-base-content mb-3">{title}</h2>
      <div className="text-base-content/70 leading-relaxed flex flex-col gap-3">{children}</div>
    </section>
  );
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-base-200">
      {/* Nav */}
      <header className="bg-base-100 border-b border-base-300 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary-content" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-bold text-base-content">Doc2Endpoint</span>
          </Link>
          <Link to="/" className="text-sm text-base-content/60 hover:text-base-content">← Back to home</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-base-content mb-3">Privacy Policy</h1>
          <p className="text-base-content/50 text-sm">Last updated: May 13, 2026</p>
        </div>

        <div className="bg-base-100 rounded-2xl border border-base-300 p-8 lg:p-12">

          <Section title="1. Introduction">
            <p>
              Doc2Endpoint ("we," "our," or "us") is committed to protecting your personal information and your right to
              privacy. This Privacy Policy describes how we collect, use, and share information when you use our
              platform at doc2endpoint.com (the "Service").
            </p>
            <p>
              By using our Service, you agree to the collection and use of information in accordance with this policy.
              If you do not agree, please discontinue use of the Service.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <p><strong className="text-base-content">Account information:</strong> When you register, we collect your full name and email address. Passwords are stored as one-way cryptographic hashes and are never readable by our staff.</p>
            <p><strong className="text-base-content">Uploaded documents:</strong> Files you upload (Excel, CSV, PDF, Word, images) are processed to extract structured data. Uploaded files are stored temporarily during processing and deleted after extraction is complete.</p>
            <p><strong className="text-base-content">Dataset content:</strong> Extracted data is stored in isolated PostgreSQL tables associated with your account. This data is accessible only through your API keys.</p>
            <p><strong className="text-base-content">Usage data:</strong> We log API calls made to your generated endpoints, including request method, path, response status, and response time. No request body or response body content is logged.</p>
            <p><strong className="text-base-content">Technical data:</strong> Standard web server logs including IP addresses, browser type, and referring URLs may be collected for security and debugging purposes.</p>
          </Section>

          <Section title="3. How We Use Your Information">
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li>Provide, operate, and maintain the Service</li>
              <li>Process and extract data from your uploaded documents</li>
              <li>Generate and serve REST API endpoints from your datasets</li>
              <li>Monitor platform performance and usage analytics</li>
              <li>Send transactional emails (account confirmation, password reset)</li>
              <li>Detect and prevent fraud, abuse, and security incidents</li>
              <li>Comply with legal obligations</li>
            </ul>
            <p>We do not sell your personal data to third parties. We do not use your uploaded document content to train AI models.</p>
          </Section>

          <Section title="4. Data Storage and Security">
            <p>
              Your data is stored on servers located in the United States. We implement industry-standard security
              measures including TLS encryption in transit, encrypted storage for sensitive fields, and access
              controls limiting data access to authorized personnel only.
            </p>
            <p>
              API keys are stored as one-way hashes. In the event of a data breach, compromised API keys cannot be
              reversed to their original values.
            </p>
            <p>
              While we take reasonable precautions, no internet transmission or electronic storage is 100% secure.
              We cannot guarantee absolute security.
            </p>
          </Section>

          <Section title="5. Data Sharing and Disclosure">
            <p>We may share your information only in the following circumstances:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li><strong className="text-base-content">Service providers:</strong> Trusted third-party vendors who assist in operating the Service (e.g., cloud hosting, email delivery) under strict confidentiality agreements.</li>
              <li><strong className="text-base-content">Legal requirements:</strong> When required by law, court order, or governmental authority.</li>
              <li><strong className="text-base-content">Protection of rights:</strong> To prevent fraud, enforce our Terms, or protect the safety of our users or others.</li>
              <li><strong className="text-base-content">Business transfer:</strong> In connection with a merger, acquisition, or sale of assets, with prior notice to affected users.</li>
            </ul>
          </Section>

          <Section title="6. AI Processing">
            <p>
              Doc2Endpoint uses the Anthropic Claude API to assist with schema extraction and confirmation. Document
              content processed through the AI agent is subject to Anthropic's{" "}
              <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Privacy Policy
              </a>.
              We recommend not uploading documents containing sensitive personal data (e.g., social security numbers,
              payment card information, medical records).
            </p>
          </Section>

          <Section title="7. Data Retention">
            <p>
              We retain your account information for as long as your account is active. Extracted dataset tables are
              retained until you delete them or delete your account. API usage logs are retained for 90 days.
            </p>
            <p>
              Upon account deletion, all your personal data, datasets, and API keys are permanently removed within
              30 days, except where retention is required by law.
            </p>
          </Section>

          <Section title="8. Your Rights">
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate or incomplete data</li>
              <li>Request deletion of your data ("right to be forgotten")</li>
              <li>Export your data in a portable format</li>
              <li>Withdraw consent for data processing where consent is the legal basis</li>
              <li>Lodge a complaint with a data protection authority</li>
            </ul>
            <p>To exercise these rights, contact us at <a href="mailto:privacy@doc2endpoint.com" className="text-primary hover:underline">privacy@doc2endpoint.com</a>.</p>
          </Section>

          <Section title="9. Cookies">
            <p>
              Doc2Endpoint uses only essential cookies required for authentication (JWT tokens stored in localStorage).
              We do not use tracking, advertising, or analytics cookies. You can disable cookies in your browser
              settings, though this will prevent you from logging in.
            </p>
          </Section>

          <Section title="10. Children's Privacy">
            <p>
              The Service is not directed at children under 16. We do not knowingly collect personal information
              from children under 16. If you believe a child has provided us with their information, please contact
              us and we will delete it promptly.
            </p>
          </Section>

          <Section title="11. Changes to This Policy">
            <p>
              We may update this Privacy Policy periodically. We will notify you of significant changes via email or
              a prominent notice in the Service. Your continued use after the effective date constitutes acceptance
              of the updated policy.
            </p>
          </Section>

          <Section title="12. Contact Us">
            <p>
              For questions or concerns about this Privacy Policy, please contact:
            </p>
            <div className="bg-base-200 rounded-lg p-4 text-sm">
              <p className="font-semibold text-base-content">Doc2Endpoint Privacy Team</p>
              <p>Email: <a href="mailto:privacy@doc2endpoint.com" className="text-primary hover:underline">privacy@doc2endpoint.com</a></p>
              <p>Address: Doc2Endpoint, Inc., 123 Innovation Drive, San Francisco, CA 94105</p>
            </div>
          </Section>

        </div>

        {/* Footer links */}
        <div className="mt-8 flex items-center justify-center gap-6 text-sm text-base-content/50">
          <Link to="/terms" className="hover:text-base-content">Terms of Service</Link>
          <span>·</span>
          <Link to="/privacy" className="hover:text-base-content">Privacy Policy</Link>
          <span>·</span>
          <Link to="/" className="hover:text-base-content">Back to Doc2Endpoint</Link>
        </div>
      </main>
    </div>
  );
}

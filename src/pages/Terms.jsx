import { Link } from "react-router-dom";

function Section({ title, children }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold text-base-content mb-3">{title}</h2>
      <div className="text-base-content/70 leading-relaxed flex flex-col gap-3">{children}</div>
    </section>
  );
}

export default function Terms() {
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
          <h1 className="text-4xl font-bold text-base-content mb-3">Terms of Service</h1>
          <p className="text-base-content/50 text-sm">Last updated: May 13, 2026</p>
        </div>

        <div className="bg-base-100 rounded-2xl border border-base-300 p-8 lg:p-12">

          <Section title="1. Acceptance of Terms">
            <p>
              These Terms of Service ("Terms") govern your access to and use of Doc2Endpoint ("Service"), operated by
              Doc2Endpoint, Inc. ("Company," "we," "us," or "our"). By registering for or using the Service, you agree
              to be bound by these Terms.
            </p>
            <p>
              If you are using the Service on behalf of an organization, you represent that you have authority to
              bind that organization to these Terms, and "you" refers to that organization.
            </p>
            <p>
              If you do not agree to these Terms, do not use the Service.
            </p>
          </Section>

          <Section title="2. Description of Service">
            <p>
              Doc2Endpoint is a software-as-a-service platform that allows users to upload documents (Excel, CSV, PDF,
              Word documents, and images), extract structured data using AI-assisted schema detection, and expose
              that data through automatically generated REST API endpoints.
            </p>
            <p>
              The Service includes a web dashboard, API endpoint generation, API key management, and usage analytics.
              Features available to you depend on your subscription plan.
            </p>
          </Section>

          <Section title="3. Accounts and Registration">
            <p>
              You must provide accurate, current, and complete information during registration. You are responsible
              for maintaining the security of your password and for all activities that occur under your account.
            </p>
            <p>
              You must notify us immediately at <a href="mailto:support@doc2endpoint.com" className="text-primary hover:underline">support@doc2endpoint.com</a> if
              you suspect unauthorized access to your account. We are not liable for any loss resulting from
              unauthorized use of your account.
            </p>
            <p>
              You may not create accounts for the purpose of automated access or abuse, register on behalf of a
              competitor to benchmark our Service, or create multiple accounts to circumvent plan limits.
            </p>
          </Section>

          <Section title="4. Subscription Plans and Billing">
            <p>
              Doc2Endpoint offers the following subscription tiers:
            </p>
            <div className="bg-base-200 rounded-lg p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-base-content/50 text-left">
                    <th className="pb-2 font-medium">Plan</th>
                    <th className="pb-2 font-medium">Datasets</th>
                    <th className="pb-2 font-medium">API Calls/mo</th>
                    <th className="pb-2 font-medium">Price</th>
                  </tr>
                </thead>
                <tbody className="text-base-content/70">
                  <tr><td className="py-1">Free</td><td>2</td><td>1,000</td><td>$0</td></tr>
                  <tr><td className="py-1">Premium</td><td>20</td><td>50,000</td><td>$29/mo</td></tr>
                  <tr><td className="py-1">Pro</td><td>Unlimited</td><td>Unlimited</td><td>$99/mo</td></tr>
                </tbody>
              </table>
            </div>
            <p>
              All paid plans are billed monthly in advance. Prices are in USD and exclude applicable taxes.
              Subscriptions automatically renew unless cancelled before the renewal date.
            </p>
            <p>
              New accounts receive a 7-day free trial of the Premium plan. No credit card is required for the trial.
              After the trial period, accounts revert to the Free plan unless upgraded.
            </p>
            <p>
              Refunds are provided at our discretion. Requests must be submitted within 7 days of a charge to
              <a href="mailto:billing@doc2endpoint.com" className="text-primary hover:underline"> billing@doc2endpoint.com</a>.
            </p>
          </Section>

          <Section title="5. Acceptable Use">
            <p>You agree not to use the Service to:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li>Upload content that infringes intellectual property rights</li>
              <li>Upload, store, or transmit malware, viruses, or malicious code</li>
              <li>Process personal data without a lawful basis under applicable privacy law</li>
              <li>Attempt to gain unauthorized access to other users' data or system infrastructure</li>
              <li>Conduct denial-of-service attacks or excessive automated requests</li>
              <li>Reverse engineer, decompile, or extract source code from the Service</li>
              <li>Resell, sublicense, or white-label the Service without a written agreement</li>
              <li>Use the Service for any illegal purpose or in violation of any regulations</li>
            </ul>
            <p>
              We reserve the right to suspend or terminate accounts that violate these restrictions, without prior
              notice where necessary to protect the platform or other users.
            </p>
          </Section>

          <Section title="6. Your Data and Content">
            <p>
              You retain ownership of all documents you upload and data stored in your datasets. By using the
              Service, you grant Doc2Endpoint a limited, non-exclusive license to process your content solely to provide
              the Service to you.
            </p>
            <p>
              You are solely responsible for ensuring you have the right to upload and process any documents you
              submit to the Service. You must not upload documents containing third-party personal data without
              appropriate authorization.
            </p>
            <p>
              We do not use your content to train AI models or for purposes beyond providing the Service.
            </p>
          </Section>

          <Section title="7. Intellectual Property">
            <p>
              The Service, including its software, design, trademarks, and documentation, is owned by Doc2Endpoint, Inc.
              and protected by intellectual property laws. These Terms do not grant you any rights to our trademarks,
              trade names, or branding.
            </p>
            <p>
              Feedback, suggestions, or ideas you submit to us may be used by Doc2Endpoint without restriction or
              compensation to you.
            </p>
          </Section>

          <Section title="8. Availability and Service Levels">
            <p>
              We strive to maintain high availability but do not guarantee uninterrupted access to the Service.
              Scheduled maintenance, emergency downtime, and factors outside our control may affect availability.
            </p>
            <p>
              Pro plan subscribers benefit from a 99.5% monthly uptime SLA. If uptime falls below this threshold
              in a given month, you may request a pro-rated service credit by contacting support within 30 days.
            </p>
            <p>
              We reserve the right to modify, suspend, or discontinue any feature of the Service with reasonable
              advance notice.
            </p>
          </Section>

          <Section title="9. Limitation of Liability">
            <p>
              To the maximum extent permitted by applicable law, Doc2Endpoint shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages, including but not limited to loss of profits,
              data, goodwill, or business interruption, arising from your use of or inability to use the Service.
            </p>
            <p>
              Our total liability to you for any claims arising under these Terms shall not exceed the greater of
              (a) $100 USD or (b) the amount you paid us in the 3 months preceding the claim.
            </p>
          </Section>

          <Section title="10. Indemnification">
            <p>
              You agree to indemnify, defend, and hold harmless Doc2Endpoint, its officers, directors, employees, and
              agents from and against any claims, damages, losses, liabilities, and expenses (including reasonable
              legal fees) arising from: (i) your use of the Service; (ii) your violation of these Terms; (iii) your
              uploaded content; or (iv) your violation of any third-party rights.
            </p>
          </Section>

          <Section title="11. Termination">
            <p>
              You may terminate your account at any time from the Settings page. Upon termination, your access to
              the Service will cease and your data will be permanently deleted within 30 days.
            </p>
            <p>
              We may suspend or terminate your account immediately if you breach these Terms, fail to pay for a
              paid subscription, or if we are required to do so by law. We will provide reasonable notice where
              feasible.
            </p>
          </Section>

          <Section title="12. Governing Law">
            <p>
              These Terms are governed by and construed in accordance with the laws of the State of California,
              United States, without regard to its conflict of law provisions. Any disputes arising under these
              Terms shall be resolved in the state or federal courts located in San Francisco County, California.
            </p>
          </Section>

          <Section title="13. Changes to Terms">
            <p>
              We reserve the right to modify these Terms at any time. We will provide at least 14 days' notice
              of material changes via email or in-app notification. Your continued use of the Service after the
              effective date constitutes your acceptance of the revised Terms.
            </p>
          </Section>

          <Section title="14. Contact">
            <p>
              For questions about these Terms, contact us at:
            </p>
            <div className="bg-base-200 rounded-lg p-4 text-sm">
              <p className="font-semibold text-base-content">Doc2Endpoint Legal</p>
              <p>Email: <a href="mailto:legal@doc2endpoint.com" className="text-primary hover:underline">legal@doc2endpoint.com</a></p>
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

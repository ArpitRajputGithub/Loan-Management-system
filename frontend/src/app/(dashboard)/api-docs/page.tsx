'use client';

import Link from 'next/link';
import { useState } from 'react';

const CodeBlock = ({ code, language = 'json' }: { code: string; language?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 text-xs px-2 py-1 rounded bg-[var(--background)] text-[var(--foreground-muted)] hover:text-white"
      >
        {copied ? '✓ Copied' : 'Copy'}
      </button>
      <pre className="bg-[var(--background)] p-4 rounded-lg overflow-x-auto text-sm">
        <code className="text-[var(--accent-cream)]">{code}</code>
      </pre>
    </div>
  );
};

export default function ApiDocsPage() {
  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      {/* Header */}
      <div>
        <Link href="/" className="text-[var(--foreground-muted)] hover:text-white text-sm mb-2 inline-block">
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-white">Partner API Documentation</h1>
        <p className="text-[var(--foreground-muted)] mt-2">
          Integrate 1Fi loan services into your fintech application
        </p>
      </div>

      {/* Overview */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Overview</h2>
        <p className="text-[var(--foreground-muted)] mb-4">
          The 1Fi Partner API allows fintech platforms to create loan applications on behalf of their users.
          Applications created via the API go through the same approval workflow as platform applications.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[var(--background)] p-4 rounded-lg">
            <p className="text-sm text-[var(--foreground-muted)]">Base URL</p>
            <p className="text-white font-mono text-sm">https://api.1fi.in/api/v1</p>
          </div>
          <div className="bg-[var(--background)] p-4 rounded-lg">
            <p className="text-sm text-[var(--foreground-muted)]">Authentication</p>
            <p className="text-white font-mono text-sm">API Key (Header)</p>
          </div>
          <div className="bg-[var(--background)] p-4 rounded-lg">
            <p className="text-sm text-[var(--foreground-muted)]">Format</p>
            <p className="text-white font-mono text-sm">JSON</p>
          </div>
        </div>
      </div>

      {/* Authentication */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Authentication</h2>
        <p className="text-[var(--foreground-muted)] mb-4">
          All Partner API requests must include your API key in the request header:
        </p>
        <CodeBlock
          language="bash"
          code={`X-API-KEY: your_partner_api_key_here`}
        />
        <div className="mt-4 p-4 bg-[var(--accent-cream)]/10 border border-[var(--accent-cream)]/30 rounded-lg">
          <p className="text-[var(--accent-cream)] text-sm">
            <strong>⚠️ Security:</strong> Keep your API key confidential. Never expose it in client-side code.
          </p>
        </div>
      </div>

      {/* Endpoints */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Endpoints</h2>

        {/* Create Application */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2 py-1 bg-[var(--accent-green)]/20 text-[var(--accent-green)] text-xs font-bold rounded">
              POST
            </span>
            <code className="text-white font-mono">/partner/applications</code>
          </div>
          <p className="text-[var(--foreground-muted)] mb-4">
            Create a new loan application for a user.
          </p>

          <h4 className="text-white font-medium mb-2">Request Body</h4>
          <CodeBlock
            code={`{
  "userId": "uuid-of-existing-user",
  "loanProductId": "uuid-of-loan-product",
  "requestedAmount": 100000,
  "selectedTenure": 12,
  "productId": "uuid-of-product (optional)"
}`}
          />

          <h4 className="text-white font-medium mb-2 mt-4">Response (201 Created)</h4>
          <CodeBlock
            code={`{
  "success": true,
  "message": "Application created via partner API",
  "data": {
    "id": "uuid",
    "applicationNumber": "LA-2024-00001",
    "status": "DRAFT",
    "requestedAmount": 100000,
    "selectedTenure": 12,
    "createdVia": "PARTNER_API",
    "createdAt": "2024-12-25T10:00:00Z"
  }
}`}
          />
        </div>

        {/* Get Application */}
        <div className="border-t border-[var(--border)] pt-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded">
              GET
            </span>
            <code className="text-white font-mono">/partner/applications/:id</code>
          </div>
          <p className="text-[var(--foreground-muted)] mb-4">
            Get the status and details of a loan application.
          </p>

          <h4 className="text-white font-medium mb-2">Response (200 OK)</h4>
          <CodeBlock
            code={`{
  "success": true,
  "data": {
    "id": "uuid",
    "applicationNumber": "LA-2024-00001",
    "status": "APPROVED",
    "requestedAmount": 100000,
    "approvedAmount": 100000,
    "selectedTenure": 12,
    "user": {
      "id": "uuid",
      "name": "Rahul Sharma",
      "email": "rahul@example.com"
    },
    "loanProduct": {
      "id": "uuid",
      "name": "LAMF Standard",
      "interestRate": 10.5
    },
    "createdAt": "2024-12-25T10:00:00Z",
    "updatedAt": "2024-12-25T11:00:00Z"
  }
}`}
          />
        </div>
      </div>

      {/* Application Status Flow */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Application Status Flow</h2>
        <p className="text-[var(--foreground-muted)] mb-4">
          Applications progress through these states:
        </p>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="px-3 py-1 rounded-full bg-gray-500/20 text-gray-400">DRAFT</span>
          <span className="text-[var(--foreground-muted)]">→</span>
          <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400">SUBMITTED</span>
          <span className="text-[var(--foreground-muted)]">→</span>
          <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400">UNDER_REVIEW</span>
          <span className="text-[var(--foreground-muted)]">→</span>
          <span className="px-3 py-1 rounded-full bg-[var(--accent-green)]/20 text-[var(--accent-green)]">APPROVED</span>
          <span className="text-[var(--foreground-muted)]">→</span>
          <span className="px-3 py-1 rounded-full bg-[var(--accent-green)]/30 text-[var(--accent-green)]">DISBURSED</span>
        </div>
        <div className="mt-3">
          <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm">REJECTED</span>
          <span className="text-[var(--foreground-muted)] text-sm ml-2">← Can occur from SUBMITTED or UNDER_REVIEW</span>
        </div>
      </div>

      {/* Error Codes */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Error Codes</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-3 text-[var(--foreground-muted)]">Code</th>
                <th className="text-left py-3 text-[var(--foreground-muted)]">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[var(--border)]">
                <td className="py-3"><code className="text-red-400">400</code></td>
                <td className="py-3 text-[var(--foreground-muted)]">Invalid request body or parameters</td>
              </tr>
              <tr className="border-b border-[var(--border)]">
                <td className="py-3"><code className="text-red-400">401</code></td>
                <td className="py-3 text-[var(--foreground-muted)]">Missing or invalid API key</td>
              </tr>
              <tr className="border-b border-[var(--border)]">
                <td className="py-3"><code className="text-red-400">403</code></td>
                <td className="py-3 text-[var(--foreground-muted)]">Partner account is blocked</td>
              </tr>
              <tr className="border-b border-[var(--border)]">
                <td className="py-3"><code className="text-red-400">404</code></td>
                <td className="py-3 text-[var(--foreground-muted)]">Application not found</td>
              </tr>
              <tr>
                <td className="py-3"><code className="text-red-400">500</code></td>
                <td className="py-3 text-[var(--foreground-muted)]">Internal server error</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Example Integration */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Example Integration</h2>
        <p className="text-[var(--foreground-muted)] mb-4">Node.js example:</p>
        <CodeBlock
          language="javascript"
          code={`const axios = require('axios');

const API_KEY = process.env.ONEFI_API_KEY;
const BASE_URL = 'https://api.1fi.in/api/v1';

async function createApplication(data) {
  const response = await axios.post(
    \`\${BASE_URL}/partner/applications\`,
    data,
    {
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': API_KEY
      }
    }
  );
  return response.data;
}

// Usage
const application = await createApplication({
  userId: 'user-uuid',
  loanProductId: 'product-uuid',
  requestedAmount: 100000,
  selectedTenure: 12
});

console.log(application.data.applicationNumber);`}
        />
      </div>

      {/* Contact */}
      <div className="card p-6 border-[var(--primary)]/30">
        <h2 className="text-xl font-semibold text-white mb-2">Need Help?</h2>
        <p className="text-[var(--foreground-muted)]">
          Contact our integration team at{' '}
          <a href="mailto:partners@1fi.in" className="text-[var(--accent-green)] hover:underline">
            partners@1fi.in
          </a>
        </p>
      </div>
    </div>
  );
}

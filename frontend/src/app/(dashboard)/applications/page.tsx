'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface Application {
  id: string;
  applicationNumber: string;
  requestedAmount: number;
  approvedAmount: number | null;
  selectedTenure: number;
  status: string;
  createdAt: string;
  user?: { name: string; email: string };
  loanProduct?: { name: string };
}

const statusColors: Record<string, string> = {
  DRAFT: 'badge-warning',
  SUBMITTED: 'badge-info',
  UNDER_REVIEW: 'badge-info',
  APPROVED: 'badge-success',
  REJECTED: 'badge-error',
  DISBURSED: 'badge-success',
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadApplications();
  }, [filter]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const res = await api.getLoanApplications(filter ? { status: filter } : undefined);
      if (res.success && res.data) {
        setApplications(res.data);
      }
    } catch {
      console.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">Loan Applications</h1>
          <p className="text-[var(--foreground-muted)] mt-1 text-sm sm:text-base">Manage all loan applications</p>
        </div>
        <Link href="/applications/new" className="btn-primary w-full sm:w-auto text-center">
          + New Application
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {['', 'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'DISBURSED', 'REJECTED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              filter === status
                ? 'bg-[var(--primary)] text-white'
                : 'bg-[var(--background-card)] text-[var(--foreground-muted)] hover:text-white'
            }`}
          >
            {status || 'All'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card p-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="spinner" />
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--background)] flex items-center justify-center">
              <svg className="w-8 h-8 text-[var(--foreground-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No applications found</h3>
            <p className="text-[var(--foreground-muted)] mb-4">Start by checking your eligibility</p>
            <Link href="/eligibility" className="btn-primary">
              Check Eligibility
            </Link>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
            <thead>
              <tr>
                <th>Application ID</th>
                <th>Applicant</th>
                <th>Product</th>
                <th>Amount</th>
                <th>Tenure</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id}>
                  <td className="font-mono text-sm">{app.applicationNumber}</td>
                  <td>{app.user?.name || 'N/A'}</td>
                  <td>{app.loanProduct?.name || 'N/A'}</td>
                  <td className="font-semibold">{formatCurrency(app.requestedAmount)}</td>
                  <td>{app.selectedTenure} months</td>
                  <td>
                    <span className={`badge ${statusColors[app.status] || 'badge-info'}`}>
                      {app.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="text-[var(--foreground-muted)]">{formatDate(app.createdAt)}</td>
                  <td>
                    <Link href={`/applications/${app.id}`} className="text-[var(--primary)] hover:underline text-sm">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

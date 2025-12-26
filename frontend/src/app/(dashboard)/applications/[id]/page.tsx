'use client';

import { useEffect, useState, use } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Application {
  id: string;
  applicationNumber: string;
  requestedAmount: number;
  approvedAmount: number | null;
  selectedTenure: number;
  status: string;
  rejectionReason: string | null;
  createdVia: string;
  createdAt: string;
  updatedAt: string;
  user?: { name: string; email: string; phone: string; pan: string };
  loanProduct?: { name: string; interestRate: string };
  product?: { name: string; price: number };
  collaterals?: { fundName: string; fundType: string; units: number; nav: number; currentValue: number; lienStatus: string }[];
}

const statusColors: Record<string, string> = {
  DRAFT: 'badge-warning',
  SUBMITTED: 'badge-info',
  UNDER_REVIEW: 'badge-info',
  APPROVED: 'badge-success',
  REJECTED: 'badge-error',
  DISBURSED: 'badge-success',
};

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvedAmount, setApprovedAmount] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadApplication();
    checkUserRole();
  }, [id]);

  const checkUserRole = async () => {
    try {
      const res = await api.getCurrentUser();
      if (res.success && res.data?.role === 'ADMIN') {
        setIsAdmin(true);
      }
    } catch {
      // Not admin
    }
  };

  const loadApplication = async () => {
    try {
      const res = await api.getLoanApplication(id);
      if (res.success && res.data) {
        setApplication(res.data);
        setApprovedAmount(res.data.requestedAmount.toString());
      } else {
        setError(res.error || 'Application not found');
      }
    } catch {
      setError('Failed to load application');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setActionLoading(true);
    const res = await api.submitApplication(id);
    if (res.success) {
      loadApplication();
    } else {
      alert(res.error || 'Failed to submit');
    }
    setActionLoading(false);
  };

  const handleApprove = async () => {
    setActionLoading(true);
    const res = await api.approveApplication(id, parseInt(approvedAmount));
    if (res.success) {
      setShowApproveModal(false);
      loadApplication();
    } else {
      alert(res.error || 'Failed to approve');
    }
    setActionLoading(false);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    setActionLoading(true);
    const res = await api.rejectApplication(id, rejectionReason);
    if (res.success) {
      setShowRejectModal(false);
      loadApplication();
    } else {
      alert(res.error || 'Failed to reject');
    }
    setActionLoading(false);
  };

  const handleDisburse = async () => {
    if (!confirm('Are you sure you want to disburse this loan?')) return;
    setActionLoading(true);
    const res = await api.disburseApplication(id);
    if (res.success) {
      router.push('/loans');
    } else {
      alert(res.error || 'Failed to disburse');
    }
    setActionLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner" />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">{error || 'Application not found'}</p>
        <Link href="/applications" className="btn-secondary">
          Back to Applications
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Link href="/applications" className="text-[var(--foreground-muted)] hover:text-white text-sm mb-2 inline-block">
            ← Back to Applications
          </Link>
          <h1 className="text-3xl font-bold text-white">{application.applicationNumber}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={`badge ${statusColors[application.status] || 'badge-info'}`}>
              {application.status.replace('_', ' ')}
            </span>
            <span className="text-[var(--foreground-muted)]">via {application.createdVia}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {application.status === 'DRAFT' && (
            <button onClick={handleSubmit} disabled={actionLoading} className="btn-primary">
              {actionLoading ? 'Submitting...' : 'Submit for Review'}
            </button>
          )}
          {(application.status === 'SUBMITTED' || application.status === 'UNDER_REVIEW') && isAdmin && (
            <>
              <button onClick={() => setShowApproveModal(true)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
                Approve
              </button>
              <button onClick={() => setShowRejectModal(true)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">
                Reject
              </button>
            </>
          )}
          {application.status === 'APPROVED' && isAdmin && (
            <button onClick={handleDisburse} disabled={actionLoading} className="btn-primary">
              {actionLoading ? 'Disbursing...' : 'Disburse Loan'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Loan Details */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Loan Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">Requested Amount</p>
                <p className="text-lg font-semibold text-white">{formatCurrency(application.requestedAmount)}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">Approved Amount</p>
                <p className="text-lg font-semibold text-white">
                  {application.approvedAmount ? formatCurrency(application.approvedAmount) : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">Tenure</p>
                <p className="text-lg font-semibold text-white">{application.selectedTenure} months</p>
              </div>
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">Loan Product</p>
                <p className="text-lg font-semibold text-white">{application.loanProduct?.name || '-'}</p>
              </div>
              {application.loanProduct?.interestRate && (
                <div>
                  <p className="text-sm text-[var(--foreground-muted)]">Interest Rate</p>
                  <p className="text-lg font-semibold text-white">{application.loanProduct.interestRate}%</p>
                </div>
              )}
            </div>
            
            {application.rejectionReason && (
              <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400 font-medium">Rejection Reason</p>
                <p className="text-white">{application.rejectionReason}</p>
              </div>
            )}
          </div>

          {/* Collaterals */}
          {application.collaterals && application.collaterals.length > 0 && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Collaterals</h2>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Fund Name</th>
                    <th>Type</th>
                    <th>Units</th>
                    <th>NAV</th>
                    <th>Value</th>
                    <th>Lien Status</th>
                  </tr>
                </thead>
                <tbody>
                  {application.collaterals.map((col, i) => (
                    <tr key={i}>
                      <td className="font-medium">{col.fundName}</td>
                      <td>
                        <span className={`badge ${col.fundType === 'EQUITY' ? 'badge-info' : col.fundType === 'DEBT' ? 'badge-success' : 'badge-warning'}`}>
                          {col.fundType}
                        </span>
                      </td>
                      <td>{col.units}</td>
                      <td>₹{col.nav}</td>
                      <td className="font-semibold">{formatCurrency(col.currentValue)}</td>
                      <td>
                        <span className={`badge ${col.lienStatus === 'MARKED' ? 'badge-success' : 'badge-warning'}`}>
                          {col.lienStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Applicant */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Applicant</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">Name</p>
                <p className="text-white font-medium">{application.user?.name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">Email</p>
                <p className="text-white">{application.user?.email || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">Phone</p>
                <p className="text-white">{application.user?.phone || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">PAN</p>
                <p className="text-white font-mono">{application.user?.pan || '-'}</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Timeline</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">Created</p>
                <p className="text-white">{formatDate(application.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">Last Updated</p>
                <p className="text-white">{formatDate(application.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Product (if shopping) */}
          {application.product && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Product</h2>
              <p className="text-white font-medium">{application.product.name}</p>
              <p className="text-[var(--accent-green)] font-semibold mt-1">
                {formatCurrency(application.product.price)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-white mb-4">Approve Application</h2>
            <div>
              <label className="block text-sm text-[var(--foreground-muted)] mb-1">Approved Amount (₹)</label>
              <input
                type="number"
                value={approvedAmount}
                onChange={(e) => setApprovedAmount(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowApproveModal(false)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button onClick={handleApprove} disabled={actionLoading} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex-1">
                {actionLoading ? 'Approving...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-white mb-4">Reject Application</h2>
            <div>
              <label className="block text-sm text-[var(--foreground-muted)] mb-1">Rejection Reason</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="input-field"
                rows={3}
                placeholder="Enter reason for rejection..."
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowRejectModal(false)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button onClick={handleReject} disabled={actionLoading} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex-1">
                {actionLoading ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

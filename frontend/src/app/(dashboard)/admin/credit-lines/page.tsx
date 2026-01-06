'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface CreditLine {
  id: string;
  creditLineNumber: string;
  sanctionedLimit: number;
  utilizedAmount: number;
  availableLimit: number;
  interestRate: number;
  accruedInterest: number;
  totalCollateralValue: number;
  currentLtv: number | null;
  status: string;
  activatedAt: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    pan: string;
  };
  collaterals: any[];
  tranches: any[];
}

export default function AdminCreditLinesPage() {
  const [creditLines, setCreditLines] = useState<CreditLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCreditLine, setSelectedCreditLine] = useState<CreditLine | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchCreditLines();
  }, [statusFilter]);

  const fetchCreditLines = async () => {
    setLoading(true);
    try {
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const res = await api.get(`/credit-lines${params}`);
      if (res.success) {
        setCreditLines(res.data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (id: string) => {
    if (!confirm('Are you sure you want to activate this credit line? This will mark liens on collaterals.')) return;
    setProcessing(true);
    try {
      const res = await api.activateCreditLine(id);
      if (res.success) {
        fetchCreditLines();
        setSelectedCreditLine(null);
      } else {
        alert(res.error || 'Failed to activate');
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleFreeze = async (id: string) => {
    if (!confirm('Are you sure you want to freeze this credit line?')) return;
    setProcessing(true);
    try {
      const res = await api.post(`/credit-lines/${id}/freeze`, { reason: 'Admin action' });
      if (res.success) {
        fetchCreditLines();
        setSelectedCreditLine(null);
      } else {
        alert(res.error || 'Failed to freeze');
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleUnfreeze = async (id: string) => {
    setProcessing(true);
    try {
      const res = await api.post(`/credit-lines/${id}/unfreeze`, {});
      if (res.success) {
        fetchCreditLines();
        setSelectedCreditLine(null);
      } else {
        alert(res.error || 'Failed to unfreeze');
      }
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500/20 text-green-400';
      case 'PENDING': return 'bg-yellow-500/20 text-yellow-400';
      case 'FROZEN': return 'bg-blue-500/20 text-blue-400';
      case 'CLOSED': return 'bg-gray-500/20 text-gray-400';
      case 'DEFAULTED': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const statusCounts = {
    all: creditLines.length,
    PENDING: creditLines.filter(c => c.status === 'PENDING').length,
    ACTIVE: creditLines.filter(c => c.status === 'ACTIVE').length,
    FROZEN: creditLines.filter(c => c.status === 'FROZEN').length,
  };

  if (loading && creditLines.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Credit Lines Management</h1>
          <p className="text-[var(--foreground-muted)]">Review and manage customer credit lines</p>
        </div>
      </div>

      {/* Status Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {['all', 'PENDING', 'ACTIVE', 'FROZEN'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === status
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--background-card)] text-[var(--foreground-muted)] hover:bg-[var(--background-secondary)]'
            }`}
          >
            {status === 'all' ? 'All' : status}
            <span className="ml-2 px-2 py-0.5 rounded-full bg-white/10 text-xs">
              {statusCounts[status as keyof typeof statusCounts] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-[var(--foreground-muted)] text-sm">Total Credit Lines</p>
          <p className="text-2xl font-bold text-[var(--foreground)]">{creditLines.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-[var(--foreground-muted)] text-sm">Total Sanctioned</p>
          <p className="text-2xl font-bold text-[var(--foreground)]">
            {formatCurrency(creditLines.reduce((sum, c) => sum + c.sanctionedLimit, 0))}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-[var(--foreground-muted)] text-sm">Total Utilized</p>
          <p className="text-2xl font-bold text-orange-400">
            {formatCurrency(creditLines.reduce((sum, c) => sum + c.utilizedAmount, 0))}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-[var(--foreground-muted)] text-sm">Total Accrued Interest</p>
          <p className="text-2xl font-bold text-red-400">
            {formatCurrency(creditLines.reduce((sum, c) => sum + c.accruedInterest, 0))}
          </p>
        </div>
      </div>

      {/* Credit Lines Table */}
      <div className="card p-5">
        {creditLines.length === 0 ? (
          <p className="text-[var(--foreground-muted)] text-center py-8">No credit lines found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left py-3 px-2">Credit Line #</th>
                  <th className="text-left py-3 px-2">Customer</th>
                  <th className="text-right py-3 px-2">Sanctioned</th>
                  <th className="text-right py-3 px-2">Utilized</th>
                  <th className="text-right py-3 px-2">Collateral</th>
                  <th className="text-center py-3 px-2">LTV</th>
                  <th className="text-center py-3 px-2">Status</th>
                  <th className="text-center py-3 px-2">Created</th>
                  <th className="text-center py-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {creditLines.map((cl) => (
                  <tr key={cl.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--background-secondary)]">
                    <td className="py-3 px-2 font-mono text-sm">{cl.creditLineNumber}</td>
                    <td className="py-3 px-2">
                      <div>
                        <p className="font-medium">{cl.user?.name || 'N/A'}</p>
                        <p className="text-xs text-[var(--foreground-muted)]">{cl.user?.email || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right font-medium">{formatCurrency(cl.sanctionedLimit)}</td>
                    <td className="py-3 px-2 text-right text-orange-400">{formatCurrency(cl.utilizedAmount)}</td>
                    <td className="py-3 px-2 text-right">{formatCurrency(cl.totalCollateralValue)}</td>
                    <td className="py-3 px-2 text-center">
                      {cl.currentLtv ? `${(Number(cl.currentLtv) * 100).toFixed(1)}%` : '-'}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(cl.status)}`}>
                        {cl.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center text-[var(--foreground-muted)]">{formatDate(cl.createdAt)}</td>
                    <td className="py-3 px-2 text-center">
                      <button
                        onClick={() => setSelectedCreditLine(cl)}
                        className="text-[var(--accent)] hover:underline text-sm"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedCreditLine && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">{selectedCreditLine.creditLineNumber}</h3>
              <button
                onClick={() => setSelectedCreditLine(null)}
                className="text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              >
                ✕
              </button>
            </div>

            {/* Customer Info */}
            <div className="p-4 bg-[var(--background-secondary)] rounded-lg mb-4">
              <h4 className="font-medium mb-2">Customer Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[var(--foreground-muted)]">Name:</span>{' '}
                  <span className="font-medium">{selectedCreditLine.user?.name}</span>
                </div>
                <div>
                  <span className="text-[var(--foreground-muted)]">Email:</span>{' '}
                  <span className="font-medium">{selectedCreditLine.user?.email}</span>
                </div>
                <div>
                  <span className="text-[var(--foreground-muted)]">PAN:</span>{' '}
                  <span className="font-medium">{selectedCreditLine.user?.pan || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[var(--foreground-muted)]">Status:</span>{' '}
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(selectedCreditLine.status)}`}>
                    {selectedCreditLine.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-[var(--background)] rounded-lg">
                <p className="text-xs text-[var(--foreground-muted)]">Sanctioned</p>
                <p className="font-bold">{formatCurrency(selectedCreditLine.sanctionedLimit)}</p>
              </div>
              <div className="text-center p-3 bg-[var(--background)] rounded-lg">
                <p className="text-xs text-[var(--foreground-muted)]">Utilized</p>
                <p className="font-bold text-orange-400">{formatCurrency(selectedCreditLine.utilizedAmount)}</p>
              </div>
              <div className="text-center p-3 bg-[var(--background)] rounded-lg">
                <p className="text-xs text-[var(--foreground-muted)]">Collateral</p>
                <p className="font-bold">{formatCurrency(selectedCreditLine.totalCollateralValue)}</p>
              </div>
              <div className="text-center p-3 bg-[var(--background)] rounded-lg">
                <p className="text-xs text-[var(--foreground-muted)]">Accrued Int.</p>
                <p className="font-bold text-red-400">{formatCurrency(selectedCreditLine.accruedInterest)}</p>
              </div>
            </div>

            {/* Collaterals */}
            <div className="mb-4">
              <h4 className="font-medium mb-2">Collaterals ({selectedCreditLine.collaterals?.length || 0})</h4>
              {selectedCreditLine.collaterals?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border)]">
                        <th className="text-left py-2 px-2">Fund</th>
                        <th className="text-right py-2 px-2">Value</th>
                        <th className="text-center py-2 px-2">Lien</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCreditLine.collaterals.map((col: any) => (
                        <tr key={col.id} className="border-b border-[var(--border)] last:border-0">
                          <td className="py-2 px-2">{col.fundName}</td>
                          <td className="py-2 px-2 text-right">{formatCurrency(col.currentValue)}</td>
                          <td className="py-2 px-2 text-center">
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              col.lienStatus === 'MARKED' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {col.lienStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-[var(--foreground-muted)] text-sm">No collaterals pledged yet</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-[var(--border)]">
              {selectedCreditLine.status === 'PENDING' && (
                <button
                  onClick={() => handleActivate(selectedCreditLine.id)}
                  disabled={processing || selectedCreditLine.collaterals?.length === 0}
                  className="btn-primary"
                >
                  {processing ? 'Processing...' : 'Activate Credit Line'}
                </button>
              )}
              {selectedCreditLine.status === 'ACTIVE' && (
                <button
                  onClick={() => handleFreeze(selectedCreditLine.id)}
                  disabled={processing}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  Freeze Credit Line
                </button>
              )}
              {selectedCreditLine.status === 'FROZEN' && (
                <button
                  onClick={() => handleUnfreeze(selectedCreditLine.id)}
                  disabled={processing}
                  className="btn-primary"
                >
                  Unfreeze Credit Line
                </button>
              )}
              <Link
                href={`/credit-line?id=${selectedCreditLine.id}`}
                className="btn-secondary"
              >
                View Full Details
              </Link>
              <button onClick={() => setSelectedCreditLine(null)} className="btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

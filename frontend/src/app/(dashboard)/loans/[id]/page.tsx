'use client';

import { useEffect, useState, use } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface Loan {
  id: string;
  loanNumber: string;
  principal: number;
  interestRate: string;
  tenureMonths: number;
  emiAmount: number;
  outstandingPrincipal: number;
  outstandingInterest: number;
  status: string;
  disbursedAt: string;
  closedAt: string | null;
  nextEmiDate: string | null;
  totalCollateralValue?: number;
  ltvStatus?: { currentLtv: number; status: string };
  loanApplication?: {
    applicationNumber: string;
    user?: { name: string; email: string; phone: string };
  };
  collaterals?: { fundName: string; fundType: string; currentValue: number; lienStatus: string }[];
  transactions?: { type: string; amount: number; createdAt: string; reference: string }[];
}

const getLtvColor = (status: string) => {
  switch (status) {
    case 'CRITICAL': return 'text-red-400';
    case 'WARNING': return 'text-yellow-400';
    default: return 'text-[var(--accent-green)]';
  }
};

export default function LoanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [loan, setLoan] = useState<Loan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showPrepayModal, setShowPrepayModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');

  useEffect(() => {
    loadLoan();
  }, [id]);

  const loadLoan = async () => {
    try {
      const res = await api.getLoan(id);
      if (res.success && res.data) {
        setLoan(res.data);
        setPayAmount(res.data.emiAmount?.toString() || '');
      } else {
        setError(res.error || 'Loan not found');
      }
    } catch {
      setError('Failed to load loan');
    } finally {
      setLoading(false);
    }
  };

  const handlePayEmi = async () => {
    setActionLoading(true);
    const res = await api.payEmi(id, parseInt(payAmount));
    if (res.success) {
      setShowPayModal(false);
      loadLoan();
    } else {
      alert(res.error || 'Failed to record payment');
    }
    setActionLoading(false);
  };

  const handlePrepay = async () => {
    setActionLoading(true);
    const res = await api.prepayLoan(id, parseInt(payAmount));
    if (res.success) {
      setShowPrepayModal(false);
      loadLoan();
    } else {
      alert(res.error || 'Failed to record prepayment');
    }
    setActionLoading(false);
  };

  const handleClose = async () => {
    if (!confirm('Are you sure you want to close this loan?')) return;
    setActionLoading(true);
    const res = await api.closeLoan(id);
    if (res.success) {
      loadLoan();
    } else {
      alert(res.error || 'Failed to close loan');
    }
    setActionLoading(false);
  };

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="spinner" /></div>;
  }

  if (error || !loan) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">{error || 'Loan not found'}</p>
        <Link href="/loans" className="btn-secondary">Back to Loans</Link>
      </div>
    );
  }

  const totalOutstanding = loan.outstandingPrincipal + loan.outstandingInterest;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Link href="/loans" className="text-[var(--foreground-muted)] hover:text-white text-sm mb-2 inline-block">
            ← Back to Loans
          </Link>
          <h1 className="text-3xl font-bold text-white">{loan.loanNumber}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={`badge ${loan.status === 'ACTIVE' ? 'badge-success' : loan.status === 'CLOSED' ? 'badge-info' : 'badge-error'}`}>
              {loan.status}
            </span>
            <span className="text-[var(--foreground-muted)]">Disbursed: {formatDate(loan.disbursedAt)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        {loan.status === 'ACTIVE' && (
          <div className="flex gap-2">
            <button onClick={() => { setPayAmount(loan.emiAmount.toString()); setShowPayModal(true); }} className="btn-primary">
              Pay EMI
            </button>
            <button onClick={() => { setPayAmount(''); setShowPrepayModal(true); }} className="btn-secondary">
              Prepay
            </button>
            <button onClick={handleClose} disabled={actionLoading} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">
              Close Loan
            </button>
          </div>
        )}
      </div>

      {/* LTV Alert Banner */}
      {loan.ltvStatus?.status === 'CRITICAL' && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-red-400">🚨 Critical LTV Breach!</h3>
            <p className="text-sm text-red-300/80">
              Current LTV: <strong>{((loan.ltvStatus.currentLtv) * 100).toFixed(1)}%</strong> — 
              Collateral value has dropped significantly. Immediate action required. 
              Consider requesting additional collateral or partial repayment.
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-red-400">{((loan.ltvStatus.currentLtv) * 100).toFixed(0)}%</p>
            <p className="text-xs text-red-300">LTV Ratio</p>
          </div>
        </div>
      )}

      {loan.ltvStatus?.status === 'WARNING' && (
        <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-400">⚠️ LTV Warning</h3>
            <p className="text-sm text-yellow-300/80">
              Current LTV: <strong>{((loan.ltvStatus.currentLtv) * 100).toFixed(1)}%</strong> — 
              Approaching threshold. Monitor collateral value closely.
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-yellow-400">{((loan.ltvStatus.currentLtv) * 100).toFixed(0)}%</p>
            <p className="text-xs text-yellow-300">LTV Ratio</p>
          </div>
        </div>
      )}

      {loan.ltvStatus?.status === 'SAFE' && (
        <div className="p-3 rounded-xl bg-[var(--accent-green)]/10 border border-[var(--accent-green)]/30 flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-[var(--accent-green)]/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-[var(--accent-green)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm text-[var(--accent-green)]">
            LTV Healthy: <strong>{((loan.ltvStatus.currentLtv) * 100).toFixed(1)}%</strong> — Collateral coverage is adequate.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Loan Summary */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Loan Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">Principal</p>
                <p className="text-lg font-semibold text-white">{formatCurrency(loan.principal)}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">Interest Rate</p>
                <p className="text-lg font-semibold text-white">{loan.interestRate}%</p>
              </div>
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">Tenure</p>
                <p className="text-lg font-semibold text-white">{loan.tenureMonths} months</p>
              </div>
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">EMI Amount</p>
                <p className="text-lg font-semibold text-[var(--primary)]">{formatCurrency(loan.emiAmount)}</p>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-[var(--background)] grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">Outstanding Principal</p>
                <p className="text-xl font-bold text-white">{formatCurrency(loan.outstandingPrincipal)}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">Outstanding Interest</p>
                <p className="text-xl font-bold text-white">{formatCurrency(loan.outstandingInterest)}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">Total Outstanding</p>
                <p className="text-xl font-bold text-[var(--accent-yellow)]">{formatCurrency(totalOutstanding)}</p>
              </div>
            </div>

            {loan.nextEmiDate && loan.status === 'ACTIVE' && (
              <div className="mt-4 p-3 rounded-lg bg-[var(--primary)]/10 border border-[var(--primary)]/20">
                <p className="text-[var(--primary)] text-sm">Next EMI Due: <strong>{formatDate(loan.nextEmiDate)}</strong></p>
              </div>
            )}
          </div>

          {/* Transactions */}
          {loan.transactions && loan.transactions.length > 0 && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Transaction History</h2>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {loan.transactions.map((tx, i) => (
                    <tr key={i}>
                      <td>{formatDate(tx.createdAt)}</td>
                      <td>
                        <span className={`badge ${tx.type === 'DISBURSEMENT' ? 'badge-info' : tx.type === 'EMI_PAYMENT' ? 'badge-success' : 'badge-warning'}`}>
                          {tx.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="font-semibold">{formatCurrency(tx.amount)}</td>
                      <td className="font-mono text-sm text-[var(--foreground-muted)]">{tx.reference || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Borrower */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Borrower</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">Name</p>
                <p className="text-white font-medium">{loan.loanApplication?.user?.name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">Email</p>
                <p className="text-white">{loan.loanApplication?.user?.email || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">Application</p>
                <p className="text-[var(--primary)]">{loan.loanApplication?.applicationNumber || '-'}</p>
              </div>
            </div>
          </div>

          {/* Collaterals */}
          {loan.collaterals && loan.collaterals.length > 0 && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Collaterals</h2>
              <div className="space-y-3">
                {loan.collaterals.map((col, i) => (
                  <div key={i} className="p-3 rounded-lg bg-[var(--background)]">
                    <p className="text-white font-medium text-sm">{col.fundName}</p>
                    <div className="flex justify-between mt-1">
                      <span className={`badge badge-sm ${col.fundType === 'EQUITY' ? 'badge-info' : 'badge-success'}`}>
                        {col.fundType}
                      </span>
                      <span className="text-[var(--accent-green)] font-semibold">{formatCurrency(col.currentValue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pay EMI Modal */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-white mb-4">Record EMI Payment</h2>
            <div>
              <label className="block text-sm text-[var(--foreground-muted)] mb-1">Amount (₹)</label>
              <input
                type="number"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowPayModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handlePayEmi} disabled={actionLoading} className="btn-primary flex-1">
                {actionLoading ? 'Recording...' : 'Record Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prepay Modal */}
      {showPrepayModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-white mb-4">Record Prepayment</h2>
            <div>
              <label className="block text-sm text-[var(--foreground-muted)] mb-1">Prepayment Amount (₹)</label>
              <input
                type="number"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                className="input-field"
                placeholder="Enter prepayment amount"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowPrepayModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handlePrepay} disabled={actionLoading} className="btn-primary flex-1">
                {actionLoading ? 'Recording...' : 'Record Prepayment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

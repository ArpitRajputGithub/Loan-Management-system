'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

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
  nextEmiDate: string;
  totalCollateralValue?: number;
  ltvStatus?: { currentLtv: number; status: string };
  loanApplication?: {
    user: { name: string };
    loanProduct: { name: string };
  };
}

const statusColors: Record<string, string> = {
  ACTIVE: 'badge-success',
  CLOSED: 'badge-info',
  DEFAULTED: 'badge-error',
};

const ltvColors: Record<string, string> = {
  SAFE: 'text-[var(--accent-green)]',
  WARNING: 'text-[var(--accent-yellow)]',
  CRITICAL: 'text-[var(--accent-red)]',
};

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    try {
      const res = await api.getLoans();
      if (res.success && res.data) {
        setLoans(res.data);
      }
    } catch {
      console.error('Failed to load loans');
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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Active Loans</h1>
        <p className="text-[var(--foreground-muted)] mt-1">Monitor ongoing loans and their LTV status</p>
      </div>

      {/* LTV Alert Banner */}
      {loans.some(l => l.ltvStatus?.status === 'CRITICAL') && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-red-400">Critical LTV Alert!</h3>
            <p className="text-sm text-red-300/80">
              {loans.filter(l => l.ltvStatus?.status === 'CRITICAL').length} loan(s) have exceeded safe LTV thresholds. 
              Collateral value has dropped significantly. Consider requesting additional collateral.
            </p>
          </div>
        </div>
      )}

      {loans.some(l => l.ltvStatus?.status === 'WARNING') && !loans.some(l => l.ltvStatus?.status === 'CRITICAL') && (
        <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-yellow-400">LTV Warning</h3>
            <p className="text-sm text-yellow-300/80">
              {loans.filter(l => l.ltvStatus?.status === 'WARNING').length} loan(s) approaching LTV threshold. 
              Monitor closely for potential margin calls.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-sm text-[var(--foreground-muted)]">Total Loans</p>
          <p className="text-2xl font-bold text-white">{loans.length}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-[var(--foreground-muted)]">Active</p>
          <p className="text-2xl font-bold text-[var(--accent-green)]">
            {loans.filter(l => l.status === 'ACTIVE').length}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-[var(--foreground-muted)]">Total Outstanding</p>
          <p className="text-2xl font-bold text-white">
            {formatCurrency(loans.reduce((sum, l) => sum + l.outstandingPrincipal + l.outstandingInterest, 0))}
          </p>
        </div>
        <div className="stat-card border-yellow-500/30">
          <p className="text-sm text-[var(--foreground-muted)]">At Risk (LTV)</p>
          <p className={`text-2xl font-bold ${loans.filter(l => l.ltvStatus?.status !== 'SAFE').length > 0 ? 'text-yellow-400' : 'text-[var(--accent-green)]'}`}>
            {loans.filter(l => l.ltvStatus?.status !== 'SAFE').length}
          </p>
        </div>
      </div>

      {/* Loans Table */}
      <div className="card p-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="spinner" />
          </div>
        ) : loans.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--background)] flex items-center justify-center">
              <svg className="w-8 h-8 text-[var(--foreground-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No active loans</h3>
            <p className="text-[var(--foreground-muted)]">Disbursed loans will appear here</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Loan ID</th>
                <th>Borrower</th>
                <th>Principal</th>
                <th>EMI</th>
                <th>Outstanding</th>
                <th>LTV</th>
                <th>Next EMI</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loans.map((loan) => (
                <tr key={loan.id}>
                  <td className="font-mono text-sm">{loan.loanNumber}</td>
                  <td>{loan.loanApplication?.user?.name || 'N/A'}</td>
                  <td>{formatCurrency(loan.principal)}</td>
                  <td>{formatCurrency(loan.emiAmount)}</td>
                  <td className="font-semibold">
                    {formatCurrency(loan.outstandingPrincipal + loan.outstandingInterest)}
                  </td>
                  <td>
                    <span className={ltvColors[loan.ltvStatus?.status || 'SAFE']}>
                      {loan.ltvStatus ? `${(loan.ltvStatus.currentLtv * 100).toFixed(1)}%` : 'N/A'}
                    </span>
                  </td>
                  <td className="text-[var(--foreground-muted)]">
                    {loan.nextEmiDate ? formatDate(loan.nextEmiDate) : 'N/A'}
                  </td>
                  <td>
                    <span className={`badge ${statusColors[loan.status] || 'badge-info'}`}>
                      {loan.status}
                    </span>
                  </td>
                  <td>
                    <Link href={`/loans/${loan.id}`} className="text-[var(--primary)] hover:underline text-sm">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface MarginCall {
  id: string;
  callNumber: string;
  triggerLtv: string;
  currentLtv: string;
  shortfallAmount: number;
  status: string;
  dueDate: string;
  createdAt: string;
  loan: {
    loanNumber: string;
    outstandingPrincipal: number;
    loanApplication: {
      user: { name: string; email: string };
    };
  };
}

interface MarginCallStats {
  pending: number;
  notified: number;
  resolved: number;
  total: number;
}

interface LtvThresholds {
  SAFE: number;
  WARNING: number;
  MARGIN_CALL: number;
  LIQUIDATION: number;
}

const statusColors: Record<string, string> = {
  PENDING: 'badge-warning',
  NOTIFIED: 'badge-info',
  TOPPED_UP: 'badge-success',
  RESOLVED: 'badge-success',
  LIQUIDATED: 'badge-error',
};

export default function MarginCallsPage() {
  const [marginCalls, setMarginCalls] = useState<MarginCall[]>([]);
  const [stats, setStats] = useState<MarginCallStats | null>(null);
  const [thresholds, setThresholds] = useState<LtvThresholds | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [callsRes, statsRes, thresholdsRes] = await Promise.all([
        api.get('/margin-calls'),
        api.get('/margin-calls/stats'),
        api.get('/margin-calls/thresholds'),
      ]);
      if (callsRes.marginCalls) setMarginCalls(callsRes.marginCalls);
      if (statsRes) setStats(statsRes);
      if (thresholdsRes) setThresholds(thresholdsRes);
    } catch {
      console.error('Failed to load margin calls');
    } finally {
      setLoading(false);
    }
  };

  const checkAllLoans = async () => {
    setChecking(true);
    try {
      const res = await api.post('/margin-calls/check', {});
      alert(res.message || 'Check completed');
      loadData();
    } catch {
      console.error('Failed to check loans');
    } finally {
      setChecking(false);
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Margin Calls</h1>
          <p className="text-[var(--foreground-muted)] mt-1">LTV monitoring and collateral alerts</p>
        </div>
        <button 
          onClick={checkAllLoans} 
          disabled={checking}
          className="btn-primary flex items-center gap-2"
        >
          {checking ? (
            <>
              <div className="spinner w-4 h-4" />
              Checking...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Check All Loans
            </>
          )}
        </button>
      </div>

      {/* LTV Thresholds Card */}
      {thresholds && (
        <div className="card p-4">
          <h3 className="text-sm font-medium text-[var(--foreground-muted)] mb-3">LTV Thresholds</h3>
          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[var(--accent-green)]" />
              <span className="text-sm text-white">Safe: &lt;{thresholds.SAFE}%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-sm text-white">Warning: {thresholds.SAFE}-{thresholds.WARNING}%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-sm text-white">Margin Call: {thresholds.WARNING}-{thresholds.MARGIN_CALL}%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[var(--accent-red)]" />
              <span className="text-sm text-white">Liquidation: &gt;{thresholds.LIQUIDATION}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="stat-card">
            <p className="text-sm text-[var(--foreground-muted)]">Total Alerts</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="stat-card border-yellow-500/30">
            <p className="text-sm text-[var(--foreground-muted)]">Pending Action</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
          </div>
          <div className="stat-card border-blue-500/30">
            <p className="text-sm text-[var(--foreground-muted)]">Notified</p>
            <p className="text-2xl font-bold text-blue-400">{stats.notified}</p>
          </div>
          <div className="stat-card border-green-500/30">
            <p className="text-sm text-[var(--foreground-muted)]">Resolved</p>
            <p className="text-2xl font-bold text-[var(--accent-green)]">{stats.resolved}</p>
          </div>
        </div>
      )}

      {/* Alert Banner */}
      {stats && stats.pending > 0 && (
        <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-yellow-400">{stats.pending} Margin Call(s) Require Action</h3>
            <p className="text-sm text-yellow-300/80">
              Contact borrowers immediately to request additional collateral or partial repayment.
            </p>
          </div>
        </div>
      )}

      {/* Margin Calls Table */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Margin Call History</h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="spinner" />
          </div>
        ) : marginCalls.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--accent-green)]/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-[var(--accent-green)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">All Clear!</h3>
            <p className="text-[var(--foreground-muted)]">No margin calls - all loans are within safe LTV limits</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Call #</th>
                <th>Loan</th>
                <th>Borrower</th>
                <th>Current LTV</th>
                <th>Shortfall</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {marginCalls.map((call) => (
                <tr key={call.id}>
                  <td className="font-mono text-sm">{call.callNumber}</td>
                  <td className="font-mono text-sm">{call.loan.loanNumber}</td>
                  <td>
                    <div className="text-sm">{call.loan.loanApplication?.user?.name || 'N/A'}</div>
                    <div className="text-xs text-[var(--foreground-muted)]">
                      {call.loan.loanApplication?.user?.email || ''}
                    </div>
                  </td>
                  <td>
                    <span className={parseFloat(call.currentLtv) >= 75 ? 'text-[var(--accent-red)]' : 'text-yellow-400'}>
                      {parseFloat(call.currentLtv).toFixed(1)}%
                    </span>
                  </td>
                  <td className="text-[var(--accent-red)] font-semibold">
                    {formatCurrency(call.shortfallAmount)}
                  </td>
                  <td className="text-[var(--foreground-muted)]">
                    {formatDate(call.dueDate)}
                  </td>
                  <td>
                    <span className={`badge ${statusColors[call.status] || 'badge-info'}`}>
                      {call.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="text-[var(--foreground-muted)] text-sm">
                    {formatDate(call.createdAt)}
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

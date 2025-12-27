'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Collateral {
  id: string;
  fundName: string;
  fundType: string;
  isin: string;
  units: number;
  nav: number;
  pledgedValue: number;
  currentValue: number;
  ltvApplied: string;
  eligibleAmount: number;
  registrar: string;
  lienStatus: string;
  loanApplication?: { applicationNumber: string; user?: { name: string } };
  loan?: { loanNumber: string };
}

const lienStatusColors: Record<string, string> = {
  PENDING: 'badge-warning',
  MARKED: 'badge-success',
  RELEASE_REQUESTED: 'badge-info',
  RELEASED: 'badge-secondary',
};

export default function CollateralsPage() {
  const [collaterals, setCollaterals] = useState<Collateral[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNavModal, setShowNavModal] = useState(false);
  const [selectedCollateral, setSelectedCollateral] = useState<Collateral | null>(null);
  const [newNav, setNewNav] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadCollaterals();
  }, []);

  const loadCollaterals = async () => {
    try {
      const res = await api.getCollaterals();
      if (res.success && res.data) {
        setCollaterals(res.data);
      }
    } catch {
      console.error('Failed to load collaterals');
    } finally {
      setLoading(false);
    }
  };

  const openNavModal = (col: Collateral) => {
    setSelectedCollateral(col);
    setNewNav(col.nav.toString());
    setShowNavModal(true);
  };

  const handleUpdateNav = async () => {
    if (!selectedCollateral) return;
    setActionLoading(true);
    const res = await api.updateCollateralNav(selectedCollateral.id, parseFloat(newNav));
    if (res.success) {
      setShowNavModal(false);
      loadCollaterals();
    } else {
      alert(res.error || 'Failed to update NAV');
    }
    setActionLoading(false);
  };

  const handleRelease = async (col: Collateral) => {
    if (!confirm(`Request lien release for ${col.fundName}?`)) return;
    setActionLoading(true);
    const res = await api.releaseCollateral(col.id);
    if (res.success) {
      loadCollaterals();
    } else {
      alert(res.error || 'Failed to request release');
    }
    setActionLoading(false);
  };

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

  // Stats
  const totalValue = collaterals.reduce((sum, c) => sum + c.currentValue, 0);
  const markedCount = collaterals.filter(c => c.lienStatus === 'MARKED').length;
  const totalEligible = collaterals.reduce((sum, c) => sum + c.eligibleAmount, 0);

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">Collateral Management</h1>
        <p className="text-[var(--foreground-muted)] mt-1 text-sm sm:text-base">Track mutual fund units pledged as collateral</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="stat-card">
          <p className="text-sm text-[var(--foreground-muted)]">Total Collaterals</p>
          <p className="text-2xl font-bold text-white">{collaterals.length}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-[var(--foreground-muted)]">Lien Marked</p>
          <p className="text-2xl font-bold text-[var(--accent-green)]">{markedCount}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-[var(--foreground-muted)]">Total Value</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(totalValue)}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-[var(--foreground-muted)]">Eligible Amount</p>
          <p className="text-2xl font-bold text-[var(--primary)]">{formatCurrency(totalEligible)}</p>
        </div>
      </div>

      {/* Collaterals Table */}
      <div className="card p-4 sm:p-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="spinner" />
          </div>
        ) : collaterals.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--background)] flex items-center justify-center">
              <svg className="w-8 h-8 text-[var(--foreground-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No collaterals</h3>
            <p className="text-[var(--foreground-muted)]">Pledged mutual funds will appear here</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
            <thead>
              <tr>
                <th>Fund Name</th>
                <th>Type</th>
                <th>Units</th>
                <th>NAV</th>
                <th>Value</th>
                <th>LTV</th>
                <th>Eligible</th>
                <th>Status</th>
                <th>Application</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {collaterals.map((col) => (
                <tr key={col.id}>
                  <td>
                    <div>
                      <p className="font-medium">{col.fundName}</p>
                      <p className="text-xs text-[var(--foreground-muted)]">{col.isin}</p>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${col.fundType === 'EQUITY' ? 'badge-info' : col.fundType === 'DEBT' ? 'badge-success' : 'badge-warning'}`}>
                      {col.fundType}
                    </span>
                  </td>
                  <td>{col.units}</td>
                  <td>₹{col.nav}</td>
                  <td className="font-semibold">{formatCurrency(col.currentValue)}</td>
                  <td>{(parseFloat(col.ltvApplied) * 100).toFixed(0)}%</td>
                  <td className="text-[var(--accent-green)]">{formatCurrency(col.eligibleAmount)}</td>
                  <td>
                    <span className={`badge ${lienStatusColors[col.lienStatus] || 'badge-info'}`}>
                      {col.lienStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="text-sm">
                    <p>{col.loanApplication?.applicationNumber || '-'}</p>
                    <p className="text-[var(--foreground-muted)]">{col.loanApplication?.user?.name || ''}</p>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => openNavModal(col)}
                        className="text-[var(--primary)] hover:underline text-sm"
                      >
                        Update NAV
                      </button>
                      {col.lienStatus === 'MARKED' && (
                        <button 
                          onClick={() => handleRelease(col)}
                          disabled={actionLoading}
                          className="text-[var(--accent-yellow)] hover:underline text-sm"
                        >
                          Release
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Update NAV Modal */}
      {showNavModal && selectedCollateral && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-white mb-4">Update NAV</h2>
            <p className="text-[var(--foreground-muted)] text-sm mb-4">{selectedCollateral.fundName}</p>
            <div>
              <label className="block text-sm text-[var(--foreground-muted)] mb-1">New NAV (₹)</label>
              <input
                type="number"
                step="0.01"
                value={newNav}
                onChange={(e) => setNewNav(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowNavModal(false)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button onClick={handleUpdateNav} disabled={actionLoading} className="btn-primary flex-1">
                {actionLoading ? 'Updating...' : 'Update NAV'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

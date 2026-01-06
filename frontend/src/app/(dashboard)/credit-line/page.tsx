'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface CreditLine {
  id: string;
  creditLineNumber: string;
  sanctionedLimit: number;
  utilizedAmount: number;
  availableLimit: number;
  interestRate: number;
  accruedInterest: number;
  totalCollateralValue: number;
  totalEligibleAmount: number;
  currentLtv: number | null;
  status: string;
  activatedAt: string | null;
  collaterals: any[];
  tranches: any[];
}

export default function CreditLinePage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [creditLine, setCreditLine] = useState<CreditLine | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showAddCollateralModal, setShowAddCollateralModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawPurpose, setWithdrawPurpose] = useState('');
  const [processing, setProcessing] = useState(false);

  // Collateral form
  const [collateralForm, setCollateralForm] = useState({
    fundName: '',
    fundType: 'EQUITY',
    isin: '',
    units: '',
    nav: '',
    folioNumber: '',
  });

  useEffect(() => {
    fetchCreditLine();
  }, []);

  const fetchCreditLine = async () => {
    try {
      const res = id 
        ? await api.getCreditLine(id)
        : await api.getMyCreditLine();
        
      if (res.success) {
        setCreditLine(res.data);
      } else if (res.error?.includes('not found')) {
        setCreditLine(null);
      } else {
        setError(res.error || 'Failed to fetch credit line');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!creditLine || !withdrawAmount) return;
    setProcessing(true);
    try {
      const res = await api.createTranche(creditLine.id, {
        amount: parseInt(withdrawAmount),
        purpose: withdrawPurpose || undefined,
      });
      if (res.success) {
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        setWithdrawPurpose('');
        fetchCreditLine();
      } else {
        alert(res.error || 'Failed to create tranche');
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleAddCollateral = async () => {
    if (!creditLine) return;
    setProcessing(true);
    try {
      const res = await api.addCreditLineCollateral(creditLine.id, {
        fundName: collateralForm.fundName,
        fundType: collateralForm.fundType,
        isin: collateralForm.isin,
        units: parseFloat(collateralForm.units),
        nav: parseFloat(collateralForm.nav),
        folioNumber: collateralForm.folioNumber || undefined,
      });
      if (res.success) {
        setShowAddCollateralModal(false);
        setCollateralForm({ fundName: '', fundType: 'EQUITY', isin: '', units: '', nav: '', folioNumber: '' });
        fetchCreditLine();
      } else {
        alert(res.error || 'Failed to add collateral');
      }
    } finally {
      setProcessing(false);
    }
  };

  // handleActivate removed - Activation is now Admin-only to ensure lien marking verification


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500/20 text-green-400';
      case 'PENDING': return 'bg-yellow-500/20 text-yellow-400';
      case 'FROZEN': return 'bg-blue-500/20 text-blue-400';
      case 'CLOSED': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-8 text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button onClick={fetchCreditLine} className="btn-primary">Retry</button>
      </div>
    );
  }

  if (!creditLine) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Credit Line</h1>
        </div>
        <div className="card p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--accent)]/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">No Credit Line Yet</h2>
          <p className="text-[var(--foreground-muted)] mb-6">
            Get started by checking your eligibility and setting up a credit line
          </p>
          <Link href="/eligibility" className="btn-primary inline-block">
            Check Eligibility
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Credit Line</h1>
          <p className="text-[var(--foreground-muted)]">{creditLine.creditLineNumber}</p>
        </div>
        <div className="flex gap-3">
          {creditLine.status === 'ACTIVE' && !id && (
            <button onClick={() => setShowWithdrawModal(true)} className="btn-primary">
              Withdraw Funds
            </button>
          )}
          {creditLine.status !== 'CLOSED' && !id && (
            <button onClick={() => setShowAddCollateralModal(true)} className="btn-secondary">
              Add Collateral
            </button>
          )}
          {id && (
            <Link href="/admin/credit-lines" className="btn-secondary">
              Back to Management
            </Link>
          )}
        </div>
      </div>

      {/* Status Banner */}
      <div className={`rounded-lg p-4 ${getStatusColor(creditLine.status)}`}>
        <div className="flex items-center gap-3">
          <span className="font-medium">Status: {creditLine.status}</span>
          {creditLine.status === 'PENDING' && (
            <span className="text-sm opacity-80">• Pledged funds are being verified. Activation pending with Admin.</span>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5">
          <p className="text-[var(--foreground-muted)] text-sm mb-1">Sanctioned Limit</p>
          <p className="text-2xl font-bold text-[var(--foreground)]">{formatCurrency(creditLine.sanctionedLimit)}</p>
        </div>
        <div className="card p-5">
          <p className="text-[var(--foreground-muted)] text-sm mb-1">Available</p>
          <p className="text-2xl font-bold text-green-400">{formatCurrency(creditLine.availableLimit)}</p>
        </div>
        <div className="card p-5">
          <p className="text-[var(--foreground-muted)] text-sm mb-1">Utilized</p>
          <p className="text-2xl font-bold text-orange-400">{formatCurrency(creditLine.utilizedAmount)}</p>
        </div>
        <div className="card p-5">
          <p className="text-[var(--foreground-muted)] text-sm mb-1">Accrued Interest</p>
          <p className="text-2xl font-bold text-red-400">{formatCurrency(creditLine.accruedInterest)}</p>
        </div>
      </div>

      {/* Utilization Progress */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[var(--foreground-muted)]">Utilization</span>
          <span className="font-medium">{Math.round((creditLine.utilizedAmount / creditLine.sanctionedLimit) * 100)}%</span>
        </div>
        <div className="h-3 bg-[var(--background-secondary)] rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[var(--accent)] to-purple-500 transition-all duration-500"
            style={{ width: `${(creditLine.utilizedAmount / creditLine.sanctionedLimit) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm text-[var(--foreground-muted)]">
          <span>Interest Rate: {Number(creditLine.interestRate).toFixed(2)}% p.a.</span>
          {creditLine.currentLtv && <span>LTV: {(Number(creditLine.currentLtv) * 100).toFixed(1)}%</span>}
        </div>
      </div>

      {/* Collaterals Section */}
      <div className="card p-5">
        <h2 className="text-lg font-semibold mb-4">Pledged Collaterals ({creditLine.collaterals.length})</h2>
        {creditLine.collaterals.length === 0 ? (
          <p className="text-[var(--foreground-muted)] text-center py-6">No collaterals pledged yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left py-3 px-2">Fund Name</th>
                  <th className="text-left py-3 px-2">Type</th>
                  <th className="text-right py-3 px-2">Units</th>
                  <th className="text-right py-3 px-2">NAV</th>
                  <th className="text-right py-3 px-2">Value</th>
                  <th className="text-right py-3 px-2">Eligible</th>
                  <th className="text-center py-3 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {creditLine.collaterals.map((col: any) => (
                  <tr key={col.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-3 px-2 font-medium">{col.fundName}</td>
                    <td className="py-3 px-2">{col.fundType}</td>
                    <td className="py-3 px-2 text-right">{Number(col.units).toFixed(2)}</td>
                    <td className="py-3 px-2 text-right">₹{Number(col.nav).toFixed(2)}</td>
                    <td className="py-3 px-2 text-right">{formatCurrency(col.currentValue)}</td>
                    <td className="py-3 px-2 text-right text-green-400">{formatCurrency(col.eligibleAmount)}</td>
                    <td className="py-3 px-2 text-center">
                      <span className={`px-2 py-1 rounded text-xs ${
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
        )}
      </div>

      {/* Tranches (Withdrawals) Section */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Tranches (Withdrawals)</h2>
          {creditLine.tranches.length > 0 && (
            <Link href={`/credit-line/tranches`} className="text-[var(--accent)] text-sm hover:underline">
              View All
            </Link>
          )}
        </div>
        {creditLine.tranches.length === 0 ? (
          <p className="text-[var(--foreground-muted)] text-center py-6">No withdrawals yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left py-3 px-2">Tranche #</th>
                  <th className="text-right py-3 px-2">Principal</th>
                  <th className="text-right py-3 px-2">Outstanding</th>
                  <th className="text-right py-3 px-2">Accrued Int.</th>
                  <th className="text-left py-3 px-2">Purpose</th>
                  <th className="text-center py-3 px-2">Status</th>
                  <th className="text-center py-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {creditLine.tranches.slice(0, 5).map((tranche: any) => (
                  <tr key={tranche.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-3 px-2 font-mono text-sm">{tranche.trancheNumber}</td>
                    <td className="py-3 px-2 text-right">{formatCurrency(tranche.principalAmount)}</td>
                    <td className="py-3 px-2 text-right font-medium">{formatCurrency(tranche.outstandingPrincipal)}</td>
                    <td className="py-3 px-2 text-right text-red-400">{formatCurrency(tranche.accruedInterest)}</td>
                    <td className="py-3 px-2 truncate max-w-[150px]">{tranche.purpose || '-'}</td>
                    <td className="py-3 px-2 text-center">
                      <span className={`px-2 py-1 rounded text-xs ${
                        tranche.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {tranche.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <Link href={`/credit-line/tranches/${tranche.id}`} className="text-[var(--accent)] hover:underline text-sm">
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

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Withdraw Funds</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--foreground-muted)] mb-1">Amount</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="input w-full"
                  max={creditLine.availableLimit}
                />
                <p className="text-xs text-[var(--foreground-muted)] mt-1">
                  Available: {formatCurrency(creditLine.availableLimit)}
                </p>
              </div>
              <div>
                <label className="block text-sm text-[var(--foreground-muted)] mb-1">Purpose (optional)</label>
                <input
                  type="text"
                  value={withdrawPurpose}
                  onChange={(e) => setWithdrawPurpose(e.target.value)}
                  placeholder="e.g., Personal expenses"
                  className="input w-full"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowWithdrawModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleWithdraw} disabled={processing || !withdrawAmount} className="btn-primary flex-1">
                  {processing ? 'Processing...' : 'Withdraw'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Collateral Modal */}
      {showAddCollateralModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Add Collateral</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--foreground-muted)] mb-1">Fund Name</label>
                <input
                  type="text"
                  value={collateralForm.fundName}
                  onChange={(e) => setCollateralForm({ ...collateralForm, fundName: e.target.value })}
                  placeholder="e.g., HDFC Midcap Fund"
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--foreground-muted)] mb-1">Fund Type</label>
                <select
                  value={collateralForm.fundType}
                  onChange={(e) => setCollateralForm({ ...collateralForm, fundType: e.target.value })}
                  className="input w-full"
                >
                  <option value="EQUITY">Equity (50% LTV)</option>
                  <option value="DEBT">Debt (80% LTV)</option>
                  <option value="HYBRID">Hybrid (65% LTV)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-[var(--foreground-muted)] mb-1">ISIN</label>
                <input
                  type="text"
                  value={collateralForm.isin}
                  onChange={(e) => setCollateralForm({ ...collateralForm, isin: e.target.value })}
                  placeholder="e.g., INF179K01BC2"
                  className="input w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--foreground-muted)] mb-1">Units</label>
                  <input
                    type="number"
                    step="0.01"
                    value={collateralForm.units}
                    onChange={(e) => setCollateralForm({ ...collateralForm, units: e.target.value })}
                    placeholder="100"
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--foreground-muted)] mb-1">NAV (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={collateralForm.nav}
                    onChange={(e) => setCollateralForm({ ...collateralForm, nav: e.target.value })}
                    placeholder="250.50"
                    className="input w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-[var(--foreground-muted)] mb-1">Folio Number (optional)</label>
                <input
                  type="text"
                  value={collateralForm.folioNumber}
                  onChange={(e) => setCollateralForm({ ...collateralForm, folioNumber: e.target.value })}
                  placeholder="12345678/90"
                  className="input w-full"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowAddCollateralModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button 
                  onClick={handleAddCollateral} 
                  disabled={processing || !collateralForm.fundName || !collateralForm.isin || !collateralForm.units || !collateralForm.nav}
                  className="btn-primary flex-1"
                >
                  {processing ? 'Adding...' : 'Add Collateral'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

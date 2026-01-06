'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface EligibilityResult {
  eligible: boolean;
  user: { name: string; pan: string; mobile: string } | null;
  maxCreditLimit: number;
  breakdown: { fundType: string; totalValue: number; ltv: number; eligibleAmount: number }[];
  holdings: { fundName: string; fundType: string; units: number; nav: number; value: number }[];
  availableTenures: number[];
  message: string;
}

interface ExistingCreditLine {
  id: string;
  creditLineNumber: string;
  status: string;
  sanctionedLimit: number;
}

export default function EligibilityPage() {
  const router = useRouter();
  const [pan, setPan] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [error, setError] = useState('');
  const [showCreditLineModal, setShowCreditLineModal] = useState(false);
  const [interestRate, setInterestRate] = useState('12.5');
  const [creatingCreditLine, setCreatingCreditLine] = useState(false);
  const [existingCreditLine, setExistingCreditLine] = useState<ExistingCreditLine | null>(null);
  const [checkingCreditLine, setCheckingCreditLine] = useState(true);
  const [selectedHoldingIndices, setSelectedHoldingIndices] = useState<Set<number>>(new Set());

  // Check if user already has a credit line on mount
  useEffect(() => {
    const checkExistingCreditLine = async () => {
      try {
        const res = await api.getMyCreditLine();
        if (res.success && res.data) {
          setExistingCreditLine(res.data);
        }
      } catch {
        // No credit line found, which is fine
      } finally {
        setCheckingCreditLine(false);
      }
    };
    checkExistingCreditLine();
  }, []);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await api.checkEligibility(pan.toUpperCase(), mobile);
      if (res.success && res.data) {
        setResult(res.data);
      } else {
        setError(res.error || 'Failed to check eligibility');
      }
    } catch {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCreditLine = async () => {
    if (!result || selectedHoldingIndices.size === 0) return;
    setCreatingCreditLine(true);
    try {
      // Get selected holdings from result
      const selectedHoldings = result.holdings
        .filter((_, index) => selectedHoldingIndices.has(index))
        .map(h => ({
          fundName: h.fundName,
          fundType: h.fundType as 'EQUITY' | 'DEBT' | 'HYBRID',
          isin: `INF${Math.random().toString(36).substring(2, 11).toUpperCase()}`, // Mock ISIN
          units: h.units,
          nav: h.nav,
        }));

      const res = await api.createCreditLine({
        interestRate: parseFloat(interestRate),
        holdings: selectedHoldings,
      });
      if (res.success) {
        setShowCreditLineModal(false);
        router.push('/credit-line');
      } else {
        alert(res.error || 'Failed to create credit line request');
      }
    } finally {
      setCreatingCreditLine(false);
    }
  };

  const toggleHolding = (index: number) => {
    setSelectedHoldingIndices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const selectAllHoldings = () => {
    if (result) {
      setSelectedHoldingIndices(new Set(result.holdings.map((_, i) => i)));
    }
  };

  const getSelectedEligibleAmount = () => {
    if (!result) return 0;
    const LTV: Record<string, number> = { EQUITY: 0.50, DEBT: 0.80, HYBRID: 0.65 };
    return result.holdings
      .filter((_, index) => selectedHoldingIndices.has(index))
      .reduce((sum, h) => sum + Math.round(h.value * (LTV[h.fundType] || 0.50)), 0);
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Check Your Eligibility</h1>
        <p className="text-[var(--foreground-muted)]">
          Find out your credit limit in just 10 seconds
        </p>
      </div>

      {/* Form Card */}
      <div className="card p-8">
        <form onSubmit={handleCheck} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground-muted)] mb-2">
                PAN Number
              </label>
              <input
                type="text"
                value={pan}
                onChange={(e) => setPan(e.target.value.toUpperCase())}
                placeholder="ABCDE1234F"
                className="input-field uppercase"
                maxLength={10}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground-muted)] mb-2">
                Mobile Number
              </label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                placeholder="9876543210"
                className="input-field"
                maxLength={10}
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || pan.length !== 10 || mobile.length !== 10}
            className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Checking...
              </span>
            ) : (
              'Check Eligibility'
            )}
          </button>
        </form>
      </div>

      {/* Result */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Credit Limit Card */}
          <div className={`card p-8 ${result.eligible ? 'glow-green' : ''}`}>
            <div className="text-center">
              {result.eligible ? (
                <>
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[var(--accent-green)]/20 flex items-center justify-center">
                    <svg className="w-10 h-10 text-[var(--accent-green)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-xl text-[var(--foreground-muted)] mb-2">You are eligible for</h2>
                  <p className="text-5xl font-bold text-[var(--accent-green)] mb-4">
                    {formatCurrency(result.maxCreditLimit)}
                  </p>
                  <p className="text-[var(--foreground-muted)]">{result.message}</p>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                    <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h2 className="text-xl text-red-400 mb-2">Not Eligible</h2>
                  <p className="text-[var(--foreground-muted)]">{result.message}</p>
                </>
              )}
            </div>
          </div>

          {/* Breakdown */}
          {result.eligible && (
            <>
              {/* Fund Breakdown */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Eligibility Breakdown by Fund Type</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {result.breakdown.map((item) => (
                    <div key={item.fundType} className="p-4 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`badge ${
                          item.fundType === 'EQUITY' ? 'badge-info' :
                          item.fundType === 'DEBT' ? 'badge-success' : 'badge-warning'
                        }`}>
                          {item.fundType}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--foreground-muted)]">Total Value</p>
                      <p className="text-lg font-semibold text-white">{formatCurrency(item.totalValue)}</p>
                      <p className="text-sm text-[var(--foreground-muted)] mt-2">LTV: {(item.ltv * 100)}%</p>
                      <p className="text-sm text-[var(--accent-green)]">Eligible: {formatCurrency(item.eligibleAmount)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Holdings - with selection */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Select Funds to Pledge</h3>
                  <button onClick={selectAllHoldings} className="text-sm text-[var(--accent)] hover:underline">
                    Select All
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th className="w-10"></th>
                        <th>Fund Name</th>
                        <th>Type</th>
                        <th>Units</th>
                        <th>NAV</th>
                        <th>Value</th>
                        <th>Eligible</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.holdings.map((holding, i) => {
                        const LTV: Record<string, number> = { EQUITY: 0.50, DEBT: 0.80, HYBRID: 0.65 };
                        const eligible = Math.round(holding.value * (LTV[holding.fundType] || 0.50));
                        const isSelected = selectedHoldingIndices.has(i);
                        return (
                          <tr 
                            key={i} 
                            className={`cursor-pointer transition-colors ${isSelected ? 'bg-[var(--accent)]/10' : 'hover:bg-[var(--background-secondary)]'}`}
                            onClick={() => toggleHolding(i)}
                          >
                            <td className="text-center">
                              <input 
                                type="checkbox" 
                                checked={isSelected}
                                onChange={() => toggleHolding(i)}
                                className="w-4 h-4 accent-[var(--accent)]"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </td>
                            <td className="font-medium">{holding.fundName}</td>
                            <td>
                              <span className={`badge ${
                                holding.fundType === 'EQUITY' ? 'badge-info' :
                                holding.fundType === 'DEBT' ? 'badge-success' : 'badge-warning'
                              }`}>
                                {holding.fundType}
                              </span>
                            </td>
                            <td>{holding.units.toFixed(2)}</td>
                            <td>₹{holding.nav.toFixed(2)}</td>
                            <td className="font-semibold">{formatCurrency(holding.value)}</td>
                            <td className="text-[var(--accent-green)]">{formatCurrency(eligible)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {selectedHoldingIndices.size > 0 && (
                  <div className="mt-4 p-4 bg-[var(--accent)]/10 border border-[var(--accent)]/30 rounded-lg flex items-center justify-between">
                    <span>
                      <strong>{selectedHoldingIndices.size}</strong> fund(s) selected
                    </span>
                    <span className="text-lg font-bold text-[var(--accent-green)]">
                      Eligible: {formatCurrency(getSelectedEligibleAmount())}
                    </span>
                  </div>
                )}
              </div>

              {/* CTA - Two Options */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-white mb-4 text-center">Choose Your Product</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Credit Line Option */}
                  <div className="p-6 rounded-xl border-2 border-[var(--accent)] bg-[var(--accent)]/10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-[var(--accent)]/20 flex items-center justify-center">
                        <svg className="w-6 h-6 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Credit Line</h4>
                        <p className="text-sm text-[var(--foreground-muted)]">Flexible Credit</p>
                      </div>
                    </div>
                    <ul className="text-sm text-[var(--foreground-muted)] space-y-1 mb-4">
                      <li>✓ Withdraw anytime, pay interest only on used amount</li>
                      <li>✓ Multiple withdrawals (tranches)</li>
                      <li>✓ No fixed EMI schedule</li>
                    </ul>
                    {existingCreditLine ? (
                      <div className="space-y-2">
                        <div className="p-2 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
                          <p className="text-xs text-green-400">You already have a Credit Line</p>
                          <p className="text-sm font-medium text-green-300">{existingCreditLine.creditLineNumber}</p>
                        </div>
                        <Link href="/credit-line" className="btn-primary w-full block text-center">
                          View My Credit Line →
                        </Link>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setShowCreditLineModal(true)}
                        className="btn-primary w-full"
                        disabled={checkingCreditLine || selectedHoldingIndices.size === 0}
                      >
                        {checkingCreditLine ? 'Checking...' : 
                         selectedHoldingIndices.size === 0 ? 'Select Funds Above' : 
                         `Request Credit Line (${formatCurrency(getSelectedEligibleAmount())}) →`}
                      </button>
                    )}
                  </div>

                  {/* Regular Loan Option */}
                  <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--background-secondary)]">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Term Loan</h4>
                        <p className="text-sm text-[var(--foreground-muted)]">Fixed EMI</p>
                      </div>
                    </div>
                    <ul className="text-sm text-[var(--foreground-muted)] space-y-1 mb-4">
                      <li>✓ One-time disbursement</li>
                      <li>✓ Fixed EMI schedule</li>
                      <li>✓ Predictable repayment</li>
                    </ul>
                    <a href="/applications/new" className="btn-secondary w-full inline-block text-center">
                      Apply for Loan →
                    </a>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Credit Line Request Modal */}
      {showCreditLineModal && result && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Request Credit Line</h3>
            <div className="space-y-4">
              <div className="p-4 bg-[var(--background-secondary)] rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-[var(--foreground-muted)]">Selected Funds</span>
                  <span className="font-medium">{selectedHoldingIndices.size} of {result.holdings.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--foreground-muted)]">Credit Limit</span>
                  <span className="font-bold text-[var(--accent-green)]">{formatCurrency(getSelectedEligibleAmount())}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm text-[var(--foreground-muted)] mb-1">Interest Rate (% p.a.)</label>
                <input
                  type="number"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  className="input w-full"
                  min="8"
                  max="24"
                />
                <p className="text-xs text-[var(--foreground-muted)] mt-1">Standard rate: 10.5% - 14.5% based on profile</p>
              </div>
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-sm text-yellow-400">
                  ⚠️ Your request will be reviewed by our team. Once approved, you can pledge collateral and start using the credit line.
                </p>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowCreditLineModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleRequestCreditLine} disabled={creatingCreditLine} className="btn-primary flex-1">
                  {creatingCreditLine ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

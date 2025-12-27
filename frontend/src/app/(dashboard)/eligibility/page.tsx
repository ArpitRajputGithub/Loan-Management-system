'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

interface EligibilityResult {
  eligible: boolean;
  user: { name: string; pan: string; mobile: string } | null;
  maxCreditLimit: number;
  breakdown: { fundType: string; totalValue: number; ltv: number; eligibleAmount: number }[];
  holdings: { fundName: string; fundType: string; units: number; nav: number; value: number }[];
  availableTenures: number[];
  message: string;
}

export default function EligibilityPage() {
  const [pan, setPan] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [error, setError] = useState('');

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

              {/* Holdings */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Your Mutual Fund Holdings</h3>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Fund Name</th>
                      <th>Type</th>
                      <th>Units</th>
                      <th>NAV</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.holdings.map((holding, i) => (
                      <tr key={i}>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* CTA */}
              <div className="text-center">
                <a href="/applications/new" className="btn-primary text-lg px-8 py-4 inline-block">
                  Apply for Loan →
                </a>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

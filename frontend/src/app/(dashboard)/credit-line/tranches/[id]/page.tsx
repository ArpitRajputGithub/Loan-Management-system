'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Tranche {
  id: string;
  trancheNumber: string;
  principalAmount: number;
  outstandingPrincipal: number;
  interestRate: number;
  accruedInterest: number;
  paidInterest: number;
  status: string;
  disbursedAt: string;
  closedAt: string | null;
  purpose: string | null;
  transactions: Transaction[];
  creditLine: {
    creditLineNumber: string;
    user: { name: string; email: string };
  };
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  principalComponent: number;
  interestComponent: number;
  balanceAfter: number;
  reference: string | null;
  createdAt: string;
}

export default function TrancheDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [tranche, setTranche] = useState<Tranche | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchTranche();
  }, [params.id]);

  const fetchTranche = async () => {
    try {
      const res = await api.getTranche(params.id as string);
      if (res.success) {
        setTranche(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!tranche || !payAmount) return;
    setProcessing(true);
    try {
      const res = await api.payTranche(tranche.id, parseInt(payAmount));
      if (res.success) {
        setShowPayModal(false);
        setPayAmount('');
        fetchTranche();
      } else {
        alert(res.error || 'Payment failed');
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'DISBURSEMENT': return 'bg-blue-500/20 text-blue-400';
      case 'INTEREST_PAYMENT': return 'bg-yellow-500/20 text-yellow-400';
      case 'PRINCIPAL_PAYMENT': return 'bg-green-500/20 text-green-400';
      case 'FULL_REPAYMENT': return 'bg-purple-500/20 text-purple-400';
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

  if (!tranche) {
    return (
      <div className="card p-8 text-center">
        <p className="text-red-400 mb-4">Tranche not found</p>
        <Link href="/credit-line" className="btn-primary">Back to Credit Line</Link>
      </div>
    );
  }

  const totalOutstanding = tranche.outstandingPrincipal + tranche.accruedInterest;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link href="/credit-line" className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] text-sm mb-2 inline-block">
            ← Back to Credit Line
          </Link>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">{tranche.trancheNumber}</h1>
          <p className="text-[var(--foreground-muted)]">
            {tranche.purpose || 'Withdrawal'} • {formatDate(tranche.disbursedAt)}
          </p>
        </div>
        {tranche.status === 'ACTIVE' && (
          <button onClick={() => setShowPayModal(true)} className="btn-primary">
            Make Payment
          </button>
        )}
      </div>

      {/* Status */}
      <div className={`rounded-lg p-4 ${tranche.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
        <span className="font-medium">Status: {tranche.status}</span>
        {tranche.closedAt && <span className="ml-4">• Closed on {formatDate(tranche.closedAt)}</span>}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5">
          <p className="text-[var(--foreground-muted)] text-sm mb-1">Principal Amount</p>
          <p className="text-2xl font-bold text-[var(--foreground)]">{formatCurrency(tranche.principalAmount)}</p>
        </div>
        <div className="card p-5">
          <p className="text-[var(--foreground-muted)] text-sm mb-1">Outstanding Principal</p>
          <p className="text-2xl font-bold text-orange-400">{formatCurrency(tranche.outstandingPrincipal)}</p>
        </div>
        <div className="card p-5">
          <p className="text-[var(--foreground-muted)] text-sm mb-1">Accrued Interest</p>
          <p className="text-2xl font-bold text-red-400">{formatCurrency(tranche.accruedInterest)}</p>
        </div>
        <div className="card p-5">
          <p className="text-[var(--foreground-muted)] text-sm mb-1">Total Outstanding</p>
          <p className="text-2xl font-bold text-purple-400">{formatCurrency(totalOutstanding)}</p>
        </div>
      </div>

      {/* Details */}
      <div className="card p-5">
        <h2 className="text-lg font-semibold mb-4">Details</h2>
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <dt className="text-[var(--foreground-muted)]">Interest Rate</dt>
            <dd className="font-medium">{Number(tranche.interestRate).toFixed(2)}% p.a.</dd>
          </div>
          <div>
            <dt className="text-[var(--foreground-muted)]">Paid Interest</dt>
            <dd className="font-medium text-green-400">{formatCurrency(tranche.paidInterest)}</dd>
          </div>
          <div>
            <dt className="text-[var(--foreground-muted)]">Principal Repaid</dt>
            <dd className="font-medium">{formatCurrency(tranche.principalAmount - tranche.outstandingPrincipal)}</dd>
          </div>
          <div>
            <dt className="text-[var(--foreground-muted)]">Daily Interest</dt>
            <dd className="font-medium">~{formatCurrency(Math.round((tranche.outstandingPrincipal * Number(tranche.interestRate)) / 100 / 365))}</dd>
          </div>
        </dl>
      </div>

      {/* Transactions */}
      <div className="card p-5">
        <h2 className="text-lg font-semibold mb-4">Transaction History</h2>
        {tranche.transactions.length === 0 ? (
          <p className="text-[var(--foreground-muted)] text-center py-6">No transactions yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left py-3 px-2">Date</th>
                  <th className="text-left py-3 px-2">Type</th>
                  <th className="text-right py-3 px-2">Amount</th>
                  <th className="text-right py-3 px-2">Principal</th>
                  <th className="text-right py-3 px-2">Interest</th>
                  <th className="text-right py-3 px-2">Balance After</th>
                </tr>
              </thead>
              <tbody>
                {tranche.transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-3 px-2 text-[var(--foreground-muted)]">{formatDate(tx.createdAt)}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-1 rounded text-xs ${getTransactionTypeColor(tx.type)}`}>
                        {tx.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right font-medium">{formatCurrency(tx.amount)}</td>
                    <td className="py-3 px-2 text-right">{formatCurrency(tx.principalComponent)}</td>
                    <td className="py-3 px-2 text-right">{formatCurrency(tx.interestComponent)}</td>
                    <td className="py-3 px-2 text-right">{formatCurrency(tx.balanceAfter)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pay Modal */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Make Payment</h3>
            <div className="space-y-4">
              <div className="p-4 bg-[var(--background-secondary)] rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Outstanding Principal</span>
                  <span>{formatCurrency(tranche.outstandingPrincipal)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span>Accrued Interest</span>
                  <span className="text-red-400">{formatCurrency(tranche.accruedInterest)}</span>
                </div>
                <div className="flex justify-between font-semibold mt-2 pt-2 border-t border-[var(--border)]">
                  <span>Total Due</span>
                  <span>{formatCurrency(totalOutstanding)}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm text-[var(--foreground-muted)] mb-1">Payment Amount</label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="input w-full"
                  max={totalOutstanding}
                />
                <p className="text-xs text-[var(--foreground-muted)] mt-1">
                  Interest is paid first, then principal
                </p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setPayAmount(tranche.accruedInterest.toString())} 
                  className="btn-secondary text-xs py-1 px-2"
                >
                  Pay Interest Only
                </button>
                <button 
                  onClick={() => setPayAmount(totalOutstanding.toString())} 
                  className="btn-secondary text-xs py-1 px-2"
                >
                  Pay Full Amount
                </button>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowPayModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handlePayment} disabled={processing || !payAmount} className="btn-primary flex-1">
                  {processing ? 'Processing...' : 'Pay Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

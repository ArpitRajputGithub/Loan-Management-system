'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const dashboardStats = {
  totalApplications: 156,
  pendingReview: 23,
  activeLoans: 89,
  aum: 2450000000,
  disbursedThisMonth: 125000000,
  atRiskLoans: 3,
};

const formatCurrency = (amount: number) => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)} Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)} L`;
  }
  return `₹${amount.toLocaleString()}`;
};

export default function DashboardPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className={`space-y-8 ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-[var(--foreground-muted)] mt-1">Welcome back! Here&apos;s your loan management overview.</p>
        </div>
        <Link href="/eligibility" className="btn-primary">
          + New Application
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total AUM */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[var(--foreground-muted)] text-sm">Total AUM</span>
            <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(dashboardStats.aum)}</p>
          <p className="text-sm text-[var(--accent-green)] mt-2">↑ 12% from last month</p>
        </div>

        {/* Active Loans */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[var(--foreground-muted)] text-sm">Active Loans</span>
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-green)]/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-[var(--accent-green)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{dashboardStats.activeLoans}</p>
          <p className="text-sm text-[var(--foreground-muted)] mt-2">{dashboardStats.atRiskLoans} at-risk</p>
        </div>

        {/* Pending Applications */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[var(--foreground-muted)] text-sm">Pending Review</span>
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-yellow)]/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-[var(--accent-yellow)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{dashboardStats.pendingReview}</p>
          <p className="text-sm text-[var(--foreground-muted)] mt-2">of {dashboardStats.totalApplications} total</p>
        </div>

        {/* Disbursed This Month */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[var(--foreground-muted)] text-sm">Disbursed This Month</span>
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-blue)]/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-[var(--accent-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(dashboardStats.disbursedThisMonth)}</p>
          <p className="text-sm text-[var(--accent-green)] mt-2">↑ 8% from last month</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Check Eligibility Card */}
        <div className="card p-8 glow-primary">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shrink-0">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white mb-2">Check Your Eligibility</h3>
              <p className="text-[var(--foreground-muted)] mb-4">
                Find out your credit limit in 10 seconds with just your PAN and mobile number.
              </p>
              <Link href="/eligibility" className="btn-primary inline-block">
                Check Now →
              </Link>
            </div>
          </div>
        </div>

        {/* Shop with EMI Card */}
        <div className="card p-8">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 rounded-2xl bg-[var(--accent-green)]/20 flex items-center justify-center shrink-0">
              <svg className="w-8 h-8 text-[var(--accent-green)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white mb-2">Shop with No-Cost EMI</h3>
              <p className="text-[var(--foreground-muted)] mb-4">
                Buy your favorite products with 0% interest EMI using your mutual fund holdings.
              </p>
              <Link href="/products" className="btn-secondary inline-block">
                Browse Products →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Recent Applications</h2>
          <Link href="/applications" className="text-[var(--primary)] hover:underline text-sm">
            View All →
          </Link>
        </div>
        
        <table className="data-table">
          <thead>
            <tr>
              <th>Application ID</th>
              <th>Applicant</th>
              <th>Amount</th>
              <th>Product</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="font-mono text-sm">LA-2024-00001</td>
              <td>Rahul Sharma</td>
              <td>₹2,00,000</td>
              <td>LAMF Standard</td>
              <td><span className="badge badge-warning">Draft</span></td>
              <td className="text-[var(--foreground-muted)]">Dec 25, 2024</td>
            </tr>
            <tr>
              <td className="font-mono text-sm">LA-2024-00002</td>
              <td>Priya Patel</td>
              <td>₹1,59,900</td>
              <td>No-Cost EMI</td>
              <td><span className="badge badge-success">Disbursed</span></td>
              <td className="text-[var(--foreground-muted)]">Dec 24, 2024</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

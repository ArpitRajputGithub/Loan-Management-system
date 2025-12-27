'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  kycStatus: string;
  aadhaarVerified: boolean;
  panVerified: boolean;
  creditScore: number | null;
  city: string | null;
  state: string | null;
  employmentType: string | null;
  monthlyIncome: number | null;
  createdAt: string;
}

interface KycStats {
  pending: number;
  inProgress: number;
  verified: number;
  rejected: number;
  total: number;
}

const kycStatusColors: Record<string, string> = {
  PENDING: 'badge-warning',
  IN_PROGRESS: 'badge-info',
  VERIFIED: 'badge-success',
  REJECTED: 'badge-error',
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<KycStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      const [customersRes, statsRes] = await Promise.all([
        api.get(`/customers${filter ? `?kycStatus=${filter}` : ''}`),
        api.get('/customers/kyc-stats'),
      ]);
      if (customersRes.customers) setCustomers(customersRes.customers);
      if (statsRes) setStats(statsRes);
    } catch {
      console.error('Failed to load customers');
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
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">Customer Management</h1>
          <p className="text-[var(--foreground-muted)] mt-1 text-sm sm:text-base">KYC verification and customer onboarding</p>
        </div>
        <button className="btn-primary w-full sm:w-auto">+ Add Customer</button>
      </div>

      {/* KYC Stats */}
      {stats && (
        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-5">
          <button
            onClick={() => setFilter('')}
            className={`stat-card cursor-pointer transition-all min-w-[140px] sm:min-w-0 flex-shrink-0 ${!filter ? 'ring-2 ring-[var(--primary)]' : ''}`}
          >
            <p className="text-sm text-[var(--foreground-muted)]">Total Customers</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </button>
          <button
            onClick={() => setFilter('PENDING')}
            className={`stat-card cursor-pointer transition-all min-w-[140px] sm:min-w-0 flex-shrink-0 ${filter === 'PENDING' ? 'ring-2 ring-yellow-500' : ''}`}
          >
            <p className="text-sm text-[var(--foreground-muted)]">KYC Pending</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
          </button>
          <button
            onClick={() => setFilter('IN_PROGRESS')}
            className={`stat-card cursor-pointer transition-all min-w-[140px] sm:min-w-0 flex-shrink-0 ${filter === 'IN_PROGRESS' ? 'ring-2 ring-blue-500' : ''}`}
          >
            <p className="text-sm text-[var(--foreground-muted)]">In Progress</p>
            <p className="text-2xl font-bold text-blue-400">{stats.inProgress}</p>
          </button>
          <button
            onClick={() => setFilter('VERIFIED')}
            className={`stat-card cursor-pointer transition-all min-w-[140px] sm:min-w-0 flex-shrink-0 ${filter === 'VERIFIED' ? 'ring-2 ring-green-500' : ''}`}
          >
            <p className="text-sm text-[var(--foreground-muted)]">Verified</p>
            <p className="text-2xl font-bold text-[var(--accent-green)]">{stats.verified}</p>
          </button>
          <button
            onClick={() => setFilter('REJECTED')}
            className={`stat-card cursor-pointer transition-all min-w-[140px] sm:min-w-0 flex-shrink-0 ${filter === 'REJECTED' ? 'ring-2 ring-red-500' : ''}`}
          >
            <p className="text-sm text-[var(--foreground-muted)]">Rejected</p>
            <p className="text-2xl font-bold text-[var(--accent-red)]">{stats.rejected}</p>
          </button>
        </div>
      )}

      {/* Customers Table */}
      <div className="card p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white">
            {filter ? `${filter.replace('_', ' ')} Customers` : 'All Customers'}
          </h2>
          {filter && (
            <button onClick={() => setFilter('')} className="text-sm text-[var(--primary)] hover:underline">
              Clear Filter
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="spinner" />
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--background)] flex items-center justify-center">
              <svg className="w-8 h-8 text-[var(--foreground-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No customers found</h3>
            <p className="text-[var(--foreground-muted)]">Add your first customer to get started</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>KYC Status</th>
                <th>Aadhaar</th>
                <th>PAN</th>
                <th>Credit Score</th>
                <th>Location</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td className="font-medium">
                    {customer.firstName} {customer.lastName}
                  </td>
                  <td>
                    <div className="text-sm">{customer.email}</div>
                    <div className="text-xs text-[var(--foreground-muted)]">{customer.phone}</div>
                  </td>
                  <td>
                    <span className={`badge ${kycStatusColors[customer.kycStatus] || 'badge-info'}`}>
                      {customer.kycStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    {customer.aadhaarVerified ? (
                      <span className="text-[var(--accent-green)]">✓ Verified</span>
                    ) : (
                      <span className="text-[var(--foreground-muted)]">Pending</span>
                    )}
                  </td>
                  <td>
                    {customer.panVerified ? (
                      <span className="text-[var(--accent-green)]">✓ Verified</span>
                    ) : (
                      <span className="text-[var(--foreground-muted)]">Pending</span>
                    )}
                  </td>
                  <td>
                    {customer.creditScore ? (
                      <span className={customer.creditScore >= 700 ? 'text-[var(--accent-green)]' : customer.creditScore >= 600 ? 'text-yellow-400' : 'text-[var(--accent-red)]'}>
                        {customer.creditScore}
                      </span>
                    ) : (
                      <span className="text-[var(--foreground-muted)]">-</span>
                    )}
                  </td>
                  <td className="text-[var(--foreground-muted)]">
                    {customer.city && customer.state ? `${customer.city}, ${customer.state}` : '-'}
                  </td>
                  <td className="text-[var(--foreground-muted)] text-sm">
                    {formatDate(customer.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

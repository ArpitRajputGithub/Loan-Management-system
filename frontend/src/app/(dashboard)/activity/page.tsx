'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  performedBy: string | null;
  ipAddress: string | null;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  } | null;
}

const actionColors: Record<string, string> = {
  STATUS_CHANGE: 'bg-blue-500/20 text-blue-400',
  CREATE: 'bg-green-500/20 text-green-400',
  UPDATE: 'bg-yellow-500/20 text-yellow-400',
  DELETE: 'bg-red-500/20 text-red-400',
  APPROVE: 'bg-[var(--accent-green)]/20 text-[var(--accent-green)]',
  REJECT: 'bg-red-500/20 text-red-400',
  DISBURSE: 'bg-purple-500/20 text-purple-400',
  SUBMIT: 'bg-blue-500/20 text-blue-400',
  PAYMENT: 'bg-green-500/20 text-green-400',
};

const entityIcons: Record<string, React.ReactNode> = {
  LOAN_APPLICATION: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  LOAN: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  COLLATERAL: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  USER: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
};

export default function ActivityPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadLogs();
  }, [filter]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await api.getAuditLogs(filter || undefined);
      if (res.success && res.data) {
        setLogs(res.data);
      }
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getActionLabel = (action: string, newValue: Record<string, unknown> | null) => {
    if (action === 'STATUS_CHANGE' && newValue?.status) {
      return `Status → ${newValue.status}`;
    }
    return action.replace(/_/g, ' ');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Activity Log</h1>
          <p className="text-[var(--foreground-muted)] mt-1">Track all system activities and changes</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filter === '' ? 'bg-[var(--primary)] text-black' : 'bg-[var(--background-card)] text-[var(--foreground-muted)] hover:text-white'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('LOAN_APPLICATION')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filter === 'LOAN_APPLICATION' ? 'bg-[var(--primary)] text-black' : 'bg-[var(--background-card)] text-[var(--foreground-muted)] hover:text-white'
          }`}
        >
          Applications
        </button>
        <button
          onClick={() => setFilter('LOAN')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filter === 'LOAN' ? 'bg-[var(--primary)] text-black' : 'bg-[var(--background-card)] text-[var(--foreground-muted)] hover:text-white'
          }`}
        >
          Loans
        </button>
        <button
          onClick={() => setFilter('COLLATERAL')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filter === 'COLLATERAL' ? 'bg-[var(--primary)] text-black' : 'bg-[var(--background-card)] text-[var(--foreground-muted)] hover:text-white'
          }`}
        >
          Collaterals
        </button>
      </div>

      {/* Activity List */}
      <div className="card">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="spinner" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--background)] flex items-center justify-center">
              <svg className="w-8 h-8 text-[var(--foreground-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No activity yet</h3>
            <p className="text-[var(--foreground-muted)]">System activities will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {logs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-[var(--background)]/50 transition-colors">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-full bg-[var(--background)] flex items-center justify-center text-[var(--foreground-muted)] flex-shrink-0">
                    {entityIcons[log.entityType] || (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${actionColors[log.action] || 'bg-gray-500/20 text-gray-400'}`}>
                        {getActionLabel(log.action, log.newValue)}
                      </span>
                      <span className="text-sm text-white font-medium">
                        {log.entityType.replace(/_/g, ' ')}
                      </span>
                    </div>
                    
                    <p className="text-[var(--foreground-muted)] text-sm mt-1">
                      {log.user?.name || 'System'} performed {log.action.toLowerCase().replace(/_/g, ' ')} on{' '}
                      <Link 
                        href={`/${log.entityType.toLowerCase().replace('_', '-')}s/${log.entityId}`}
                        className="text-[var(--primary)] hover:underline font-mono text-xs"
                      >
                        {log.entityId.substring(0, 8)}...
                      </Link>
                    </p>

                    {/* Show status change details */}
                    {log.action === 'STATUS_CHANGE' && typeof log.oldValue?.status === 'string' && typeof log.newValue?.status === 'string' && (
                      <div className="mt-2 flex items-center gap-2 text-sm">
                        <span className="text-[var(--foreground-muted)]">{log.oldValue.status}</span>
                        <svg className="w-4 h-4 text-[var(--foreground-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        <span className="text-white font-medium">{log.newValue.status}</span>
                      </div>
                    )}
                  </div>

                  {/* Timestamp */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm text-[var(--foreground-muted)]">{getTimeAgo(log.createdAt)}</p>
                    <p className="text-xs text-[var(--foreground-muted)]/60">{formatDate(log.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

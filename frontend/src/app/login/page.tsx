'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.login(email, password);
      if (res.success) {
        router.push('/');
      } else {
        setError(res.error || 'Login failed');
      }
    } catch {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">1Fi</h1>
          <p className="text-[var(--foreground-muted)]">
            Sign in to your loan management dashboard
          </p>
        </div>

        {/* Login Card */}
        <div className="card p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground-muted)] mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@1fi.in"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground-muted)] mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field"
                required
              />
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Quick Login */}
          <div className="mt-6 p-4 rounded-xl bg-[var(--background)] border border-[var(--border)]">
            <p className="text-sm text-[var(--foreground-muted)] mb-3">Quick Login (click to fill):</p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@1fi.in');
                  setPassword('admin123');
                  navigator.clipboard.writeText('admin@1fi.in / admin123');
                }}
                className="w-full text-left p-2 rounded-lg bg-[var(--background-card)] hover:bg-[var(--primary)]/10 transition-all group"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-mono text-white">admin@1fi.in / admin123</span>
                  <span className="text-xs text-[var(--primary)] opacity-0 group-hover:opacity-100">Admin →</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('rahul@example.com');
                  setPassword('user123');
                  navigator.clipboard.writeText('rahul@example.com / user123');
                }}
                className="w-full text-left p-2 rounded-lg bg-[var(--background-card)] hover:bg-[var(--primary)]/10 transition-all group"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-mono text-white">rahul@example.com / user123</span>
                  <span className="text-xs text-[var(--primary)] opacity-0 group-hover:opacity-100">User →</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[var(--foreground-muted)] text-sm mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/eligibility" className="text-[var(--primary)] hover:underline">
            Check Eligibility
          </Link>
        </p>
      </div>
    </div>
  );
}

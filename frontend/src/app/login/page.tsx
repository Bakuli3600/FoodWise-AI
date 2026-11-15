'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, AlertCircle, Shield } from 'lucide-react';
import { api, setAuthToken, setStoredUser } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.login({ email, password });
      setAuthToken(res.access_token);
      setStoredUser(res.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-base shadow-sm">
            FW
          </div>
          <span className="font-bold text-xl tracking-tight text-text-primary">
            FOODWISE AI
          </span>
        </Link>
        <h2 className="text-center text-xl font-bold tracking-tight text-text-primary">
          Sign In to Institutional Platform
        </h2>
        <p className="mt-1 text-center text-xs text-text-secondary">
          Food Waste Detection, Analytics & SDG 12.3 Monitoring
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface py-8 px-6 shadow-sm border border-border sm:rounded-xl sm:px-10">
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-danger text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-primary">
                Email Address
              </label>
              <div className="mt-1.5 relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@institution.edu"
                  className="block w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-text-primary"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-text-primary">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-accent hover:text-primary transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="mt-1.5 relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-text-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="mt-6 pt-6 border-t border-border">
            <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-accent" />
              <span>One-Click Role Demonstration</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillDemo('admin@foodwise.ai', 'Admin@1234')}
                className="p-2 rounded-lg bg-background hover:bg-primary-light hover:text-primary border border-border text-left transition-colors"
              >
                <div className="font-semibold text-[11px] text-text-primary">Super Admin</div>
                <div className="text-[10px] text-text-muted">Full administrative privileges</div>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('manager@foodwise.ai', 'Manager@1234')}
                className="p-2 rounded-lg bg-background hover:bg-primary-light hover:text-primary border border-border text-left transition-colors"
              >
                <div className="font-semibold text-[11px] text-text-primary">Cafeteria Manager</div>
                <div className="text-[10px] text-text-muted">Dining service operations</div>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('staff@foodwise.ai', 'Staff@1234')}
                className="p-2 rounded-lg bg-background hover:bg-primary-light hover:text-primary border border-border text-left transition-colors"
              >
                <div className="font-semibold text-[11px] text-text-primary">Staff Member</div>
                <div className="text-[10px] text-text-muted">Plate scanning & auditing</div>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('researcher@foodwise.ai', 'Research@1234')}
                className="p-2 rounded-lg bg-background hover:bg-primary-light hover:text-primary border border-border text-left transition-colors"
              >
                <div className="font-semibold text-[11px] text-text-primary">Researcher</div>
                <div className="text-[10px] text-text-muted">Analytics & methodology</div>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-text-secondary">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              Register now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

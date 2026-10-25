'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, User, AlertCircle, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      router.push('/admin');
      router.refresh();
    } catch (err: unknown) {
      setStatus('error');
      setErrorMsg((err as Error).message || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#E9EDE4] border border-[#D9DCD2] p-8 rounded-sm space-y-6 shadow-sm">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded bg-[#285748] text-[#F7F5EF] flex items-center justify-center mx-auto">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-2xl font-medium text-[#192B2A]">
            Researcher Administration
          </h1>
          <p className="text-xs text-[#52605A]">
            Authenticated portal for managing publications, consultations, and editorial inquiries.
          </p>
        </div>

        {status === 'error' && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="admin-username" className="block text-xs font-semibold text-[#192B2A] mb-1">
              Admin Username
            </label>
            <div className="relative">
              <input
                id="admin-username"
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full pl-9 pr-3 py-2 text-sm bg-[#F7F5EF] border border-[#D9DCD2] rounded text-[#192B2A] focus:border-[#285748]"
              />
              <User className="w-4 h-4 text-[#52605A] absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-xs font-semibold text-[#192B2A] mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm bg-[#F7F5EF] border border-[#D9DCD2] rounded text-[#192B2A] focus:border-[#285748]"
              />
              <Lock className="w-4 h-4 text-[#52605A] absolute left-3 top-2.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full py-2.5 text-sm font-semibold bg-[#285748] text-[#F7F5EF] rounded hover:bg-[#1e4337] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In to Admin</span>
            )}
          </button>
        </form>

        <div className="border-t border-[#D9DCD2] pt-4 text-center">
          <p className="text-[11px] text-[#718079]">
            Initial credentials configured via CLI bootstrap: <code className="bg-[#DCE3D7] px-1 py-0.5 rounded">npm run admin:bootstrap</code>
          </p>
        </div>
      </div>
    </div>
  );
}

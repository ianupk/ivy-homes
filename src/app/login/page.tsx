'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { KeyRound, Mail, Lock, CheckCircle2, AlertCircle, ArrowRight, MapPin, Heart, Home } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { user, login, logout, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await login(cleanEmail, password);
      router.push('/listings');
    } catch (err: any) {
      setError(err.message || 'Sign in failed. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sign In</h1>
          <p className="text-xs text-slate-500">
            Access your verified properties, saved collections, and personalized market insights.
          </p>
        </div>

        {user ? (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-3">
              <div className="flex items-center space-x-2 font-bold text-sm text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Active Session</span>
              </div>
              <div className="space-y-1 text-slate-700">
                <p>
                  Signed in as: <strong className="text-slate-900 font-semibold">{user.email}</strong>
                </p>
                {user.assigned_locality && (
                  <p className="flex items-center text-emerald-700 font-medium capitalize">
                    <MapPin className="w-3.5 h-3.5 mr-1 shrink-0" />
                    Assigned Locality: {user.assigned_locality}{user.city ? `, ${user.city}` : ''}
                  </p>
                )}
              </div>
              <div className="pt-2 border-t border-emerald-200/60 text-[11px] text-emerald-700 flex items-center justify-between">
                <span>Token status: Auto-refresh active</span>
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                href="/listings"
                className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Browse Listings</span>
              </Link>
              <Link
                href="/favourites"
                className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
              >
                <Heart className="w-3.5 h-3.5 text-red-500" />
                <span>Saved Homes</span>
              </Link>
            </div>

            <button
              onClick={() => logout()}
              className="w-full py-2.5 px-4 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition"
            >
              Sign Out / Switch Account
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-sm transition disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {submitting ? (
                <span>Signing In...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

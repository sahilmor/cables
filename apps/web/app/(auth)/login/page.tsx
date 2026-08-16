'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Cpu, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signInWithEmail } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);
    try {
      await signInWithEmail(email, password);
      router.push('/custom-cable');
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (roleEmail: string) => {
    setEmail(roleEmail);
    setLoading(true);
    try {
      await signInWithEmail(roleEmail, 'password123');
      router.push(roleEmail.includes('admin') ? '/admin' : roleEmail.includes('manuf') ? '/admin/manufacturing' : '/custom-cable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-slate-800 bg-slate-900/80">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mb-2">
            <Cpu className="h-6 w-6 text-blue-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
          <CardDescription>
            Enter your credentials to access your saved custom cables and orders
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input
                  type="email"
                  placeholder="engineer@company.com"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300">Password</label>
                <Link href="/forgot-password" className="text-xs text-blue-400 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="pl-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full gap-2" disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {/* Quick Demo Access Buttons */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                Demo Credentials:
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('customer@cablecraft.io')}
                className="p-2 rounded bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition text-center"
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('manufacturing@cablecraft.io')}
                className="p-2 rounded bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-amber-300 hover:text-amber-200 transition text-center"
              >
                Shop Floor
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin@cablecraft.io')}
                className="p-2 rounded bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-purple-300 hover:text-purple-200 transition text-center"
              >
                Admin
              </button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center border-t border-slate-800/50 pt-4 text-xs text-slate-400">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="ml-1 text-blue-400 hover:underline">
            Sign up
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Cpu, Lock, Mail, User, ArrowRight } from 'lucide-react';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signUpWithEmail } = useAuth();
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);
    try {
      await signUpWithEmail(email, password, fullName);
      router.push('/custom-cable');
    } catch (err: any) {
      setError(err?.message || 'Registration failed');
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
          <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
          <CardDescription>
            Join CableCraft to save pin wiring layouts and place custom fabrication orders
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Full Name / Company</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input
                  type="text"
                  placeholder="Sahil Mor"
                  className="pl-9"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Work Email</label>
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
              <label className="text-xs font-medium text-slate-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input
                  type="password"
                  placeholder="At least 8 characters"
                  className="pl-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button type="submit" className="w-full gap-2" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center border-t border-slate-800/50 pt-4 text-xs text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="ml-1 text-blue-400 hover:underline">
            Sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

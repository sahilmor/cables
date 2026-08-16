'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, CheckCircle2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password === confirmPassword) {
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    }
  };

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-slate-800 bg-slate-900/80">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">New Password</CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>

        <CardContent>
          {success ? (
            <div className="text-center py-4 space-y-3">
              <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <p className="text-sm text-slate-300">
                Password updated successfully! Redirecting to login...
              </p>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="pl-9"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="pl-9"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full">
                Update Password
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex justify-center border-t border-slate-800/50 pt-4 text-xs text-slate-400">
          <Link href="/login" className="text-blue-400 hover:underline">
            Back to Sign In
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

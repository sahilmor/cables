'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Shield, Mail, Key, Sparkles, Check } from 'lucide-react';

export default function AccountPage() {
  const { user, switchDemoRole } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || 'Sahil Mor');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="container mx-auto px-4 sm:px-8 py-10 max-w-4xl space-y-8">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Account & Profile</h1>
        <p className="text-xs text-slate-400 mt-1">Manage credentials, permissions, and demo role simulator</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-slate-800 bg-slate-900/80">
            <CardHeader>
              <CardTitle className="text-base text-white">Profile Details</CardTitle>
              <CardDescription>Update your name and contact info for order dispatch notices</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Full Name</label>
                  <Input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Email Address</label>
                  <Input
                    type="email"
                    value={user?.email || 'customer@cablecraft.io'}
                    disabled
                    className="opacity-70 bg-slate-950"
                  />
                </div>

                <Button type="submit" size="sm" className="gap-1.5">
                  {saved ? (
                    <>
                      <Check className="h-4 w-4" />
                      Saved Successfully
                    </>
                  ) : (
                    'Update Profile'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Role & Permissions Panel */}
        <div className="space-y-6">
          <Card className="border-slate-800 bg-slate-900/80">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-400" />
                <CardTitle className="text-base text-white">Role Simulator</CardTitle>
              </div>
              <CardDescription>Switch active role to explore role-protected features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 font-mono block">CURRENT ACTIVE ROLE</span>
                <Badge
                  variant={
                    user?.role === 'ADMIN'
                      ? 'destructive'
                      : user?.role === 'MANUFACTURING'
                      ? 'warning'
                      : 'info'
                  }
                  className="font-mono text-xs"
                >
                  {user?.role || 'CUSTOMER'}
                </Badge>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => switchDemoRole('CUSTOMER')}
                  className={`w-full p-2.5 rounded-lg border text-left text-xs transition ${
                    user?.role === 'CUSTOMER'
                      ? 'border-blue-500 bg-blue-950/30 text-white'
                      : 'border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="font-semibold">Customer Role</div>
                  <div className="text-[11px] text-slate-400">Configure, save, order custom & standard cables</div>
                </button>

                <button
                  type="button"
                  onClick={() => switchDemoRole('MANUFACTURING')}
                  className={`w-full p-2.5 rounded-lg border text-left text-xs transition ${
                    user?.role === 'MANUFACTURING'
                      ? 'border-amber-500 bg-amber-950/30 text-white'
                      : 'border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="font-semibold text-amber-300">Manufacturing Role</div>
                  <div className="text-[11px] text-slate-400">Access shop floor queue, inspect continuity specs</div>
                </button>

                <button
                  type="button"
                  onClick={() => switchDemoRole('ADMIN')}
                  className={`w-full p-2.5 rounded-lg border text-left text-xs transition ${
                    user?.role === 'ADMIN'
                      ? 'border-purple-500 bg-purple-950/30 text-white'
                      : 'border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="font-semibold text-purple-300">Admin Role</div>
                  <div className="text-[11px] text-slate-400">Manage connectors, pins, compatibility, and pricing</div>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

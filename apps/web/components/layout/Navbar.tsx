'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sliders,
  ShoppingBag,
  Cpu,
  Layers,
  User,
  ShieldAlert,
  Wrench,
  LogOut,
  Sparkles,
  Bell,
  CheckCircle2,
  Info,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { user, token, signOut, switchDemoRole } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    async function loadNotifs() {
      try {
        const data = await apiClient<any[]>('/notifications', {
          token: token || undefined,
        });
        setNotifications(data);
      } catch {
        // Default fallback notifications
        setNotifications([
          {
            id: 'n1',
            title: 'Welcome to CableCraft',
            message: 'Visual React Flow custom wiring builder active.',
            type: 'INFO',
            isRead: false,
          },
        ]);
      }
    }
    loadNotifs();
  }, [token]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-[#0b0f17]/85 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 font-bold tracking-wider text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-md shadow-blue-500/25">
              <Cpu className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg">
              CABLE<span className="text-blue-500">CRAFT</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-300">
            <Link
              href="/custom-cable"
              className={`flex items-center gap-1.5 transition hover:text-white ${
                pathname.startsWith('/custom-cable') ? 'text-blue-400 font-semibold' : ''
              }`}
            >
              <Sliders className="h-4 w-4 text-blue-400" />
              <span>Configurator</span>
              <Badge variant="success" className="ml-1 text-[10px] px-1.5 py-0">PRO</Badge>
            </Link>
            <Link
              href="/products"
              className={`transition hover:text-white ${
                pathname.startsWith('/products') ? 'text-blue-400 font-semibold' : ''
              }`}
            >
              Standard Cables
            </Link>
            <Link
              href="/saved-cables"
              className={`transition hover:text-white ${
                pathname.startsWith('/saved-cables') ? 'text-blue-400 font-semibold' : ''
              }`}
            >
              My Saved Cables
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Demo Role Switcher */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
            <span className="text-slate-500 px-1.5 font-mono">Role:</span>
            <button
              onClick={() => switchDemoRole('CUSTOMER')}
              className={`px-2 py-0.5 rounded transition ${
                user?.role === 'CUSTOMER' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Customer
            </button>
            <button
              onClick={() => switchDemoRole('MANUFACTURING')}
              className={`px-2 py-0.5 rounded transition ${
                user?.role === 'MANUFACTURING' ? 'bg-amber-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Manufacturing
            </button>
            <button
              onClick={() => switchDemoRole('ADMIN')}
              className={`px-2 py-0.5 rounded transition ${
                user?.role === 'ADMIN' ? 'bg-purple-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Admin
            </button>
          </div>

          {user?.role === 'ADMIN' && (
            <Link href="/admin">
              <Button variant="outline" size="sm" className="gap-1.5 border-purple-500/30 text-purple-300 hover:bg-purple-500/10">
                <ShieldAlert className="h-4 w-4 text-purple-400" />
                <span>Admin</span>
              </Button>
            </Link>
          )}

          {user?.role === 'MANUFACTURING' && (
            <Link href="/admin/manufacturing">
              <Button variant="outline" size="sm" className="gap-1.5 border-amber-500/30 text-amber-300 hover:bg-amber-500/10">
                <Wrench className="h-4 w-4 text-amber-400" />
                <span>Shop Floor</span>
              </Button>
            </Link>
          )}

          {/* Notifications Dropdown */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative text-slate-300 hover:text-white"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-slate-900" />
              )}
            </Button>

            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-900 border border-slate-800 p-4 shadow-2xl space-y-3 z-50">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-semibold text-white">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] text-blue-400 hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-lg text-xs space-y-1 ${
                        n.isRead ? 'bg-slate-950/40 text-slate-400' : 'bg-blue-950/20 text-slate-200 border border-blue-500/20'
                      }`}
                    >
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <Info className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                        <span>{n.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative text-slate-300 hover:text-white" title="Cart">
              <ShoppingBag className="h-5 w-5" />
            </Button>
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <Link href="/account">
                <Button variant="ghost" size="sm" className="gap-2 text-slate-300 hover:text-white">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline-block max-w-[100px] truncate text-xs">
                    {user.fullName || user.email.split('@')[0]}
                  </span>
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => signOut()} title="Sign out">
                <LogOut className="h-4 w-4 text-slate-400" />
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button size="sm" variant="default" className="gap-1.5">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

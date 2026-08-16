'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Package,
  ArrowRight,
  Clock,
  CheckCircle2,
  Cpu,
  Truck,
  Wrench,
  Sliders,
} from 'lucide-react';

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'PAID':
    case 'CONFIRMED':
      return <Badge variant="success">PAID & CONFIRMED</Badge>;
    case 'MANUFACTURING':
      return <Badge variant="warning" className="animate-pulse">FABRICATION IN PROGRESS</Badge>;
    case 'QUALITY_CHECK':
      return <Badge variant="info">QUALITY INSPECTION</Badge>;
    case 'READY_TO_SHIP':
    case 'SHIPPED':
      return <Badge variant="default" className="bg-blue-600">DISPATCHED</Badge>;
    case 'DELIVERED':
      return <Badge variant="success">DELIVERED</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export default function OrdersPage() {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await apiClient<any[]>('/orders', {
          token: token || undefined,
        });
        setOrders(data);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-8 py-10 max-w-5xl space-y-8">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Order History</h1>
          <p className="text-xs text-slate-400 mt-1">Track manufacturing status and wiring specs</p>
        </div>
        <Link href="/custom-cable">
          <Button variant="cyber" size="sm" className="gap-2">
            <Sliders className="h-4 w-4" />
            Build New Cable
          </Button>
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
          <div className="h-16 w-16 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
            <Package className="h-8 w-8" />
          </div>
          <h3 className="text-base font-semibold text-white">No orders placed yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Design your first precision cable assembly using our visual wiring builder.
          </p>
          <Link href="/custom-cable">
            <Button variant="default" size="sm" className="mt-2">
              Launch Configurator
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card
              key={order.id}
              className="border-slate-800 bg-slate-900/70 hover:border-slate-700 transition"
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-base text-white">
                        {order.orderNumber}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-xs text-slate-400">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-500 uppercase block font-mono">Total Paid</span>
                    <span className="text-lg font-mono font-bold text-blue-400">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Items summary */}
                <div className="divide-y divide-slate-800/60 text-xs">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={item.itemType === 'CUSTOM_CABLE' ? 'info' : 'secondary'}
                          className="text-[9px] font-mono"
                        >
                          {item.itemType === 'CUSTOM_CABLE' ? 'CUSTOM' : 'STANDARD'}
                        </Badge>
                        <span className="text-slate-200 font-medium">{item.title}</span>
                        <span className="text-slate-500 font-mono">x{item.quantity}</span>
                      </div>
                      <span className="font-mono text-slate-300">
                        {formatCurrency(item.totalPrice)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-end">
                  <Link href={`/orders/${order.id}`}>
                    <Button variant="outline" size="sm" className="gap-2 border-slate-700 hover:bg-slate-800">
                      <span>View Full Tracking & Wiring Spec</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

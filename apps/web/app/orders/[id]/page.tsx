'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  Package,
  Wrench,
  ShieldCheck,
  Truck,
  Download,
  ArrowLeft,
  Cpu,
  Clock,
} from 'lucide-react';

const steps = [
  { key: 'PAID', label: 'Order Paid & Verified', icon: CheckCircle2 },
  { key: 'MANUFACTURING', label: 'Bench Fabrication', icon: Wrench },
  { key: 'QUALITY_CHECK', label: '100% Continuity QA', icon: ShieldCheck },
  { key: 'READY_TO_SHIP', label: 'Dispatched & Shipping', icon: Truck },
];

export default function OrderDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { token } = useAuth();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      try {
        const data = await apiClient<any>(`/orders/${id}`, {
          token: token || undefined,
        });
        setOrder(data);
      } catch (err) {
        console.error('Failed to load order details:', err);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadOrder();
  }, [id, token]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Order Not Found</h2>
        <Link href="/orders">
          <Button variant="outline">Back to Orders</Button>
        </Link>
      </div>
    );
  }

  const customItems = (order.items || []).filter((i: any) => i.itemType === 'CUSTOM_CABLE');
  const standardItems = (order.items || []).filter((i: any) => i.itemType === 'STANDARD_PRODUCT');
  const job = order.manufacturingJobs?.[0];

  const getStepStatus = (stepKey: string) => {
    const statusOrder = ['PENDING_PAYMENT', 'PAID', 'CONFIRMED', 'MANUFACTURING', 'QUALITY_CHECK', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED'];
    const currentIndex = statusOrder.indexOf(order.status);
    const stepIndex = statusOrder.indexOf(stepKey);
    return currentIndex >= stepIndex;
  };

  return (
    <div className="container mx-auto px-4 sm:px-8 py-10 max-w-5xl space-y-8">
      <Link
        href="/orders"
        className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        BACK TO ORDERS
      </Link>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white font-mono">{order.orderNumber}</h1>
            <Badge variant="success" className="text-xs font-mono">
              {order.status}
            </Badge>
          </div>
          <p className="text-xs text-slate-400">
            Placed on {new Date(order.createdAt).toLocaleString('en-IN')}
          </p>
        </div>

        {job && (
          <a
            href={`http://localhost:4000/api/manufacturing/jobs/${job.id}/pdf`}
            target="_blank"
            rel="noreferrer"
          >
            <Button variant="outline" size="sm" className="gap-2 border-slate-700 hover:bg-slate-800">
              <Download className="h-4 w-4 text-blue-400" />
              <span>Download Wiring Spec PDF</span>
            </Button>
          </a>
        )}
      </div>

      {/* Production Pipeline Steps */}
      <Card className="border-slate-800 bg-slate-900/70">
        <CardHeader className="border-b border-slate-800 pb-3">
          <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-400" />
            Manufacturing & Delivery Progression
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {steps.map((s, idx) => {
              const isPassed = getStepStatus(s.key);
              const Icon = s.icon;

              return (
                <div
                  key={s.key}
                  className={`p-4 rounded-xl border transition ${
                    isPassed
                      ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300'
                      : 'border-slate-800 bg-slate-950/40 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`h-4 w-4 ${isPassed ? 'text-emerald-400' : 'text-slate-600'}`} />
                    <span className="text-[10px] font-mono font-bold uppercase">STEP {idx + 1}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-200">{s.label}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Custom Cable Immutable Snapshots */}
      {customItems.map((item: any) => {
        const snap = item.customCableSnapshot || {};
        const c1 = snap.connector1 || {};
        const c2 = snap.connector2 || {};
        const phys = snap.cablePhysicalSpecs || {};
        const pinMapping = snap.pinMapping || [];

        return (
          <Card key={item.id} className="border-slate-800 bg-slate-900/80">
            <CardHeader className="border-b border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-400 text-xs font-mono">
                  <Cpu className="h-4 w-4" />
                  <span>FROZEN PRODUCTION SPECIFICATION SNAPSHOT</span>
                </div>
                <Badge variant="outline" className="font-mono text-xs">
                  QTY: {item.quantity}
                </Badge>
              </div>
              <CardTitle className="text-lg text-white mt-1">{item.title}</CardTitle>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              {/* Physical details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">FINISHED LENGTH</span>
                  <span className="font-mono font-bold text-white">{phys.finishedLengthMeters}m</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">CUT LENGTH (STRIP INCL.)</span>
                  <span className="font-mono font-bold text-slate-300">{phys.manufacturingCutLengthMeters}m</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">RAW CONDUCTOR</span>
                  <span className="font-mono font-bold text-white truncate block">{phys.type}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">SHIELDING / GAUGE</span>
                  <span className="font-mono font-semibold text-slate-200">{phys.gaugeAWG} AWG</span>
                </div>
              </div>

              {/* Pin mapping matrix */}
              <div>
                <h4 className="text-xs font-mono font-semibold text-slate-300 uppercase mb-3">
                  Shop Floor Continuity Map ({pinMapping.length} Wires)
                </h4>

                <div className="rounded-lg border border-slate-800 overflow-hidden text-xs">
                  <div className="grid grid-cols-12 bg-slate-950 p-2.5 font-mono text-slate-400 border-b border-slate-800 text-[11px]">
                    <div className="col-span-1">#</div>
                    <div className="col-span-4">End 1 ({c1.name})</div>
                    <div className="col-span-3">Conductor Color</div>
                    <div className="col-span-4">End 2 ({c2.name})</div>
                  </div>

                  <div className="divide-y divide-slate-800/60 max-h-56 overflow-y-auto">
                    {pinMapping.map((conn: any, idx: number) => (
                      <div key={idx} className="grid grid-cols-12 p-2.5 items-center hover:bg-slate-800/40 text-slate-300">
                        <div className="col-span-1 font-mono text-slate-500">{idx + 1}</div>
                        <div className="col-span-4 font-medium text-white truncate">
                          Pin {conn.sourcePinNumber}: {conn.sourcePinName}
                        </div>
                        <div className="col-span-3 flex items-center gap-1.5 font-mono text-[11px]">
                          <span
                            className="h-2.5 w-2.5 rounded-full border border-slate-700"
                            style={{ backgroundColor: conn.wireColor || '#3B82F6' }}
                          />
                          <span>{conn.wireColor || '#3B82F6'}</span>
                        </div>
                        <div className="col-span-4 font-medium text-white truncate">
                          Pin {conn.targetPinNumber}: {conn.targetPinName}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Shipping and Billing Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-white">Shipping Address</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-300 space-y-1">
            <p className="font-semibold text-white">{order.shippingAddress?.street}</p>
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}</p>
            <p>{order.shippingAddress?.country}</p>
            <p className="text-slate-400 pt-1">Phone: {order.shippingAddress?.phone}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-white">Payment Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal:</span>
              <span className="font-mono text-white">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>GST (18%):</span>
              <span className="font-mono text-white">{formatCurrency(order.taxAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Shipping Fee:</span>
              <span className="font-mono text-emerald-400">
                {Number(order.shippingFee) === 0 ? 'FREE' : formatCurrency(order.shippingFee)}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm text-white">
              <span>Total Paid:</span>
              <span className="font-mono text-blue-400">{formatCurrency(order.totalAmount)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

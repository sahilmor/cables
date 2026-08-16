'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ShoppingBag,
  Trash2,
  Cpu,
  ArrowRight,
  Sliders,
  Eye,
  Edit,
  ShieldCheck,
  X,
} from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [previewCustomCable, setPreviewCustomCable] = useState<any | null>(null);

  const loadCart = async () => {
    try {
      const data = await apiClient<any>('/cart', {
        token: token || undefined,
      });
      setCart(data);
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, [token]);

  const handleUpdateQuantity = async (itemId: string, newQty: number) => {
    try {
      await apiClient(`/cart/items/${itemId}`, {
        method: 'PATCH',
        token: token || undefined,
        body: JSON.stringify({ quantity: newQty }),
      });
      loadCart();
    } catch (err) {
      console.error('Update qty failed:', err);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await apiClient(`/cart/items/${itemId}`, {
        method: 'DELETE',
        token: token || undefined,
      });
      loadCart();
    } catch (err) {
      console.error('Remove item failed:', err);
    }
  };

  const subtotal = cart?.items?.reduce(
    (acc: number, item: any) => acc + Number(item.totalPrice),
    0,
  ) || 0;
  const tax = Math.round(subtotal * 0.18 * 100) / 100;
  const shipping = subtotal >= 2500 || subtotal === 0 ? 0 : 120;
  const total = subtotal + tax + shipping;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const items = cart?.items || [];

  return (
    <div className="container mx-auto px-4 sm:px-8 py-10 max-w-5xl space-y-8">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Shopping Cart</h1>
          <p className="text-xs text-slate-400 mt-1">Review standard and custom cable items</p>
        </div>
        <Badge variant="secondary" className="font-mono">
          {items.length} {items.length === 1 ? 'Item' : 'Items'}
        </Badge>
      </div>

      {items.length === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
          <div className="h-16 w-16 mx-auto rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold text-white">Your cart is empty</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Design a precision custom cable with our visual pin configurator or browse standard cables.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link href="/custom-cable">
              <Button variant="cyber" size="sm" className="gap-2">
                <Sliders className="h-4 w-4" />
                Launch Custom Cable Builder
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="outline" size="sm">
                Browse Standard Products
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item: any) => {
              const isCustom = !!item.customCableId;
              const cc = item.customCable;
              const prod = item.product;

              return (
                <div
                  key={item.id}
                  className="p-5 rounded-xl border border-slate-800 bg-slate-900/70 backdrop-blur space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="h-14 w-14 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 shrink-0 overflow-hidden">
                        {isCustom ? (
                          <div className="h-full w-full bg-blue-950/40 flex items-center justify-center text-blue-400">
                            <Sliders className="h-6 w-6" />
                          </div>
                        ) : prod?.images?.[0]?.url ? (
                          <img
                            src={prod.images[0].url}
                            alt={prod.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Cpu className="h-6 w-6 text-slate-500" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={isCustom ? 'info' : 'secondary'}
                            className="text-[10px] font-mono"
                          >
                            {isCustom ? 'CUSTOM FABRICATION' : 'STANDARD CABLE'}
                          </Badge>
                        </div>
                        <h4 className="text-sm font-semibold text-white">
                          {isCustom
                            ? `${cc?.connector1?.name} → ${cc?.connector2?.name} (${cc?.lengthMeters}m)`
                            : prod?.name}
                        </h4>
                        <p className="text-xs text-slate-400">
                          {isCustom
                            ? `${cc?.cableType?.name || 'Shielded'} • ${cc?.connections?.length || 0} Pin Connections`
                            : `SKU: ${prod?.sku}`}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-slate-500 hover:text-red-400 transition p-1"
                      title="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Custom Cable Action Bar (View pinout, Edit wiring) */}
                  {isCustom && (
                    <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewCustomCable(cc)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 font-mono text-[11px] transition"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View Wiring Pinout
                        </button>

                        <Link
                          href={`/custom-cable/${cc.id}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-mono text-[11px] transition"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          Edit Wiring
                        </Link>
                      </div>

                      <span className="font-mono text-emerald-400 text-[11px]">
                        ✓ Electrical Rule Verified
                      </span>
                    </div>
                  )}

                  {/* Quantity and Price */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center rounded-lg border border-slate-700 bg-slate-950">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="px-2.5 py-1 text-slate-400 hover:text-white transition"
                        >
                          -
                        </button>
                        <span className="px-2.5 font-mono text-xs font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="px-2.5 py-1 text-slate-400 hover:text-white transition"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">
                        @ {formatCurrency(item.unitPrice)} each
                      </span>
                    </div>

                    <span className="font-mono font-bold text-base text-white">
                      {formatCurrency(item.totalPrice)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary & Checkout */}
          <div className="space-y-6">
            <Card className="border-slate-800 bg-slate-900/90 sticky top-24">
              <CardHeader className="border-b border-slate-800 pb-4">
                <CardTitle className="text-lg text-white">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4 text-xs">
                <div className="space-y-2.5 divide-y divide-slate-800/80">
                  <div className="flex justify-between text-slate-400 pt-1">
                    <span>Subtotal</span>
                    <span className="font-mono text-white">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 pt-2.5">
                    <span>GST (18%)</span>
                    <span className="font-mono text-white">{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 pt-2.5">
                    <span>Shipping</span>
                    <span className="font-mono text-emerald-400">
                      {shipping === 0 ? 'FREE' : formatCurrency(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline pt-4 text-base font-bold text-white">
                    <span>Total Amount</span>
                    <span className="font-mono text-xl text-blue-400">{formatCurrency(total)}</span>
                  </div>
                </div>

                <Link href="/checkout" className="block pt-2">
                  <Button variant="cyber" className="w-full h-11 text-sm font-semibold gap-2">
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
                  <span>Secure Razorpay / UPI Gateway</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Pinout Modal Preview */}
      {previewCustomCable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="h-5 w-5 text-blue-400" />
                <h3 className="font-semibold text-white text-base">
                  {previewCustomCable.name} Wiring Specification
                </h3>
              </div>
              <button
                onClick={() => setPreviewCustomCable(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div>
                <span className="text-slate-500 font-mono">END 1:</span>{' '}
                <span className="font-semibold text-white">{previewCustomCable.connector1?.name}</span>
              </div>
              <div>
                <span className="text-slate-500 font-mono">END 2:</span>{' '}
                <span className="font-semibold text-white">{previewCustomCable.connector2?.name}</span>
              </div>
              <div>
                <span className="text-slate-500 font-mono">LENGTH:</span>{' '}
                <span className="font-semibold text-white">{previewCustomCable.lengthMeters} meters</span>
              </div>
              <div>
                <span className="text-slate-500 font-mono">CONDUCTOR:</span>{' '}
                <span className="font-semibold text-white">{previewCustomCable.cableType?.name}</span>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto divide-y divide-slate-800 text-xs">
              {(previewCustomCable.connections || []).map((c: any, i: number) => (
                <div key={i} className="py-2 flex items-center justify-between font-mono">
                  <span className="text-slate-200">
                    Pin {c.sourcePin?.pinNumber} ({c.sourcePin?.name})
                  </span>
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold text-white"
                    style={{ backgroundColor: c.wireColor || '#3B82F6' }}
                  >
                    ───────
                  </span>
                  <span className="text-slate-200">
                    Pin {c.targetPin?.pinNumber} ({c.targetPin?.name})
                  </span>
                </div>
              ))}
            </div>

            <Button
              className="w-full"
              variant="outline"
              onClick={() => setPreviewCustomCable(null)}
            >
              Close Preview
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

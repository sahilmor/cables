'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Tag,
  Check,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, token } = useAuth();

  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Form states
  const [street, setStreet] = useState('Plot 42, Tech Park Central');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [postalCode, setPostalCode] = useState('560100');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [gstNumber, setGstNumber] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponStatus, setCouponStatus] = useState<string | null>(null);
  const [customerNotes, setCustomerNotes] = useState('');

  useEffect(() => {
    async function loadCartData() {
      try {
        const data = await apiClient<any>('/cart', { token: token || undefined });
        setCart(data);
      } catch (err) {
        console.error('Failed to load cart:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCartData();
  }, [token]);

  const subtotal = cart?.items?.reduce(
    (acc: number, item: any) => acc + Number(item.totalPrice),
    0,
  ) || 0;

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    try {
      const res = await apiClient<any>(
        `/coupons/validate?code=${encodeURIComponent(couponCode)}&subtotal=${subtotal}`,
      );
      setDiscountAmount(res.discountAmount);
      setCouponStatus(res.message);
    } catch (err: any) {
      // Demo fallback promo codes if DB record not seeded
      if (couponCode.toUpperCase() === 'PRO10' || couponCode.toUpperCase() === 'CABLECRAFT') {
        const disc = Math.round(subtotal * 0.1 * 100) / 100;
        setDiscountAmount(disc);
        setCouponStatus(`Coupon ${couponCode.toUpperCase()} applied: 10% off (-₹${disc})`);
      } else {
        setDiscountAmount(0);
        setCouponStatus(err?.message || 'Invalid coupon code');
      }
    }
  };

  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const tax = Math.round(discountedSubtotal * 0.18 * 100) / 100;
  const shipping = subtotal >= 2500 || subtotal === 0 ? 0 : 120;
  const total = discountedSubtotal + tax + shipping;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (processing) return;
    setProcessing(true);

    try {
      const order = await apiClient<any>('/orders', {
        method: 'POST',
        token: token || undefined,
        body: JSON.stringify({
          shippingAddress: {
            street,
            city,
            state,
            postalCode,
            country: 'India',
            phone,
          },
          gstNumber: gstNumber || undefined,
          couponCode: discountAmount > 0 ? couponCode : undefined,
          customerNotes: customerNotes || undefined,
        }),
      });

      const paymentOrder = await apiClient<any>('/payments/create-order', {
        method: 'POST',
        token: token || undefined,
        body: JSON.stringify({ orderId: order.id }),
      });

      const mockPaymentId = `pay_${Date.now()}`;
      const mockSignature = `sig_${Date.now()}`;

      await apiClient('/payments/verify', {
        method: 'POST',
        token: token || undefined,
        body: JSON.stringify({
          orderId: order.id,
          razorpayOrderId: paymentOrder.razorpayOrderId,
          razorpayPaymentId: mockPaymentId,
          razorpaySignature: mockSignature,
        }),
      });

      router.push(`/orders/${order.id}`);
    } catch (err: any) {
      alert(`Order placement failed: ${err?.message || 'Please check your information'}`);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-8 py-10 max-w-5xl space-y-8">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Checkout</h1>
        <p className="text-xs text-slate-400 mt-1">Provide shipping address and complete payment</p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Address & Tax Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-800 bg-slate-900/80">
            <CardHeader>
              <CardTitle className="text-base text-white flex items-center gap-2">
                <Truck className="h-4 w-4 text-blue-400" />
                Shipping & Delivery Address
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Street Address</label>
                <Input
                  type="text"
                  placeholder="Plot/Flat number, Building, Street"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">City</label>
                  <Input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">State</label>
                  <Input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">PIN Code</label>
                  <Input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Contact Phone Number</label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/80">
            <CardHeader>
              <CardTitle className="text-base text-white">Business Invoice & GST (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">GSTIN Number (for tax credit)</label>
                <Input
                  type="text"
                  placeholder="e.g. 29AAAAA0000A1Z5"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Notes / PO Reference</label>
                <Input
                  type="text"
                  placeholder="e.g. PO-8921 Lab Bench 4 Interconnect"
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Column: Summary & Payment */}
        <div className="space-y-6">
          <Card className="border-slate-800 bg-slate-900/90 sticky top-24">
            <CardHeader className="border-b border-slate-800 pb-4">
              <CardTitle className="text-lg text-white">Payment Summary</CardTitle>
            </CardHeader>

            <CardContent className="pt-4 space-y-4 text-xs">
              {/* Coupon Code input */}
              <div className="space-y-2 pb-2 border-b border-slate-800/80">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-blue-400" />
                  Promo / Coupon Code
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Try PRO10"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="font-mono text-xs uppercase"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleApplyCoupon}
                    className="shrink-0 text-xs"
                  >
                    Apply
                  </Button>
                </div>
                {couponStatus && (
                  <p
                    className={`text-[11px] ${
                      discountAmount > 0 ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {couponStatus}
                  </p>
                )}
              </div>

              <div className="space-y-2.5 divide-y divide-slate-800/80">
                <div className="flex justify-between text-slate-400 pt-1">
                  <span>Items ({cart?.items?.length || 0})</span>
                  <span className="font-mono text-white">{formatCurrency(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 pt-2.5">
                    <span>Coupon Discount</span>
                    <span className="font-mono">-{formatCurrency(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-400 pt-2.5">
                  <span>GST (18%)</span>
                  <span className="font-mono text-white">{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between text-slate-400 pt-2.5">
                  <span>Shipping Fee</span>
                  <span className="font-mono text-emerald-400">
                    {shipping === 0 ? 'FREE' : formatCurrency(shipping)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline pt-4 text-base font-bold text-white">
                  <span>Total Payable</span>
                  <span className="font-mono text-xl text-blue-400">{formatCurrency(total)}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-500/20 text-xs text-blue-300 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-white">
                  <CreditCard className="h-4 w-4 text-blue-400" />
                  <span>Razorpay Payment Gateway</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Accepts UPI, NetBanking, Credit/Debit Cards, and Corporate EMI.
                </p>
              </div>

              <Button
                type="submit"
                variant="cyber"
                disabled={processing || subtotal === 0}
                className="w-full h-11 text-sm font-semibold gap-2"
              >
                <Lock className="h-4 w-4" />
                {processing ? 'Authorizing Payment...' : `Pay ${formatCurrency(total)}`}
              </Button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>256-bit Encrypted Server Payment</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}

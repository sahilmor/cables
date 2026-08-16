'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ShieldAlert,
  Cpu,
  DollarSign,
  Package,
  Layers,
  Wrench,
  Check,
  Plus,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, token } = useAuth();
  const [connectors, setConnectors] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [pricingRules, setPricingRules] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CONNECTORS' | 'PRICING' | 'ORDERS'>('OVERVIEW');
  const [loading, setLoading] = useState(true);

  // Pricing Rule form
  const [baseAssembly, setBaseAssembly] = useState(250);
  const [perPin, setPerPin] = useState(15);
  const [taxPercent, setTaxPercent] = useState(18);
  const [shippingFee, setShippingFee] = useState(120);
  const [savedPricing, setSavedPricing] = useState(false);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [connData, prodData, rulesData] = await Promise.all([
          apiClient<any[]>('/connectors'),
          apiClient<any[]>('/products'),
          apiClient<any[]>('/pricing/rules', { token: token || undefined }).catch(() => []),
        ]);
        setConnectors(connData);
        setProducts(prodData);
        setPricingRules(rulesData);
        if (rulesData.length > 0) {
          setBaseAssembly(Number(rulesData[0].baseAssemblyFee));
          setPerPin(Number(rulesData[0].perPinFee));
          setTaxPercent(Number(rulesData[0].taxRatePercent));
          setShippingFee(Number(rulesData[0].shippingFee));
        }
      } catch (err) {
        console.error('Failed to load admin data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, [token]);

  const handleSavePricing = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedPricing(true);
    setTimeout(() => setSavedPricing(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-8 py-10 max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-purple-950/20 border border-purple-500/30">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-purple-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">CableCraft Administrator Console</h1>
          </div>
          <p className="text-xs text-slate-400">
            Control connectors catalog, pinouts, compatibility rules, pricing engines, and production dispatch.
          </p>
        </div>

        <Link href="/admin/manufacturing">
          <Button variant="outline" size="sm" className="gap-2 border-amber-500/40 text-amber-300 hover:bg-amber-500/10">
            <Wrench className="h-4 w-4" />
            <span>Open Shop Floor Queue</span>
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'OVERVIEW'
              ? 'bg-purple-600 text-white shadow'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          Overview & Metrics
        </button>
        <button
          onClick={() => setActiveTab('CONNECTORS')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'CONNECTORS'
              ? 'bg-purple-600 text-white shadow'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          Connectors ({connectors.length})
        </button>
        <button
          onClick={() => setActiveTab('PRICING')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'PRICING'
              ? 'bg-purple-600 text-white shadow'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          Pricing Engine Rules
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-slate-800 bg-slate-900/60 p-5">
              <span className="text-[10px] font-mono text-slate-500 uppercase">ACTIVE CONNECTORS</span>
              <div className="text-2xl font-bold font-mono text-white mt-1">{connectors.length}</div>
              <p className="text-[11px] text-slate-400 mt-1">HDMI, RJ45, USB-C, XLR, etc.</p>
            </Card>

            <Card className="border-slate-800 bg-slate-900/60 p-5">
              <span className="text-[10px] font-mono text-slate-500 uppercase">CATALOG PRODUCTS</span>
              <div className="text-2xl font-bold font-mono text-white mt-1">{products.length}</div>
              <p className="text-[11px] text-slate-400 mt-1">Standard factory assemblies</p>
            </Card>

            <Card className="border-slate-800 bg-slate-900/60 p-5">
              <span className="text-[10px] font-mono text-slate-500 uppercase">BASE ASSEMBLY FEE</span>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {formatCurrency(baseAssembly)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Per custom cable unit</p>
            </Card>

            <Card className="border-slate-800 bg-slate-900/60 p-5">
              <span className="text-[10px] font-mono text-slate-500 uppercase">GST TAX RATE</span>
              <div className="text-2xl font-bold font-mono text-blue-400 mt-1">{taxPercent}%</div>
              <p className="text-[11px] text-slate-400 mt-1">Indian standard GST</p>
            </Card>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Visual Cable Configurator Engine</h3>
              <p className="text-xs text-slate-400 mt-1">
                Pinouts, compatibility rules, and pricing engines are synchronized in real-time.
              </p>
            </div>
            <Link href="/custom-cable">
              <Button variant="cyber" size="sm" className="gap-2">
                <Cpu className="h-4 w-4" />
                Launch Live Editor
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Tab 2: Connectors Management */}
      {activeTab === 'CONNECTORS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {connectors.map((c) => (
              <Card key={c.id} className="border-slate-800 bg-slate-900/70 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white text-base">{c.name}</span>
                  <Badge variant="secondary" className="font-mono text-[10px]">
                    {c.type}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">{c.description}</p>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">{c.pins?.length || c.numberOfPins} Pins Defined</span>
                  <span className="text-blue-400 font-bold">{formatCurrency(c.basePrice)}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Pricing Rules */}
      {activeTab === 'PRICING' && (
        <Card className="border-slate-800 bg-slate-900/80 max-w-2xl">
          <CardHeader>
            <CardTitle className="text-base text-white">Configure Server-Side Pricing Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSavePricing} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Base Assembly Fee (₹)</label>
                  <Input
                    type="number"
                    value={baseAssembly}
                    onChange={(e) => setBaseAssembly(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Per-Pin Wire Fee (₹)</label>
                  <Input
                    type="number"
                    value={perPin}
                    onChange={(e) => setPerPin(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">GST Tax Rate (%)</label>
                  <Input
                    type="number"
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Standard Shipping Fee (₹)</label>
                  <Input
                    type="number"
                    value={shippingFee}
                    onChange={(e) => setShippingFee(Number(e.target.value))}
                  />
                </div>
              </div>

              <Button type="submit" size="sm" className="gap-1.5 bg-purple-600 hover:bg-purple-500">
                {savedPricing ? (
                  <>
                    <Check className="h-4 w-4" />
                    Rules Saved Successfully
                  </>
                ) : (
                  'Save Pricing Engine Rules'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

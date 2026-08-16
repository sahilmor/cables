'use client';

import React, { useState } from 'react';
import {
  ConnectorDto,
  CableTypeConfigDto,
  WireConnectionDto,
  PriceBreakdown,
  WiringValidationResult,
  JacketMaterial,
  CableShieldingType,
} from '@cables/types';
import { formatCurrency } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ShoppingBag,
  Bookmark,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Layers,
  ShieldCheck,
  FileText,
} from 'lucide-react';

interface ReviewStepProps {
  name: string;
  connector1: ConnectorDto;
  connector2: ConnectorDto;
  cableType: CableTypeConfigDto;
  lengthMeters: number;
  cableColor: string;
  jacketMaterial: JacketMaterial;
  shieldingType: CableShieldingType;
  connections: WireConnectionDto[];
  pricing: PriceBreakdown;
  validationResult: WiringValidationResult | null;
  notes: string;
  onAddToCart: () => Promise<void>;
  onSaveToLibrary: () => Promise<void>;
}

export function ReviewStep({
  name,
  connector1,
  connector2,
  cableType,
  lengthMeters,
  cableColor,
  jacketMaterial,
  shieldingType,
  connections,
  pricing,
  validationResult,
  notes,
  onAddToCart,
  onSaveToLibrary,
}: ReviewStepProps) {
  const [addingToCart, setAddingToCart] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const pinMap1 = new Map(connector1.pins.map((p) => [p.id, p]));
  const pinMap2 = new Map(connector2.pins.map((p) => [p.id, p]));

  const handleCartClick = async () => {
    setAddingToCart(true);
    try {
      await onAddToCart();
    } finally {
      setAddingToCart(false);
    }
  };

  const handleSaveClick = async () => {
    setSaving(true);
    try {
      await onSaveToLibrary();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const stripAllowanceCm = 6;
  const totalCutLength = (lengthMeters + (stripAllowanceCm * 2) / 100).toFixed(2);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Review & Authorize Build</h2>
        <p className="text-sm text-slate-400 mt-1">
          Verify electrical wiring pinout, conductor specifications, and authoritative price breakdown.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Technical Specification Document */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Harness Overview Card */}
          <Card className="border-slate-800 bg-slate-900/80">
            <CardHeader className="border-b border-slate-800 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-400 text-xs font-mono">
                  <ShieldCheck className="h-4 w-4" />
                  <span>SPECIFICATION ID: CC-{Math.floor(10000 + Math.random() * 90000)}</span>
                </div>
                <Badge
                  variant={validationResult?.isValid ? 'success' : 'warning'}
                  className="font-mono text-xs"
                >
                  {validationResult?.isValid ? 'VERIFIED PASSED' : 'UNVERIFIED'}
                </Badge>
              </div>
              <CardTitle className="text-xl mt-1 text-white">{name}</CardTitle>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              {/* Connector Endpoints Diagram */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">END 1 CONNECTOR</span>
                  <div className="font-semibold text-white text-sm flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-blue-400" />
                    {connector1.name}
                  </div>
                  <p className="text-xs text-slate-400">
                    {connector1.type} • {connector1.numberOfPins} Pins
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">END 2 CONNECTOR</span>
                  <div className="font-semibold text-white text-sm flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-emerald-400" />
                    {connector2.name}
                  </div>
                  <p className="text-xs text-slate-400">
                    {connector2.type} • {connector2.numberOfPins} Pins
                  </p>
                </div>
              </div>

              {/* Physical specs grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">FINISHED LENGTH</span>
                  <span className="font-mono font-bold text-white text-sm">{lengthMeters} m</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">CUT LENGTH</span>
                  <span className="font-mono font-bold text-slate-300 text-sm">{totalCutLength} m</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">CONDUCTOR GAUGE</span>
                  <span className="font-mono font-bold text-white text-sm">{cableType.gaugeAWG} AWG</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">JACKET / SHIELD</span>
                  <span className="font-mono font-semibold text-slate-200 truncate block">
                    {jacketMaterial} / {shieldingType.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Pin mapping breakdown table */}
              <div>
                <h4 className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-3">
                  PIN-TO-PIN CONTINUITY MATRIX ({connections.length} Terminations)
                </h4>

                <div className="rounded-lg border border-slate-800 overflow-hidden text-xs">
                  <div className="grid grid-cols-12 bg-slate-950 p-2.5 font-mono text-slate-400 border-b border-slate-800 text-[11px]">
                    <div className="col-span-1">#</div>
                    <div className="col-span-4">End 1 ({connector1.type})</div>
                    <div className="col-span-3">Conductor Color</div>
                    <div className="col-span-4">End 2 ({connector2.type})</div>
                  </div>

                  <div className="divide-y divide-slate-800/60 max-h-60 overflow-y-auto">
                    {connections.map((conn, idx) => {
                      const p1 = pinMap1.get(conn.sourcePinId);
                      const p2 = pinMap2.get(conn.targetPinId);

                      return (
                        <div
                          key={idx}
                          className="grid grid-cols-12 p-2.5 items-center hover:bg-slate-800/40 text-slate-300"
                        >
                          <div className="col-span-1 font-mono text-slate-500">{idx + 1}</div>
                          <div className="col-span-4 font-medium text-white truncate">
                            P{p1?.pinNumber}: {p1?.name}
                          </div>
                          <div className="col-span-3 flex items-center gap-1.5 font-mono text-[11px]">
                            <span
                              className="h-2.5 w-2.5 rounded-full border border-slate-700"
                              style={{ backgroundColor: conn.wireColor || p1?.color || '#3B82F6' }}
                            />
                            <span>{conn.wireColor || '#3B82F6'}</span>
                          </div>
                          <div className="col-span-4 font-medium text-white truncate">
                            P{p2?.pinNumber}: {p2?.name}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {notes && (
                <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800 text-xs">
                  <span className="text-slate-500 font-semibold block mb-1">Customer Manufacturing Notes:</span>
                  <p className="text-slate-300">{notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Column: Authoritative Server Price Breakdown & Checkout Actions */}
        <div className="space-y-6">
          <Card className="border-slate-800 bg-slate-900/90 sticky top-24">
            <CardHeader className="border-b border-slate-800 pb-4">
              <CardTitle className="text-lg text-white">Price Calculation</CardTitle>
            </CardHeader>

            <CardContent className="pt-4 space-y-4 text-xs">
              <div className="space-y-2.5 divide-y divide-slate-800/80">
                <div className="flex justify-between text-slate-400 pt-1">
                  <span>{connector1.name}</span>
                  <span className="font-mono text-white">{formatCurrency(pricing.connector1Price)}</span>
                </div>

                <div className="flex justify-between text-slate-400 pt-2.5">
                  <span>{connector2.name}</span>
                  <span className="font-mono text-white">{formatCurrency(pricing.connector2Price)}</span>
                </div>

                <div className="flex justify-between text-slate-400 pt-2.5">
                  <span>Raw Conductor ({lengthMeters}m @ {formatCurrency(cableType.pricePerMeter)}/m)</span>
                  <span className="font-mono text-white">{formatCurrency(pricing.lengthCost)}</span>
                </div>

                <div className="flex justify-between text-slate-400 pt-2.5">
                  <span>Fabrication & Pin Assembly ({connections.length} pins)</span>
                  <span className="font-mono text-white">{formatCurrency(pricing.assemblyFee)}</span>
                </div>

                <div className="flex justify-between text-slate-300 font-medium pt-2.5">
                  <span>Subtotal</span>
                  <span className="font-mono text-white">{formatCurrency(pricing.subtotal)}</span>
                </div>

                <div className="flex justify-between text-slate-400 pt-2.5">
                  <span>GST ({pricing.taxRatePercent}%)</span>
                  <span className="font-mono text-white">{formatCurrency(pricing.taxAmount)}</span>
                </div>

                <div className="flex justify-between text-slate-400 pt-2.5">
                  <span>Standard Shipping</span>
                  <span className="font-mono text-emerald-400">
                    {pricing.shippingFee === 0 ? 'FREE' : formatCurrency(pricing.shippingFee)}
                  </span>
                </div>

                <div className="flex justify-between items-baseline pt-4 text-base font-bold text-white">
                  <span>Authoritative Total</span>
                  <span className="font-mono text-xl text-blue-400">
                    {formatCurrency(pricing.total)}
                  </span>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <Button
                  type="button"
                  variant="cyber"
                  className="w-full h-11 text-sm font-semibold gap-2"
                  disabled={!validationResult?.isValid || addingToCart}
                  onClick={handleCartClick}
                >
                  <ShoppingBag className="h-4 w-4" />
                  {addingToCart ? 'Adding to Cart...' : 'Add Custom Cable to Cart'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2 border-slate-700 hover:bg-slate-800 text-slate-200"
                  disabled={saving}
                  onClick={handleSaveClick}
                >
                  <Bookmark className="h-4 w-4" />
                  {saving ? 'Saving...' : savedSuccess ? '✓ Saved to Library!' : 'Save Configuration'}
                </Button>
              </div>

              <p className="text-[11px] text-slate-500 text-center leading-relaxed">
                100% Guaranteed Pinout Continuity Tested before dispatch. Hand-assembled under IPC/WHMA-A-620 standards.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

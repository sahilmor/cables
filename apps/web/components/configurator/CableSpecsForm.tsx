'use client';

import React from 'react';
import { CableTypeConfigDto, JacketMaterial, CableShieldingType } from '@cables/types';
import { formatCurrency } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Layers, Shield, Sparkles, SlidersHorizontal, Ruler } from 'lucide-react';

interface CableSpecsFormProps {
  cableTypes: CableTypeConfigDto[];
  selectedCableTypeId: string;
  onSelectCableType: (id: string) => void;
  lengthMeters: number;
  onChangeLength: (length: number) => void;
  jacketMaterial: JacketMaterial;
  onChangeJacket: (material: JacketMaterial) => void;
  shieldingType: CableShieldingType;
  onChangeShielding: (shielding: CableShieldingType) => void;
  cableColor: string;
  onChangeColor: (color: string) => void;
  notes: string;
  onChangeNotes: (notes: string) => void;
}

const standardLengths = [0.5, 1, 1.5, 2, 3, 5, 10];

const jacketOptions: { label: string; value: JacketMaterial; desc: string }[] = [
  { label: 'PVC (Standard)', value: JacketMaterial.PVC, desc: 'Cost-effective, flame-retardant, high durability' },
  { label: 'TPE (Flexible)', value: JacketMaterial.TPE, desc: 'Rubber-like flexibility, high fatigue resistance' },
  { label: 'Silicone (Ultra-Flex)', value: JacketMaterial.SILICONE, desc: 'Zero memory coil, extreme temperature range' },
  { label: 'Braided Nylon (Armored)', value: JacketMaterial.BRAIDED_NYLON, desc: 'High abrasion and tangle resistance' },
  { label: 'PUR (Industrial Heavy Duty)', value: JacketMaterial.PUR, desc: 'Oil, chemical, and drag-chain rated' },
];

const shieldingOptions: { label: string; value: CableShieldingType; desc: string }[] = [
  { label: 'Unshielded (UTP)', value: CableShieldingType.UNSHIELDED, desc: 'Basic signal, lightweight routing' },
  { label: 'Foil Shielded (F/UTP)', value: CableShieldingType.FOIL_SHIELDED, desc: 'Standard EMI/RFI protection' },
  { label: 'Braided Shielded (S/UTP)', value: CableShieldingType.BRAIDED_SHIELDED, desc: 'Studio low-noise audio and video' },
  { label: 'Double Shielded (S/FTP)', value: CableShieldingType.DOUBLE_SHIELDED, desc: 'Maximum interference immunity 10Gbps+' },
];

const wireColors = [
  { name: 'Stealth Black', hex: '#000000' },
  { name: 'Industrial Grey', hex: '#475569' },
  { name: 'Cobalt Blue', hex: '#2563EB' },
  { name: 'Signal Red', hex: '#DC2626' },
  { name: 'Studio Purple', hex: '#7C3AED' },
  { name: 'Clean White', hex: '#F8FAFC' },
  { name: 'Warning Yellow', hex: '#EAB308' },
];

export function CableSpecsForm({
  cableTypes,
  selectedCableTypeId,
  onSelectCableType,
  lengthMeters,
  onChangeLength,
  jacketMaterial,
  onChangeJacket,
  shieldingType,
  onChangeShielding,
  cableColor,
  onChangeColor,
  notes,
  onChangeNotes,
}: CableSpecsFormProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Cable Specifications & Length</h2>
        <p className="text-sm text-slate-400 mt-1">
          Select the raw conductor grade, jacket compound, shielding level, and finished length.
        </p>
      </div>

      {/* 1. Conductor / Cable Type Selection */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Layers className="h-4 w-4 text-blue-400" />
          Bulk Conductor Grade
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {cableTypes.map((type) => {
            const isSelected = selectedCableTypeId === type.id;
            return (
              <div
                key={type.id}
                onClick={() => onSelectCableType(type.id)}
                className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-500 bg-blue-950/30 ring-1 ring-blue-500'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-sm">{type.name}</span>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {type.gaugeAWG} AWG
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">
                    Max conductors: {type.maxConductors} | {type.shielding.replace('_', ' ')}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">Rate / meter</span>
                  <span className="font-mono font-bold text-blue-400 text-sm">
                    {formatCurrency(type.pricePerMeter)}/m
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Length Selector */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Ruler className="h-4 w-4 text-blue-400" />
          Cable Length (Meters)
        </label>

        <div className="flex flex-wrap gap-2">
          {standardLengths.map((len) => (
            <button
              key={len}
              type="button"
              onClick={() => onChangeLength(len)}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-medium transition ${
                lengthMeters === len
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              {len}m
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 pt-2 max-w-sm">
          <span className="text-xs text-slate-400 whitespace-nowrap">Custom Length:</span>
          <Input
            type="number"
            min="0.1"
            max="100"
            step="0.1"
            value={lengthMeters}
            onChange={(e) => onChangeLength(parseFloat(e.target.value) || 1)}
            className="w-28 font-mono bg-slate-900"
          />
          <span className="text-xs text-slate-400">meters</span>
        </div>
      </div>

      {/* 3. Shielding & Jacket Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-400" />
            Shielding Specification
          </label>
          <div className="space-y-2">
            {shieldingOptions.map((opt) => (
              <label
                key={opt.value}
                onClick={() => onChangeShielding(opt.value)}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${
                  shieldingType === opt.value
                    ? 'border-emerald-500 bg-emerald-950/20'
                    : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900'
                }`}
              >
                <input
                  type="radio"
                  name="shielding"
                  checked={shieldingType === opt.value}
                  onChange={() => onChangeShielding(opt.value)}
                  className="mt-1 accent-emerald-500"
                />
                <div>
                  <div className="text-xs font-semibold text-white">{opt.label}</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-400" />
            Outer Jacket Material
          </label>
          <div className="space-y-2">
            {jacketOptions.map((opt) => (
              <label
                key={opt.value}
                onClick={() => onChangeJacket(opt.value)}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${
                  jacketMaterial === opt.value
                    ? 'border-purple-500 bg-purple-950/20'
                    : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900'
                }`}
              >
                <input
                  type="radio"
                  name="jacket"
                  checked={jacketMaterial === opt.value}
                  onChange={() => onChangeJacket(opt.value)}
                  className="mt-1 accent-purple-500"
                />
                <div>
                  <div className="text-xs font-semibold text-white">{opt.label}</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Color & Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-200">Cable Jacket Color</label>
          <div className="flex flex-wrap items-center gap-3">
            {wireColors.map((col) => (
              <button
                key={col.hex}
                type="button"
                onClick={() => onChangeColor(col.hex)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition ${
                  cableColor === col.hex
                    ? 'border-blue-500 bg-slate-800 ring-1 ring-blue-500'
                    : 'border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <span
                  className="h-3.5 w-3.5 rounded-full border border-slate-700"
                  style={{ backgroundColor: col.hex }}
                />
                <span>{col.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-200">Custom Manufacturing Instructions</label>
          <Input
            type="text"
            placeholder="e.g. 5cm heat shrink on End 1, label with custom serial"
            value={notes}
            onChange={(e) => onChangeNotes(e.target.value)}
            className="bg-slate-900 border-slate-700"
          />
        </div>
      </div>
    </div>
  );
}

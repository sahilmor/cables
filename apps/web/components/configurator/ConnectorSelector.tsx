'use client';

import React, { useState } from 'react';
import { ConnectorDto } from '@cables/types';
import { formatCurrency } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, CheckCircle2, AlertTriangle, Cpu, Layers } from 'lucide-react';

interface ConnectorSelectorProps {
  title: string;
  subtitle: string;
  connectors: ConnectorDto[];
  selectedId: string | null;
  onSelect: (connector: ConnectorDto) => void;
  selectedEnd1?: ConnectorDto | null;
  compatibilityInfo?: { isCompatible: boolean; notes?: string } | null;
}

export function ConnectorSelector({
  title,
  subtitle,
  connectors,
  selectedId,
  onSelect,
  selectedEnd1,
}: ConnectorSelectorProps) {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  const connectorTypes = ['ALL', ...Array.from(new Set(connectors.map((c) => c.type)))];

  const filteredConnectors = connectors.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.type.toLowerCase().includes(search.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(search.toLowerCase()));

    const matchesType = selectedType === 'ALL' || c.type === selectedType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
          <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            type="text"
            placeholder="Search connectors..."
            className="pl-9 bg-slate-900/90 border-slate-700"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Type Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {connectorTypes.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
              selectedType === type
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Connector Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredConnectors.map((connector) => {
          const isSelected = selectedId === connector.id;

          return (
            <Card
              key={connector.id}
              onClick={() => onSelect(connector)}
              className={`relative cursor-pointer transition-all duration-200 overflow-hidden group ${
                isSelected
                  ? 'border-blue-500 bg-blue-950/20 ring-2 ring-blue-500/30'
                  : 'hover:border-slate-700 hover:bg-slate-900/90 bg-slate-900/50'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 z-10">
                  <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-md">
                    <CheckCircle2 className="h-4 w-4 stroke-[3]" />
                  </div>
                </div>
              )}

              <div className="p-5 flex flex-col justify-between h-full space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="h-14 w-14 rounded-lg bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-400 shrink-0 overflow-hidden">
                    {connector.imageUrl ? (
                      <img
                        src={connector.imageUrl}
                        alt={connector.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                    ) : (
                      <Cpu className="h-7 w-7 text-blue-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white truncate text-base">
                        {connector.name}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                      {connector.description || 'Precision industrial connector with gold-plated contacts.'}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[11px] font-mono text-slate-300">
                      {connector.numberOfPins} Pins
                    </Badge>
                    <Badge variant="secondary" className="text-[11px]">
                      {connector.type}
                    </Badge>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase block">Base Price</span>
                    <span className="font-mono font-bold text-white text-sm">
                      {formatCurrency(connector.basePrice)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

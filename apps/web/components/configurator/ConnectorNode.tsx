'use client';

import React, { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { ConnectorDto, ConnectorPinDto } from '@cables/types';
import { Badge } from '@/components/ui/badge';
import { Cpu, Zap, Shield, Radio, Volume2, Filter } from 'lucide-react';

interface ConnectorNodeData {
  connector: ConnectorDto;
  side: 'left' | 'right';
  connectedPinIds: Set<string>;
  selectedSourcePinId: string | null;
  onPinClick?: (pin: ConnectorPinDto, side: 'left' | 'right') => void;
}

const getPinTypeBadge = (type: string) => {
  switch (type) {
    case 'POWER':
      return <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-mono text-[9px]">PWR</span>;
    case 'GROUND':
      return <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[9px]">GND</span>;
    case 'HIGH_SPEED_DIFFERENTIAL':
      return <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono text-[9px]">DIFF</span>;
    case 'CLOCK':
      return <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono text-[9px]">CLK</span>;
    case 'SHIELD':
      return <span className="px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400 font-mono text-[9px]">SHLD</span>;
    case 'ANALOG_AUDIO':
      return <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 font-mono text-[9px]">AUD</span>;
    default:
      return <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[9px]">SIG</span>;
  }
};

export const ConnectorNode = memo(({ data }: { data: ConnectorNodeData }) => {
  const { connector, side, connectedPinIds, selectedSourcePinId, onPinClick } = data;
  const isSource = side === 'left';
  const [pinFilter, setPinFilter] = useState<'ALL' | 'DATA' | 'POWER' | 'REQUIRED'>('ALL');

  const filteredPins = connector.pins.filter((pin) => {
    if (pinFilter === 'REQUIRED') return pin.required;
    if (pinFilter === 'POWER') return pin.type === 'POWER' || pin.type === 'GROUND';
    if (pinFilter === 'DATA') return pin.type === 'HIGH_SPEED_DIFFERENTIAL' || pin.type === 'DATA_PLUS' || pin.type === 'DATA_MINUS';
    return true;
  });

  return (
    <div className="w-80 rounded-xl border border-slate-700/80 bg-[#0d131f]/95 shadow-2xl backdrop-blur-md overflow-hidden text-slate-100">
      {/* Node Header */}
      <div className="p-3.5 bg-gradient-to-r from-slate-900 via-slate-800/80 to-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Cpu className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono font-bold text-blue-400 uppercase">
                {isSource ? 'END 1 (SOURCE)' : 'END 2 (TARGET)'}
              </span>
            </div>
            <h4 className="text-sm font-semibold text-white truncate">{connector.name}</h4>
          </div>
        </div>

        <Badge variant="outline" className="text-[10px] font-mono shrink-0">
          {connector.pins.length} Pins
        </Badge>
      </div>

      {/* Quick Pin Filter Pills for High-Density Connectors */}
      {connector.pins.length > 6 && (
        <div className="px-2.5 py-1.5 bg-slate-950/60 border-b border-slate-800/60 flex items-center gap-1 overflow-x-auto text-[10px]">
          <span className="text-slate-500 font-mono text-[9px] mr-1">Filter:</span>
          {(['ALL', 'DATA', 'POWER', 'REQUIRED'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setPinFilter(f)}
              className={`px-2 py-0.5 rounded transition font-medium ${
                pinFilter === f
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      {/* Pin list */}
      <div className="p-2 space-y-1.5 max-h-[460px] overflow-y-auto">
        {filteredPins.map((pin) => {
          const isConnected = connectedPinIds.has(pin.id);
          const isSelectedSource = selectedSourcePinId === pin.id;

          return (
            <div
              key={pin.id}
              onClick={() => onPinClick && onPinClick(pin, side)}
              className={`relative flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-all ${
                isSelectedSource
                  ? 'bg-blue-600/30 border border-blue-400 ring-2 ring-blue-500/50'
                  : isConnected
                  ? 'bg-slate-800/80 border border-slate-700/60 hover:bg-slate-800 text-white'
                  : 'bg-slate-900/50 border border-transparent hover:bg-slate-800/60 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: pin.color || '#3B82F6' }}
                />
                <span className="font-mono text-slate-400 text-[11px] shrink-0">
                  P{pin.pinNumber}
                </span>
                <span className="font-medium text-white truncate text-xs" title={pin.description || pin.name}>
                  {pin.name}
                  {pin.required && <span className="text-red-400 ml-0.5">*</span>}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {getPinTypeBadge(pin.type)}
                {isConnected && (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" title="Connected" />
                )}
              </div>

              {/* React Flow Handle */}
              {isSource ? (
                <Handle
                  type="source"
                  position={Position.Right}
                  id={pin.id}
                  className="!right-[-9px] !w-3 !h-3 !border-2 !border-slate-900 !bg-blue-500 hover:!scale-125 !transition"
                />
              ) : (
                <Handle
                  type="target"
                  position={Position.Left}
                  id={pin.id}
                  className="!left-[-9px] !w-3 !h-3 !border-2 !border-slate-900 !bg-emerald-500 hover:!scale-125 !transition"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

ConnectorNode.displayName = 'ConnectorNode';

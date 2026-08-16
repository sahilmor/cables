'use client';

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { ConnectorDto, ConnectorPinDto, WireConnectionDto, WiringValidationResult } from '@cables/types';
import { ConnectorNode } from './ConnectorNode';
import { WireEdge } from './WireEdge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Zap,
  Trash2,
  HelpCircle,
} from 'lucide-react';

interface WiringCanvasProps {
  connector1: ConnectorDto;
  connector2: ConnectorDto;
  connections: WireConnectionDto[];
  onChangeConnections: (connections: WireConnectionDto[]) => void;
  validationResult: WiringValidationResult | null;
  onValidate: () => void;
}

const nodeTypes = {
  connector: ConnectorNode,
};

const edgeTypes = {
  wire: WireEdge,
};

function InnerWiringCanvas({
  connector1,
  connector2,
  connections,
  onChangeConnections,
  validationResult,
  onValidate,
}: WiringCanvasProps) {
  const [selectedSourcePin, setSelectedSourcePin] = useState<ConnectorPinDto | null>(null);

  // Set of connected pin IDs
  const connectedPinIds = useMemo(() => {
    const set = new Set<string>();
    connections.forEach((c) => {
      set.add(c.sourcePinId);
      set.add(c.targetPinId);
    });
    return set;
  }, [connections]);

  // Handle pin click for click-to-connect mode
  const handlePinClick = useCallback(
    (pin: ConnectorPinDto, side: 'left' | 'right') => {
      if (side === 'left') {
        setSelectedSourcePin((prev) => (prev?.id === pin.id ? null : pin));
      } else if (side === 'right' && selectedSourcePin) {
        // Connect selected source pin to this target pin
        const exists = connections.some(
          (c) => c.sourcePinId === selectedSourcePin.id && c.targetPinId === pin.id,
        );

        if (!exists) {
          const newConns = [
            ...connections,
            {
              sourcePinId: selectedSourcePin.id,
              targetPinId: pin.id,
              wireColor: selectedSourcePin.color || '#3B82F6',
              label: `W-${connections.length + 1}`,
            },
          ];
          onChangeConnections(newConns);
        }
        setSelectedSourcePin(null);
      }
    },
    [selectedSourcePin, connections, onChangeConnections],
  );

  // Define Nodes
  const initialNodes: Node[] = useMemo(
    () => [
      {
        id: 'node-end1',
        type: 'connector',
        position: { x: 40, y: 40 },
        data: {
          connector: connector1,
          side: 'left',
          connectedPinIds,
          selectedSourcePinId: selectedSourcePin?.id || null,
          onPinClick: handlePinClick,
        },
        draggable: false,
      },
      {
        id: 'node-end2',
        type: 'connector',
        position: { x: 580, y: 40 },
        data: {
          connector: connector2,
          side: 'right',
          connectedPinIds,
          selectedSourcePinId: null,
          onPinClick: handlePinClick,
        },
        draggable: false,
      },
    ],
    [connector1, connector2, connectedPinIds, selectedSourcePin, handlePinClick],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);

  // Sync node data changes
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  // Handle Wire deletion
  const handleDeleteEdge = useCallback(
    (edgeId: string) => {
      const parts = edgeId.replace('edge-', '').split('-');
      if (parts.length >= 2) {
        const sourcePinId = parts[0];
        const targetPinId = parts[1];
        const updated = connections.filter(
          (c) => !(c.sourcePinId === sourcePinId && c.targetPinId === targetPinId),
        );
        onChangeConnections(updated);
      }
    },
    [connections, onChangeConnections],
  );

  // Convert connections to React Flow edges
  const edges: Edge[] = useMemo(() => {
    return connections.map((conn) => {
      const edgeId = `edge-${conn.sourcePinId}-${conn.targetPinId}`;
      return {
        id: edgeId,
        source: 'node-end1',
        sourceHandle: conn.sourcePinId,
        target: 'node-end2',
        targetHandle: conn.targetPinId,
        type: 'wire',
        data: {
          wireColor: conn.wireColor || '#3B82F6',
          onDelete: handleDeleteEdge,
        },
      };
    });
  }, [connections, handleDeleteEdge]);

  // Handle drag-and-drop connection
  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.sourceHandle || !params.targetHandle) return;

      const exists = connections.some(
        (c) =>
          c.sourcePinId === params.sourceHandle && c.targetPinId === params.targetHandle,
      );

      if (!exists) {
        const sourcePin = connector1.pins.find((p) => p.id === params.sourceHandle);
        const newConns = [
          ...connections,
          {
            sourcePinId: params.sourceHandle,
            targetPinId: params.targetHandle,
            wireColor: sourcePin?.color || '#3B82F6',
            label: `W-${connections.length + 1}`,
          },
        ];
        onChangeConnections(newConns);
      }
    },
    [connections, connector1.pins, onChangeConnections],
  );

  // Auto-wire 1:1 Preset
  const handleAutoWire = () => {
    const minPins = Math.min(connector1.pins.length, connector2.pins.length);
    const newConns: WireConnectionDto[] = [];

    for (let i = 0; i < minPins; i++) {
      const p1 = connector1.pins[i];
      const p2 = connector2.pins[i];
      if (p1 && p2) {
        newConns.push({
          sourcePinId: p1.id,
          targetPinId: p2.id,
          wireColor: p1.color || '#3B82F6',
          label: `W-${i + 1}`,
        });
      }
    }
    onChangeConnections(newConns);
  };

  const handleClearAll = () => {
    onChangeConnections([]);
  };

  return (
    <div className="space-y-4">
      {/* Top Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">Active Wires:</span>
            <Badge variant="default" className="font-mono bg-blue-600 text-white">
              {connections.length} Connected
            </Badge>
          </div>

          {selectedSourcePin && (
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              <span>Selected End 1 Pin {selectedSourcePin.pinNumber} — Click target pin on End 2</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAutoWire}
            className="text-xs gap-1.5 border-slate-700 hover:bg-slate-800"
          >
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            Auto-Wire 1:1
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            className="text-xs gap-1.5 border-slate-700 hover:bg-red-950/40 hover:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear All
          </Button>
        </div>
      </div>

      {/* React Flow Interactive Canvas */}
      <div className="h-[580px] w-full rounded-2xl border border-slate-800 bg-[#070b12] overflow-hidden relative shadow-2xl">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.5}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#1e293b" gap={20} size={1} variant={BackgroundVariant.Dots} />
          <Controls className="!bg-slate-900 !border-slate-800 !text-slate-200" />
        </ReactFlow>

        {/* Canvas Instructions floating badge */}
        <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 backdrop-blur">
          <HelpCircle className="h-3.5 w-3.5 text-blue-400" />
          <span>Tip: Drag from left handle to right handle, or click source pin then target pin.</span>
        </div>
      </div>

      {/* Validation Report Banner */}
      {validationResult && (
        <div
          className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            validationResult.isValid
              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
              : 'bg-amber-950/20 border-amber-500/30 text-amber-300'
          }`}
        >
          <div className="flex items-start gap-3">
            {validationResult.isValid ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="text-sm font-semibold">
                {validationResult.isValid
                  ? 'Configuration Valid — Ready for Fabrication'
                  : 'Configuration Incomplete / Attention Required'}
              </h4>
              {validationResult.errors.length > 0 && (
                <ul className="text-xs text-amber-200/80 list-disc list-inside mt-1 space-y-0.5">
                  {validationResult.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )}
              {validationResult.warnings.length > 0 && (
                <ul className="text-xs text-blue-200/80 list-disc list-inside mt-1 space-y-0.5">
                  {validationResult.warnings.map((warn, i) => (
                    <li key={i}>{warn}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onValidate}
            className="text-xs shrink-0 border-current bg-transparent hover:bg-white/10"
          >
            Re-run Validation
          </Button>
        </div>
      )}
    </div>
  );
}

export function WiringCanvas(props: WiringCanvasProps) {
  return (
    <ReactFlowProvider>
      <InnerWiringCanvas {...props} />
    </ReactFlowProvider>
  );
}

'use client';

import React from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react';
import { X } from 'lucide-react';

export function WireEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const wireColor = (data?.wireColor as string) || '#3B82F6';
  const onDelete = data?.onDelete as ((id: string) => void) | undefined;

  return (
    <>
      {/* Outer shadow / glow */}
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: 5,
          stroke: wireColor,
          opacity: 0.85,
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
        }}
      />

      {/* Inner highlight core */}
      <BaseEdge
        path={edgePath}
        style={{
          strokeWidth: 2,
          stroke: '#ffffff',
          opacity: 0.25,
        }}
      />

      {/* Delete button positioned at the center of the wire */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan group"
        >
          <button
            type="button"
            onClick={() => onDelete && onDelete(id)}
            className="h-5 w-5 rounded-full bg-slate-900 border border-slate-700 hover:border-red-500 hover:bg-red-600 text-slate-400 hover:text-white flex items-center justify-center shadow-lg transition-all transform hover:scale-125"
            title="Delete wire connection"
          >
            <X className="h-3 w-3 stroke-[2.5]" />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

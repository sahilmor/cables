'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sliders,
  Copy,
  Edit,
  Trash2,
  ShoppingBag,
  Cpu,
  Layers,
  ArrowRight,
  Plus,
} from 'lucide-react';

export default function SavedCablesPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [cables, setCables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSavedCables = async () => {
    try {
      const data = await apiClient<any[]>('/custom-cables', {
        token: token || undefined,
      });
      setCables(data);
    } catch (err) {
      console.error('Failed to load saved cables:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavedCables();
  }, [token]);

  const handleDuplicate = async (id: string) => {
    try {
      await apiClient(`/custom-cables/${id}/duplicate`, {
        method: 'POST',
        token: token || undefined,
      });
      loadSavedCables();
    } catch (err) {
      console.error('Duplicate failed:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this saved configuration?')) return;
    try {
      await apiClient(`/custom-cables/${id}`, {
        method: 'DELETE',
        token: token || undefined,
      });
      loadSavedCables();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleAddToCart = async (cableId: string) => {
    try {
      await apiClient('/cart/items', {
        method: 'POST',
        token: token || undefined,
        body: JSON.stringify({
          customCableId: cableId,
          quantity: 1,
        }),
      });
      router.push('/cart');
    } catch (err) {
      console.error('Add to cart failed:', err);
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
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Saved Custom Cables</h1>
          <p className="text-xs text-slate-400 mt-1">Your library of custom pinout wiring configurations</p>
        </div>
        <Link href="/custom-cable">
          <Button variant="cyber" size="sm" className="gap-2 font-semibold">
            <Plus className="h-4 w-4" />
            Build New Design
          </Button>
        </Link>
      </div>

      {cables.length === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
          <div className="h-16 w-16 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
            <Sliders className="h-8 w-8 text-blue-400" />
          </div>
          <h3 className="text-base font-semibold text-white">No saved configurations yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Create and save custom pin mappings for quick re-ordering and fabrication.
          </p>
          <Link href="/custom-cable">
            <Button variant="cyber" size="sm" className="mt-2">
              Launch Visual Configurator
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {cables.map((cable) => (
            <Card
              key={cable.id}
              className="border-slate-800 bg-slate-900/70 hover:border-slate-700 transition flex flex-col justify-between"
            >
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <Badge variant="info" className="text-[10px] font-mono">
                    {cable.lengthMeters} METERS
                  </Badge>
                  <Badge variant={cable.isValid ? 'success' : 'warning'} className="text-[10px] font-mono">
                    {cable.isValid ? 'VALIDATED' : 'INCOMPLETE'}
                  </Badge>
                </div>
                <CardTitle className="text-base text-white line-clamp-1">{cable.name}</CardTitle>
                <p className="text-xs text-slate-400">
                  {cable.connector1?.name} ── {cable.connections?.length || 0} Wires ── {cable.connector2?.name}
                </p>
              </CardHeader>

              <CardContent className="p-5 pt-0 text-xs text-slate-400 space-y-2">
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-center justify-between font-mono">
                  <span>Conductor: {cable.cableType?.name || 'Shielded'}</span>
                  <span className="text-white font-bold">{formatCurrency(cable.calculatedPrice)}</span>
                </div>
              </CardContent>

              <CardFooter className="p-5 pt-0 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Link href={`/custom-cable/${cable.id}`}>
                    <Button variant="outline" size="sm" className="h-8 gap-1 border-slate-700 text-xs">
                      <Edit className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                  </Link>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDuplicate(cable.id)}
                    className="h-8 w-8 text-slate-400 hover:text-white"
                    title="Duplicate configuration"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(cable.id)}
                    className="h-8 w-8 text-slate-500 hover:text-red-400"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handleAddToCart(cable.id)}
                  disabled={!cable.isValid}
                  className="h-8 gap-1.5 text-xs bg-blue-600 hover:bg-blue-500"
                >
                  <ShoppingBag className="h-3.5 w-3.5" />
                  Order
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

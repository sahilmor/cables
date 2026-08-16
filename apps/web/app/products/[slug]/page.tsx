'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Cpu,
  ArrowLeft,
  Sliders,
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const { token } = useAuth();

  const [product, setProduct] = useState<any>(null);
  const [selectedLength, setSelectedLength] = useState<string>('2m');
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [adding, setAdding] = useState<boolean>(false);
  const [added, setAdded] = useState<boolean>(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        const data = await apiClient<any>(`/products/slug/${slug}`);
        setProduct(data);
        if (data?.lengthOptions && data.lengthOptions.length > 0) {
          setSelectedLength(data.lengthOptions[0]);
        }
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        setLoading(false);
      }
    }
    if (slug) loadProduct();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product) return;
    setAdding(true);
    try {
      await apiClient('/cart/items', {
        method: 'POST',
        token: token || undefined,
        body: JSON.stringify({
          productId: product.id,
          quantity,
        }),
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } catch (err) {
      console.error('Add to cart failed:', err);
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Product Not Found</h2>
        <Link href="/products">
          <Button variant="outline">Back to Catalog</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-8 py-10 space-y-10 max-w-6xl">
      <Link
        href="/products"
        className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        BACK TO CATALOG
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Product Image Gallery */}
        <div className="space-y-4">
          <div className="h-96 w-full rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center relative">
            {product.images?.[0]?.url ? (
              <img
                src={product.images[0].url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Cpu className="h-20 w-20 text-slate-700" />
            )}
            <Badge variant="secondary" className="absolute top-4 left-4 font-mono text-xs">
              {product.sku}
            </Badge>
          </div>
        </div>

        {/* Details & Purchase */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="info" className="text-[10px] font-mono">
                {product.category?.name || 'CABLES'}
              </Badge>
              <Badge variant="success" className="text-[10px] font-mono">
                IN STOCK ({product.stock})
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {product.name}
            </h1>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed">{product.description}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-baseline justify-between">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-mono">PRICE (INCL. GST)</span>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold font-mono text-white">
                  {formatCurrency(product.price)}
                </span>
                {product.compareAtPrice && (
                  <span className="text-sm font-mono text-slate-500 line-through">
                    {formatCurrency(product.compareAtPrice)}
                  </span>
                )}
              </div>
            </div>
            <span className="text-xs text-emerald-400 font-medium">Ready to Dispatch in 24h</span>
          </div>

          {/* Length Options */}
          {product.lengthOptions && product.lengthOptions.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Length Selection</label>
              <div className="flex flex-wrap gap-2">
                {product.lengthOptions.map((len: string) => (
                  <button
                    key={len}
                    onClick={() => setSelectedLength(len)}
                    className={`px-4 py-2 rounded-lg text-xs font-mono font-medium transition ${
                      selectedLength === len
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    }`}
                  >
                    {len}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center rounded-lg border border-slate-700 bg-slate-900">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-2 text-slate-400 hover:text-white transition"
              >
                -
              </button>
              <span className="px-3 font-mono text-xs font-bold text-white">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="px-3 py-2 text-slate-400 hover:text-white transition"
              >
                +
              </button>
            </div>

            <Button
              className="flex-1 h-11 gap-2 font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20"
              onClick={handleAddToCart}
              disabled={adding}
            >
              {added ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" />
                  {adding ? 'Adding...' : 'Add to Cart'}
                </>
              )}
            </Button>
          </div>

          <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-400" />
              <span>3-Year Warranty</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-emerald-400" />
              <span>Express Air Courier</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

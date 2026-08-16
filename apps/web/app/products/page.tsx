'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ShoppingBag, Sliders, Cpu, ArrowRight, Check } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [addedItemIds, setAddedItemIds] = useState<Set<string>>(new Set());
  const { token } = useAuth();

  useEffect(() => {
    async function loadCatalog() {
      try {
        const [prodData, catData] = await Promise.all([
          apiClient<any[]>('/products'),
          apiClient<any[]>('/categories'),
        ]);
        setProducts(prodData);
        setCategories(catData);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, []);

  const handleAddToCart = async (productId: string) => {
    try {
      await apiClient('/cart/items', {
        method: 'POST',
        token: token || undefined,
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      setAddedItemIds((prev) => new Set(prev).add(productId));
      setTimeout(() => {
        setAddedItemIds((prev) => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
      }, 2000);
    } catch (err) {
      console.error('Add to cart failed:', err);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'ALL' || p.category?.slug === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Header & Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-8 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-slate-800">
        <div>
          <Badge variant="info" className="mb-2 font-mono text-[10px]">
            FACTORY CERTIFIED ASSEMBLIES
          </Badge>
          <h1 className="text-3xl font-bold text-white tracking-tight">Standard Precision Cables</h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Pre-assembled industrial patch leads, high-bandwidth HDMI 2.1, Cat6A/8 Ethernet, and studio audio interconnects.
          </p>
        </div>

        <Link href="/custom-cable">
          <Button variant="cyber" className="gap-2 font-semibold shadow-lg shadow-blue-500/20">
            <Sliders className="h-4 w-4" />
            Build Custom Pinout
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
              selectedCategory === 'ALL'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
            }`}
          >
            All Categories ({products.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                selectedCategory === cat.slug
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            type="text"
            placeholder="Search by name, SKU..."
            className="pl-9 bg-slate-900/90 border-slate-700"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-slate-900/40 border border-slate-800">
          <p className="text-slate-400 text-sm">No products found matching your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const isAdded = addedItemIds.has(product.id);
            const image = product.images?.[0]?.url;

            return (
              <Card
                key={product.id}
                className="border-slate-800 bg-slate-900/60 hover:border-slate-700 transition flex flex-col justify-between overflow-hidden group"
              >
                <div className="relative h-48 w-full bg-slate-950 overflow-hidden">
                  {image ? (
                    <img
                      src={image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-700">
                      <Cpu className="h-12 w-12" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="text-[10px] font-mono backdrop-blur bg-slate-900/80">
                      {product.sku}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="p-5 pb-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>{product.category?.name || 'Standard'}</span>
                    <span className="text-emerald-400 font-medium">In Stock ({product.stock})</span>
                  </div>
                  <Link href={`/products/${product.slug}`} className="hover:text-blue-400 transition">
                    <CardTitle className="text-base text-white line-clamp-1">{product.name}</CardTitle>
                  </Link>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1.5">{product.description}</p>
                </CardHeader>

                <CardContent className="p-5 pt-0">
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {product.lengthOptions?.map((len: string) => (
                      <span
                        key={len}
                        className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 text-[10px] font-mono text-slate-300"
                      >
                        {len}
                      </span>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="p-5 pt-0 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Price</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold font-mono text-white">
                        {formatCurrency(product.price)}
                      </span>
                      {product.compareAtPrice && (
                        <span className="text-xs font-mono text-slate-500 line-through">
                          {formatCurrency(product.compareAtPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={isAdded ? 'outline' : 'default'}
                    onClick={() => handleAddToCart(product.id)}
                    className={`gap-1.5 ${isAdded ? 'border-emerald-500/50 text-emerald-400' : ''}`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="h-4 w-4" />
                        Added
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="h-4 w-4" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  imageUrl: string;
  availableTenures: number[];
  stockQuantity: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await api.getProducts();
      if (res.success && res.data) {
        setProducts(res.data);
      }
    } catch {
      console.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Shop with No-Cost EMI</h1>
        <p className="text-[var(--foreground-muted)] mt-1">
          Buy products using your mutual fund credit line with 0% interest
        </p>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="spinner" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[var(--foreground-muted)]">No products available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="card overflow-hidden group">
              {/* Image */}
              <div className="h-56 bg-gradient-to-br from-[var(--primary)]/5 to-[var(--background)] flex items-center justify-center overflow-hidden p-4">
                {(() => {
                  const name = product.name.toLowerCase();
                  if (name.includes('iphone')) return <img src="/products/iphone.png" alt={product.name} className="h-48 w-auto object-contain" />;
                  if (name.includes('macbook')) return <img src="/products/macbook.png" alt={product.name} className="h-48 w-auto object-contain" />;
                  if (name.includes('sony') || name.includes('headphone')) return <img src="/products/headphones.png" alt={product.name} className="h-48 w-auto object-contain" />;
                  if (name.includes('lg') || name.includes('tv') || name.includes('oled')) return <img src="/products/tv.png" alt={product.name} className="h-48 w-auto object-contain" />;
                  if (name.includes('enfield') || name.includes('classic')) return <img src="/products/motorcycle.png" alt={product.name} className="h-48 w-auto object-contain" />;
                  return (
                    <div className="w-28 h-28 rounded-2xl bg-[var(--background-secondary)] flex items-center justify-center">
                      <svg className="w-14 h-14 text-[var(--foreground-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                  );
                })()}
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <span className="badge badge-info">{product.category}</span>
                  {product.brand && (
                    <span className="text-sm text-[var(--foreground-muted)]">{product.brand}</span>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                  {product.name}
                </h3>
                
                <p className="text-2xl font-bold text-white mb-4">
                  {formatCurrency(product.price)}
                </p>

                {/* EMI Options */}
                <div className="mb-4">
                  <p className="text-sm text-[var(--foreground-muted)] mb-2">No-Cost EMI starting at</p>
                  <p className="text-lg font-semibold text-[var(--accent-green)]">
                    {formatCurrency(Math.round(product.price / Math.max(...product.availableTenures)))}/month
                  </p>
                </div>

                {/* Tenures */}
                <div className="flex gap-2 flex-wrap mb-4">
                  {product.availableTenures.map((tenure) => (
                    <span
                      key={tenure}
                      className="px-3 py-1 rounded-lg bg-[var(--background)] text-sm text-[var(--foreground-muted)]"
                    >
                      {tenure}M
                    </span>
                  ))}
                </div>

                <Link href={`/products/${product.id}`} className="btn-primary w-full group-hover:shadow-lg text-center">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

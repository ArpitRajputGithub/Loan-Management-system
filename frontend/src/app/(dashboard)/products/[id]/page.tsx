'use client';

import { useEffect, useState, use } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

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
  status: string;
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTenure, setSelectedTenure] = useState<number | null>(null);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const res = await api.getProduct(id);
      if (res.success && res.data) {
        setProduct(res.data);
        if (res.data.availableTenures?.length > 0) {
          setSelectedTenure(res.data.availableTenures[0]);
        }
      } else {
        setError(res.error || 'Product not found');
      }
    } catch {
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

  const calculateEmi = (price: number, tenure: number) => {
    return Math.round(price / tenure);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="spinner" /></div>;
  }

  if (error || !product) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">{error || 'Product not found'}</p>
        <Link href="/products" className="btn-secondary">Back to Shop</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Link href="/products" className="text-[var(--foreground-muted)] hover:text-white text-sm">
        ← Back to Shop
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="card p-8">
          <div className="aspect-square rounded-2xl bg-gradient-to-br from-[var(--primary)]/5 to-[var(--background)] flex items-center justify-center overflow-hidden p-6">
            {(() => {
              const name = product.name.toLowerCase();
              if (name.includes('iphone')) return <img src="/products/iphone.png" alt={product.name} className="max-h-full max-w-full object-contain" />;
              if (name.includes('macbook')) return <img src="/products/macbook.png" alt={product.name} className="max-h-full max-w-full object-contain" />;
              if (name.includes('sony') || name.includes('headphone')) return <img src="/products/headphones.png" alt={product.name} className="max-h-full max-w-full object-contain" />;
              if (name.includes('lg') || name.includes('tv') || name.includes('oled')) return <img src="/products/tv.png" alt={product.name} className="max-h-full max-w-full object-contain" />;
              if (name.includes('enfield') || name.includes('classic')) return <img src="/products/motorcycle.png" alt={product.name} className="max-h-full max-w-full object-contain" />;
              return (
                <div className="w-32 h-32 rounded-3xl bg-[var(--background-secondary)] flex items-center justify-center">
                  <svg className="w-16 h-16 text-[var(--foreground-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="badge badge-info">{product.category}</span>
              {product.brand && <span className="text-[var(--foreground-muted)]">{product.brand}</span>}
            </div>
            <h1 className="text-3xl font-bold text-white">{product.name}</h1>
            {product.description && (
              <p className="text-[var(--foreground-muted)] mt-2">{product.description}</p>
            )}
          </div>

          <div className="text-4xl font-bold text-white">
            {formatCurrency(product.price)}
          </div>

          {/* EMI Options */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">No-Cost EMI Options</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {product.availableTenures.map((tenure) => (
                <button
                  key={tenure}
                  onClick={() => setSelectedTenure(tenure)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedTenure === tenure
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                      : 'border-[var(--border)] hover:border-[var(--foreground-muted)]'
                  }`}
                >
                  <p className="text-2xl font-bold text-white">{tenure}</p>
                  <p className="text-sm text-[var(--foreground-muted)]">months</p>
                  <p className="text-lg font-semibold text-[var(--accent-green)] mt-2">
                    {formatCurrency(calculateEmi(product.price, tenure))}/mo
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          {selectedTenure && (
            <div className="card p-6 border-[var(--primary)]/30">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[var(--foreground-muted)]">Monthly EMI</span>
                <span className="text-2xl font-bold text-[var(--accent-green)]">
                  {formatCurrency(calculateEmi(product.price, selectedTenure))}
                </span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-[var(--foreground-muted)]">Total Amount</span>
                <span className="text-lg text-white">{formatCurrency(product.price)}</span>
              </div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-[var(--foreground-muted)]">Interest</span>
                <span className="text-lg text-[var(--accent-green)]">₹0 (0%)</span>
              </div>
              <button className="btn-primary w-full text-lg py-4">
                Apply for No-Cost EMI
              </button>
              <p className="text-center text-xs text-[var(--foreground-muted)] mt-3">
                Your mutual fund holdings will be used as collateral
              </p>
            </div>
          )}

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            {product.stockQuantity > 0 ? (
              <>
                <div className="w-2 h-2 rounded-full bg-[var(--accent-green)]" />
                <span className="text-[var(--accent-green)]">In Stock ({product.stockQuantity} available)</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-red-400">Out of Stock</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

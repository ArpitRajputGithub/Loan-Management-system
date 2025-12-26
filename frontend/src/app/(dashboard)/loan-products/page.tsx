'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface LoanProduct {
  id: string;
  name: string;
  description: string;
  interestRate: string;
  processingFeePercent: string;
  minAmount: number;
  maxAmount: number;
  minTenureMonths: number;
  maxTenureMonths: number;
  equityLtv: string;
  debtLtv: string;
  status: string;
}

interface FormData {
  name: string;
  description: string;
  interestRate: string;
  processingFeePercent: string;
  minAmount: string;
  maxAmount: string;
  minTenureMonths: string;
  maxTenureMonths: string;
  equityLtv: string;
  debtLtv: string;
}

const emptyForm: FormData = {
  name: '',
  description: '',
  interestRate: '',
  processingFeePercent: '',
  minAmount: '',
  maxAmount: '',
  minTenureMonths: '',
  maxTenureMonths: '',
  equityLtv: '',
  debtLtv: '',
};

export default function LoanProductsPage() {
  const [products, setProducts] = useState<LoanProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await api.getLoanProducts();
      if (res.success && res.data) {
        setProducts(res.data);
      }
    } catch {
      console.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError('');
    setShowModal(true);
  };

  const openEdit = (product: LoanProduct) => {
    setForm({
      name: product.name,
      description: product.description || '',
      interestRate: product.interestRate,
      processingFeePercent: product.processingFeePercent,
      minAmount: product.minAmount.toString(),
      maxAmount: product.maxAmount.toString(),
      minTenureMonths: product.minTenureMonths.toString(),
      maxTenureMonths: product.maxTenureMonths.toString(),
      equityLtv: (parseFloat(product.equityLtv) * 100).toString(),
      debtLtv: (parseFloat(product.debtLtv) * 100).toString(),
    });
    setEditingId(product.id);
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const data = {
      name: form.name,
      description: form.description || undefined,
      interestRate: parseFloat(form.interestRate),
      processingFeePercent: parseFloat(form.processingFeePercent),
      minAmount: parseInt(form.minAmount),
      maxAmount: parseInt(form.maxAmount),
      minTenureMonths: parseInt(form.minTenureMonths),
      maxTenureMonths: parseInt(form.maxTenureMonths),
      equityLtv: parseFloat(form.equityLtv) / 100,
      debtLtv: parseFloat(form.debtLtv) / 100,
    };

    try {
      let res;
      if (editingId) {
        res = await api.updateLoanProduct(editingId, data);
      } else {
        res = await api.createLoanProduct(data);
      }

      if (res.success) {
        setShowModal(false);
        loadProducts();
      } else {
        setError(res.error || 'Failed to save');
      }
    } catch {
      setError('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (product: LoanProduct) => {
    const newStatus = product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const res = await api.updateLoanProduct(product.id, { status: newStatus });
    if (res.success) {
      loadProducts();
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(0)}L`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Loan Products</h1>
          <p className="text-[var(--foreground-muted)] mt-1">Manage loan product configurations</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          + New Product
        </button>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="spinner" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="card p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-white">{product.name}</h3>
                <span className={`badge ${product.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>
                  {product.status}
                </span>
              </div>
              
              {product.description && (
                <p className="text-[var(--foreground-muted)] text-sm mb-4">{product.description}</p>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--foreground-muted)]">Interest Rate</span>
                  <span className="text-white font-medium">{product.interestRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--foreground-muted)]">Processing Fee</span>
                  <span className="text-white">{product.processingFeePercent}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--foreground-muted)]">Amount Range</span>
                  <span className="text-white">{formatCurrency(product.minAmount)} - {formatCurrency(product.maxAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--foreground-muted)]">Tenure</span>
                  <span className="text-white">{product.minTenureMonths} - {product.maxTenureMonths} months</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--foreground-muted)]">LTV (Equity/Debt)</span>
                  <span className="text-white">{(parseFloat(product.equityLtv) * 100).toFixed(0)}% / {(parseFloat(product.debtLtv) * 100).toFixed(0)}%</span>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button 
                  onClick={() => openEdit(product)} 
                  className="btn-secondary flex-1 text-sm py-2"
                >
                  Edit
                </button>
                <button 
                  onClick={() => toggleStatus(product)}
                  className={`flex-1 text-sm py-2 rounded-lg ${
                    product.status === 'ACTIVE' 
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                      : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                  }`}
                >
                  {product.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-white mb-6">
              {editingId ? 'Edit Loan Product' : 'Create Loan Product'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--foreground-muted)] mb-1">Product Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-[var(--foreground-muted)] mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input-field"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--foreground-muted)] mb-1">Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.interestRate}
                    onChange={(e) => setForm({ ...form, interestRate: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--foreground-muted)] mb-1">Processing Fee (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.processingFeePercent}
                    onChange={(e) => setForm({ ...form, processingFeePercent: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--foreground-muted)] mb-1">Min Amount (₹)</label>
                  <input
                    type="number"
                    value={form.minAmount}
                    onChange={(e) => setForm({ ...form, minAmount: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--foreground-muted)] mb-1">Max Amount (₹)</label>
                  <input
                    type="number"
                    value={form.maxAmount}
                    onChange={(e) => setForm({ ...form, maxAmount: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--foreground-muted)] mb-1">Min Tenure (months)</label>
                  <input
                    type="number"
                    value={form.minTenureMonths}
                    onChange={(e) => setForm({ ...form, minTenureMonths: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--foreground-muted)] mb-1">Max Tenure (months)</label>
                  <input
                    type="number"
                    value={form.maxTenureMonths}
                    onChange={(e) => setForm({ ...form, maxTenureMonths: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--foreground-muted)] mb-1">Equity LTV (%)</label>
                  <input
                    type="number"
                    step="1"
                    value={form.equityLtv}
                    onChange={(e) => setForm({ ...form, equityLtv: e.target.value })}
                    className="input-field"
                    placeholder="e.g. 50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--foreground-muted)] mb-1">Debt LTV (%)</label>
                  <input
                    type="number"
                    step="1"
                    value={form.debtLtv}
                    onChange={(e) => setForm({ ...form, debtLtv: e.target.value })}
                    className="input-field"
                    placeholder="e.g. 80"
                    required
                  />
                </div>
              </div>

              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Saving...' : (editingId ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

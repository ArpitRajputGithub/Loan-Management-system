'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface EligibilityResult {
  creditLimit: number;
  breakdown: { fundType: string; totalValue: number; ltvApplied: number; eligibleAmount: number }[];
  holdings: { fundName: string; isin: string; fundType: string; units: number; nav: number; value: number }[];
}

interface LoanProduct {
  id: string;
  name: string;
  interestRate: string;
  minAmount: number;
  maxAmount: number;
  minTenureMonths: number;
  maxTenureMonths: number;
}

const steps = ['Check Eligibility', 'Select Product', 'Configure Loan', 'Review & Submit'];

export default function NewApplicationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Eligibility
  const [pan, setPan] = useState('');
  const [mobile, setMobile] = useState('');
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(null);

  // Step 2: Product
  const [products, setProducts] = useState<LoanProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<LoanProduct | null>(null);

  // Step 3: Loan config
  const [amount, setAmount] = useState('');
  const [tenure, setTenure] = useState('');

  const formatCurrency = (amt: number) => `₹${amt.toLocaleString('en-IN')}`;

  const checkEligibility = async () => {
    if (!pan || !mobile) {
      setError('Please enter PAN and mobile number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.checkEligibility(pan, mobile);
      if (res.success && res.data) {
        setEligibility(res.data);
        // Also load products
        const prodRes = await api.getLoanProducts();
        if (prodRes.success && prodRes.data) {
          setProducts(prodRes.data.filter((p: any) => p.status === 'ACTIVE'));
        }
        setCurrentStep(1);
      } else {
        setError(res.error || 'Failed to check eligibility');
      }
    } catch {
      setError('Failed to check eligibility');
    } finally {
      setLoading(false);
    }
  };

  const selectProduct = (product: LoanProduct) => {
    setSelectedProduct(product);
    setAmount(Math.min(eligibility?.creditLimit || product.minAmount, product.maxAmount).toString());
    setTenure(product.minTenureMonths.toString());
    setCurrentStep(2);
  };

  const configureAndReview = () => {
    if (!amount || !tenure) {
      setError('Please enter amount and tenure');
      return;
    }
    const amt = parseInt(amount);
    if (selectedProduct) {
      if (amt < selectedProduct.minAmount || amt > selectedProduct.maxAmount) {
        setError(`Amount must be between ${formatCurrency(selectedProduct.minAmount)} and ${formatCurrency(selectedProduct.maxAmount)}`);
        return;
      }
      if (amt > (eligibility?.creditLimit || 0)) {
        setError(`Amount cannot exceed your credit limit of ${formatCurrency(eligibility?.creditLimit || 0)}`);
        return;
      }
    }
    setError('');
    setCurrentStep(3);
  };

  const submitApplication = async () => {
    if (!selectedProduct) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.createLoanApplication({
        loanProductId: selectedProduct.id,
        requestedAmount: parseInt(amount),
        selectedTenure: parseInt(tenure),
      });
      if (res.success && res.data) {
        router.push(`/applications/${res.data.id}`);
      } else {
        setError(res.error || 'Failed to create application');
      }
    } catch {
      setError('Failed to create application');
    } finally {
      setLoading(false);
    }
  };

  const calculateEmi = () => {
    if (!amount || !tenure || !selectedProduct) return 0;
    const p = parseInt(amount);
    const r = parseFloat(selectedProduct.interestRate) / 12 / 100;
    const n = parseInt(tenure);
    if (r === 0) return Math.round(p / n);
    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(emi);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <Link href="/applications" className="text-[var(--foreground-muted)] hover:text-white text-sm">
        ← Back to Applications
      </Link>

      <h1 className="text-3xl font-bold text-white">New Loan Application</h1>

      {/* Steps Progress */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              i <= currentStep 
                ? 'bg-[var(--primary)] text-white' 
                : 'bg-[var(--background-card)] text-[var(--foreground-muted)]'
            }`}>
              {i + 1}
            </div>
            <span className={`ml-2 text-sm ${i <= currentStep ? 'text-white' : 'text-[var(--foreground-muted)]'}`}>
              {step}
            </span>
            {i < steps.length - 1 && (
              <div className={`w-12 h-0.5 mx-3 ${
                i < currentStep ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'
              }`} />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          {error}
        </div>
      )}

      {/* Step 1: Eligibility Check */}
      {currentStep === 0 && (
        <div className="card p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Check Your Eligibility</h2>
          <p className="text-[var(--foreground-muted)] mb-6">
            Enter your PAN and mobile number to check your credit limit based on mutual fund holdings.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm text-[var(--foreground-muted)] mb-1">PAN Number</label>
              <input
                type="text"
                value={pan}
                onChange={(e) => setPan(e.target.value.toUpperCase())}
                placeholder="ABCDE1234F"
                className="input-field uppercase"
                maxLength={10}
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--foreground-muted)] mb-1">Mobile Number</label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="9876543210"
                className="input-field"
                maxLength={10}
              />
            </div>
          </div>
          <button onClick={checkEligibility} disabled={loading} className="btn-primary">
            {loading ? 'Checking...' : 'Check Eligibility'}
          </button>
        </div>
      )}

      {/* Step 2: Select Product */}
      {currentStep === 1 && eligibility && (
        <div className="space-y-6">
          <div className="card p-6 border-[var(--accent-green)]/30">
            <h2 className="text-xl font-semibold text-white mb-2">Your Credit Limit</h2>
            <p className="text-4xl font-bold text-[var(--accent-green)]">
              {formatCurrency(eligibility.creditLimit)}
            </p>
            <p className="text-[var(--foreground-muted)] mt-2">
              Based on {eligibility.holdings?.length || 0} mutual fund holdings
            </p>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Select a Loan Product</h2>
            <div className="grid gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => selectProduct(product)}
                  className="p-4 rounded-xl border border-[var(--border)] hover:border-[var(--primary)] cursor-pointer transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                      <p className="text-sm text-[var(--foreground-muted)]">
                        {formatCurrency(product.minAmount)} - {formatCurrency(product.maxAmount)} | 
                        {product.minTenureMonths} - {product.maxTenureMonths} months
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-[var(--primary)]">{product.interestRate}%</p>
                      <p className="text-sm text-[var(--foreground-muted)]">interest p.a.</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Configure Loan */}
      {currentStep === 2 && selectedProduct && (
        <div className="card p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Configure Your Loan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm text-[var(--foreground-muted)] mb-1">
                Loan Amount (₹)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-field"
                min={selectedProduct.minAmount}
                max={Math.min(selectedProduct.maxAmount, eligibility?.creditLimit || selectedProduct.maxAmount)}
              />
              <p className="text-xs text-[var(--foreground-muted)] mt-1">
                Max: {formatCurrency(Math.min(selectedProduct.maxAmount, eligibility?.creditLimit || selectedProduct.maxAmount))}
              </p>
            </div>
            <div>
              <label className="block text-sm text-[var(--foreground-muted)] mb-1">Tenure (months)</label>
              <select
                value={tenure}
                onChange={(e) => setTenure(e.target.value)}
                className="input-field"
              >
                {Array.from(
                  { length: selectedProduct.maxTenureMonths - selectedProduct.minTenureMonths + 1 },
                  (_, i) => selectedProduct.minTenureMonths + i
                ).filter(t => t % 3 === 0 || t === selectedProduct.minTenureMonths).map((t) => (
                  <option key={t} value={t}>{t} months</option>
                ))}
              </select>
            </div>
          </div>

          {amount && tenure && (
            <div className="p-4 rounded-xl bg-[var(--background)] mb-6">
              <p className="text-[var(--foreground-muted)]">Estimated EMI</p>
              <p className="text-3xl font-bold text-[var(--primary)]">
                {formatCurrency(calculateEmi())}/month
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setCurrentStep(1)} className="btn-secondary">
              Back
            </button>
            <button onClick={configureAndReview} className="btn-primary">
              Review Application
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Review & Submit */}
      {currentStep === 3 && selectedProduct && (
        <div className="card p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Review Your Application</h2>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between py-3 border-b border-[var(--border)]">
              <span className="text-[var(--foreground-muted)]">Product</span>
              <span className="text-white font-medium">{selectedProduct.name}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-[var(--border)]">
              <span className="text-[var(--foreground-muted)]">Loan Amount</span>
              <span className="text-white font-medium">{formatCurrency(parseInt(amount))}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-[var(--border)]">
              <span className="text-[var(--foreground-muted)]">Tenure</span>
              <span className="text-white font-medium">{tenure} months</span>
            </div>
            <div className="flex justify-between py-3 border-b border-[var(--border)]">
              <span className="text-[var(--foreground-muted)]">Interest Rate</span>
              <span className="text-white font-medium">{selectedProduct.interestRate}% p.a.</span>
            </div>
            <div className="flex justify-between py-3 border-b border-[var(--border)]">
              <span className="text-[var(--foreground-muted)]">Monthly EMI</span>
              <span className="text-[var(--accent-green)] font-bold text-lg">{formatCurrency(calculateEmi())}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 mb-6">
            <p className="text-sm text-[var(--foreground-muted)]">
              By submitting, you agree to pledge your mutual fund units as collateral. 
              A lien will be marked on eligible holdings.
            </p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setCurrentStep(2)} className="btn-secondary">
              Back
            </button>
            <button onClick={submitApplication} disabled={loading} className="btn-primary flex-1">
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

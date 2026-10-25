import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';

export default function AdminSubscriptionsPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | null
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [billingInterval, setBillingInterval] = useState('monthly');
  const [durationDays, setDurationDays] = useState(30);
  const [priceEtb, setPriceEtb] = useState(349);
  const [priceUsd, setPriceUsd] = useState(6.99);
  const [badge, setBadge] = useState('Most Popular');
  const [featuresText, setFeaturesText] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  async function loadPlans() {
    setLoading(true);
    try {
      const data = await adminApi.getSubscriptionPlans();
      setPlans(data || []);
    } catch (err) {
      console.error('Error fetching subscription plans:', err);
    } finally {
      setLoading(false);
    }
  }

  const openCreateModal = () => {
    setModalMode('create');
    setEditingId(null);
    setCode('');
    setName('');
    setBillingInterval('monthly');
    setDurationDays(30);
    setPriceEtb(349);
    setPriceUsd(6.99);
    setBadge('Special Offer');
    setFeaturesText([
      'Unlimited full-length mock examinations',
      'Interactive exam simulator with real timer',
      'Step-by-step verified worked rationales',
      'National percentile and cutoff analytics',
    ].join('\n'));
    setIsActive(true);
  };

  const openEditModal = (p) => {
    setModalMode('edit');
    setEditingId(p.id);
    setCode(p.code || '');
    setName(p.name || '');
    setBillingInterval(p.billing_interval || 'monthly');
    setDurationDays(p.duration_days || 30);
    setPriceEtb(parseFloat(p.price_etb) || 0);
    setPriceUsd(parseFloat(p.price_usd) || 0);
    setBadge(p.badge || '');
    const feats = Array.isArray(p.features_json) ? p.features_json : [];
    setFeaturesText(feats.join('\n'));
    setIsActive(p.is_active !== undefined ? p.is_active : true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      alert('Code and Name are required.');
      return;
    }

    const featuresArray = featuresText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    setSaving(true);
    try {
      const payload = {
        code: code.trim().toLowerCase(),
        name: name.trim(),
        billing_interval: billingInterval,
        duration_days: parseInt(durationDays, 10),
        price_etb: parseFloat(priceEtb),
        price_usd: parseFloat(priceUsd),
        badge: badge.trim(),
        features_json: featuresArray,
        is_active: isActive,
      };

      if (modalMode === 'create') {
        await adminApi.createSubscriptionPlan(payload);
      } else {
        await adminApi.updateSubscriptionPlan(editingId, payload);
      }

      setModalMode(null);
      await loadPlans();
    } catch (err) {
      alert(err.message || 'Failed to save subscription plan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Are you sure you want to delete ${p.name}? This will remove it from candidate checkout.`)) {
      return;
    }
    try {
      await adminApi.deleteSubscriptionPlan(p.id);
      await loadPlans();
    } catch (err) {
      alert(err.message || 'Failed to delete plan.');
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
              Monetization & Plans
            </span>
            <span className="text-xs text-on-surface-variant">Telebirr • CBE Birr • Chapa</span>
          </div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight mt-1">
            Subscription & Pricing Plans
          </h1>
          <p className="text-sm text-on-surface-variant">
            Configure ETB/USD prices, duration, feature entitlements, and active candidate plans.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold text-xs flex items-center gap-2 shadow-sm self-start transition-colors"
        >
          <span className="material-symbols-outlined text-base">add_card</span>
          <span>Create New Plan</span>
        </button>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map(p => {
          const feats = Array.isArray(p.features_json) ? p.features_json : [];
          return (
            <div
              key={p.id}
              className={`p-6 rounded-3xl border flex flex-col justify-between transition-all bg-surface-container ${
                p.is_active ? 'border-outline-variant/40 shadow-sm' : 'border-outline-variant/20 opacity-60'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-on-surface-variant block font-bold">
                      {p.code}
                    </span>
                    <h3 className="text-lg font-bold text-on-surface mt-0.5">{p.name}</h3>
                  </div>
                  {p.badge && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-secondary/10 text-secondary border border-secondary/20">
                      {p.badge}
                    </span>
                  )}
                </div>

                {/* Price Display */}
                <div className="p-4 rounded-2xl bg-surface border border-outline-variant/30 flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-black text-primary font-mono block">
                      {parseFloat(p.price_etb) === 0 ? 'FREE' : `${p.price_etb} ETB`}
                    </span>
                    <span className="text-[10px] text-on-surface-variant">
                      ${p.price_usd} USD • {p.billing_interval} ({p.duration_days} days)
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    p.is_active ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-500/10 text-slate-500'
                  }`}>
                    {p.is_active ? 'Active' : 'Archived'}
                  </span>
                </div>

                {/* Features List */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">
                    Candidate Entitlements ({feats.length}):
                  </span>
                  <ul className="space-y-1.5 text-xs text-on-surface-variant">
                    {feats.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-emerald-600 text-sm shrink-0 mt-0.5">
                          check_circle
                        </span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Card Actions */}
              <div className="pt-5 mt-5 border-t border-outline-variant/30 flex items-center justify-between">
                <span className="text-[11px] text-on-surface-variant font-medium">
                  {p.active_subscribers_count || 0} Active Subscribers
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(p)}
                    className="p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface transition-colors"
                    title="Edit Plan"
                  >
                    <span className="material-symbols-outlined text-lg">edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(p)}
                    className="p-2 rounded-xl text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
                    title="Delete Plan"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT PLAN MODAL */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface border border-outline-variant/40 rounded-3xl max-w-xl w-full flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container">
              <div>
                <h3 className="font-bold text-base text-on-surface">
                  {modalMode === 'create' ? 'Create Subscription Plan' : `Edit: ${name}`}
                </h3>
                <span className="text-xs text-on-surface-variant">
                  Update payment pricing thresholds and feature bullet points.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="p-1.5 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-on-surface-variant uppercase text-[10px] block mb-1">
                    Plan Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. premium_monthly, aviation_annual"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-on-surface-variant uppercase text-[10px] block mb-1">
                    Plan Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Premium Exam Pass"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-on-surface-variant uppercase text-[10px] block mb-1">
                    Billing Interval
                  </label>
                  <select
                    value={billingInterval}
                    onChange={(e) => setBillingInterval(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="annual">Annual</option>
                    <option value="lifetime">Lifetime</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-on-surface-variant uppercase text-[10px] block mb-1">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="font-bold text-on-surface-variant uppercase text-[10px] block mb-1">
                    Badge Text
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="e.g. Most Popular"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-on-surface-variant uppercase text-[10px] block mb-1">
                    Price in ETB (Birr) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={priceEtb}
                    onChange={(e) => setPriceEtb(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-on-surface-variant uppercase text-[10px] block mb-1">
                    Price in USD ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={priceUsd}
                    onChange={(e) => setPriceUsd(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary font-mono"
                  />
                </div>
              </div>

              {/* Features List Textarea (one per line) */}
              <div>
                <label className="font-bold text-on-surface-variant uppercase text-[10px] block mb-1">
                  Features Included (Enter one feature per line)
                </label>
                <textarea
                  rows={4}
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  placeholder="Unlimited full-length mock examinations&#10;Interactive exam simulator&#10;Worked rationales"
                  className="w-full p-3 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="planActiveToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary"
                />
                <label htmlFor="planActiveToggle" className="font-bold text-on-surface cursor-pointer">
                  Make Plan Available in Student Checkout
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 rounded-xl bg-surface-container text-on-surface font-semibold hover:bg-surface-container-high transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold shadow-sm disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

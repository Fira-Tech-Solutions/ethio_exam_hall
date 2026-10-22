import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function SubscriptionPage() {
  const { user } = useAuth();
  const [billingInterval, setBillingInterval] = useState('annual'); // 'monthly' or 'annual'
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('telebirr');
  const [phoneOrAccount, setPhoneOrAccount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  const currentPlan = user?.has_pro_access ? 'Premium Exam Pass' : 'Free Explorer Tier';
  const isPro = user?.has_pro_access;

  const PLANS = [
    {
      id: 'free',
      name: 'Free Explorer Tier',
      badge: 'Standard Access',
      priceMonthly: 0,
      priceAnnual: 0,
      desc: 'Fundamental access to Ethiopian past papers in read-only preview mode.',
      features: [
        'Access to public past exam papers (PDF)',
        'Basic timed test simulation',
        'Standard answer keys without explanations',
        'Community study discussion groups',
      ],
      current: !isPro,
      cta: 'Current Tier',
      disabled: true,
    },
    {
      id: 'pro',
      name: 'Premium Exam Pass',
      badge: 'Most Popular',
      priceMonthly: 349,
      priceAnnual: 2990,
      monthlyEquivalent: 249,
      desc: 'Full institutional license for University Exit, Freshman & Grade 12 examinations.',
      features: [
        'Unlimited Mock Examinations & National Simulators',
        'Interactive AI Agentic RAG Tutor (Hints & Explanations)',
        'Step-by-step worked rationales for all 100 questions',
        'National Percentile & Cutoff Readiness Analytics',
        'Locked Fullscreen Proctored Mode',
        'Continuous 2016 / 2017 E.C. syllabus updates',
      ],
      current: isPro,
      highlight: true,
      cta: isPro ? 'Active Plan' : 'Upgrade to Pro Pass',
    },
    {
      id: 'aviation',
      name: 'Aviation Academy Track',
      badge: 'Specialized Portal',
      priceMonthly: 699,
      priceAnnual: 5990,
      monthlyEquivalent: 499,
      desc: 'Comprehensive suite for Ethiopian Airlines Pilot Cadet, AMT & Crew competitions.',
      features: [
        'Everything in Premium Exam Pass included',
        'Pilot Cadet Aptitude, Physics & Spatial Orientation',
        'Aircraft Maintenance Technician (AMT) avionics bank',
        'Verified Oral Interview Questions & Panel Rubrics',
        'Ethiopian Airlines exam simulator with strict timing',
        'Direct instructor dispute priority',
      ],
      current: false,
      cta: 'Unlock Aviation Track',
    },
  ];

  const handleOpenCheckout = (plan) => {
    setSelectedPlan(plan);
    setCheckoutModalOpen(true);
    setSuccessMessage(false);
  };

  const handleSimulatePayment = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setSuccessMessage(true);
      setTimeout(() => {
        setCheckoutModalOpen(false);
      }, 2500);
    }, 1800);
  };

  return (
    <div className="w-full min-h-screen bg-[#070e1c] text-white p-4 sm:p-6 lg:p-8 flex flex-col gap-8">
      {/* Current Subscription Status Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-[#0B1527] to-slate-900 border border-slate-800 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              isPro 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}>
              {currentPlan}
            </span>
            <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Active Account
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Subscription & Institutional Access Tier
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Candidate ID: <strong className="font-mono text-amber-400">{user?.candidate_id || 'ETH-88492'}</strong> • Registered to {user?.name || 'Candidate'}. Your subscription unlocks full mock tests, step-by-step rationales, and the AI Agentic RAG Tutor.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-2 shrink-0 min-w-[240px]">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
            Current Tier Status
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-white">{isPro ? 'Pro Pass' : 'Free'}</span>
            <span className="text-xs text-amber-400 font-semibold">{isPro ? '342 Days Left' : 'No Expiry'}</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {isPro ? 'Unlimited access to all examinations.' : 'Upgrade to unlock full answers & AI Tutor.'}
          </p>
        </div>
      </div>

      {/* Interval Toggle */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center p-1.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-inner">
          <button
            onClick={() => setBillingInterval('monthly')}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              billingInterval === 'monthly'
                ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingInterval('annual')}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              billingInterval === 'annual'
                ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Annual Pass</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500 text-slate-950">
              Save 28%
            </span>
          </button>
        </div>
        <span className="text-xs text-slate-400">
          Payment processed securely via Ethiopian local payment rails (Telebirr & CBE Birr)
        </span>
      </div>

      {/* Plans Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {PLANS.map(plan => {
          const isAnnual = billingInterval === 'annual';
          const price = isAnnual ? plan.priceAnnual : plan.priceMonthly;

          return (
            <div
              key={plan.id}
              className={`p-6 sm:p-8 rounded-3xl border flex flex-col justify-between gap-6 transition-all relative ${
                plan.highlight
                  ? 'bg-gradient-to-b from-[#0F1E36] to-slate-900 border-amber-500/60 shadow-2xl shadow-amber-500/10 ring-1 ring-amber-500/40'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md">
                  Recommended for Students
                </span>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {plan.badge}
                  </span>
                  {plan.current && (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Current
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{plan.desc}</p>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-white font-mono">
                      {price === 0 ? 'Free' : `ETB ${price}`}
                    </span>
                    {price > 0 && (
                      <span className="text-xs text-slate-400 font-semibold">
                        /{isAnnual ? 'year' : 'month'}
                      </span>
                    )}
                  </div>
                  {isAnnual && plan.monthlyEquivalent && (
                    <span className="text-[11px] text-amber-400 font-semibold block mt-0.5">
                      Equivalent to ETB {plan.monthlyEquivalent}/month
                    </span>
                  )}
                </div>

                <ul className="space-y-2.5 pt-4 border-t border-slate-800 text-xs text-slate-300">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-base text-amber-400 shrink-0 mt-0.5">
                        check
                      </span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                disabled={plan.current}
                onClick={() => handleOpenCheckout(plan)}
                className={`w-full py-3 rounded-xl font-black text-xs sm:text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 ${
                  plan.current
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                    : plan.highlight
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                }`}
              >
                <span>{plan.cta}</span>
                {!plan.current && <span className="material-symbols-outlined text-base">arrow_forward</span>}
              </button>
            </div>
          );
        })}
      </div>

      {/* Checkout Modal */}
      {checkoutModalOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-[#0B1527] border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative text-white">
            <button
              onClick={() => setCheckoutModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            {successMessage ? (
              <div className="py-8 text-center flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl">
                  <span className="material-symbols-outlined text-4xl">check_circle</span>
                </div>
                <h3 className="text-xl font-bold text-white">Subscription Activated!</h3>
                <p className="text-xs text-slate-300">
                  Your account has been upgraded to <strong>{selectedPlan.name}</strong>. Telebirr/CBE transaction verified.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSimulatePayment} className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    Instant Upgrade Checkout
                  </span>
                  <h3 className="text-xl font-black text-white">{selectedPlan.name}</h3>
                  <p className="text-xs text-slate-400">
                    Total: <strong className="text-white font-mono">ETB {billingInterval === 'annual' ? selectedPlan.priceAnnual : selectedPlan.priceMonthly}</strong> ({billingInterval})
                  </p>
                </div>

                {/* Local Payment Methods */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">
                    Choose Local Payment Gateway:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'telebirr', name: 'Telebirr', badge: 'Instant (Ethio Telecom)' },
                      { id: 'cbe', name: 'CBE Birr', badge: 'Commercial Bank of Ethiopia' },
                      { id: 'chapa', name: 'Chapa', badge: 'Debit Cards / Awash' },
                      { id: 'ebirr', name: 'E-Birr / Coopay', badge: 'Cooperative Bank' },
                    ].map(p => (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => setPaymentMethod(p.id)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          paymentMethod === p.id
                            ? 'bg-amber-500/10 border-amber-400 ring-1 ring-amber-400/50'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="text-xs font-bold text-white block">{p.name}</span>
                        <span className="text-[10px] opacity-75">{p.badge}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 block">
                    {paymentMethod === 'telebirr' ? 'Telebirr Mobile Number:' : 'Account Number / Phone:'}
                  </label>
                  <input
                    type="text"
                    required
                    value={phoneOrAccount}
                    onChange={(e) => setPhoneOrAccount(e.target.value)}
                    placeholder="0911234567"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-[10px] text-slate-500">
                    A push verification prompt will be sent directly to your phone.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                      <span>Verifying with {paymentMethod.toUpperCase()}...</span>
                    </>
                  ) : (
                    <>
                      <span>Pay ETB {billingInterval === 'annual' ? selectedPlan.priceAnnual : selectedPlan.priceMonthly}</span>
                      <span className="material-symbols-outlined text-base">lock</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

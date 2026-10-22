import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function PricingPage() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [plans, setPlans] = useState([]);
  const [billingInterval, setBillingInterval] = useState('monthly'); // 'monthly' | 'annual'
  const [loading, setLoading] = useState(true);

  // Checkout modal state
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState('telebirr');
  const [phoneOrAccount, setPhoneOrAccount] = useState('');
  const [checkoutResult, setCheckoutResult] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState(false);

  useEffect(() => {
    api.getPlans().then(setPlans).catch(console.error).finally(() => setLoading(false));
  }, []);

  const getPlanByCode = (code) => {
    return plans.find(p => p.code === code) || null;
  };

  const handleOpenCheckout = (plan) => {
    if (!user) {
      navigate('/sign-in');
      return;
    }
    if (plan.price_etb == 0) {
      alert('You already have access to the Free Student Plan!');
      return;
    }
    setSelectedPlan(plan);
    setCheckoutResult(null);
    setVerifySuccess(false);
  };

  const handleInitiatePayment = async (e) => {
    e.preventDefault();
    if (!selectedPlan) return;
    setCheckoutLoading(true);
    try {
      const res = await api.checkout({
        planId: selectedPlan.id,
        provider: selectedProvider,
        phoneOrAccount: phoneOrAccount.trim(),
      });
      setCheckoutResult(res);
    } catch (err) {
      alert(err.message || 'Payment initiation failed.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!checkoutResult?.referenceCode) return;
    setCheckoutLoading(true);
    try {
      const res = await api.verifyPayment(checkoutResult.referenceCode);
      setVerifySuccess(true);
      await refreshUser();
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      alert(err.message || 'Verification failed.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Monthly vs Annual Plan Selectors
  const freePlan = getPlanByCode('free');
  const premiumPlan = billingInterval === 'monthly' ? getPlanByCode('premium_monthly') : getPlanByCode('premium_annual');
  const aviationPlan = billingInterval === 'monthly' ? getPlanByCode('aviation_monthly') : getPlanByCode('aviation_annual');

  return (
    <div className="w-full bg-slate-950 min-h-screen text-white flex flex-col">
      
      {/* 1. Sticky Hero & Billing Selector Layer (z-10) */}
      <section
        style={{ position: 'sticky', top: 0, zIndex: 10 }}
        className="w-full min-h-[46vh] lg:min-h-[50vh] py-10 sm:py-14 bg-gradient-to-b from-slate-950 via-[#0B1527] to-[#0B1527] text-white relative overflow-hidden border-b border-slate-800/80 flex flex-col justify-center items-center text-center px-4"
      >
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-semibold text-amber-300 uppercase tracking-widest mb-3 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Telebirr &amp; CBE Birr Integrated</span>
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight mb-2">
            Fair &amp; Accessible Exam Preparation
          </h1>

          <p className="text-amber-400/90 text-sm font-medium mb-3">
            ተመጣጣኝ እና አስተማማኝ የፈተና ዝግጅት ክፍያ
          </p>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed mb-6">
            Free access to authentic past papers. Upgrade for full-length timed mock simulators, detailed step-by-step rationales, and specialized aviation candidate training.
          </p>

          {/* Billing Interval Switcher */}
          <div className="bg-slate-900/90 border border-slate-700/80 p-1.5 rounded-full flex items-center gap-1 shadow-xl backdrop-blur-md">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                billingInterval === 'monthly'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
              type="button"
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingInterval('annual')}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingInterval === 'annual'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
              type="button"
            >
              <span>Annual Billing</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-black bg-emerald-500 text-slate-950">
                Save 28%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Sticky Overlapping Pricing Cards Layer (z-20) */}
      <section
        style={{ position: 'sticky', top: 0, zIndex: 20 }}
        className="w-full min-h-screen py-16 md:py-24 bg-[#0B1527] text-white relative shadow-[0_-20px_50px_rgba(0,0,0,0.6)] border-t border-slate-800/80 flex flex-col justify-center items-center"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            
            {/* 1. Free Student Plan */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl backdrop-blur-md">
              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-[11px] font-bold mb-4">
                  Free Forever
                </div>
                <h2 className="text-2xl font-black text-white">Free Student Plan</h2>
                <p className="text-xs text-slate-400 mt-1 mb-6 leading-relaxed">
                  Essential past paper discovery and basic practice for all Ethiopian matriculation candidates.
                </p>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-white font-mono">0</span>
                  <span className="font-mono text-sm text-slate-400 font-bold">ETB / month</span>
                </div>

                <div className="space-y-3 border-t border-slate-800 pt-5 text-xs text-slate-300">
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-amber-400 text-[18px] shrink-0">check</span>
                    <span>5,000+ Past exam papers archive (PDF previews)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-amber-400 text-[18px] shrink-0">check</span>
                    <span>Basic timed drill simulator</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-amber-400 text-[18px] shrink-0">check</span>
                    <span>Official answer keys with basic answer letters</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-amber-400 text-[18px] shrink-0">check</span>
                    <span>Mobile &amp; desktop responsive browser experience</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-800">
                <button
                  disabled
                  className="w-full py-3 bg-slate-800 text-slate-400 rounded-xl text-xs font-bold cursor-default"
                >
                  Included by Default
                </button>
              </div>
            </div>

            {/* 2. Premium Exam Pass (Recommended) */}
            <div className="bg-slate-900/95 border-2 border-amber-400 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-[0_20px_60px_rgba(245,158,11,0.2)] relative scale-100 md:scale-105 z-10 backdrop-blur-xl">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 px-4 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-lg">
                Recommended for University Candidates
              </div>

              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-bold mb-4 mt-2 border border-amber-400/40">
                  Most Popular Choice
                </div>
                <h2 className="text-2xl font-black text-white">Premium Exam Pass</h2>
                <p className="text-xs text-slate-300 mt-1 mb-6 leading-relaxed">
                  Complete mock test environment with verified step-by-step rationales and national cutoff analytics.
                </p>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-amber-400 font-mono">
                    {billingInterval === 'monthly' ? '349' : '2,990'}
                  </span>
                  <span className="font-mono text-sm text-slate-300 font-bold">
                    ETB {billingInterval === 'monthly' ? '/ month' : '/ year'}
                  </span>
                  <span className="text-[11px] text-slate-400 ml-2">
                    ({billingInterval === 'monthly' ? '$6.99 USD' : '$59.99 USD'})
                  </span>
                </div>

                <div className="space-y-3 border-t border-slate-800 pt-5 text-xs text-slate-200">
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-amber-400 text-[18px] shrink-0 font-bold">check_circle</span>
                    <span className="font-bold text-white">Unlimited interactive mock simulations with real MoE countdown timer</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-amber-400 text-[18px] shrink-0 font-bold">check_circle</span>
                    <span><strong>Step-by-step verified worked rationales</strong> for every question</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-amber-400 text-[18px] shrink-0 font-bold">check_circle</span>
                    <span><strong>National percentile score</strong> &amp; institutional cutoff predictions</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-amber-400 text-[18px] shrink-0 font-bold">check_circle</span>
                    <span>Custom drill builder filtered by curriculum domain</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-amber-400 text-[18px] shrink-0 font-bold">check_circle</span>
                    <span>Targeted remedial revision recommendations</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-800">
                <button
                  onClick={() => handleOpenCheckout(premiumPlan)}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 rounded-xl font-bold text-sm shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 hover:scale-105"
                >
                  <span>Get Premium Exam Pass</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* 3. Aviation & Professional Prep */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl backdrop-blur-md">
              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[11px] font-bold mb-4">
                  Specialized Track
                </div>
                <h2 className="text-2xl font-black text-white">Aviation &amp; Professional Prep</h2>
                <p className="text-xs text-slate-400 mt-1 mb-6 leading-relaxed">
                  Engineered for Ethiopian Airlines Aviation Academy Pilot Cadets, AMT Technicians, and Cabin Crew.
                </p>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-white font-mono">
                    {billingInterval === 'monthly' ? '699' : '5,990'}
                  </span>
                  <span className="font-mono text-sm text-slate-400 font-bold">
                    ETB {billingInterval === 'monthly' ? '/ month' : '/ year'}
                  </span>
                  <span className="text-[11px] text-slate-400 ml-2">
                    ({billingInterval === 'monthly' ? '$12.99 USD' : '$119.99 USD'})
                  </span>
                </div>

                <div className="space-y-3 border-t border-slate-800 pt-5 text-xs text-slate-300">
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-amber-400 text-[18px] shrink-0">check</span>
                    <span className="font-bold text-white">All Premium Exam Pass features included</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-amber-400 text-[18px] shrink-0">check</span>
                    <span><strong>Commercial Pilot Cadet</strong> entrance examination mock suites</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-amber-400 text-[18px] shrink-0">check</span>
                    <span>Aircraft Maintenance Technician (AMT) mechanics &amp; turbine physics</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-amber-400 text-[18px] shrink-0">check</span>
                    <span>Aviation spatial orientation &amp; psychomotor agility drills</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-amber-400 text-[18px] shrink-0">check</span>
                    <span>Verified interview question banks and scoring rubrics</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-800">
                <button
                  onClick={() => handleOpenCheckout(aviationPlan)}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-95 border border-slate-700 hover:border-amber-400/40"
                >
                  <span>Unlock Aviation Portal</span>
                  <span className="material-symbols-outlined text-[18px]">flight</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 3. Sticky Ethiopian Local Financial Rails Layer (z-30) */}
      <section
        style={{ position: 'sticky', top: 0, zIndex: 30 }}
        className="w-full min-h-screen py-16 md:py-24 bg-[#070e1c] text-white relative shadow-[0_-20px_50px_rgba(0,0,0,0.7)] border-t border-slate-800/80 flex flex-col justify-center items-center text-center px-4"
      >
        <div className="max-w-4xl mx-auto w-full flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-semibold text-amber-300 uppercase tracking-widest mb-3 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span>Local Ethiopian Financial Rails</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight mb-2">
            Secure Local &amp; Seamless Ethiopian Payment Options
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl mb-10 leading-relaxed">
            No international credit card required. Instantly activate your premium features via Telebirr, CBE Birr, Chapa, or direct deposit.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col items-center gap-1.5 shadow-lg">
              <span className="font-mono text-xl text-amber-400 font-bold">telebirr</span>
              <span className="text-[11px] text-slate-400 font-medium">USSD Push &amp; QR Code</span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col items-center gap-1.5 shadow-lg">
              <span className="font-mono text-xl text-amber-400 font-bold">CBE Birr</span>
              <span className="text-[11px] text-slate-400 font-medium">Commercial Bank *847#</span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col items-center gap-1.5 shadow-lg">
              <span className="font-mono text-xl text-emerald-400 font-bold">Chapa</span>
              <span className="text-[11px] text-slate-400 font-medium">Mobile &amp; Web Checkout</span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col items-center gap-1.5 shadow-lg">
              <span className="font-mono text-xl text-blue-400 font-bold">Awash Pay</span>
              <span className="text-[11px] text-slate-400 font-medium">Direct Bank Transfer</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Checkout Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-700 relative text-white">
            
            <button
              onClick={() => setSelectedPlan(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>

            {!checkoutResult ? (
              <form onSubmit={handleInitiatePayment} className="flex flex-col gap-4">
                <div className="border-b border-slate-800 pb-3">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Checkout</span>
                  <h3 className="text-xl font-bold text-white">
                    Activate {selectedPlan.name}
                  </h3>
                  <p className="font-mono text-2xl text-amber-400 font-bold mt-1">
                    ETB {selectedPlan.price_etb}
                  </p>
                </div>

                {/* Choose Payment Rail */}
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-2">
                    Select Ethiopian Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'telebirr', name: 'Telebirr', desc: 'Direct USSD Push' },
                      { id: 'cbe_birr', name: 'CBE Birr', desc: 'Commercial Bank' },
                      { id: 'chapa', name: 'Chapa Pay', desc: 'Card & Multi-rail' },
                      { id: 'bank_transfer', name: 'Bank Transfer', desc: 'CBE Account Slip' },
                    ].map((p) => (
                      <label
                        key={p.id}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col gap-0.5 ${
                          selectedProvider === p.id
                            ? 'border-amber-400 bg-amber-400/10 ring-1 ring-amber-400'
                            : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800'
                        }`}
                      >
                        <input
                          type="radio"
                          name="provider"
                          value={p.id}
                          checked={selectedProvider === p.id}
                          onChange={(e) => setSelectedProvider(e.target.value)}
                          className="sr-only"
                        />
                        <span className="font-bold text-white text-[13px]">{p.name}</span>
                        <span className="text-[11px] text-slate-400">{p.desc}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Mobile or Account input */}
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    {selectedProvider === 'telebirr' ? 'Telebirr Registered Phone Number' : 'Account or Phone Identifier'}
                  </label>
                  <input
                    type="text"
                    required
                    value={phoneOrAccount}
                    onChange={(e) => setPhoneOrAccount(e.target.value)}
                    placeholder={selectedProvider === 'telebirr' ? '+251 91 123 4567' : 'Enter account or reference'}
                    className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={checkoutLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-md mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {checkoutLoading ? (
                    <span>Processing Payment Push...</span>
                  ) : (
                    <>
                      <span>Pay ETB {selectedPlan.price_etb}</span>
                      <span className="material-symbols-outlined text-[18px]">lock</span>
                    </>
                  )}
                </button>
              </form>
            ) : verifySuccess ? (
              <div className="py-8 flex flex-col items-center text-center gap-3">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <span className="material-symbols-outlined text-[36px]">check_circle</span>
                </div>
                <h3 className="text-xl text-white font-bold">Payment Verified!</h3>
                <p className="text-sm text-slate-300">
                  Your Pro entitlement has been activated on the server. Redirecting to Candidate Dashboard...
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="text-center border-b border-slate-800 pb-4">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                    Transaction Initiated
                  </span>
                  <h3 className="text-lg font-bold text-white">
                    Complete via {checkoutResult.provider.toUpperCase()}
                  </h3>
                  <div className="mt-2 inline-block px-4 py-1.5 rounded-lg bg-slate-950 font-mono text-base font-bold text-amber-400 border border-slate-800">
                    Ref: {checkoutResult.referenceCode}
                  </div>
                </div>

                <div className="bg-slate-950/80 rounded-xl p-4 text-xs space-y-2 border border-slate-800">
                  <span className="font-bold text-white block">Payment Instructions:</span>
                  <p className="text-slate-300 leading-relaxed">
                    {checkoutResult.instructions?.step1}
                  </p>
                  <p className="text-slate-300 leading-relaxed">
                    {checkoutResult.instructions?.step2}
                  </p>
                  <p className="text-amber-300 font-bold">
                    {checkoutResult.instructions?.step3}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleVerifyPayment}
                  disabled={checkoutLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {checkoutLoading ? (
                    <span>Verifying with Server...</span>
                  ) : (
                    <>
                      <span>I Have Completed Payment</span>
                      <span className="material-symbols-outlined text-[18px]">verified</span>
                    </>
                  )}
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

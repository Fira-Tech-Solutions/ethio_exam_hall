import React, { useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';

function IsometricAcademicIllustration() {
  return (
    <svg className="w-full h-full drop-shadow-xl" fill="none" viewBox="0 0 320 240" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="160" cy="195" fill="#10233F" fillOpacity="0.14" rx="90" ry="22"></ellipse>
      {/* Examination papers stack */}
      <path d="M70 175 L150 142 L230 172 L150 205 Z" fill="#E2E8F0"></path>
      <path d="M70 180 L150 147 L230 177 L150 210 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5"></path>
      <path d="M100 175 L135 160" stroke="#94A3B8" strokeLinecap="round" strokeWidth="2"></path>
      <path d="M105 182 L140 167" stroke="#94A3B8" strokeLinecap="round" strokeWidth="2"></path>
      {/* Diploma scroll with ribbon & seal */}
      <g transform="translate(145, 120) rotate(-15)">
        <path d="M10 32 C10 24, 25 24, 25 32 L25 90 C25 98, 10 98, 10 90 Z" fill="#E2E8F0"></path>
        <path d="M20 28 L95 5 C98 5, 105 12, 105 20 L30 102 C25 102, 20 95, 20 88 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5"></path>
        <rect fill="#DC2626" height="52" rx="2" transform="rotate(35 60 56)" width="16" x="52" y="30"></rect>
        <circle cx="68" cy="62" fill="#B91C1C" r="14" stroke="#991B1B" strokeWidth="2"></circle>
        <circle cx="68" cy="62" fill="#DC2626" r="9"></circle>
        <path d="M68 56 L70 60 L74 61 L71 64 L72 68 L68 66 L64 68 L65 64 L62 61 L66 60 Z" fill="#F59E0B"></path>
      </g>
      {/* 3D Mortarboard */}
      <g transform="translate(0, -10)">
        <path d="M110 95 C110 80, 210 80, 210 95 C210 120, 110 120, 110 95 Z" fill="#1E293B"></path>
        <path d="M125 102 C125 122, 195 122, 195 102 L195 122 C195 138, 125 138, 125 122 Z" fill="#0F172A"></path>
        <polygon fill="#1E293B" points="160,52 250,88 160,122 70,88"></polygon>
        <polygon fill="#24344D" points="160,55 245,88 160,119 75,88"></polygon>
        <ellipse cx="160" cy="87" fill="#F59E0B" rx="6" ry="3.5"></ellipse>
        <path d="M160 88 C175 90, 210 96, 215 118" fill="none" stroke="#F59E0B" strokeLinecap="round" strokeWidth="3"></path>
        <ellipse cx="215" cy="120" fill="#D97706" rx="3" ry="2"></ellipse>
        <path d="M213 120 L211 148 L220 148 L217 120 Z" fill="#F59E0B"></path>
        <line stroke="#D97706" strokeWidth="2" x1="211" x2="220" y1="148" y2="148"></line>
      </g>
    </svg>
  );
}

export default function AdminLoginPage() {
  const { login } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [language, setLanguage] = useState('EN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isAm = language === 'AM';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || (isAm ? 'መግባት አልተሳካም። የአስተዳዳሪ ፈቃድ ያስፈልጋል።' : 'Login failed. Administrator privileges required.'));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSuperAdmin = async () => {
    setLoading(true);
    setError(null);
    try {
      await login('admin@ethioexamhall.edu.et', 'Password123!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#E5EBF4] accent-mesh font-sans text-slate-800 flex flex-col justify-between antialiased selection:bg-brand-blue selection:text-white">
      {/* ======================= MAIN CONTENT AREA (FULL SCREEN) ======================= */}
      <div className="flex-grow w-full items-center justify-center px-6 sm:px-10 lg:px-12 xl:px-16 2xl:px-24 py-8 lg:py-12 flex">
        <div className="w-full max-w-7xl 2xl:max-w-[1536px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16 items-center">
          {/* Left Hero Section (lg:col-span-7) */}
          <section className="lg:col-span-7 flex flex-col justify-between h-full space-y-8 z-10" data-purpose="branding-and-illustration">
            {/* Brand Logo Header */}
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-navy to-brand-blue flex items-center justify-center text-white shadow-md shadow-brand-blue/30 transform transition-transform hover:scale-105">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                </svg>
              </div>
              <div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-extrabold tracking-tight text-brand-navy">Ethio Exam Hall</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-brand-blue font-ethiopic border border-blue-200/60">
                    {isAm ? 'አስተዳዳሪ ፖርታል' : 'ኢትዮ ፈተና'}
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">
                  {isAm ? 'የአስተዳደር እና የፈተና ይዘት ቁጥጥር ማዕከል' : 'Administration & Content Pipeline'}
                </p>
              </div>
            </div>

            {/* Inspiring Academic Quote & Restricted Access Badge */}
            <div className="space-y-4 max-w-xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/80 border border-slate-200/80 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>
                  {isAm
                    ? 'የተጠበቀ የትምህርት ሚኒስቴር እና የፈተናዎች ኤጀንሲ አስተዳዳሪ መረብ'
                    : 'Restricted MoE & EAES Administrator Network'}
                </span>
              </div>
              <div className="relative pl-6 border-l-4 border-brand-blue">
                <span className="text-3xl text-brand-blue/40 font-serif absolute -top-2 left-1 select-none">&ldquo;</span>
                <h1 className="text-3xl xl:text-[2.2rem] font-bold text-brand-navy leading-tight">
                  {isAm ? (
                    <>
                      የኢትዮጵያን <span className="text-brand-blue underline decoration-brand-blue/30 underline-offset-4">ብሔራዊ የምዘና ሥርዓት</span> በበላይነት መምራት።
                    </>
                  ) : (
                    <>
                      Overseeing Ethiopia&rsquo;s <span className="text-brand-blue underline decoration-brand-blue/30 underline-offset-4">National Assessment Pipeline</span>.
                    </>
                  )}
                </h1>
                <p className="text-base text-slate-600 mt-2 font-normal">
                  {isAm
                    ? 'የተረጋገጡ የሚኒስቴር ፈተናዎችን፣ የተማሪዎች ስብስቦችን፣ የክፍያ ምዝገባዎችን እና የፈተና ማስመሰያ ሞተርን ከአንድ ደህንነቱ የተጠበቀ ማዕከል ያስተዳድሩ።'
                    : 'Manage verified ministry exam papers, candidate cohorts, subscription tiers, and the timed simulation engine from one secure control center.'}
                </p>
              </div>
            </div>

            {/* 3D Isometric Academic Illustration Graphic */}
            <div className="flex items-center justify-center py-6" data-purpose="academic-illustration">
              <div className="relative w-80 h-60 animate-floating flex items-center justify-center">
                <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-2xl -z-10"></div>
                <IsometricAcademicIllustration />
              </div>
            </div>

            {/* Trust Badges & Administrative Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-200/80 pt-5">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-blue-100/70 text-brand-blue rounded-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </div>
                <span className="text-xs font-semibold text-slate-700 leading-tight">
                  {isAm ? 'የሚኒስቴር የተረጋገጠ የፈተና ይዘት' : 'Ministry-Verified Content Pipeline'}
                </span>
              </div>
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-blue-100/70 text-brand-blue rounded-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </div>
                <span className="text-xs font-semibold text-slate-700 leading-tight">
                  {isAm ? 'በደረጃ የተገደበ የአስተዳዳሪ ፈቃድ' : 'Role-Gated Superadmin Access'}
                </span>
              </div>
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-blue-100/70 text-brand-blue rounded-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </div>
                <span className="text-xs font-semibold text-slate-700 leading-tight">
                  {isAm ? 'የቀጥታ የተማሪዎች መረጃ እና ትንታኔ' : 'Live Cohort & Analytics Console'}
                </span>
              </div>
            </div>
          </section>

          {/* Right Login Card Section (lg:col-span-5) */}
          <section className="lg:col-span-5 flex justify-center items-center w-full" data-purpose="auth-form-card">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-card-lift border border-slate-100 overflow-hidden relative">
              {/* Top Curved Banner */}
              <div className="relative bg-gradient-to-r from-brand-navy via-brand-blue to-blue-600 h-28 flex items-center justify-center overflow-hidden">
                <div className="absolute -right-6 -top-6 w-28 h-28 bg-white/10 rounded-full blur-md pointer-events-none"></div>
                <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-sm pointer-events-none"></div>
                <svg className="absolute bottom-0 left-0 w-full text-white fill-current" preserveAspectRatio="none" viewBox="0 0 400 30">
                  <path d="M0,0 C150,30 250,30 400,0 L400,30 L0,30 Z"></path>
                </svg>
              </div>

              {/* Security Shield Avatar Badge */}
              <div className="relative -mt-12 flex flex-col items-center z-10 px-6">
                <div className="w-20 h-20 rounded-2xl bg-white shadow-lg p-2 border-2 border-white ring-4 ring-blue-50 flex items-center justify-center group hover:scale-105 transition-transform duration-200">
                  <div className="w-full h-full rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 text-brand-blue flex items-center justify-center">
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"></path>
                    </svg>
                  </div>
                </div>
                <h2 className="mt-2 text-lg font-bold text-brand-navy tracking-tight">
                  {isAm ? 'የአስተዳደር መቆጣጠሪያ ዳሽቦርድ' : 'Admin Control Center'}
                </h2>
                <p className="text-xs text-slate-500 font-medium font-ethiopic">
                  {isAm ? 'የይለፍ ቃልዎን ያስገቡ' : 'የአስተዳደር መቆጣጠሪያ ዳሽቦርድ'}
                </p>
              </div>

              {/* Restricted Access Badge */}
              <div className="px-6 pt-4 pb-2 flex items-center justify-center">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-[11px] font-bold text-red-600 uppercase tracking-wider">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                  <span>
                    {isAm ? 'የተገደበ መግቢያ — ለፈቃድ ላላቸው ብቻ' : 'Restricted Access — Authorised Personnel Only'}
                  </span>
                </span>
              </div>

              {error && (
                <div className="mx-6 mb-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[13px] font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="p-6 pt-3 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    {isAm ? 'የአስተዳዳሪ ኢሜይል' : 'Administrator Email'}
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@ethioexamhall.edu.et"
                      className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      {isAm ? 'ዋና የይለፍ ቃል' : 'Master Password'}
                    </label>
                    <a className="text-xs font-semibold text-brand-blue hover:text-blue-700 transition-colors" href="#recover">
                      {isAm ? 'መለያ ማግኛ' : 'Recover Access?'}
                    </a>
                  </div>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      aria-label="Toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" strokeLinecap="round" strokeLinejoin="round"></path>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round"></path>
                          <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round"></path>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center text-xs pt-0.5">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input defaultChecked type="checkbox" className="w-4 h-4 text-brand-blue border-slate-300 rounded focus:ring-brand-blue transition" />
                    <span className="text-slate-600 font-medium select-none">
                      {isAm ? 'ይህን ደህንነቱ የተጠበቀ ኮምፒውተር እመነዉ' : 'Trust this secure workstation'}
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-navy to-brand-blue hover:from-slate-900 hover:to-blue-700 text-white font-bold text-sm tracking-wide shadow-md shadow-brand-blue/30 hover:shadow-lg hover:shadow-brand-blue/40 transform active:scale-[0.99] transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
                >
                  <span>
                    {loading
                      ? (isAm ? 'ደህንነት በማረጋገጥ ላይ...' : 'Authenticating...')
                      : (isAm ? 'እንደ አስተዳዳሪ ይግቡ' : 'Sign In as Administrator')}
                  </span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </button>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-3 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                    {isAm ? 'ፈጣን የሙከራ መግቢያ' : 'instant demo sign-in'}
                  </span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleQuickSuperAdmin}
                  className="w-full flex items-center justify-center space-x-1.5 py-2.5 px-3 border border-slate-200 rounded-xl hover:bg-slate-50 text-xs font-semibold text-slate-700 transition disabled:opacity-50"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-gold inline-block"></span>
                  <span>Super Admin (admin@ethioexamhall.edu.et)</span>
                </button>

                <p className="text-center text-[11px] text-slate-500 pt-1">
                  {isAm
                    ? 'ሁሉም እንቅስቃሴዎች በትምህርት ሚኒስቴር የመረጃ ፖሊሲ መሰረት ይመዘገባሉ።'
                    : 'Access is logged and monitored under MoE & EAES data policy.'}
                </p>
              </form>
            </div>
          </section>
        </div>
      </div>

      {/* ======================= FULL-WIDTH DARK FOOTER ======================= */}
      <footer className="w-full bg-brand-navy text-slate-300 py-4 px-8 lg:px-16 border-t border-slate-800" data-purpose="site-footer">
        <div className="w-full max-w-7xl 2xl:max-w-[1536px] mx-auto flex items-center justify-between gap-4 text-xs font-medium">
          <div className="flex items-center space-x-2 text-slate-400">
            <span>&copy; 2025 Ethio Exam Hall. MoE &amp; EAES Accredited Framework.</span>
            <span className="hidden xl:inline text-slate-600">|</span>
            <span className="hidden xl:inline text-slate-300 font-ethiopic">የኢትዮጵያ የትምህርት ምዘና እና ፈተናዎች ኤጀንሲ ተባባሪ</span>
          </div>
          <div className="flex items-center gap-x-6">
            <a className="hover:text-white transition-colors" href="#policy">Data Policy</a>
            <a className="hover:text-white transition-colors" href="#audit">Audit Logs</a>
            <a className="hover:text-white transition-colors" href="#contact">IT Help Desk</a>
            <div className="inline-flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700">
              <button
                type="button"
                onClick={() => setLanguage('EN')}
                className={`px-2 py-0.5 rounded text-[11px] transition ${language === 'EN' ? 'bg-brand-blue text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('AM')}
                className={`px-2 py-0.5 rounded text-[11px] font-ethiopic transition ${language === 'AM' ? 'bg-brand-blue text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                አማርኛ
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

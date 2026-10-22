import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TelegramAuthButton from '../components/common/TelegramAuthButton';

/* ------------------------------------------------------------------ */
/* Shared Helper Components                                           */
/* ------------------------------------------------------------------ */

function EyeToggleButton({ show, onClick }) {
  return (
    <button
      type="button"
      aria-label="Toggle password visibility"
      onClick={onClick}
      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 focus:outline-none transition-colors"
    >
      {show ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Sign In & Register Page — Consistent Cinematic Dark UI             */
/* ------------------------------------------------------------------ */

export function SignInPage({ initialMode = 'signin' }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, register } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'signin' or 'register'

  // Common & SignIn state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register specific state
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [language, setLanguage] = useState('EN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  const isAm = language === 'AM';

  // Real-time password verification checks
  const passChecks = {
    length: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password),
  };
  const isPasswordStrong =
    passChecks.length &&
    passChecks.hasUpper &&
    passChecks.hasLower &&
    passChecks.hasNumber &&
    passChecks.hasSpecial;
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

  const switchMode = (newMode) => {
    setMode(newMode);
    setError(null);
    setInfo(null);
    if (newMode === 'register') {
      window.history.replaceState(null, '', '/register');
    } else {
      window.history.replaceState(null, '', '/sign-in');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    try {
      if (mode === 'register') {
        if (!name.trim()) {
          throw new Error(isAm ? 'እባክዎ ሙሉ ስምዎን ያስገቡ።' : 'Please enter your full name.');
        }
        if (!isPasswordStrong) {
          throw new Error(
            isAm
              ? 'እባክዎ ጠንካራ የይለፍ ቃል መስፈርቶችን ያሟሉ (ቢያንስ 8 ፊደላት፣ ትልቅና ትንሽ ፊደል፣ ቁጥር እና ልዩ ምልክት)።'
              : 'Please fulfill all password requirements before registering.'
          );
        }
        if (password !== confirmPassword) {
          throw new Error(isAm ? 'የይለፍ ቃሎች አይጣጣሙም።' : 'Passwords do not match.');
        }

        await register({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        });
        navigate('/dashboard');
      } else {
        await login(email, password);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(
        err.message ||
          (isAm
            ? 'አልተሳካም። እባክዎ መረጃዎን ያረጋግጡ።'
            : 'Authentication failed. Please verify your credentials.')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail) => {
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      await login(demoEmail, 'Password123!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#070e1c] font-inter text-slate-100 flex flex-col justify-between relative overflow-hidden selection:bg-blue-600 selection:text-white">
      {/* Background Lighting & Radial Mesh Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-[550px] h-[450px] bg-amber-500/5 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_20%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      {/* Top Navbar Bar */}
      <header className="w-full bg-[#0B1527]/80 backdrop-blur-md border-b border-slate-800/80 z-20">
        <div className="max-w-7xl 2xl:max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-12 h-16 sm:h-20 flex items-center justify-between">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/images/logo.png"
              alt="Ethio Exam Hall Logo"
              className="h-9 sm:h-11 w-auto object-contain transition-transform group-hover:scale-105 drop-shadow"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-extrabold tracking-tight text-white group-hover:text-blue-400 transition-colors">
                  Ethio Exam Hall
                </span>
                <span className="hidden sm:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  {isAm ? 'ብሔራዊ ፖርታል' : '2017 E.C.'}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium hidden sm:block">
                {isAm ? 'ብሔራዊ የምዘና እና የፈተና ማስመሰያ መረብ' : 'National Assessment & Timed Simulator Network'}
              </p>
            </div>
          </Link>

          {/* Quick Links & Language Toggle */}
          <div className="flex items-center gap-3 sm:gap-6">
            <Link
              to="/"
              className="text-xs sm:text-sm font-medium text-slate-300 hover:text-white transition-colors hidden md:inline-flex items-center gap-1.5"
            >
              <span>{isAm ? 'መነሻ' : 'Home'}</span>
            </Link>
            <Link
              to="/explore-exams"
              className="text-xs sm:text-sm font-medium text-slate-300 hover:text-white transition-colors hidden md:inline-flex items-center gap-1.5"
            >
              <span>{isAm ? 'ፈተናዎችን ይመልከቱ' : 'Explore Exams'}</span>
            </Link>
            <Link
              to="/assisted-with-ai"
              className="text-xs sm:text-sm font-medium text-slate-300 hover:text-white transition-colors hidden md:inline-flex items-center gap-1.5"
            >
              <span>{isAm ? 'በአርቴፊሻል ኢንተለጀንስ የታገዘ' : 'Assisted with AI'}</span>
            </Link>
            <Link
              to="/pricing"
              className="text-xs sm:text-sm font-medium text-slate-300 hover:text-white transition-colors hidden md:inline-flex items-center gap-1.5"
            >
              <span>{isAm ? 'ዋጋዎች' : 'Pricing'}</span>
            </Link>

            {/* Language Selector */}
            <div className="inline-flex items-center bg-slate-900/90 rounded-lg p-0.5 border border-slate-700">
              <button
                type="button"
                onClick={() => setLanguage('EN')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
                  language === 'EN'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('AM')}
                className={`px-2 py-1 rounded text-[11px] font-ethiopic font-semibold transition ${
                  language === 'AM'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                አማ
              </button>
            </div>

            {/* Return link */}
            <Link
              to="/"
              className="text-xs font-semibold text-slate-400 hover:text-blue-400 flex items-center gap-1 transition-colors border border-slate-800 bg-slate-900/60 px-3 py-1.5 rounded-lg"
            >
              <span>&larr;</span>
              <span className="hidden sm:inline">{isAm ? 'ተመለስ' : 'Return'}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ======================= MAIN WORKSPACE (TWO-COLUMN) ======================= */}
      <main className="flex-grow w-full flex items-center justify-center px-4 sm:px-6 lg:px-12 xl:px-16 py-8 sm:py-12 z-10">
        <div className="w-full max-w-7xl 2xl:max-w-[1536px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center">
          
          {/* Left Column: Academic Credentials & Value Showcase (lg:col-span-7) */}
          <section className="lg:col-span-7 flex flex-col space-y-6 sm:space-y-8">
            
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold w-fit">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              <span>{isAm ? 'ብሔራዊ የፈተና ዝግጅት መድረክ' : 'Official Ethiopian Examination Preparation Network'}</span>
            </div>

            {/* Hero Heading */}
            <div className="space-y-3 max-w-2xl">
              <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black tracking-tight text-white leading-[1.15]">
                {isAm ? (
                  <>
                    በብቃት ይዘጋጁ። <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300">
                      ነገን በልበ ሙሉነት ይገንቡ።
                    </span>
                  </>
                ) : (
                  <>
                    Prepare Smarter. <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300">
                      Walk Into Every Exam With Confidence.
                    </span>
                  </>
                )}
              </h1>
              <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
                {isAm
                  ? 'የኢትዮጵያን ተማሪዎች እና ባለሙያዎች ለ12ኛ ክፍል ማትሪክ፣ የዩኒቨርሲቲ መውጫ ፈተና፣ የፍሬሽማን ኮርሶች እና የኢትዮጵያ አየር መንገድ አካዳሚ ፈተናዎች በታማኝነት ማዘጋጀት።'
                  : 'Empowering Ethiopia’s candidates to excel across Grade 12 ESUEE matriculation, University Exit Exams, freshman university courses, and Ethiopian Airlines Aviation Academy entrance pipelines.'}
              </p>
            </div>

            {/* 3 Value Bento Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="p-4 rounded-2xl bg-[#0B1527]/70 border border-slate-800 backdrop-blur-sm hover:border-blue-500/30 transition-colors group">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-lg">verified</span>
                </div>
                <h3 className="text-xs font-bold text-white mb-1">
                  {isAm ? '1,200+ የተረጋገጡ ፈተናዎች' : '1,200+ Verified Papers'}
                </h3>
                <p className="text-[11px] text-slate-400 leading-snug">
                  {isAm ? 'የሚኒስቴር እና የዩኒቨርሲቲ ትክክለኛ የጥያቄ ቡክሌቶች ከመልስ ጋር' : 'Grade 12 ESUEE, MoE Exit Exams, and University freshman finals.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0B1527]/70 border border-slate-800 backdrop-blur-sm hover:border-amber-500/30 transition-colors group">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-lg">psychology</span>
                </div>
                <h3 className="text-xs font-bold text-white mb-1">
                  {isAm ? 'AI አጋዥ አስተማሪ (RAG)' : 'AI Academic Tutor'}
                </h3>
                <p className="text-[11px] text-slate-400 leading-snug">
                  {isAm ? 'የደረጃ በደረጃ ማብራሪያ፣ ፍንጮች እና የሥርዓተ-ትምህርት መረጃዎች' : 'Instant pedagogical hints, step-by-step logic, and syllabus links.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0B1527]/70 border border-slate-800 backdrop-blur-sm hover:border-emerald-500/30 transition-colors group">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-lg">timer</span>
                </div>
                <h3 className="text-xs font-bold text-white mb-1">
                  {isAm ? 'ትክክለኛ የፈተና ማስመሰያ' : 'Timed Simulator'}
                </h3>
                <p className="text-[11px] text-slate-400 leading-snug">
                  {isAm ? 'ሙሉ ስክሪን የተቆለፈበት እና ማጭበርበርን የሚከላከል የፈተና አካባቢ' : 'Full-screen locked mode, countdown timers, and anti-cheat monitoring.'}
                </p>
              </div>
            </div>

            {/* Official Institution Partner Badges */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
                {isAm ? 'ፈተና አዘጋጅ እና እውቅና የተሰጣቸው ተቋማት' : 'Curriculum Standards & Examination Partners'}
              </span>
              <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                <div className="flex items-center justify-center h-12 px-4 bg-[#0B1527]/90 backdrop-blur-md rounded-xl border border-slate-800 hover:border-blue-500/40 transition group" title="Ethiopian Airlines Aviation University">
                  <img
                    src="/images/inst_logos/Ethiopian_Airlines_Logo.svg.webp"
                    alt="Ethiopian Airlines"
                    className="h-6 w-auto max-w-[110px] object-contain group-hover:scale-105 transition-transform filter brightness-95"
                  />
                </div>
                <div className="flex items-center justify-center h-12 px-4 bg-[#0B1527]/90 backdrop-blur-md rounded-xl border border-slate-800 hover:border-blue-500/40 transition group" title="Ministry of Education (Ethiopia)">
                  <img
                    src="/images/inst_logos/Ministry_of_Education_(Ethiopia).png"
                    alt="Ministry of Education"
                    className="h-7 w-7 object-contain group-hover:scale-105 transition-transform"
                  />
                  <span className="ml-2 text-xs font-semibold text-slate-300">MoE / EAES</span>
                </div>
                <div className="flex items-center justify-center h-12 px-4 bg-[#0B1527]/90 backdrop-blur-md rounded-xl border border-slate-800 hover:border-blue-500/40 transition group" title="Addis Ababa University">
                  <img
                    src="/images/inst_logos/aau.png"
                    alt="Addis Ababa University"
                    className="h-7 w-7 object-contain group-hover:scale-105 transition-transform"
                  />
                  <span className="ml-2 text-xs font-semibold text-slate-300">AAU</span>
                </div>
                <div className="flex items-center justify-center h-12 px-4 bg-[#0B1527]/90 backdrop-blur-md rounded-xl border border-slate-800 hover:border-blue-500/40 transition group" title="Adama Science and Technology University">
                  <img
                    src="/images/inst_logos/astu.png"
                    alt="Adama Science and Technology University"
                    className="h-7 w-7 object-contain group-hover:scale-105 transition-transform"
                  />
                  <span className="ml-2 text-xs font-semibold text-slate-300">ASTU</span>
                </div>
              </div>
            </div>
          </section>

          {/* Right Column: High-Impact Dark Glass Authentication Card (lg:col-span-5) */}
          <section className="lg:col-span-5 flex flex-col justify-center items-center w-full" data-purpose="auth-form-card">
            <div className="w-full max-w-md bg-[#0B1527]/90 backdrop-blur-2xl rounded-3xl border border-slate-800 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden relative">
              
              {/* Top Accent Gradient Bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-400" />

              {/* Header inside Card */}
              <div className="p-6 sm:p-7 pb-4 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3 shadow-lg shadow-blue-500/10">
                  <span className="material-symbols-outlined text-2xl">school</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {mode === 'signin'
                    ? (isAm ? 'እንኳን ደህና መጡ' : 'Welcome Back')
                    : (isAm ? 'አካውንት ይፍጠሩ' : 'Create Free Account')}
                </h2>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  {mode === 'signin'
                    ? (isAm ? 'ዝግጅትዎን በኢትዮ ፈተና አዳራሽ ይቀጥሉ' : 'Access your personalized exam prep workspace.')
                    : (isAm ? 'የፈተና ዝግጅትዎን አሁኑኑ በነፃ ይጀምሩ' : 'Join thousands of Ethiopian candidates preparing today.')}
                </p>

                {/* In-Place Mode Switcher Tabs */}
                <div className="mt-4 bg-slate-900/90 p-1 rounded-xl flex items-center text-xs font-semibold border border-slate-800">
                  <button
                    type="button"
                    onClick={() => switchMode('signin')}
                    className={`flex-1 py-2 text-center rounded-lg transition-all ${
                      mode === 'signin'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-md shadow-blue-600/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {isAm ? 'መግቢያ' : 'Sign In'}
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode('register')}
                    className={`flex-1 py-2 text-center rounded-lg transition-all ${
                      mode === 'register'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-md shadow-blue-600/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {isAm ? 'አዲስ መመዝገቢያ' : 'Create Account'}
                  </button>
                </div>
              </div>

              {/* Alerts: Error & Info */}
              <div className="px-6 sm:px-7 space-y-2">
                {error && (
                  <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs font-medium flex items-start gap-2">
                    <span className="material-symbols-outlined text-sm text-red-400 shrink-0 mt-0.5">error</span>
                    <span>{error}</span>
                  </div>
                )}
                {info && (
                  <div className="p-3 rounded-xl bg-blue-950/50 border border-blue-500/40 text-blue-200 text-xs font-medium">
                    {info}
                  </div>
                )}
              </div>

              {/* Primary Action: Single-Click Telegram Auth */}
              <div className="px-6 sm:px-7 pt-2 pb-1">
                <TelegramAuthButton
                  text={mode === 'signin' ? "Continue with Telegram" : "Sign up with Telegram"}
                  amharicText={mode === 'signin' ? "በቴሌግራም ይቀጥሉ" : "በቴሌግራም ይመዝገቡ"}
                  isAm={isAm}
                  returnUrl="/dashboard"
                />
              </div>

              {/* Divider */}
              <div className="px-6 sm:px-7 py-3 flex items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-3 text-slate-500 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider">
                  {mode === 'signin'
                    ? (isAm ? 'ወይም በኢሜይል እና የይለፍ ቃል' : 'or sign in with password')
                    : (isAm ? 'ወይም በኢሜይል ይመዝገቡ' : 'or register with email')}
                </span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              {/* Main Auth Form */}
              <form onSubmit={handleSubmit} className="px-6 sm:px-7 pb-6 space-y-3.5">
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      {isAm ? 'ሙሉ ስም' : 'Full Name'}
                    </label>
                    <div className="relative rounded-xl shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <span className="material-symbols-outlined text-lg">person</span>
                      </div>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={isAm ? 'ምሳሌ፡ አበበ በቀለ' : 'e.g. Abebe Bekele'}
                        className="block w-full pl-10 pr-3 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    {isAm ? 'ኢሜይል አድራሻ' : 'Email Address'}
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <span className="material-symbols-outlined text-lg">mail</span>
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={isAm ? 'ምሳሌ፡ user@example.com' : 'e.g., name@example.com'}
                      className="block w-full pl-10 pr-3 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      {isAm ? 'የይለፍ ቃል' : 'Password'}
                    </label>
                    {mode === 'signin' && (
                      <a className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors" href="#recover">
                        {isAm ? 'ረሱት?' : 'Forgot Password?'}
                      </a>
                    )}
                  </div>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <span className="material-symbols-outlined text-lg">lock</span>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="block w-full pl-10 pr-10 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <EyeToggleButton show={showPassword} onClick={() => setShowPassword(!showPassword)} />
                  </div>

                  {/* Password requirements meter for register */}
                  {mode === 'register' && (
                    <div className="mt-2.5 p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1.5 px-0.5">
                        <span>{isAm ? 'የይለፍ ቃል መስፈርቶች፡' : 'Password requirements:'}</span>
                        {password && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            isPasswordStrong ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {isPasswordStrong ? (isAm ? 'ጠንካራ' : 'Strong') : (isAm ? 'ያልተሟላ' : 'Incomplete')}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[10.5px]">
                        <div className={`flex items-center gap-1.5 transition-colors ${passChecks.length ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
                          <span className="material-symbols-outlined text-xs">
                            {passChecks.length ? 'check_circle' : 'radio_button_unchecked'}
                          </span>
                          <span>{isAm ? 'ቢያንስ 8 ፊደላት' : 'Min. 8 characters'}</span>
                        </div>
                        <div className={`flex items-center gap-1.5 transition-colors ${passChecks.hasUpper && passChecks.hasLower ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
                          <span className="material-symbols-outlined text-xs">
                            {passChecks.hasUpper && passChecks.hasLower ? 'check_circle' : 'radio_button_unchecked'}
                          </span>
                          <span>{isAm ? 'ትልቅና ትንሽ (A-z)' : 'Upper & lowercase'}</span>
                        </div>
                        <div className={`flex items-center gap-1.5 transition-colors ${passChecks.hasNumber ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
                          <span className="material-symbols-outlined text-xs">
                            {passChecks.hasNumber ? 'check_circle' : 'radio_button_unchecked'}
                          </span>
                          <span>{isAm ? 'ቁጥር (0-9)' : 'At least 1 number'}</span>
                        </div>
                        <div className={`flex items-center gap-1.5 transition-colors ${passChecks.hasSpecial ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
                          <span className="material-symbols-outlined text-xs">
                            {passChecks.hasSpecial ? 'check_circle' : 'radio_button_unchecked'}
                          </span>
                          <span>{isAm ? 'ልዩ ምልክት (!@#$)' : 'Special char (!@#$)'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      {isAm ? 'የይለፍ ቃል ያረጋግጡ' : 'Confirm Password'}
                    </label>
                    <div className="relative rounded-xl shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <span className="material-symbols-outlined text-lg">verified_user</span>
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="block w-full pl-10 pr-10 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      <EyeToggleButton show={showConfirmPassword} onClick={() => setShowConfirmPassword(!showConfirmPassword)} />
                    </div>
                    {confirmPassword && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-[11px] px-1">
                        {passwordsMatch ? (
                          <span className="text-emerald-400 font-medium flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">check_circle</span>
                            {isAm ? 'የይለፍ ቃሎች ይጣጣማሉ' : 'Passwords match'}
                          </span>
                        ) : (
                          <span className="text-red-400 font-medium flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">cancel</span>
                            {isAm ? 'የይለፍ ቃሎች አይጣጣሙም' : 'Passwords do not match'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {mode === 'signin' && (
                  <div className="flex items-center text-xs pt-0.5">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        defaultChecked
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 bg-slate-900 border-slate-700 rounded focus:ring-blue-500 focus:ring-offset-slate-900 transition"
                      />
                      <span className="text-slate-300 font-medium select-none">
                        {isAm ? 'ይህን መሣሪያ አስታውስ' : 'Remember this device'}
                      </span>
                    </label>
                  </div>
                )}

                {/* Primary Submit Button */}
                <button
                  type="submit"
                  disabled={loading || (mode === 'register' && (!isPasswordStrong || !passwordsMatch))}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transform active:scale-[0.99] transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>
                    {loading
                      ? (isAm ? 'በማስኬድ ላይ...' : 'Authenticating...')
                      : mode === 'register'
                      ? (isAm ? 'አካውንት ፍጠር' : 'Create Account')
                      : (isAm ? 'ወደ ፈተና አዳራሽ ይግቡ' : 'Sign In')}
                  </span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>

                {/* Quick Demo Access (Sign-in mode only) */}
                {mode === 'signin' && (
                  <>
                    <div className="relative flex py-1 items-center">
                      <div className="flex-grow border-t border-slate-800"></div>
                      <span className="flex-shrink mx-3 text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
                        {isAm ? 'ፈጣን የሙከራ መግቢያ' : 'instant demo access'}
                      </span>
                      <div className="flex-grow border-t border-slate-800"></div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => handleQuickDemo('dawit@aau.edu.et')}
                        className="h-9 border border-emerald-500/30 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition active:scale-[0.99] disabled:opacity-50"
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shadow-sm shadow-emerald-400"></span>
                        <span>Candidate (Dawit)</span>
                      </button>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => handleQuickDemo('admin@ethioexamhall.edu.et')}
                        className="h-9 border border-blue-500/30 bg-blue-950/40 hover:bg-blue-900/60 text-blue-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition active:scale-[0.99] disabled:opacity-50"
                      >
                        <span className="w-2 h-2 rounded-full bg-blue-400 inline-block shadow-sm shadow-blue-400"></span>
                        <span>Super Admin</span>
                      </button>
                    </div>
                  </>
                )}

                {/* In-Place Bottom Toggle Prompt */}
                <div className="pt-2 text-center">
                  {mode === 'signin' ? (
                    <p className="text-xs text-slate-400 font-medium">
                      {isAm ? 'አዲስ ተጠቃሚ ነዎት?' : "Don't have an account?"}{' '}
                      <button
                        type="button"
                        onClick={() => switchMode('register')}
                        className="font-bold text-blue-400 hover:text-blue-300 hover:underline cursor-pointer transition-colors"
                      >
                        {isAm ? 'ነፃ አካውንት ይፍጠሩ' : 'Create an Account'}
                      </button>
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 font-medium">
                      {isAm ? 'ቀደም ሲል አካውንት አለዎት?' : 'Already have an account?'}{' '}
                      <button
                        type="button"
                        onClick={() => switchMode('signin')}
                        className="font-bold text-blue-400 hover:text-blue-300 hover:underline cursor-pointer transition-colors"
                      >
                        {isAm ? 'ይግቡ' : 'Sign In'}
                      </button>
                    </p>
                  )}
                </div>
              </form>
            </div>
          </section>
        </div>
      </main>

      {/* ======================= FULL-WIDTH DARK FOOTER ======================= */}
      <footer className="w-full bg-[#050B14] text-slate-400 py-4 px-6 lg:px-12 border-t border-slate-800/80 z-20">
        <div className="max-w-7xl 2xl:max-w-[1536px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span>&copy; 2026 Ethio Exam Hall. All rights reserved.</span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-slate-500 hidden sm:inline">
              {isAm ? 'የትምህርት ምዘና እና ፈተናዎች አገልግሎት ተባባሪ' : 'Educational Assessment & Examinations Service Framework'}
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <Link to="/explore-exams" className="hover:text-white transition-colors">
              {isAm ? 'ፈተናዎች' : 'Exams'}
            </Link>
            <Link to="/pricing" className="hover:text-white transition-colors">
              {isAm ? 'ዋጋዎች' : 'Plans'}
            </Link>
            <span className="text-slate-600">|</span>
            <span className="text-[11px] text-slate-500 font-mono">v2.0-secure</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Register Page Wrapper                                              */
/* ------------------------------------------------------------------ */

export function RegisterPage() {
  return <SignInPage initialMode="register" />;
}

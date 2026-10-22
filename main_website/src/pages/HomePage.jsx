import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import ExamCard from '../components/exam/ExamCard';
import HeroCinematicVideo from '../components/common/HeroCinematicVideo';
import PopularCategoriesSection from '../components/home/PopularCategoriesSection';

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [featuredExams, setFeaturedExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, exams] = await Promise.all([
          api.getCategories(),
          api.getFeaturedExams(),
        ]);
        setCategories(cats || []);
        setFeaturedExams(exams || []);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="flex flex-col w-full">
      
      {/* 1. Fullscreen Cinematic Hero Section (Sticky Background) */}
      <section
        aria-label="Ethio Exam Hall Hero"
        className="relative w-full h-screen min-h-screen flex items-center justify-start overflow-hidden bg-slate-950 text-white"
        style={{ position: 'sticky', top: 0, zIndex: 10 }}
      >
        {/* Full Bleed Background Video */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <HeroCinematicVideo className="w-full h-full" />
          {/* Multi-stage dark vignette for maximum text contrast & cinematic depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-slate-950/60 pointer-events-none" />
          <div className="absolute inset-0 bg-radial from-transparent via-slate-950/30 to-slate-950/80 pointer-events-none" />
        </div>
        {/* Left-Aligned Clean Hero Content Over Video */}
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10 flex flex-col items-start justify-center h-full pt-16">
          <div className="max-w-xl text-left flex flex-col items-start gap-4 animate-fade-in-up">
            
            {/* Small overline pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/15 text-white shadow-lg">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                Ethio Exam Hall
              </span>
            </div>

            {/* Small clean headline */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-snug drop-shadow-lg">
              National Examination &amp; Timed Simulator Platform
            </h1>

            {/* Small descriptive text */}
            <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed drop-shadow-md">
              Past papers, timed exam simulation, and diagnostic performance analytics for Ethiopian candidates.
            </p>

            {/* Left Action Button -> Redirects to sign-up/register page */}
            <div className="pt-2">
              <Link
                to="/register"
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-sm shadow-xl hover:shadow-2xl transition-all inline-flex items-center gap-2 active:scale-95 group"
              >
                <span>Get Started for Free</span>
                <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </Link>
            </div>

          </div>
        </div>

        {/* Scroll Indicator */}
        <div
          aria-hidden="true"
          className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 pointer-events-none animate-bounce flex flex-col items-center gap-1.5"
        >
          <span className="text-[10px] uppercase tracking-[0.25em] text-white/60 font-semibold">Scroll</span>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-white/60">
            <path
              d="M10 4v12m0 0l-4-4m4 4l4-4"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </section>

      {/* 2. Popular Academic & Career Categories (Sticky Layer 2 - z-20) */}
      <PopularCategoriesSection categories={categories} style={{ position: 'sticky', top: 0, zIndex: 20 }} />

      {/* 3. Featured Examination Resources (Sticky Layer 3 - z-30) */}
      <section
        style={{ position: 'sticky', top: 0, zIndex: 30 }}
        className="w-full min-h-screen py-16 md:py-24 bg-[#0B1527] text-white relative overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.6)] border-t border-slate-800/80 flex flex-col justify-center"
      >
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 md:mb-14">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-semibold text-amber-300 uppercase tracking-widest mb-2 shadow-inner">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span>Verified National Resources</span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
                Featured Examination Resources
              </h2>
              <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
                Authentic papers accompanied by official booklet codes, curriculum domains, and worked rationales.
              </p>
            </div>
            <Link
              to="/explore-exams"
              className="px-5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-amber-300 font-bold text-sm transition-all inline-flex items-center gap-1.5 shrink-0 shadow-md hover:scale-105 active:scale-95"
            >
              <span>View Full Archive</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-64 rounded-2xl bg-slate-900/80 border border-slate-800 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredExams.map((exam) => (
                <ExamCard key={exam.id} exam={exam} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. Editorial Spotlight Split / Photo Narrative (Sticky Layer 4 - z-40) */}
      <section
        style={{ position: 'sticky', top: 0, zIndex: 40 }}
        className="w-full min-h-screen py-16 md:py-24 bg-[#070e1c] text-white relative overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.6)] border-t border-slate-800/80 flex flex-col justify-center"
      >
        <div className="absolute top-1/3 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Photo Column with Overlapping Micro Badge */}
            <div className="lg:col-span-5 relative">
              <div className="w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl relative bg-slate-900 border border-slate-800">
                <img
                  src="/images/hero-student.jpg"
                  alt="Ethiopian university candidate studying for national examinations in library setting"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105 brightness-95 hover:brightness-105"
                  width="600"
                  height="450"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none"></div>
              </div>

              {/* Overlapping Micro Badge */}
              <div className="absolute -bottom-6 -right-2 sm:-right-4 bg-slate-900/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl shadow-2xl max-w-xs flex items-center gap-3 border border-slate-700/80">
                <div className="w-11 h-11 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center shrink-0 shadow-md">
                  <span className="material-symbols-outlined text-[22px]">fact_check</span>
                </div>
                <div>
                  <span className="text-sm text-white font-bold block">100% Ethiopian Standard</span>
                  <span className="text-xs text-slate-400">Reviewed against Ministry syllabi</span>
                </div>
              </div>
            </div>

            {/* Editorial Content Column */}
            <div className="lg:col-span-7 flex flex-col justify-center lg:pl-6 mt-8 lg:mt-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-semibold text-amber-300 uppercase tracking-widest mb-3 shadow-inner w-fit">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span>Designed For Serious Focus</span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight mb-3">
                No distractions. Just structured past papers and timed exam practice.
              </h2>
              <p className="text-slate-300 text-sm sm:text-base mb-6 leading-relaxed">
                Most online preparation materials for Ethiopian students are fragmented across unorganized Telegram channels, poorly photocopied PDFs, and low-res photos. Ethio Exam Hall curates, cleans, typesets, and validates each examination paper.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <span className="material-symbols-outlined text-amber-400 text-[22px] shrink-0 mt-0.5">verified</span>
                  <div>
                    <h4 className="text-sm font-bold text-white">Official Year Provenance</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Categorized by Ethiopian Calendar (E.C.) and Gregorian academic intakes.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <span className="material-symbols-outlined text-amber-400 text-[22px] shrink-0 mt-0.5">rule</span>
                  <div>
                    <h4 className="text-sm font-bold text-white">Ministry Syllabi Alignment</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Curriculum domain breakdowns matched to official exit exam competencies.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <span className="material-symbols-outlined text-amber-400 text-[22px] shrink-0 mt-0.5">lightbulb</span>
                  <div>
                    <h4 className="text-sm font-bold text-white">Step-by-Step Rationales</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Verified solutions with academic explanations to master key concepts.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <span className="material-symbols-outlined text-amber-400 text-[22px] shrink-0 mt-0.5">ad_off</span>
                  <div>
                    <h4 className="text-sm font-bold text-white">Zero Ad Distraction</h4>
                    <p className="text-xs text-slate-400 mt-0.5">A clean, distraction-free environment built exclusively for serious candidates.</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Link
                  to="/explore-exams"
                  className="px-6 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold rounded-xl shadow-xl transition-all inline-flex items-center gap-2 hover:scale-105 active:scale-95"
                >
                  <span>Explore All Verified Papers</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Aviation Portal Spotlight (Sticky Layer 5 - z-50) */}
      <section
        style={{ position: 'sticky', top: 0, zIndex: 50 }}
        className="w-full min-h-screen py-16 md:py-24 bg-[#0A162B] text-white relative overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.6)] border-t border-slate-800/80 flex flex-col justify-center"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 w-full">
          
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-semibold text-amber-300 uppercase tracking-widest mb-4 shadow-inner">
              <span className="material-symbols-outlined text-[16px]">flight</span>
              <span>Dedicated Aviation Division</span>
            </div>
            
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight mb-3">
              Master the Ethiopian Aviation Academy &amp; Airline Entrance
            </h2>
            
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
              Specialized preparation tracks engineered for Ethiopian Airlines Commercial Pilot Cadets, Aircraft Maintenance Technicians (AMT), Cabin Crew, and Dispatchers.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/aviation-portal"
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold shadow-xl transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
              >
                <span>Enter Aviation Portal</span>
                <span className="material-symbols-outlined text-[18px]">flight_takeoff</span>
              </Link>
              <Link
                to="/pricing"
                className="px-5 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-white font-bold transition-all"
              >
                View Aviation Prep Plans
              </Link>
            </div>
          </div>

          {/* Aviation Visual Cockpit Card & Dial */}
          <div className="w-full lg:w-auto shrink-0 flex flex-col sm:flex-row items-center gap-6">
            
            {/* Cadet Photo Card */}
            <div className="relative w-full sm:w-56 h-64 rounded-3xl overflow-hidden shadow-2xl border border-slate-700/80 bg-slate-900 shrink-0">
              <img
                src="/images/aviation-cadet.jpg"
                alt="Ethiopian Airlines cadet pilot in training"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                width="224"
                height="256"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent pointer-events-none"></div>
              <div className="absolute bottom-3 left-3 right-3 text-left">
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">Cadet Academy</span>
                <span className="text-sm font-bold text-white block">Bole International Airport</span>
              </div>
            </div>

            {/* Instrument Horizon Dial */}
            <div className="bg-slate-900/90 p-5 rounded-3xl border border-slate-800 flex flex-col items-center justify-center shrink-0 w-full sm:w-56 shadow-2xl backdrop-blur-md">
              <div className="w-32 h-32 rounded-full border-2 border-slate-700 relative flex items-center justify-center bg-slate-950 shadow-inner">
                <svg className="w-28 h-28" viewBox="0 0 100 100">
                  <clipPath id="horizon-home-clip">
                    <circle cx="50" cy="50" r="44" />
                  </clipPath>
                  <g clipPath="url(#horizon-home-clip)">
                    <rect fill="#1e40af" height="52" opacity="0.85" width="100" x="0" y="0" />
                    <rect fill="#0f172a" height="48" width="100" x="0" y="52" />
                    <line stroke="#38bdf8" strokeWidth="1.5" x1="15" x2="85" y1="52" y2="52" />
                    <line stroke="#ffffff" strokeDasharray="2 2" strokeWidth="1" x1="38" x2="62" y1="42" y2="42" />
                    <line stroke="#ffffff" strokeWidth="1" x1="42" x2="58" y1="32" y2="32" />
                    <line stroke="#ffffff" strokeDasharray="2 2" strokeWidth="1" x1="38" x2="62" y1="62" y2="62" />
                    <polygon fill="#38bdf8" points="50,10 47,16 53,16" />
                    <circle cx="50" cy="52" fill="#ffffff" r="2.5" />
                    <line stroke="#ffffff" strokeWidth="2.5" x1="28" x2="44" y1="52" y2="52" />
                    <line stroke="#ffffff" strokeWidth="2.5" x1="56" x2="72" y1="52" y2="52" />
                    <line stroke="#ffffff" strokeWidth="2" x1="50" x2="50" y1="52" y2="57" />
                  </g>
                </svg>
                <div className="absolute bottom-1 font-mono text-[9px] text-amber-300 font-semibold tracking-wider">
                  PITCH +4°
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 w-full mt-3 text-center">
                <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                  <span className="block text-slate-400 text-[10px] font-semibold">ALTITUDE</span>
                  <span className="font-mono text-xs text-white font-bold">8,500 <span className="text-[9px] font-normal text-slate-400">FT</span></span>
                </div>
                <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                  <span className="block text-slate-400 text-[10px] font-semibold">AIRSPEED</span>
                  <span className="font-mono text-xs text-white font-bold">260 <span className="text-[9px] font-normal text-slate-400">KTS</span></span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 6. How Ethio Exam Hall Works (Sticky Layer 6 - z-60) */}
      <section
        style={{ position: 'sticky', top: 0, zIndex: 60 }}
        className="w-full min-h-screen py-16 md:py-24 bg-slate-950 text-white relative overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.7)] border-t border-slate-800/80 flex flex-col justify-center"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 w-full">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-semibold text-amber-300 uppercase tracking-widest mb-3 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span>Standardized Method</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight mb-8">
            How Ethio Exam Hall Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col gap-4 shadow-xl hover:-translate-y-2 hover:border-amber-400/40 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400/30 text-amber-300 flex items-center justify-center font-black text-xl shadow-sm">
                1
              </div>
              <h3 className="text-xl font-bold text-white">
                Discover Past Papers
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Search verified national exams categorized by curriculum tracks, years, and academic domains with official attribution.
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col gap-4 shadow-xl hover:-translate-y-2 hover:border-amber-400/40 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-300 flex items-center justify-center font-black text-xl shadow-sm">
                2
              </div>
              <h3 className="text-xl font-bold text-white">
                Practice Realistic Simulations
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Experience official timed countdowns, question palettes, and review flagging that accurately model real MoE and EAA examination conditions.
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col gap-4 shadow-xl hover:-translate-y-2 hover:border-amber-400/40 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center justify-center font-black text-xl shadow-sm">
                3
              </div>
              <h3 className="text-xl font-bold text-white">
                Master Diagnostic Analytics
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Receive server-graded scores, national percentile ranks, domain breakdowns, and step-by-step verified rationales.
              </p>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
}

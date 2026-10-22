import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import ExamCard from '../components/exam/ExamCard';

export default function AviationPortalPage() {
  const [disciplines, setDisciplines] = useState([]);
  const [aviationExams, setAviationExams] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAviation() {
      try {
        const [discs, exams, st] = await Promise.all([
          api.getAviationDisciplines(),
          api.getAviationExams(),
          api.getAviationStats(),
        ]);
        setDisciplines(discs || []);
        setAviationExams(exams || []);
        setStats(st || null);
      } catch (err) {
        console.error('Failed to load aviation data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAviation();
  }, []);

  return (
    <div className="w-full bg-slate-950 min-h-screen text-white flex flex-col">
      
      {/* 1. Sticky Aviation Hero & Live Metrics Layer (z-10) */}
      <section
        style={{ position: 'sticky', top: 0, zIndex: 10 }}
        className="w-full min-h-[50vh] lg:min-h-[55vh] py-10 sm:py-14 bg-gradient-to-b from-slate-950 via-[#0B1527] to-[#0A162B] text-white relative overflow-hidden border-b border-slate-800/80 flex flex-col justify-center"
      >
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex flex-col gap-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Mission Description */}
            <div className="lg:col-span-7 flex flex-col gap-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-semibold text-amber-300 uppercase tracking-widest shadow-inner w-fit">
                <span className="material-symbols-outlined text-[16px]">flight</span>
                <span>Ethiopian Aviation University &amp; Academy Recruitment Portal</span>
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
                Master the Ethiopian Aviation Academy &amp; Airline Entrance.
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
                Targeted aptitude models, applied aerodynamics, spatial reasoning matrices, and mechanical comprehension suites engineered directly for Ethiopian Airlines cadet cohorts.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/simulator/7" // EAA-CADET-2024
                  className="px-6 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-sm rounded-xl shadow-xl transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
                >
                  <span>Launch Cadet Aptitude Mock</span>
                  <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                </Link>
                <Link
                  to="/pricing"
                  className="px-5 py-3.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white font-bold text-sm rounded-xl transition-all"
                >
                  Unlock Aviation Track (ETB 699)
                </Link>
              </div>
            </div>

            {/* Right Column: Visual Cockpit & Cadet Photo */}
            <div className="lg:col-span-5 flex flex-col sm:flex-row items-center justify-center gap-5 shrink-0">
              
              {/* Cadet Pilot Photo Card */}
              <div className="relative w-full sm:w-48 h-56 rounded-3xl overflow-hidden shadow-2xl border border-slate-700/80 bg-slate-900 shrink-0">
                <img
                  src="/images/aviation-cadet.jpg"
                  alt="Ethiopian Airlines cadet pilot in training"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  width="192"
                  height="224"
                  loading="eager"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none"></div>
                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-left">
                  <span className="text-[9px] font-bold text-amber-300 uppercase tracking-wider block">Cadet Academy</span>
                  <span className="text-xs font-bold text-white block">Bole International</span>
                </div>
              </div>

              {/* Artificial Horizon Dial */}
              <div className="bg-slate-900/90 p-4 rounded-3xl border border-slate-800 flex flex-col items-center justify-center shrink-0 w-full sm:w-48 shadow-xl backdrop-blur-md">
                <div className="w-28 h-28 rounded-full border-2 border-slate-700 relative flex items-center justify-center bg-slate-950 shadow-inner">
                  <svg className="w-24 h-24" viewBox="0 0 100 100">
                    <clipPath id="horizon-portal-clip">
                      <circle cx="50" cy="50" r="44" />
                    </clipPath>
                    <g clipPath="url(#horizon-portal-clip)">
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
                  <div className="absolute bottom-1 font-mono text-[8px] text-amber-300 font-semibold tracking-wider">
                    PITCH +4° • ROLL 00°
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1.5 w-full mt-2.5 text-center">
                  <div className="bg-slate-950/80 p-1.5 rounded-lg border border-slate-800">
                    <span className="block text-slate-400 text-[9px] font-semibold">ALTITUDE</span>
                    <span className="font-mono text-[11px] text-white font-bold">8,500 <span className="text-[8px] font-normal text-slate-400">FT</span></span>
                  </div>
                  <div className="bg-slate-950/80 p-1.5 rounded-lg border border-slate-800">
                    <span className="block text-slate-400 text-[9px] font-semibold">AIRSPEED</span>
                    <span className="font-mono text-[11px] text-white font-bold">260 <span className="text-[8px] font-normal text-slate-400">KTS</span></span>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Live Cadet Statistics */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Candidates</span>
                <span className="font-mono text-2xl font-bold text-amber-400 mt-1 block">{stats.activeCandidates}</span>
                <span className="text-[11px] text-slate-400">Preparing for next intake</span>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cadet Pass Rate</span>
                <span className="font-mono text-2xl font-bold text-emerald-400 mt-1 block">{stats.cadetPassRate}</span>
                <span className="text-[11px] text-slate-400">Platform verified alumni</span>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Verified Past Papers</span>
                <span className="font-mono text-2xl font-bold text-blue-400 mt-1 block">{stats.verifiedPastPapers}</span>
                <span className="text-[11px] text-slate-400">EAA &amp; ICAO curriculum</span>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recruitment Standard</span>
                <span className="font-mono text-xl font-bold text-white mt-1 block">ICAO / ECAA</span>
                <span className="text-[11px] text-amber-400 font-semibold">Authoritative Rubric</span>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* 2. Sticky Overlapping Aviation Disciplines Layer (z-20) */}
      <section
        style={{ position: 'sticky', top: 0, zIndex: 20 }}
        className="w-full min-h-screen py-16 md:py-24 bg-[#0B1527] text-white relative shadow-[0_-20px_50px_rgba(0,0,0,0.6)] border-t border-slate-800/80 flex flex-col justify-center"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-semibold text-amber-300 uppercase tracking-widest mb-2 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>Disciplines &amp; Assessment Paths</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
              Preparation Disciplines &amp; Competency Drills
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {disciplines.map((d) => (
              <div
                key={d.id}
                className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl hover:border-amber-400/40 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-300">
                        <span className="material-symbols-outlined text-[26px]">{d.icon}</span>
                      </div>
                      <div>
                        <span className="font-mono text-xs font-bold text-amber-400">{d.code}</span>
                        <h3 className="text-lg font-bold text-white">{d.title}</h3>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {d.badge}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
                    {d.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-xs mb-6">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Requirement</span>
                      <span className="font-bold text-amber-300">{d.passingRequirement}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Test Bank</span>
                      <span className="font-bold text-white">{d.totalQuestions} Questions • {d.modulesCount} Modules</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <Link
                    to="/aviation-exams"
                    className="text-xs sm:text-sm font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    <span>Explore Exam Tracks</span>
                    <span className="material-symbols-outlined text-base">chevron_right</span>
                  </Link>

                  <Link
                    to="/simulator/7"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md active:scale-95"
                  >
                    Launch Mock
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Sticky Overlapping Aviation Mock Test Arena (z-30) */}
      <section
        style={{ position: 'sticky', top: 0, zIndex: 30 }}
        className="w-full min-h-screen py-16 md:py-24 bg-slate-950 text-white relative shadow-[0_-20px_50px_rgba(0,0,0,0.7)] border-t border-slate-800/80 flex flex-col justify-center"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col gap-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-semibold text-amber-300 uppercase tracking-widest mb-2 shadow-inner">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span>Standardized Simulation</span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
                Standardized Mock Test Arena
              </h2>
            </div>
            <Link
              to="/explore-exams?category=aviation"
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-bold text-sm transition-all inline-flex items-center gap-1.5 shrink-0"
            >
              <span>Explore All Aviation Papers</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aviationExams.map((exam) => (
              <ExamCard key={exam.id} exam={exam} />
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

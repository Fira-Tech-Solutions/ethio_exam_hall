import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ExamModeModal({ isOpen, onClose, exam }) {
  const navigate = useNavigate();

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !exam) return null;

  const handleLaunch = (mode) => {
    onClose();
    navigate(`/simulator/${exam.id}?mode=${mode}`);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      role="presentation"
    >
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="exam-mode-modal-title"
        className="w-full max-w-2xl bg-[#0B1527] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          aria-label="Close dialog"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* Modal Header */}
        <div className="flex flex-col gap-1 mb-6 pr-8">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {exam.code}
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
              {exam.year_ec ? `${exam.year_ec} E.C.` : 'National Exam'}
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-sky-400">
              {exam.subject || 'Standard Track'}
            </span>
          </div>

          <h3 id="exam-mode-modal-title" className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
            Select Examination Mode
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 line-clamp-1">
            {exam.title}
          </p>
        </div>

        {/* 2 Examination Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Option 1: Practice Mode (AI Agentic RAG) */}
          <div 
            role="button"
            tabIndex={0}
            onClick={() => handleLaunch('practice')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleLaunch('practice');
              }
            }}
            className="group relative flex flex-col justify-between p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/60 border border-slate-800 hover:border-amber-500/60 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 hover:shadow-[0_10px_30px_rgba(245,158,11,0.15)] transition-all cursor-pointer"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl">smart_toy</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  AI RAG Enabled
                </span>
              </div>

              <div>
                <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                  Practice Mode
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Learn at your own pace without time pressure. Interact with the Ethiopian Curriculum AI Tutor for hints, explanations, and step-by-step breakdowns.
                </p>
              </div>

              <ul className="space-y-1.5 text-[11px] text-slate-300 pt-2 border-t border-slate-800/80">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[15px] text-emerald-400">check</span>
                  <span>Untimed, relaxed learning</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[15px] text-amber-400">auto_awesome</span>
                  <span>Interactive AI Tutor & Hints</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[15px] text-emerald-400">check</span>
                  <span>Immediate answer verification</span>
                </li>
              </ul>
            </div>

            <button 
              type="button"
              className="mt-5 w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow"
            >
              <span>Launch Practice</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </div>

          {/* Option 2: Exam Simulation Mode (Locked Real Exam) */}
          <div 
            role="button"
            tabIndex={0}
            onClick={() => handleLaunch('simulation')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleLaunch('simulation');
              }
            }}
            className="group relative flex flex-col justify-between p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/60 border border-slate-800 hover:border-sky-500/60 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/50 hover:shadow-[0_10px_30px_rgba(14,165,233,0.15)] transition-all cursor-pointer"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl">timer</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Strict Proctored
                </span>
              </div>

              <div>
                <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-sky-400 transition-colors">
                  Exam Simulation Mode
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Simulate the actual national testing hall. Enforces locked fullscreen mode, anti-cheat detection, official timer, and authoritative scoring.
                </p>
              </div>

              <ul className="space-y-1.5 text-[11px] text-slate-300 pt-2 border-t border-slate-800/80">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[15px] text-sky-400">fullscreen</span>
                  <span>Locked Fullscreen & Anti-Cheat</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[15px] text-rose-400">block</span>
                  <span>No AI Assistance (Real Test)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[15px] text-sky-400">schedule</span>
                  <span>Strict official timer countdown</span>
                </li>
              </ul>
            </div>

            <button 
              type="button"
              className="mt-5 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20"
            >
              <span>Enter Locked Exam</span>
              <span className="material-symbols-outlined text-base">lock</span>
            </button>
          </div>

        </div>

        {/* Footer Guidance */}
        <p className="text-[11px] text-slate-500 text-center mt-6">
          Ethio Exam Hall Assessment System • Standardized against MoE / EAES / Ethiopian Airlines blueprints
        </p>
      </div>
    </div>
  );
}

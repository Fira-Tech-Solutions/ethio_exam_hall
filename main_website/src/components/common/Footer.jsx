import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="relative z-[70] w-full bg-[#070e1c] text-slate-300 border-t border-slate-800 shadow-[0_-20px_50px_rgba(0,0,0,0.8)] pt-12 md:pt-16 pb-8" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8 md:gap-12">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <img 
                src="/images/logo.png" 
                alt="Ethio Exam Hall Logo" 
                className="h-10 w-auto object-contain brightness-0 invert opacity-90"
                width="40"
                height="40"
                loading="lazy"
                decoding="async"
              />
              <div>
                <span className="text-base sm:text-lg text-white font-bold block leading-none">
                  Ethio Exam Hall
                </span>
                <span className="text-xs text-slate-400 block mt-1">
                  ኢትዮ ፈተና • National Examination Prep Network
                </span>
              </div>
            </div>
            
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm mt-1 leading-relaxed">
              Ethiopia’s high-trust digital testing ecosystem for Grade 12 matriculation, university exit examinations, graduate admission, and Ethiopian Aviation Academy recruitment.
            </p>

            {/* National Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium w-fit mt-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>2016 E.C. Academic Year Active • 5,000+ Verified Papers</span>
            </div>
          </div>

          {/* Academic Categories */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Examination Tracks
            </h4>
            <ul className="flex flex-col gap-2 text-xs text-slate-400">
              <li>
                <Link to="/explore-exams?category=esuee" className="hover:text-amber-400 transition-colors">
                  Grade 12 ESUEE (Natural &amp; Social)
                </Link>
              </li>
              <li>
                <Link to="/explore-exams?category=exit" className="hover:text-amber-400 transition-colors">
                  University Exit Exams (MoE)
                </Link>
              </li>
              <li>
                <Link to="/explore-exams?category=gat" className="hover:text-amber-400 transition-colors">
                  AAU GAT (Postgraduate)
                </Link>
              </li>
              <li>
                <Link to="/aviation-portal" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <span>Aviation &amp; Cadet Academy</span>
                  <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 rounded text-[9px] uppercase font-bold">New</span>
                </Link>
              </li>
              <li>
                <Link to="/explore-exams?category=banking" className="hover:text-amber-400 transition-colors">
                  CBE &amp; Bank Trainee Aptitude
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Features */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Study Platform
            </h4>
            <ul className="flex flex-col gap-2 text-xs text-slate-400">
              <li>
                <Link to="/assisted-with-ai" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <span>Assisted with AI (RAG Tutor)</span>
                  <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 rounded text-[9px] uppercase font-bold">New</span>
                </Link>
              </li>
              <li>
                <Link to="/university-exams" className="hover:text-amber-400 transition-colors">
                  Freshman Exam Archives
                </Link>
              </li>
              <li>
                <Link to="/explore-exams" className="hover:text-amber-400 transition-colors">
                  Document Previewer &amp; PDF Archive
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-amber-400 transition-colors">
                  Pricing &amp; Ethiopian Payments
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-amber-400 transition-colors">
                  Diagnostic Performance Analytics
                </Link>
              </li>
              <li>
                <a href="http://localhost:3001" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors inline-flex items-center gap-1">
                  <span>Admin Control Center</span>
                  <span className="text-[10px]">↗</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Ethiopian Payment Rails & Trust */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Local Payment Rails
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Seamlessly activate Pro Pass instantly through verified Ethiopian payment gateways:
            </p>
            <div className="flex flex-wrap gap-2 mt-1">
              <span className="px-2.5 py-1 bg-slate-900 rounded-lg font-mono text-[11px] font-bold text-amber-400 border border-slate-800">
                telebirr
              </span>
              <span className="px-2.5 py-1 bg-slate-900 rounded-lg font-mono text-[11px] font-bold text-amber-300 border border-slate-800">
                CBE Birr
              </span>
              <span className="px-2.5 py-1 bg-slate-900 rounded-lg font-mono text-[11px] font-bold text-white border border-slate-800">
                Chapa
              </span>
              <span className="px-2.5 py-1 bg-slate-900 rounded-lg font-mono text-[11px] font-bold text-white border border-slate-800">
                Awash Pay
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Server-side verified instant activation.
            </p>
          </div>

        </div>

        {/* Sub-Footer & Legal Disclaimer */}
        <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>
            © 2016 E.C. (2024 G.C.) Ethio Exam Hall. All past papers are attributed to respective examining bodies (MoE, EAES, AAU, EAA).
          </p>
          <div className="flex items-center gap-3">
            <span>Fair Use &amp; Attribution Policy</span>
            <span>•</span>
            <span>Privacy Guidelines</span>
            <span>•</span>
            <span>Academic Integrity</span>
          </div>
        </div>

      </div>
    </footer>
  );
}

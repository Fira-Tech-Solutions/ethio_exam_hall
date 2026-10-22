import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ExamDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);

  useEffect(() => {
    async function loadExam() {
      setLoading(true);
      try {
        const res = await api.getExamById(id);
        setData(res);
      } catch (err) {
        console.error('Failed to load exam details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadExam();
  }, [id]);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-slate-950 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-400 font-medium text-sm">Loading Examination Document...</span>
        </div>
      </div>
    );
  }

  if (!data || !data.exam) {
    return (
      <div className="w-full min-h-screen bg-slate-950 flex items-center justify-center p-8">
        <div className="bg-slate-900/90 p-8 rounded-2xl border border-slate-800 text-center max-w-md shadow-2xl backdrop-blur-sm">
          <h2 className="text-xl text-white font-bold mb-2">Examination Not Found</h2>
          <p className="text-sm text-slate-400 mb-6">The requested examination resource does not exist or has been archived.</p>
          <Link to="/explore-exams" className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl font-bold text-sm transition-all shadow-lg shadow-amber-500/20">
            Return to Library
          </Link>
        </div>
      </div>
    );
  }

  const { exam, relatedExams } = data;
  const isPro = exam.access_tier === 'pro';
  const hasAccess = exam.user_has_access;

  const handleBookmark = async () => {
    try {
      const res = await api.toggleBookmark(exam.id);
      setData(prev => ({
        ...prev,
        exam: { ...prev.exam, is_bookmarked: res.bookmarked },
      }));
    } catch {
      alert('Please sign in to bookmark examinations.');
    }
  };

  return (
    <div className="w-full bg-slate-950 text-white min-h-screen py-8 md:py-14 selection:bg-amber-500/30 selection:text-amber-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-[12px] text-slate-400">
          <Link to="/" className="hover:text-amber-400 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/explore-exams" className="hover:text-amber-400 transition-colors">Exams</Link>
          <span>/</span>
          <span className="text-amber-400 font-semibold truncate">{exam.category_name}</span>
          <span>/</span>
          <span className="font-mono text-white font-bold">{exam.code}</span>
        </nav>

        {/* Title & Metadata Top Banner */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-[0_15px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex flex-col gap-2 max-w-4xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[12px] font-bold px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {exam.code}
                </span>
                <span className="text-[12px] font-semibold px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60">
                  {exam.year_ec} E.C. ({exam.year_gc} G.C.)
                </span>
                {exam.booklet_code && (
                  <span className="font-mono text-[12px] font-semibold px-2.5 py-0.5 rounded-md bg-slate-800 text-sky-400 border border-slate-700/60">
                    Booklet: {exam.booklet_code}
                  </span>
                )}
                <span className={`text-[12px] font-bold px-2.5 py-0.5 rounded-full border ${
                  isPro 
                    ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border-amber-500/40' 
                    : 'bg-slate-800/80 text-emerald-400 border-emerald-500/30'
                }`}>
                  {isPro ? 'Pro Pass Required' : 'Public Domain Paper'}
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl lg:text-4xl text-white font-black tracking-tight mt-1">
                {exam.title}
              </h1>

              {exam.amharic_title && (
                <p className="text-sm md:text-base text-slate-400 font-medium">
                  {exam.amharic_title}
                </p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handleBookmark}
                className={`p-2.5 px-4 rounded-xl border transition-colors flex items-center gap-1.5 text-sm font-bold ${
                  exam.is_bookmarked
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700/60'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {exam.is_bookmarked ? 'bookmark' : 'bookmark_border'}
                </span>
                <span>{exam.is_bookmarked ? 'Saved' : 'Save'}</span>
              </button>

              <Link
                to={`/simulator/${exam.id}`}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-sm font-black transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95"
              >
                <span>Launch Simulator</span>
                <span className="material-symbols-outlined text-[18px]">play_arrow</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 2-Column Workstation Grid (Document Preview & Specifications) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left: Document Preview Canvas (8 cols) */}
          <div className="lg:col-span-8 flex flex-col rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900/90 backdrop-blur-sm">
            
            {/* Viewer Chrome Toolbar */}
            <div className="bg-[#0B1527] border-b border-slate-800 px-4 py-3 flex items-center justify-between text-slate-300 text-[12px]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400 text-[18px]">picture_as_pdf</span>
                <span className="font-mono font-semibold truncate max-w-xs text-white">{exam.file_name || `${exam.code}.pdf`}</span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] border border-slate-700/60 font-mono">
                  PDF Specimen
                </span>
              </div>

              {/* Page Controls & Zoom */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700/60 text-slate-200">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="p-0.5 rounded hover:bg-slate-700 disabled:opacity-30"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                  </button>
                  <span className="font-mono font-bold px-1 text-white">{currentPage} / {exam.total_pages || 18}</span>
                  <button
                    disabled={currentPage >= (exam.total_pages || 18)}
                    onClick={() => setCurrentPage(p => Math.min(exam.total_pages || 18, p + 1))}
                    className="p-0.5 rounded hover:bg-slate-700 disabled:opacity-30"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </button>
                </div>

                <div className="hidden sm:flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700/60 text-slate-200">
                  <button
                    onClick={() => setZoomLevel(z => Math.max(75, z - 10))}
                    className="p-0.5 rounded hover:bg-slate-700"
                    type="button"
                    title="Zoom Out"
                  >
                    <span className="material-symbols-outlined text-[16px]">zoom_out</span>
                  </button>
                  <span className="font-mono text-[11px] px-1 text-slate-300">{zoomLevel}%</span>
                  <button
                    onClick={() => setZoomLevel(z => Math.min(150, z + 10))}
                    className="p-0.5 rounded hover:bg-slate-700"
                    type="button"
                    title="Zoom In"
                  >
                    <span className="material-symbols-outlined text-[16px]">zoom_in</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Document Preview Sheet Container */}
            <div className="p-4 md:p-8 flex items-center justify-center bg-[#070e1c] overflow-x-auto min-h-[600px] relative">
              
              {/* Document Sheet (Styled to match authentic physical Ministry examination booklet) */}
              <div 
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                className="w-full max-w-[650px] bg-white text-slate-900 rounded-lg shadow-2xl border border-slate-200 p-8 md:p-12 relative select-none transition-transform"
              >
                {/* Official Watermark Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.05] rotate-[-30deg]">
                  <span className="text-[44px] font-black tracking-widest text-slate-950 text-center uppercase">
                    {exam.watermark_text || 'ETHIO EXAM HALL • OFFICIAL PREVIEW'}
                  </span>
                </div>

                {/* Exam Booklet Cover Header */}
                <div className="border-b-2 border-slate-900 pb-6 mb-6 text-center flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full border-2 border-slate-300 p-1.5 flex items-center justify-center mb-2 bg-slate-50 shadow-sm">
                    <img 
                      src="/images/logo.png" 
                      alt="Official Academic Examination Seal" 
                      className="h-10 w-auto object-contain"
                      width="40"
                      height="40"
                      loading="lazy"
                    />
                  </div>
                  <span className="text-[12px] uppercase font-bold tracking-widest text-slate-600">
                    {exam.institution || 'Federal Democratic Republic of Ethiopia • Ministry of Education'}
                  </span>
                  <h2 className="text-lg md:text-xl font-black text-slate-900 uppercase mt-1">
                    {exam.title}
                  </h2>
                  <div className="flex items-center gap-3 mt-2 text-[12px] font-mono text-slate-700">
                    <span className="font-bold">YEAR: {exam.year_ec} E.C.</span>
                    <span>•</span>
                    <span className="font-bold">BOOKLET CODE: {exam.booklet_code || '01-CS'}</span>
                    <span>•</span>
                    <span className="font-bold">TIME: {exam.time_limit_minutes} MINUTES</span>
                  </div>
                </div>

                {/* Official Instructions Callout */}
                <div className="border border-slate-300 bg-slate-50 rounded-lg p-4 mb-6 text-[12px] space-y-2">
                  <span className="font-bold text-slate-900 uppercase block tracking-wider text-[11px]">
                    GENERAL CANDIDATE INSTRUCTIONS:
                  </span>
                  <ol className="list-decimal pl-4 space-y-1 text-slate-700 font-medium">
                    <li>This examination booklet contains <strong>{exam.total_questions || 100} multiple choice questions</strong>.</li>
                    <li>Each question carries <strong>1.0 mark</strong>. There is <strong>no negative marking</strong> for incorrect responses.</li>
                    <li>Read each item carefully and choose the best answer from the given alternatives (A, B, C, or D).</li>
                    <li>Do not turn this page until the official examination supervisor gives the signal to commence.</li>
                  </ol>
                </div>

                {/* Sample First Question Preview */}
                <div className="border-t border-slate-200 pt-4 space-y-3 text-[13px]">
                  <div className="flex items-center justify-between font-mono font-bold text-amber-700 text-[11px]">
                    <span>SECTION A • QUESTION 1 PREVIEW</span>
                    <span>1.0 MARK</span>
                  </div>
                  <p className="text-slate-900 leading-relaxed font-serif text-[14px]">
                    In modern multi-threaded operating systems, when multiple processes compete for a shared resource without adequate synchronization primitives, a race condition can occur. Which of the following synchronization mechanisms guarantees mutual exclusion while avoiding busy waiting by placing competing threads into a sleep/waiting state?
                  </p>
                  <div className="space-y-1.5 pl-2 text-slate-700 text-[12px]">
                    <div>(A) Counting Semaphore with wait() [P] and signal() [V] operations and process blocking</div>
                    <div>(B) Test-and-Set hardware instruction in a tight while loop</div>
                    <div>(C) Disabling interrupts on all CPU cores in user mode</div>
                    <div>(D) Dekker's algorithm utilizing software busy-wait flags</div>
                  </div>
                </div>

                {/* Footer attribution */}
                <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>ETHIO EXAM HALL ARCHIVE • VERIFIED</span>
                  <span>PAGE {currentPage} OF {exam.total_pages || 18}</span>
                </div>
              </div>

            </div>

            {/* Pro Access Gate Banner if Document is Pro and user does not have access */}
            {!hasAccess && isPro && (
              <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 text-white p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-amber-500/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                    <span className="material-symbols-outlined text-[22px]">lock</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-white">This is a Pro Institutional Paper</h4>
                    <p className="text-xs text-slate-300">
                      Preview is restricted to sample specimen pages. Unlock full booklet & complete worked solutions with Pro Pass.
                    </p>
                  </div>
                </div>
                <Link
                  to="/pricing"
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-sm font-black shrink-0 transition-all shadow-lg shadow-amber-500/20"
                >
                  Unlock Pro Pass (ETB 349)
                </Link>
              </div>
            )}

          </div>

          {/* Right: Specifications & Provenance (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Primary Action Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm flex flex-col gap-4">
              <h3 className="text-base text-white font-bold">
                Examination Actions
              </h3>

              <Link
                to={`/simulator/${exam.id}`}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-sm rounded-xl font-black flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-[20px]">timer</span>
                <span>Start Timed Simulation</span>
              </Link>

              <Link
                to={`/practice`}
                className="w-full py-2.5 px-4 bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 text-sm rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">tune</span>
                <span>Build Custom Domain Drill</span>
              </Link>

              <div className="pt-3 border-t border-slate-800/80 text-xs text-slate-400 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span>Questions In System:</span>
                  <strong className="text-white">{exam.question_bank_count || 100} Items</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Scoring Engine:</span>
                  <strong className="text-amber-400">Authoritative Server Key</strong>
                </div>
              </div>
            </div>

            {/* Academic Specifications Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm flex flex-col gap-2 text-xs text-slate-300">
              <h3 className="text-base text-white font-bold mb-2">
                Academic Specifications
              </h3>

              <div className="flex justify-between py-2 border-b border-slate-800/80">
                <span className="text-slate-400">Examining Body</span>
                <span className="font-semibold text-white text-right">{exam.institution}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/80">
                <span className="text-slate-400">Subject Track</span>
                <span className="font-semibold text-white">{exam.subject}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/80">
                <span className="text-slate-400">Academic Year</span>
                <span className="font-semibold text-white">{exam.year_ec} E.C.</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/80">
                <span className="text-slate-400">Standard Time Limit</span>
                <span className="font-semibold text-white">{exam.time_limit_minutes} Minutes</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/80">
                <span className="text-slate-400">Passing Cutoff</span>
                <span className="font-semibold text-white">{exam.passing_score ? `${Math.round(exam.passing_score)}%` : '50%'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400">Curriculum Domain</span>
                <span className="font-semibold text-amber-400 text-right max-w-[200px] truncate">{exam.curriculum_domain || 'General'}</span>
              </div>
            </div>

            {/* Source Attribution & Redistribution Permissions */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <span className="material-symbols-outlined text-[16px] text-amber-400">verified_user</span>
                <span>Provenance & Copyright Disclosure</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                {exam.source_attribution || 'Original paper attributed to examining authorities.'}
              </p>
              <div className="inline-block px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-mono text-[11px] font-semibold border border-slate-700/60">
                Status: {exam.redistribution_status === 'public_domain' ? 'Public Educational Archive' : 'Fair Use Specimen Preview'}
              </div>
            </div>

            {/* Related Examinations */}
            {relatedExams && relatedExams.length > 0 && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
                <h4 className="text-sm font-bold text-white mb-3">
                  Related Examination Papers
                </h4>
                <div className="flex flex-col gap-2">
                  {relatedExams.map((re) => (
                    <Link
                      key={re.id}
                      to={`/exams/${re.id}`}
                      className="p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800/60 transition-all flex items-center justify-between group"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-bold text-white group-hover:text-amber-400 block truncate text-sm transition-colors">
                          {re.title}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {re.code} • {re.year_ec} E.C.
                        </span>
                      </div>
                      <span className="material-symbols-outlined text-[18px] text-slate-500 group-hover:text-amber-400 transition-colors">
                        arrow_forward
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}

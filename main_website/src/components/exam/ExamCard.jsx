import React from 'react';
import { Link } from 'react-router-dom';

export default function ExamCard({ exam, onBookmarkToggle, isBookmarked }) {
  const isPro = exam.access_tier === 'pro';

  return (
    <div className="bg-slate-900/95 border border-slate-800/90 rounded-2xl p-space-md md:p-space-lg shadow-lg hover:shadow-[0_16px_40px_rgba(0,0,0,0.5)] hover:border-amber-400/40 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group overflow-hidden relative text-white">
      {/* Official Booklet Accent Bar */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 ${
        exam.code?.startsWith('EXIT') 
          ? 'bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400' 
          : exam.code?.startsWith('EAA') 
            ? 'bg-gradient-to-r from-amber-400 via-red-500 to-amber-500'
            : exam.code?.startsWith('GAT')
              ? 'bg-gradient-to-r from-purple-500 to-violet-400'
              : 'bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-500'
      }`} />
      
      <div className="pt-1">
        {/* Top Meta Bar */}
        <div className="flex items-center justify-between gap-2 mb-space-sm">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-mono text-[11px] font-bold text-amber-300 bg-slate-800/90 border border-slate-700/70 px-2.5 py-1 rounded-md">
              {exam.code || 'EXAM-CODE'}
            </span>
            <span className="text-[11px] font-semibold text-slate-300 bg-slate-800/60 border border-slate-700/50 px-2 py-0.5 rounded">
              {exam.year_ec ? `${exam.year_ec} E.C.` : 'National'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {isPro ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <span className="material-symbols-outlined text-[13px]">lock</span>
                Pro Pass
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">
                <span className="material-symbols-outlined text-[13px]">verified</span>
                Free Tier
              </span>
            )}

            {onBookmarkToggle && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onBookmarkToggle(exam.id);
                }}
                className={`p-2.5 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl transition-colors ${
                  isBookmarked 
                    ? 'text-amber-400 bg-amber-400/15' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title={isBookmarked ? 'Remove Bookmark' : 'Save Exam'}
                type="button"
                aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark exam'}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {isBookmarked ? 'bookmark' : 'bookmark_border'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Exam Title */}
        <Link to={`/exams/${exam.id}`} className="block">
          <h3 className="font-headline-sm text-headline-sm text-white font-bold line-clamp-2 group-hover:text-amber-300 transition-colors mb-2">
            {exam.title}
          </h3>
        </Link>

        {/* Institution & Subject Subtext */}
        <p className="text-body-sm text-slate-300 line-clamp-1 mb-space-md">
          {exam.institution || 'Ministry of Education (MoE)'} • {exam.subject}
        </p>

        {/* Specification Grid */}
        <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-center text-[12px] mb-space-md">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Questions</span>
            <span className="font-mono font-bold text-white">{exam.total_questions || 100} Qs</span>
          </div>
          <div className="border-x border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Duration</span>
            <span className="font-mono font-bold text-white">{exam.time_limit_minutes || 120} Min</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Pass Mark</span>
            <span className="font-mono font-bold text-white">{exam.passing_score ? `${Math.round(exam.passing_score)}%` : '50%'}</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <Link
          to={`/exams/${exam.id}`}
          className="text-body-sm font-semibold text-slate-300 hover:text-white transition-colors flex items-center gap-1 group/btn"
        >
          <span className="material-symbols-outlined text-[18px]">visibility</span>
          <span>Preview PDF</span>
        </Link>

        <Link
          to={`/simulator/${exam.id}`}
          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold font-label-md text-label-md transition-all flex items-center gap-1 shadow-md active:scale-95"
        >
          <span>Take Exam</span>
          <span className="material-symbols-outlined text-[16px]">play_arrow</span>
        </Link>
      </div>
    </div>
  );
}

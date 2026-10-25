import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ScoreReportSkeletonLoader } from '../components/common/SkeletonLoader';

export default function ScoreReportPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'incorrect' | 'flagged'

  useEffect(() => {
    async function loadReport() {
      setLoading(true);
      try {
        const data = await api.getReport(attemptId);
        setReport(data);
      } catch (err) {
        console.error('Failed to load score report:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [attemptId]);

  if (loading) {
    return <ScoreReportSkeletonLoader />;
  }

  if (!report) {
    return (
      <div className="w-full min-h-screen bg-[#070e1c] text-white flex items-center justify-center p-8">
        <div className="bg-[#0B1527] p-8 rounded-3xl border border-slate-800 text-center max-w-md shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-2xl">error</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Report Not Found</h2>
          <p className="text-sm text-slate-400 mb-6">
            Could not load diagnostic performance report for this session.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 rounded-xl font-bold text-sm shadow-md hover:scale-105 active:scale-95 transition-all"
          >
            <span>Return to Dashboard</span>
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </Link>
        </div>
      </div>
    );
  }

  const {
    candidate,
    exam,
    score,
    totalPossible,
    percentage,
    passed,
    percentile,
    domainBreakdown,
    priorityFocus,
    questionReviews,
  } = report;

  const filteredQuestions = (questionReviews || []).filter((q) => {
    if (activeFilter === 'incorrect') return !q.is_correct;
    if (activeFilter === 'flagged') return q.is_flagged;
    return true;
  });

  return (
    <div className="w-full min-h-screen bg-[#070e1c] text-white py-6 md:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6 md:gap-8">
        
        {/* Top Diagnostic Banner */}
        <div className="bg-[#0B1527] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700/80 text-amber-300 text-xs font-semibold uppercase tracking-wider w-fit">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>Authoritative Examination Result</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {candidate?.name || 'Candidate Score Report'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300">
              Candidate ID: <strong className="font-mono text-amber-400 font-bold">{candidate?.candidateId || 'ETH-88492'}</strong> • {candidate?.institution || 'Addis Ababa University'}
            </p>
            <p className="text-xs text-slate-400 font-mono">
              {exam?.title} ({exam?.code})
            </p>
          </div>

          {/* Big Score & Percentile Box */}
          <div className="flex items-center gap-6 bg-slate-900/90 p-4 sm:p-5 rounded-2xl border border-slate-800 shrink-0">
            <div className="text-center pr-6 border-r border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Raw Score
              </span>
              <div className="font-mono text-3xl sm:text-4xl font-black text-white leading-tight mt-1">
                {score} <span className="text-xs sm:text-sm text-slate-400">/ {totalPossible}</span>
              </div>
              <span
                className={`inline-block px-3 py-0.5 rounded-full text-[11px] font-bold mt-1.5 ${
                  passed
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {passed ? `Passed (${percentage}%)` : `Below Cutoff (${percentage}%)`}
              </span>
            </div>

            <div className="text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Percentile
              </span>
              <div className="font-mono text-3xl sm:text-4xl font-black text-amber-400 leading-tight mt-1">
                {percentile}th
              </div>
              <span className="text-[11px] text-slate-400 font-medium block mt-1.5">
                Top {parseFloat((100 - percentile).toFixed(1))}% Nationally
              </span>
            </div>
          </div>
        </div>

        {/* 2-Column Section: Domain Breakdown & Cutoff Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left: Ministry Curriculum Domains Breakdown (7 cols) */}
          <div className="lg:col-span-7 bg-[#0B1527] border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col gap-4">
            <div>
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-0.5">
                Competency Matrix
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Curriculum Domains &amp; Competency Breakdown
              </h2>
            </div>

            <div className="flex flex-col gap-4 pt-1">
              {domainBreakdown?.map((dom) => (
                <div key={dom.domain} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-bold text-white truncate max-w-xs sm:max-w-md">{dom.domain}</span>
                    <div className="flex items-center gap-2 font-mono shrink-0">
                      <span className="font-bold text-slate-200">{dom.percentage}%</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          dom.status === 'Mastery'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {dom.status}
                      </span>
                    </div>
                  </div>
                  <div
                    className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800"
                    role="progressbar"
                    aria-valuenow={dom.percentage}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    <div
                      style={{ width: `${dom.percentage}%` }}
                      className={`h-full rounded-full transition-all ${
                        dom.percentage >= 70 ? 'bg-emerald-400' : 'bg-rose-500'
                      }`}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: National Cutoff & Priority Focus (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* National Cutoff & Institution Analytics */}
            <div className="bg-[#0B1527] border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col gap-3 text-xs sm:text-sm">
              <h3 className="text-base font-bold text-white mb-1">
                National Cutoff Analytics
              </h3>

              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Candidate Score</span>
                <span className="font-mono font-bold text-amber-400 text-right">{percentage}%</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Institutional Faculty Mean</span>
                <span className="font-mono font-bold text-slate-200">72.4%</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">MoE National Pass Cutoff</span>
                <span className="font-mono font-bold text-slate-200">50.0%</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400">Exit Degree Qualification</span>
                <span className="font-bold text-emerald-400">Certified &amp; Qualified</span>
              </div>
            </div>

            {/* Priority Focus Areas & Next Steps */}
            {priorityFocus && priorityFocus.length > 0 && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[18px]">priority_high</span>
                  <span>Priority Remedial Focus Areas</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Domains where performance fell below the 70% threshold. Practice targeted past papers to master these topics:
                </p>
                <div className="space-y-1.5">
                  {priorityFocus.map((pf) => (
                    <div
                      key={pf.domain}
                      className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <span className="font-bold text-white truncate max-w-xs">{pf.domain}</span>
                      <span className="font-mono font-bold text-rose-400">{pf.percentage}%</span>
                    </div>
                  ))}
                </div>
                <Link
                  to="/exit-exams"
                  className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-1.5 text-xs shadow-md active:scale-95 transition-all mt-2"
                >
                  <span>Practice Target Past Papers</span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </Link>
              </div>
            )}

          </div>

        </div>

        {/* Section: Interactive Question Grid & Verified Rationales */}
        <section className="bg-[#0B1527] border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-xl flex flex-col gap-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Interactive Question Review &amp; Verified Rationales
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Official Ministry answer keys accompanied by step-by-step academic explanations.
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0" role="tablist" aria-label="Question filters">
              {[
                { id: 'all', label: 'All Items' },
                { id: 'incorrect', label: 'Incorrect Only' },
                { id: 'flagged', label: 'Flagged' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={activeFilter === f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeFilter === f.id
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question Review Cards */}
          <div className="flex flex-col gap-4">
            {filteredQuestions.map((q) => (
              <div
                key={q.id}
                className={`p-4 sm:p-6 rounded-2xl border flex flex-col gap-3 transition-all ${
                  q.is_correct
                    ? 'border-slate-800 bg-slate-900/60'
                    : 'border-rose-500/30 bg-rose-950/10'
                }`}
              >
                {/* Question Top Row */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-base sm:text-lg text-white">
                      Q{q.number}
                    </span>
                    <span className="text-[11px] font-semibold text-amber-300 bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700">
                      {q.domain}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {q.is_flagged && (
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 text-[10px] font-bold border border-slate-700">
                        Marked for Review
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                        q.is_correct
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {q.is_correct ? 'check_circle' : 'cancel'}
                      </span>
                      <span>{q.is_correct ? 'Correct (+1.0)' : 'Incorrect (0.0)'}</span>
                    </span>
                  </div>
                </div>

                {/* Question Stem */}
                <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                  {q.stem}
                </p>

                {/* Context reference if available */}
                {q.context_reference && (
                  <div className="bg-slate-950/80 p-3 rounded-xl text-xs text-slate-300 border border-slate-800">
                    <strong className="text-amber-400 block mb-0.5">Reference Context:</strong>
                    {q.context_reference}
                  </div>
                )}

                {/* Options Review */}
                <div className="space-y-2 pt-1">
                  {q.options?.map((opt) => {
                    const isCandidateChoice = q.selected_option === opt.option_letter;
                    const isCorrectAnswer = q.correct_option === opt.option_letter;

                    let optStyle = 'border-slate-800/80 bg-slate-950/60 text-slate-300';
                    if (isCorrectAnswer) {
                      optStyle = 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200 ring-1 ring-emerald-500/30';
                    } else if (isCandidateChoice && !isCorrectAnswer) {
                      optStyle = 'border-rose-500/50 bg-rose-500/10 text-rose-200 ring-1 ring-rose-500/30';
                    }

                    return (
                      <div
                        key={opt.option_letter}
                        className={`p-3 rounded-xl border flex items-start gap-3 text-xs sm:text-sm ${optStyle}`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5 ${
                            isCorrectAnswer
                              ? 'bg-emerald-400 text-slate-950'
                              : isCandidateChoice
                              ? 'bg-rose-500 text-white'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {opt.option_letter}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold">{opt.option_text}</span>
                          {opt.subtext && (
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              {opt.subtext}
                            </span>
                          )}
                          {isCorrectAnswer && (
                            <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 mt-1">
                              <span className="material-symbols-outlined text-[14px]">check</span>
                              Official Correct Answer Key
                            </span>
                          )}
                          {isCandidateChoice && !isCorrectAnswer && (
                            <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1 mt-1">
                              <span className="material-symbols-outlined text-[14px]">close</span>
                              Your Selected Choice
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Verified Academic Rationale */}
                {q.explanation && (
                  <div className="bg-slate-950/90 rounded-xl p-3.5 sm:p-4 border border-slate-800 mt-1">
                    <span className="font-bold text-amber-400 text-xs uppercase tracking-wider block mb-1">
                      Verified Academic Rationale:
                    </span>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {q.explanation}
                    </p>
                  </div>
                )}

              </div>
            ))}
          </div>

        </section>

      </div>
    </div>
  );
}

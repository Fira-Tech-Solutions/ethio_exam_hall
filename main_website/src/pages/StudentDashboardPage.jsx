import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ExamModeModal from '../components/exam/ExamModeModal';

export default function StudentDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedExamForModal, setSelectedExamForModal] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/sign-in');
      return;
    }

    async function loadDashboard() {
      try {
        const data = await api.getStudentDashboard();
        setDashboardData(data);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#070e1c] flex items-center justify-center p-8 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-slate-300">
            Loading Candidate Dashboard & Analytics...
          </span>
        </div>
      </div>
    );
  }

  const { candidate, readiness, recentSessions, curatedExams, bookmarks } = dashboardData || {};

  const handleLaunchMock = (exam) => {
    setSelectedExamForModal(exam || {
      id: 1,
      code: 'MOE-EXIT-CS-2016',
      title: '2016 E.C. Ethiopian University Exit Examination: Computer Science & Software Engineering',
      subject: 'Computer Science',
      year_ec: 2016,
      total_questions: 100,
    });
  };

  return (
    <div className="w-full min-h-screen bg-[#070e1c] text-white p-4 sm:p-6 lg:p-8 flex flex-col gap-8">
      
      {/* Candidate Welcome & Target Header Bar */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-[#0B1527] to-slate-900 border border-slate-800 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg shadow-amber-500/20 shrink-0">
            {candidate?.name?.charAt(0) || 'C'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                Welcome back, {candidate?.name || 'Candidate'}.
              </h1>
              <span className="inline-flex items-center gap-1.5 bg-slate-800 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-emerald-400 border border-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                National Registry Verified
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Candidate ID: <strong className="font-mono text-amber-400">{candidate?.candidate_id || 'ETH-88492'}</strong> • {candidate?.institution || 'Addis Ababa University'}
            </p>
            <div className="pt-1 flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-amber-300 text-[11px] font-bold uppercase tracking-wider border border-slate-700/60">
                Track: {candidate?.target_track?.toUpperCase() || 'UNIVERSITY EXIT'}
              </span>
              <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold ${
                candidate?.has_pro_access 
                  ? 'bg-amber-400 text-slate-950 font-black' 
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
                {candidate?.has_pro_access ? 'Pro Pass Active' : 'Free Tier Candidate'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Launch Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/gpa-calculator"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px] text-amber-400">calculate</span>
            <span>GPA Calculator</span>
          </Link>
          <button
            onClick={() => handleLaunchMock(null)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black transition-all shadow-lg shadow-amber-500/20 flex items-center gap-1.5 active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">play_arrow</span>
            <span>Start Exit Mock</span>
          </button>
        </div>
      </div>

      {/* Quick Navigation Cards: 4 Academic Pillars */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { title: 'Freshman Exams', desc: 'All Universities', path: '/university-exams', icon: 'account_balance', color: 'text-blue-400', border: 'hover:border-blue-500/50' },
          { title: 'Exit Exams', desc: 'MoE By Department', path: '/exit-exams', icon: 'school', color: 'text-emerald-400', border: 'hover:border-emerald-500/50' },
          { title: 'Grade 12 ESUEE', desc: 'Natural & Social', path: '/entrance-exams', icon: 'menu_book', color: 'text-amber-400', border: 'hover:border-amber-500/50' },
          { title: 'Aviation Portal', desc: 'Cadet / AMT / Crew', path: '/aviation-exams', icon: 'flight', color: 'text-sky-400', border: 'hover:border-sky-500/50' },
        ].map((mod, idx) => (
          <Link
            key={idx}
            to={mod.path}
            className={`p-4 rounded-2xl bg-slate-900/90 border border-slate-800 transition-all ${mod.border} flex items-center gap-3 group shadow-md`}
          >
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
              <span className={`material-symbols-outlined text-xl ${mod.color}`}>
                {mod.icon}
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                {mod.title}
              </h3>
              <p className="text-[11px] text-slate-400 truncate">{mod.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Readiness Index & Metric Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Main Readiness Index */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
              Readiness Index
            </span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="font-mono text-3xl sm:text-4xl font-black text-white">{readiness?.score || 78}%</span>
              <span className="text-xs text-slate-400 font-medium">/ 100</span>
            </div>
            <p className="text-xs text-slate-300 font-bold mt-1">
              {readiness?.label || 'Competitive Threshold'}
            </p>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 mt-4 overflow-hidden">
            <div 
              style={{ width: `${readiness?.score || 78}%` }}
              className="bg-amber-400 h-full rounded-full transition-all"
            ></div>
          </div>
        </div>

        {/* Top National Percentile */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              National Percentile
            </span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="font-mono text-3xl sm:text-4xl font-black text-amber-400">
                Top {100 - (readiness?.percentile || 89.4)}%
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Standing above {readiness?.percentile || 89.4}% of candidates
            </p>
          </div>
          <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            Calculated across verified sessions
          </span>
        </div>

        {/* Study Volume */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Study Volume
            </span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="font-mono text-3xl sm:text-4xl font-black text-white">{readiness?.studyHours || '14.5'}</span>
              <span className="text-xs text-slate-400 font-medium">Hours logged</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {readiness?.totalAttempts || 0} examination attempts
            </p>
          </div>
          <span className="text-[11px] text-slate-400">Active this academic cycle</span>
        </div>

        {/* Questions Answered & Accuracy */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Questions Mastered
            </span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="font-mono text-3xl sm:text-4xl font-black text-white">{readiness?.questionsAnswered || 0}</span>
              <span className="text-xs text-slate-400 font-medium">Answered</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Accuracy: <strong className="text-amber-400">{readiness?.accuracy || 0}%</strong> overall
            </p>
          </div>
          <Link to="/exit-exams" className="text-[11px] font-bold text-amber-400 hover:underline flex items-center gap-1">
            <span>Explore full curriculum</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>
      </div>

      {/* 2-Column Section: Recent Sessions & Curated Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Recent Academic Sessions (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Recent Academic Sessions</h2>
              <p className="text-xs text-slate-400">Your authorized timed exam submissions and score reports</p>
            </div>
          </div>

          {(!recentSessions || recentSessions.length === 0) ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              No recent attempts found. Start your first mock examination above!
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {recentSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-amber-300 bg-slate-800 px-2 py-0.5 rounded">
                        {session.exam_code}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        session.passed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {session.passed ? 'Passed Cutoff' : 'Review Required'}
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate mt-1">
                      {session.exam_title}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Score: <strong className="text-white">{session.score} / {session.total_possible} ({Math.round(session.percentage)}%)</strong> • Standing: {session.percentile}th Percentile
                    </p>
                  </div>

                  <Link
                    to={`/analytics/${session.id}`}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold shrink-0 transition-colors flex items-center gap-1 border border-slate-700"
                  >
                    <span>Report</span>
                    <span className="material-symbols-outlined text-[16px]">analytics</span>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Curated for Your Target Track (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col gap-4">
          <div>
            <h2 className="text-base font-bold text-white">
              Curated for Your Track
            </h2>
            <p className="text-xs text-slate-400">Recommended next steps for your curriculum</p>
          </div>

          <div className="flex flex-col gap-2">
            {curatedExams && curatedExams.map((exam) => (
              <div
                key={exam.id}
                className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/40 transition-colors flex items-center justify-between gap-2"
              >
                <div className="min-w-0 pr-2">
                  <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">{exam.code}</span>
                  <h4 className="font-bold text-xs text-white truncate">{exam.title}</h4>
                  <span className="text-[11px] text-slate-400">{exam.total_questions} Questions • {exam.time_limit_minutes} Min</span>
                </div>
                <button
                  onClick={() => handleLaunchMock(exam)}
                  className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shrink-0 shadow"
                  title="Launch Test"
                >
                  <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                </button>
              </div>
            ))}
          </div>

          <Link
            to="/exit-exams"
            className="text-xs font-bold text-amber-400 hover:underline inline-flex items-center gap-1 pt-1"
          >
            <span>Explore all {candidate?.target_track?.toUpperCase()} past papers</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>

      </div>

      {/* Mode Selector Modal */}
      <ExamModeModal
        isOpen={Boolean(selectedExamForModal)}
        onClose={() => setSelectedExamForModal(null)}
        exam={selectedExamForModal}
      />
    </div>
  );
}

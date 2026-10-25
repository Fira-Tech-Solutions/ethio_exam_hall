import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ExamSimulatorSkeletonLoader } from '../components/common/SkeletonLoader';

export default function ExamSimulatorPage() {
  const { examId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const mode = searchParams.get('mode') || 'simulation'; // 'practice' or 'simulation'
  const isPractice = mode === 'practice';

  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: { selected_option: 'A', is_flagged: false } }
  
  // Timer & Progress state
  const [secondsRemaining, setSecondsRemaining] = useState(7200); // 2 hours default
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [autoSavedTimeAgo, setAutoSavedTimeAgo] = useState(10);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mobilePaletteOpen, setMobilePaletteOpen] = useState(false);

  // Simulation Mode Security & Anti-Cheat State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [strikes, setStrikes] = useState(0);
  const [violationAlert, setViolationAlert] = useState(null);

  // Practice Mode AI Agentic RAG State
  const [aiPanelOpen, setAiPanelOpen] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [aiQuery, setAiQuery] = useState('');
  const [checkedAnswer, setCheckedAnswer] = useState(null); // { questionId, isCorrect, correctOption }

  // Initialize or resume attempt on mount
  useEffect(() => {
    if (!user) {
      navigate('/sign-in');
      return;
    }

    async function initSession() {
      setLoading(true);
      try {
        const res = await api.startAttempt(examId, isPractice ? 'drill' : 'mock');
        setSessionData(res);
        setAnswers(res.savedAnswers || {});

        const limitSecs = (res.exam.time_limit_minutes || 120) * 60;
        setSecondsRemaining(limitSecs);
      } catch (err) {
        alert(err.message || 'Failed to start exam session.');
        navigate('/explore-exams');
      } finally {
        setLoading(false);
      }
    }
    initSession();
  }, [examId, user, navigate, isPractice]);

  // Timer: Countdown for Simulation, Elapsed for Practice
  useEffect(() => {
    if (!sessionData) return;
    const interval = setInterval(() => {
      if (isPractice) {
        setElapsedSeconds(p => p + 1);
      } else {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleTimeExpired();
            return 0;
          }
          return prev - 1;
        });
      }
      setAutoSavedTimeAgo(p => p + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionData, isPractice]);

  // Periodic Auto-Save every 15 seconds
  useEffect(() => {
    if (!sessionData || Object.keys(answers).length === 0) return;
    const saveInterval = setInterval(async () => {
      try {
        const timeSpent = isPractice ? elapsedSeconds : (7200 - secondsRemaining);
        await api.saveProgress(sessionData.attemptId, answers, timeSpent);
        setAutoSavedTimeAgo(0);
      } catch {
        // Silently retry
      }
    }, 15000);

    return () => clearInterval(saveInterval);
  }, [sessionData, answers, secondsRemaining, elapsedSeconds, isPractice]);

  // Fullscreen & Anti-Cheat Monitoring in Simulation Mode
  useEffect(() => {
    if (isPractice || !sessionData) return;

    const handleFullscreenChange = () => {
      const active = Boolean(document.fullscreenElement);
      setIsFullscreen(active);
      if (!active && strikes < 3) {
        triggerSecurityViolation('You exited fullscreen mode. Real examination conditions require locked fullscreen.');
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && strikes < 3) {
        triggerSecurityViolation('Focus lost: You switched tabs or minimized the browser window.');
      }
    };

    const handleWindowBlur = () => {
      if (strikes < 3) {
        triggerSecurityViolation('Focus lost: Navigation away from the examination window is prohibited.');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [isPractice, sessionData, strikes]);

  const requestFullscreenLock = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch (err) {
      console.warn('Fullscreen request denied:', err);
    }
  };

  const triggerSecurityViolation = (reason) => {
    setStrikes(prev => {
      const nextStrikes = prev + 1;
      setViolationAlert({
        reason,
        strikeNumber: nextStrikes,
      });

      if (nextStrikes >= 3) {
        setTimeout(() => {
          alert('SECURITY LOCKOUT: 3 test security violations detected. Authoritatively submitting your examination to the Ministry.');
          handleSubmitExam();
        }, 1500);
      }
      return nextStrikes;
    });
  };

  const handleTimeExpired = async () => {
    alert('Time has expired! Authoritatively submitting your examination answers to the Ministry server.');
    handleSubmitExam();
  };

  const currentQuestion = sessionData?.questions[currentIndex] || null;
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : null;

  // Clear AI response when changing question
  useEffect(() => {
    setAiResponse(null);
    setCheckedAnswer(null);
    setAiQuery('');
  }, [currentIndex]);

  const handleSelectOption = (letter) => {
    if (!currentQuestion) return;
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        selected_option: letter,
        is_flagged: prev[currentQuestion.id]?.is_flagged || false,
      },
    }));
  };

  const handleToggleFlag = () => {
    if (!currentQuestion) return;
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        selected_option: prev[currentQuestion.id]?.selected_option || null,
        is_flagged: !prev[currentQuestion.id]?.is_flagged,
      },
    }));
  };

  const handleClearResponse = () => {
    if (!currentQuestion) return;
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        selected_option: null,
        is_flagged: prev[currentQuestion.id]?.is_flagged || false,
      },
    }));
    setCheckedAnswer(null);
  };

  // AI Agentic RAG Tutor Call
  const fetchAiAssist = async (promptType, customQuery = '') => {
    if (!currentQuestion) return;
    setAiLoading(true);
    try {
      const res = await api.getAiRagAssist({
        questionId: currentQuestion.id,
        promptType,
        candidateQuery: customQuery,
        selectedOption: currentAnswer?.selected_option || null,
      });
      setAiResponse(res);
      setAiPanelOpen(true);
    } catch (err) {
      console.error('Failed to get AI assistance:', err);
    } finally {
      setAiLoading(false);
    }
  };

  // Instant Check Answer in Practice Mode
  const handleCheckAnswer = async () => {
    if (!currentQuestion) return;
    if (!currentAnswer?.selected_option) {
      alert('Please select an option before checking.');
      return;
    }
    setAiLoading(true);
    try {
      const res = await api.getAiRagAssist({
        questionId: currentQuestion.id,
        promptType: 'explain',
        selectedOption: currentAnswer.selected_option,
      });
      setCheckedAnswer({
        questionId: currentQuestion.id,
        isCorrect: currentAnswer.selected_option === res.correctOption,
        correctOption: res.correctOption,
      });
      setAiResponse(res);
      setAiPanelOpen(true);
    } catch (err) {
      console.error('Failed to check answer:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmitExam = async () => {
    setSubmitting(true);
    try {
      const timeSpent = isPractice ? elapsedSeconds : (7200 - secondsRemaining);
      const res = await api.submitAttempt(sessionData.attemptId, answers, timeSpent);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      navigate(`/analytics/${sessionData.attemptId}`);
    } catch (err) {
      alert(err.message || 'Submission failed.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return <ExamSimulatorSkeletonLoader />;
  }

  const questions = sessionData?.questions || [];
  const answeredCount = Object.values(answers).filter(a => Boolean(a.selected_option)).length;
  const unansweredCount = questions.length - answeredCount;

  // Format Timer HH:MM:SS
  const formatTimer = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className="w-full min-h-screen bg-[#070e1c] text-white flex flex-col select-none"
      onContextMenu={(e) => !isPractice && e.preventDefault()}
      onCopy={(e) => !isPractice && e.preventDefault()}
      onCut={(e) => !isPractice && e.preventDefault()}
    >
      {/* Simulation Mode Fullscreen Lock Banner if not in fullscreen */}
      {!isPractice && !isFullscreen && (
        <div className="bg-gradient-to-r from-amber-600 to-rose-600 text-white px-4 py-2.5 flex items-center justify-between text-xs font-bold sticky top-0 z-50 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">warning</span>
            <span>Real Exam Mode Active: Browser must be locked in fullscreen to simulate the official testing hall.</span>
          </div>
          <button
            onClick={requestFullscreenLock}
            className="px-3 py-1 rounded-lg bg-slate-950 text-white hover:bg-black transition-colors flex items-center gap-1 shadow"
          >
            <span>Lock Fullscreen</span>
            <span className="material-symbols-outlined text-sm">fullscreen</span>
          </button>
        </div>
      )}

      {/* Security Violation Alert Modal */}
      {violationAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="bg-slate-900 border-2 border-rose-500 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-3xl">
              <span className="material-symbols-outlined text-3xl">shield_locked</span>
            </div>
            <h3 className="text-xl font-black text-white">Security Violation Detected</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {violationAlert.reason}
            </p>
            <div className="w-full py-2 px-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono font-bold">
              VIOLATION STRIKE {violationAlert.strikeNumber} OF 3
            </div>
            <p className="text-[11px] text-slate-400">
              {violationAlert.strikeNumber >= 3 
                ? 'Maximum strikes reached. Auto-submitting...' 
                : 'Warning: 3 strikes will immediately submit your examination to the Ministry.'}
            </p>
            {violationAlert.strikeNumber < 3 && (
              <button
                onClick={() => {
                  setViolationAlert(null);
                  requestFullscreenLock();
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-slate-950 font-black text-xs transition-all shadow-lg shadow-rose-500/20"
              >
                Return & Re-Lock Fullscreen
              </button>
            )}
          </div>
        </div>
      )}

      {/* Top Examination Control Bar */}
      <header className="w-full bg-[#0B1527] border-b border-slate-800 text-white sticky top-0 z-40 shadow-xl backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          
          {/* Session & Identity */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isPractice ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
            }`}>
              <span className="material-symbols-outlined text-[20px]">
                {isPractice ? 'smart_toy' : 'timer'}
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-white text-xs sm:text-sm truncate max-w-[200px] sm:max-w-md">
                  {sessionData?.exam?.title || 'Examination Session'}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isPractice ? 'bg-amber-400 text-slate-950' : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                }`}>
                  {isPractice ? 'Practice • AI RAG' : 'Real Simulation Mode'}
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                <span>Booklet: <strong className="text-white font-mono">{sessionData?.exam?.booklet_code || '01-CS'}</strong></span>
                <span>•</span>
                <span>Candidate: <strong className="text-white">{sessionData?.candidate?.name}</strong></span>
              </div>
            </div>
          </div>

          {/* Countdown / Elapsed Timer & Actions */}
          <div className="flex items-center gap-3 shrink-0">
            
            {/* Auto-save notification — desktop */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Saved <span className="font-mono text-slate-300">({autoSavedTimeAgo}s)</span></span>
            </div>

            {/* Official Timer Pill */}
            <div className={`flex items-center px-3 py-1.5 rounded-xl border font-mono text-xs sm:text-sm font-bold gap-1.5 ${
              isPractice 
                ? 'bg-slate-900 border-slate-700 text-amber-300' 
                : secondsRemaining < 300 
                ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse' 
                : 'bg-slate-900 border-slate-700 text-sky-300'
            }`}>
              <span className="material-symbols-outlined text-[16px]">
                {isPractice ? 'update' : 'schedule'}
              </span>
              <span>{isPractice ? formatTimer(elapsedSeconds) : formatTimer(secondsRemaining)}</span>
              {!isPractice && (
                <span className="text-[10px] text-slate-400 uppercase hidden md:inline">Locked</span>
              )}
            </div>

            {/* Mobile palette toggle */}
            <button
              onClick={() => setMobilePaletteOpen(true)}
              type="button"
              className="lg:hidden p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors relative"
              aria-label="Open question palette"
            >
              <span className="material-symbols-outlined text-[20px]">grid_view</span>
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[9px] font-bold flex items-center justify-center">
                {answeredCount}
              </span>
            </button>

            {/* Submit Exam Button */}
            <button
              onClick={() => setSubmitModalOpen(true)}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-black shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1 active:scale-95"
              type="button"
            >
              <span>Submit</span>
              <span className="material-symbols-outlined text-base">check_circle</span>
            </button>
          </div>

        </div>
      </header>

      {/* Workstation Container */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main Question Area (8 cols) */}
          <main className="lg:col-span-8 flex flex-col gap-4">
            
            {currentQuestion ? (
              <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl backdrop-blur-sm flex flex-col gap-4">
                
                {/* Question Header & Review Flag */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base sm:text-lg font-black text-white">
                      Question {currentIndex + 1}
                    </span>
                    <span className="text-xs text-slate-400">
                      of {questions.length}
                    </span>
                    {currentQuestion.domain && (
                      <span className="bg-slate-800 text-amber-400 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-slate-700/60">
                        {currentQuestion.domain}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono bg-slate-800 px-2.5 py-0.5 rounded-full text-slate-300">
                      Marks: +{currentQuestion.marks || '1.0'}
                    </span>

                    {/* Mark for Review Toggle */}
                    <button
                      onClick={handleToggleFlag}
                      type="button"
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                        currentAnswer?.is_flagged
                          ? 'bg-amber-400 text-slate-950 shadow-sm'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {currentAnswer?.is_flagged ? 'bookmark' : 'bookmark_border'}
                      </span>
                      <span>{currentAnswer?.is_flagged ? 'Marked' : 'Review'}</span>
                    </button>
                  </div>
                </div>

                {/* Question Stem */}
                <div className="space-y-3">
                  <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-medium">
                    {currentQuestion.stem}
                  </p>

                  {/* Context Reference */}
                  {currentQuestion.context_reference && (
                    <div className="bg-slate-950/70 rounded-xl p-4 text-slate-300 flex items-start gap-3 border border-slate-800">
                      <span className="material-symbols-outlined text-amber-400 text-xl shrink-0">architecture</span>
                      <div className="space-y-0.5 text-xs">
                        <div className="font-bold text-white uppercase tracking-wider text-[10px]">
                          System Context Reference
                        </div>
                        <p>{currentQuestion.context_reference}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Multiple Choice Options Form */}
                <fieldset aria-label="Multiple Choice Options" className="space-y-2 mt-2">
                  {currentQuestion.options?.map((opt) => {
                    const isSelected = currentAnswer?.selected_option === opt.option_letter;
                    const isCheckedCorrect = checkedAnswer && checkedAnswer.correctOption === opt.option_letter;
                    const isCheckedWrong = checkedAnswer && isSelected && !checkedAnswer.isCorrect;

                    let cardStyle = 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 text-slate-200';
                    if (isCheckedCorrect) {
                      cardStyle = 'bg-emerald-950/40 border-emerald-500 text-white ring-1 ring-emerald-500';
                    } else if (isCheckedWrong) {
                      cardStyle = 'bg-rose-950/40 border-rose-500 text-white ring-1 ring-rose-500';
                    } else if (isSelected) {
                      cardStyle = 'bg-amber-500/10 border-amber-500/80 text-white ring-1 ring-amber-500/60 shadow-md';
                    }

                    return (
                      <label
                        key={opt.option_letter}
                        onClick={() => handleSelectOption(opt.option_letter)}
                        className={`group relative flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl cursor-pointer transition-all duration-150 border ${cardStyle}`}
                      >
                        <input
                          type="radio"
                          name={`q_${currentQuestion.id}`}
                          value={opt.option_letter}
                          checked={isSelected}
                          onChange={() => handleSelectOption(opt.option_letter)}
                          className="sr-only"
                        />
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 transition-transform ${
                          isCheckedCorrect
                            ? 'bg-emerald-500 text-slate-950 font-black'
                            : isCheckedWrong
                            ? 'bg-rose-500 text-white font-black'
                            : isSelected
                            ? 'bg-amber-400 text-slate-950 font-black scale-105'
                            : 'bg-slate-800 text-slate-300 group-hover:bg-slate-700'
                        }`}>
                          {opt.option_letter}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs sm:text-sm font-semibold text-slate-100 block">
                            {opt.option_text}
                          </span>
                          {opt.subtext && (
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              {opt.subtext}
                            </span>
                          )}
                          {isSelected && !checkedAnswer && (
                            <span className="text-[11px] text-amber-400 mt-1 flex items-center gap-1 font-bold">
                              <span className="material-symbols-outlined text-[14px]">check</span> Selected
                            </span>
                          )}
                          {isCheckedCorrect && (
                            <span className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-bold">
                              <span className="material-symbols-outlined text-[14px]">verified</span> Official Ministry Answer
                            </span>
                          )}
                          {isCheckedWrong && (
                            <span className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-bold">
                              <span className="material-symbols-outlined text-[14px]">close</span> Incorrect
                            </span>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </fieldset>

                {/* Practice Mode AI Quick Bar */}
                {isPractice && (
                  <div className="mt-2 p-3.5 rounded-2xl bg-[#0B1527] border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={handleCheckAnswer}
                        type="button"
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors flex items-center gap-1 shadow"
                      >
                        <span className="material-symbols-outlined text-[16px]">task_alt</span>
                        <span>Check Answer</span>
                      </button>

                      <button
                        onClick={() => fetchAiAssist('hint')}
                        type="button"
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs transition-colors flex items-center gap-1 border border-slate-700/60"
                      >
                        <span className="material-symbols-outlined text-[16px]">lightbulb</span>
                        <span>Get Hint</span>
                      </button>

                      <button
                        onClick={() => fetchAiAssist('explain')}
                        type="button"
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 font-bold text-xs transition-colors flex items-center gap-1 border border-slate-700/60"
                      >
                        <span className="material-symbols-outlined text-[16px]">school</span>
                        <span>Explain Concept</span>
                      </button>
                    </div>

                    <button
                      onClick={() => setAiPanelOpen(!aiPanelOpen)}
                      type="button"
                      className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold"
                    >
                      <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                      <span>{aiPanelOpen ? 'Hide AI Assistant' : 'Open AI Assistant'}</span>
                    </button>
                  </div>
                )}

                {/* Practice Mode Interactive AI Agentic RAG Panel */}
                {isPractice && aiPanelOpen && (
                  <div className="mt-2 p-4 rounded-2xl bg-[#08101E] border border-slate-800 text-xs flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                          <span className="material-symbols-outlined text-sm">auto_awesome</span>
                        </div>
                        <span className="font-bold text-white text-xs">
                          {aiResponse?.title || 'EthioExam RAG Academic Agent'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => fetchAiAssist('rag_analysis')}
                          className="px-2 py-1 rounded-md text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
                        >
                          Syllabus Reference
                        </button>
                        <button
                          onClick={() => fetchAiAssist('alternative_analysis')}
                          className="px-2 py-1 rounded-md text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
                        >
                          Breakdown Options
                        </button>
                      </div>
                    </div>

                    {aiLoading ? (
                      <div className="py-6 flex items-center justify-center gap-2 text-slate-400">
                        <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                        <span>Retrieving national curriculum context & rationales...</span>
                      </div>
                    ) : aiResponse ? (
                      <div className="space-y-3">
                        <div className="prose prose-invert prose-xs max-w-none text-slate-300 leading-relaxed whitespace-pre-line">
                          {aiResponse.content}
                        </div>

                        {aiResponse.syllabusReference && (
                          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-amber-300/90 font-mono">
                            🏛️ {aiResponse.syllabusReference}
                          </div>
                        )}

                        {aiResponse.recommendedQuestions?.length > 0 && (
                          <div className="space-y-1 pt-1">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">
                              Related Study Prompts:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {aiResponse.recommendedQuestions.map((q, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => fetchAiAssist('chat', q)}
                                  className="text-[10px] px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors text-left"
                                >
                                  💬 {q}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="py-4 text-center text-slate-400">
                        Click <strong className="text-amber-400">"Check Answer"</strong>, <strong className="text-amber-400">"Get Hint"</strong>, or ask any question below to interact with the curriculum agent.
                      </div>
                    )}

                    {/* Free-form AI Chat Input */}
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (aiQuery.trim()) {
                          fetchAiAssist('chat', aiQuery);
                          setAiQuery('');
                        }
                      }}
                      className="flex items-center gap-2 pt-2 border-t border-slate-800"
                    >
                      <input
                        type="text"
                        value={aiQuery}
                        onChange={(e) => setAiQuery(e.target.value)}
                        placeholder="Ask AI Tutor about this problem..."
                        className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                      <button
                        type="submit"
                        disabled={!aiQuery.trim() || aiLoading}
                        className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs disabled:opacity-40 transition-colors flex items-center gap-1"
                      >
                        <span>Ask</span>
                        <span className="material-symbols-outlined text-sm">send</span>
                      </button>
                    </form>
                  </div>
                )}

                {/* Question Navigation Controls */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                  <button
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
                    type="button"
                    className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    <span className="hidden sm:inline">Previous</span>
                  </button>

                  <button
                    onClick={handleClearResponse}
                    type="button"
                    className="text-xs text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    Clear Choice
                  </button>

                  <button
                    disabled={currentIndex === questions.length - 1}
                    onClick={() => setCurrentIndex(i => Math.min(questions.length - 1, i + 1))}
                    type="button"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-all flex items-center gap-1 shadow disabled:opacity-30"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                </div>

              </section>
            ) : (
              <div className="p-8 text-center text-slate-400">No questions loaded for this session.</div>
            )}

          </main>

          {/* Right Question Palette (4 cols) */}
          <aside className="lg:col-span-4 flex flex-col gap-4 sticky top-24">
            
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl backdrop-blur-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">
                  Question Palette
                </h3>
                <span className="font-mono text-xs font-bold text-amber-400">
                  {answeredCount} / {questions.length} Done
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div 
                  style={{ width: `${(answeredCount / (questions.length || 1)) * 100}%` }}
                  className="bg-amber-400 h-full rounded-full transition-all"
                ></div>
              </div>

              {/* Numbered Palette Grid (1..N) */}
              <div className="grid grid-cols-5 gap-2 max-h-72 overflow-y-auto p-1">
                {questions.map((q, idx) => {
                  const ans = answers[q.id];
                  const isAnswered = Boolean(ans?.selected_option);
                  const isFlagged = Boolean(ans?.is_flagged);
                  const isCurrent = idx === currentIndex;

                  let btnStyle = 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:bg-slate-700';
                  if (isCurrent) {
                    btnStyle = 'ring-2 ring-amber-400 font-black bg-slate-700 text-white';
                  } else if (isFlagged) {
                    btnStyle = 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold';
                  } else if (isAnswered) {
                    btnStyle = 'bg-sky-500/20 text-sky-300 border-sky-500/40 font-bold';
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      type="button"
                      className={`h-9 rounded-xl font-mono text-xs border transition-all flex items-center justify-center relative ${btnStyle}`}
                    >
                      <span>{idx + 1}</span>
                      {isFlagged && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute top-1 right-1"></span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-800 text-[10px] text-slate-400 font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-sky-500/30 border border-sky-500/60"></span>
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-amber-500/30 border border-amber-500/60"></span>
                  <span>Flagged</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-slate-800 border border-slate-700"></span>
                  <span>Open</span>
                </div>
              </div>

              {/* Submit trigger button inside sidebar */}
              <button
                onClick={() => setSubmitModalOpen(true)}
                type="button"
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95"
              >
                <span>Complete & Submit</span>
                <span className="material-symbols-outlined text-[16px]">done_all</span>
              </button>
            </div>

          </aside>

        </div>
      </div>

      {/* Mobile Question Palette — Bottom Sheet */}
      {mobilePaletteOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setMobilePaletteOpen(false)}>
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
          <div
            className="absolute bottom-0 left-0 right-0 bg-[#0B1527] border-t border-slate-800 rounded-t-3xl p-5 flex flex-col gap-4 shadow-2xl"
            style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Question Palette</h3>
                <span className="text-xs text-slate-400 font-mono">
                  {answeredCount} answered · {questions.length - answeredCount} remaining
                </span>
              </div>
              <button
                onClick={() => setMobilePaletteOpen(false)}
                type="button"
                className="p-1.5 rounded-xl bg-slate-800 text-slate-300"
                aria-label="Close palette"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="grid grid-cols-6 gap-2 max-h-52 overflow-y-auto">
              {questions.map((q, idx) => {
                const ans = answers[q.id];
                const isAnswered = Boolean(ans?.selected_option);
                const isFlagged = Boolean(ans?.is_flagged);
                const isCurrent = idx === currentIndex;
                let btnStyle = 'bg-slate-800 text-slate-300 border-slate-700';
                if (isCurrent) btnStyle = 'ring-2 ring-amber-400 font-black bg-slate-700 text-white';
                else if (isFlagged) btnStyle = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
                else if (isAnswered) btnStyle = 'bg-sky-500/20 text-sky-300 border-sky-500/40';
                return (
                  <button
                    key={q.id}
                    onClick={() => { setCurrentIndex(idx); setMobilePaletteOpen(false); }}
                    type="button"
                    className={`h-9 rounded-xl font-mono text-xs border transition-all flex items-center justify-center relative ${btnStyle}`}
                  >
                    <span>{idx + 1}</span>
                    {isFlagged && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute top-1 right-1" />}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => { setMobilePaletteOpen(false); setSubmitModalOpen(true); }}
              type="button"
              className="w-full py-3 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-95"
            >
              <span>Complete & Submit</span>
              <span className="material-symbols-outlined text-[16px]">done_all</span>
            </button>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {submitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-[#0B1527] border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 text-white">
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                <span className="material-symbols-outlined text-2xl">fact_check</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Confirm Submission
                </h3>
                <span className="text-xs text-slate-400">Authoritative Scoring Verification</span>
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl p-4 text-xs space-y-2 border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Exam Questions:</span>
                <strong className="text-white">{questions.length} Items</strong>
              </div>
              <div className="flex justify-between text-amber-400">
                <span>Completed / Answered:</span>
                <strong>{answeredCount} Items</strong>
              </div>
              {unansweredCount > 0 ? (
                <div className="flex justify-between text-rose-400 font-bold">
                  <span>Unanswered Items:</span>
                  <span>{unansweredCount} Items</span>
                </div>
              ) : (
                <div className="text-emerald-400 font-bold">
                  All questions answered!
                </div>
              )}
            </div>

            {unansweredCount > 0 && (
              <p className="text-[11px] text-rose-300 bg-rose-950/40 p-2.5 rounded-xl border border-rose-500/30">
                Warning: You have <strong>{unansweredCount} unanswered questions</strong>. Once submitted, answers cannot be edited.
              </p>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setSubmitModalOpen(false)}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
                type="button"
              >
                Return to Exam
              </button>
              <button
                onClick={handleSubmitExam}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
                type="button"
              >
                {submitting ? (
                  <span>Grading...</span>
                ) : (
                  <>
                    <span>Confirm & Grade</span>
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

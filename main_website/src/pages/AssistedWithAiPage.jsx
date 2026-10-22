import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

/* ------------------------------------------------------------------ */
/* Preset Authentic Ethiopian Examination Questions for the Demo       */
/* ------------------------------------------------------------------ */

const SAMPLE_QUESTIONS = [
  {
    id: 1,
    title: 'MoE University Exit Exam • Computer Science & SE',
    badge: 'University Exit Exam 2016 E.C.',
    badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    curriculumDomain: 'Operating Systems & Systems Architecture (Domain 3)',
    question:
      'In a preemptive multi-tasking operating system, which synchronization primitive avoids CPU spinlock busy-waiting when a thread must wait for an unavailable shared resource?',
    options: [
      { key: 'A', text: 'Counting Semaphore with kernel wait-queue and process blocking' },
      { key: 'B', text: 'Test-and-Set hardware instruction in a while-loop' },
      { key: 'C', text: 'Atomic Compare-and-Swap spinlock primitive' },
      { key: 'D', text: 'Disabling CPU interrupts in user mode execution space' },
    ],
    correctKey: 'A',
    sampleDialogue: [
      {
        sender: 'user',
        text: 'I was thinking between Option A and Option B. Why is Option B not the preferred choice in modern multi-tasking operating systems?',
      },
      {
        sender: 'ai',
        text: `### 🎯 Why Option B is a Classic Exam Trap:
Option (B) refers to **Test-and-Set in a while-loop**, which is the canonical definition of a **spinlock**.

When a thread encounters an acquired spinlock, the CPU core is forced to execute a tight loop (\`while (test_and_set(&lock));\`) burning **100% of the CPU cycle quota** without performing any productive work!

### 💡 Why Option A is Correct:
A **Counting Semaphore with process blocking** utilizes kernel sleep queues (like \`futex\` in Linux). When the resource count is 0, the kernel changes the thread's state from \`RUNNING\` to \`SLEEPING/WAITING\`, moves its Task Control Block (TCB) to the semaphore's wait queue, and triggers the scheduler to run another candidate process.

**MoE Blueprint Reference:** Ministry of Education Exit Blueprint • OS Concurrency & CPU Scheduling Competency 3.2.`,
      },
    ],
    hints: [
      'Think about what happens to the CPU while waiting: does it burn electricity spinning, or does it yield to other tasks?',
      'Consider the difference between user-space spinlocks and kernel-managed sleeping synchronization primitives.',
    ],
    syllabus: 'Ethiopian Ministry of Education (MoE) • Higher Education Exit Examination Competency Blueprint: Computer Science & Software Engineering (Domain 3: Operating Systems, Chapter 4 - Synchronization Primitives).',
  },
  {
    id: 2,
    title: 'Grade 12 ESUEE • National Physics Matriculation',
    badge: 'Grade 12 ESUEE 2015 E.C.',
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    curriculumDomain: 'Mechanics & Conservation Laws (Grade 12 Unit 2)',
    question:
      'A 0.5 kg block is released from rest at the top of a frictionless curved ramp of height h = 5.0 m. At the bottom, it slides across a rough horizontal surface with kinetic friction coefficient μ_k = 0.25 until it comes to a complete stop. Taking g = 10 m/s², what total horizontal distance d does the block travel on the rough surface?',
    options: [
      { key: 'A', text: '10 meters' },
      { key: 'B', text: '20 meters' },
      { key: 'C', text: '25 meters' },
      { key: 'D', text: '40 meters' },
    ],
    correctKey: 'B',
    sampleDialogue: [
      {
        sender: 'user',
        text: 'Can you show me the step-by-step formula derivation for this problem without skipping steps?',
      },
      {
        sender: 'ai',
        text: `### 📐 Step-by-Step Energy Conservation Derivation:

#### 1. Mechanical Energy at Top of Ramp:
At height $h = 5.0\\text{ m}$, the block has pure Gravitational Potential Energy:
$$E_{\\text{top}} = m \\cdot g \\cdot h$$
$$E_{\\text{top}} = (0.5\\text{ kg}) \\times (10\\text{ m/s}^2) \\times (5.0\\text{ m}) = 25.0\\text{ Joules}$$

#### 2. Work Done by Friction on the Horizontal Track:
Frictional force is $f_k = \\mu_k \\cdot N = \\mu_k \\cdot m \\cdot g$:
$$f_k = 0.25 \\times (0.5\\text{ kg}) \\times (10\\text{ m/s}^2) = 1.25\\text{ N}$$

The work-energy theorem states that initial mechanical energy is entirely dissipated by friction over distance $d$:
$$W_{\\text{friction}} = f_k \\cdot d = E_{\\text{top}}$$
$$1.25 \\cdot d = 25.0$$
$$d = \\frac{25.0}{1.25} = 20\\text{ meters}$$

**Notice:** The mass $m = 0.5\\text{ kg}$ cancels out on both sides ($mgh = \\mu_k mg d \\implies d = \\frac{h}{\\mu_k} = \\frac{5.0}{0.25} = 20\\text{ m}$)!

**Correct Answer:** **Option (B) 20 meters**.`,
      },
    ],
    hints: [
      'Notice that the mass cancels out completely if you set initial Potential Energy equal to Work done by Friction!',
      'Formula: d = h / μ_k. Plug in h = 5.0 and μ_k = 0.25.',
    ],
    syllabus: 'Ministry of Education (MoE) • Grade 12 Physics Textbook, Unit 2: Work, Energy, and Power (Sections 2.3 & 2.4 - Conservation of Energy and Non-Conservative Forces).',
  },
  {
    id: 3,
    title: 'Ethiopian Airlines Aviation University • Cadet Pilot Aptitude',
    badge: 'Aviation Pilot Trainee Stage 1',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    curriculumDomain: 'Aviation Flight Principles & Navigation Vectoring',
    question:
      'An aircraft maintaining a True Airspeed (TAS) of 180 knots flies on a heading of 360° (Due North). A prevailing crosswind blows from 270° (Due West) at 30 knots. What is the approximate Drift Angle and Ground Speed (GS) of the aircraft?',
    options: [
      { key: 'A', text: 'Drift 9.5° Right (East), Ground Speed ~182.5 knots' },
      { key: 'B', text: 'Drift 9.5° Left (West), Ground Speed ~150.0 knots' },
      { key: 'C', text: 'Drift 15.0° Right (East), Ground Speed ~210.0 knots' },
      { key: 'D', text: 'Drift 5.0° Right (East), Ground Speed ~180.0 knots' },
    ],
    correctKey: 'A',
    sampleDialogue: [
      {
        sender: 'user',
        text: 'Why does a 90° pure crosswind increase ground speed instead of decreasing it?',
      },
      {
        sender: 'ai',
        text: `### ✈️ Aviation Vector Triangle Breakdown:

In navigation vector triangles:
- **Heading Vector (TAS):** 180 knots North ($y$-axis).
- **Wind Vector:** Blowing from 270° (Due West) towards East ($x$-axis) at 30 knots.

Because the wind is perpendicular (at 90°), the resultant track is the hypotenuse of a right triangle:
$$\\text{Ground Speed (GS)} = \\sqrt{\\text{TAS}^2 + \\text{Wind}^2}$$
$$\\text{GS} = \\sqrt{180^2 + 30^2} = \\sqrt{32400 + 900} = \\sqrt{33300} \\approx 182.48\\text{ knots}$$

#### 🧭 Drift Angle Calculation:
$$\\tan(\\theta) = \\frac{\\text{Crosswind}}{\\text{TAS}} = \\frac{30}{180} = \\frac{1}{6} \\approx 0.1667$$
$$\\theta = \\arctan(0.1667) \\approx 9.46° \\approx 9.5°\\text{ Right (Eastward Drift)}$$

**Takeaway:** A pure 90° crosswind pushes the aircraft sideways, causing it to cover ground along the resultant hypotenuse vector, slightly increasing Ground Speed while skewing track 9.5° East!

**Correct Answer:** **Option (A)**.`,
      },
    ],
    hints: [
      'The wind is blowing from 270°, meaning it blows towards 090° (East).',
      'Use the Pythagorean theorem for perpendicular vectors: GS = sqrt(180^2 + 30^2).',
    ],
    syllabus: 'Ethiopian Airlines Aviation Academy • Ground School Flight Navigation & Meteorology Manual, Module 4 (Wind Triangles & Drift Angle Computation).',
  },
];

/* ------------------------------------------------------------------ */
/* Assisted With AI Showcase Page Component                           */
/* ------------------------------------------------------------------ */

export default function AssistedWithAiPage() {
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const currentQ = SAMPLE_QUESTIONS[selectedQuestionIndex];

  // Chat conversation state
  const [messages, setMessages] = useState(currentQ.sampleDialogue);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const chatScrollRef = useRef(null);

  // Sync conversation when switching question
  useEffect(() => {
    setMessages(currentQ.sampleDialogue);
    setSelectedOption(null);
  }, [selectedQuestionIndex]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || isLoading) return;

    const userMsg = { sender: 'user', text: query.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Connect to the real backend AI RAG tutor endpoint
      const response = await api.getAiRagAssist({
        questionId: currentQ.id,
        question: currentQ.question,
        userQuery: query,
        action: 'chat',
        curriculumDomain: currentQ.curriculumDomain,
      });

      if (response && response.content) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: response.content,
            syllabus: response.syllabusReference,
          },
        ]);
      } else {
        throw new Error('No AI response received');
      }
    } catch (err) {
      // Intelligent pedagogical fallback if offline
      setTimeout(() => {
        let fallbackReply = `### 💡 AI Tutor Clarification on "${currentQ.curriculumDomain}":\n\nWhen examining this question, focus on the fundamental governing principle. For **${currentQ.title}**, examiners test your ability to apply core formulas and distinguish high-frequency distractors.\n\n- **Primary Rule:** Refer directly to ${currentQ.syllabus}.\n- **Recommended Next Step:** Click "Give me a hint" or test Choice (${currentQ.correctKey}) to observe how the concept applies.`;
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: fallbackReply,
            syllabus: currentQ.syllabus,
          },
        ]);
      }, 700);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionPrompt = (actionType) => {
    if (actionType === 'hint') {
      const hint = currentQ.hints[Math.floor(Math.random() * currentQ.hints.length)];
      setMessages((prev) => [
        ...prev,
        { sender: 'user', text: '💡 Can you give me a Socratic hint without giving away the direct answer?' },
        {
          sender: 'ai',
          text: `### 💡 Pedagogical Hint:\n${hint}\n\n*Take another look at the options and think about how this constraint affects your calculation.*`,
        },
      ]);
    } else if (actionType === 'trap') {
      setMessages((prev) => [
        ...prev,
        { sender: 'user', text: '🔍 What is the common trap in this question that candidates fall for?' },
        {
          sender: 'ai',
          text: `### ⚠️ Examiner Trap Analysis:\nIn this national paper, examiners intentionally include distractors that result from skipping intermediate steps or confusing definitions.\n\nReview the exact parameters in the stem before committing to a choice!`,
        },
      ]);
    } else if (actionType === 'syllabus') {
      setMessages((prev) => [
        ...prev,
        { sender: 'user', text: '📖 Where is this concept referenced in the official Ministry syllabus?' },
        {
          sender: 'ai',
          text: `### 📚 Official Curriculum Citation:\n${currentQ.syllabus}\n\n*Our RAG engine cross-references this directly with Ethiopian Ministry of Education accreditation benchmarks.*`,
        },
      ]);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#070e1c] text-slate-100 font-inter selection:bg-blue-600 selection:text-white">
      
      {/* ========================================================================= */}
      {/* LAYER 1: Hero Section & AI Learning Introduction (Deck Layer 1, z-10)     */}
      {/* ========================================================================= */}
      <section className="sticky top-0 min-h-[85vh] lg:min-h-screen z-10 flex flex-col justify-center bg-[#070e1c] px-4 sm:px-6 lg:px-12 xl:px-16 py-16 overflow-hidden border-b border-slate-800/80">
        {/* Ambient Backlight Lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent blur-[140px] pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-amber-500/10 blur-[130px] pointer-events-none -z-10" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto w-full text-center space-y-6">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/5">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            <span>Agentic RAG Academic Tutor • Official Ethiopian Curriculum Grounded</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-snug max-w-3xl mx-auto">
            Never Get Stuck on a Question. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300">
              Understand the "Why" in Real-Time Chat.
            </span>
          </h1>

          {/* Amharic Subtitle */}
          <p className="text-xs sm:text-sm text-amber-300/90 font-medium font-ethiopic">
            የኢትዮጵያን ብሔራዊ ፈተናዎች በአርቴፊሻል ኢንተለጀንስ ታግዘው በጥልቀት ይረዱ።
          </p>

          {/* Value Prose */}
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Traditional answer keys only tell you <span className="text-white font-semibold">"Option A is correct"</span>. 
            Ethio Exam Hall’s <strong>AI Academic Tutor</strong> converses with you in real-time, uncovering examiner traps, 
            providing Socratic hints without spoiling answers, and citing official Ministry of Education textbooks.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#interactive-demo"
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <span className="material-symbols-outlined text-lg">smart_toy</span>
              <span>Test the Live Chat Below</span>
              <span className="material-symbols-outlined text-xs">arrow_downward</span>
            </a>
            <Link
              to="/explore-exams"
              className="px-5 py-2.5 bg-[#0B1527] hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-xs sm:text-sm rounded-xl border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-lg">library_books</span>
              <span>Explore 1,200+ Verified Exams</span>
            </Link>
          </div>

          {/* 4 Feature Pills */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
            <div className="p-3.5 rounded-2xl bg-[#0B1527]/80 border border-slate-800 backdrop-blur-sm">
              <span className="material-symbols-outlined text-blue-400 text-xl block mb-1">psychology</span>
              <h4 className="text-xs font-bold text-white">Socratic Hints</h4>
              <p className="text-[11px] text-slate-400">Guides your intuition without giving away answers.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#0B1527]/80 border border-slate-800 backdrop-blur-sm">
              <span className="material-symbols-outlined text-amber-400 text-xl block mb-1">rule</span>
              <h4 className="text-xs font-bold text-white">Distractor Breakdown</h4>
              <p className="text-[11px] text-slate-400">Diagnoses why incorrect options are traps.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#0B1527]/80 border border-slate-800 backdrop-blur-sm">
              <span className="material-symbols-outlined text-emerald-400 text-xl block mb-1">menu_book</span>
              <h4 className="text-xs font-bold text-white">Curriculum Grounded</h4>
              <p className="text-[11px] text-slate-400">Directly cites MoE textbooks & EAES blueprints.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#0B1527]/80 border border-slate-800 backdrop-blur-sm">
              <span className="material-symbols-outlined text-purple-400 text-xl block mb-1">chat</span>
              <h4 className="text-xs font-bold text-white">Bilingual Dialogue</h4>
              <p className="text-[11px] text-slate-400">Ask questions naturally in English or Amharic.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* LAYER 2: Live Interactive AI Tutor Chat Arena (Deck Layer 2, z-20)       */}
      {/* ========================================================================= */}
      <section
        id="interactive-demo"
        className="sticky top-0 min-h-screen z-20 bg-[#0B1527] px-4 sm:px-6 lg:px-12 xl:px-16 py-12 flex flex-col justify-center border-t border-slate-800 shadow-[0_-25px_60px_rgba(0,0,0,0.8)]"
      >
        <div className="max-w-7xl mx-auto w-full space-y-6">
          
          {/* Section Heading */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20 mb-2">
                <span className="material-symbols-outlined text-sm">forum</span>
                <span>Interactive Learning Arena</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                Experience How AI Helps You Understand
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Select an authentic Ethiopian exam question on the left, then converse with the AI Academic Tutor on the right.
              </p>
            </div>

            {/* Question Selector Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 overflow-x-auto max-w-full">
              {SAMPLE_QUESTIONS.map((q, idx) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setSelectedQuestionIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedQuestionIndex === idx
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {q.title.split('•')[0].trim()}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Workspace: Left Question Booklet + Right AI Chat */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Official Exam Booklet Question (lg:col-span-5) */}
            <div className="lg:col-span-5 rounded-3xl bg-[#070e1c] border border-slate-800 p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden">
              <div className="space-y-4">
                
                {/* Exam Booklet Header */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${currentQ.badgeColor}`}>
                    {currentQ.badge}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Official Past Paper
                  </span>
                </div>

                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {currentQ.curriculumDomain}
                </div>

                {/* Question Stem */}
                <h3 className="text-xs sm:text-sm font-bold text-white leading-relaxed">
                  {currentQ.question}
                </h3>

                {/* Options List */}
                <div className="space-y-2 pt-1">
                  {currentQ.options.map((opt) => {
                    const isSelected = selectedOption === opt.key;
                    const isCorrect = opt.key === currentQ.correctKey;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setSelectedOption(opt.key)}
                        className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition-all flex items-start gap-2.5 ${
                          isSelected
                            ? isCorrect
                              ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                              : 'bg-red-950/60 border-red-500 text-red-200'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-lg font-bold flex items-center justify-center shrink-0 text-xs ${
                            isSelected
                              ? isCorrect
                                ? 'bg-emerald-500 text-slate-950'
                                : 'bg-red-500 text-white'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {opt.key}
                        </span>
                        <span className="leading-snug">{opt.text}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Result Feedback Banner */}
                {selectedOption && (
                  <div
                    className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
                      selectedOption === currentQ.correctKey
                        ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                        : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {selectedOption === currentQ.correctKey ? 'check_circle' : 'info'}
                    </span>
                    <span>
                      {selectedOption === currentQ.correctKey
                        ? 'Correct! Ask the AI Tutor on the right why this concept works.'
                        : `Option ${selectedOption} is a common trap! Look at the AI conversation on the right.`}
                    </span>
                  </div>
                )}
              </div>

              {/* Syllabus Accreditation Pill */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-400">
                <span className="material-symbols-outlined text-sm text-blue-400">verified</span>
                <span>Verified with EAES Ethiopian Curriculum Standard</span>
              </div>
            </div>

            {/* Right Column: AI Academic Tutor Chat Interface (lg:col-span-7) */}
            <div className="lg:col-span-7 rounded-3xl bg-[#070e1c] border border-slate-800 shadow-2xl flex flex-col h-[580px] overflow-hidden">
              
              {/* Chat Header Bar */}
              <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
                    <span className="material-symbols-outlined text-xl">psychology</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">Ethio Exam AI Tutor</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Online RAG
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Socratic Reasoning • MoE Curriculum Aligned
                    </p>
                  </div>
                </div>

                {/* Question Info Pill */}
                <span className="text-[11px] font-mono text-slate-400 hidden sm:inline-block bg-slate-800/80 px-2.5 py-1 rounded-lg">
                  Question #{currentQ.id}
                </span>
              </div>

              {/* Chat Messages Scroll Container */}
              <div
                ref={chatScrollRef}
                className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm"
              >
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {msg.sender === 'user' ? 'Candidate' : 'AI Academic Tutor'}
                      </span>
                    </div>
                    <div
                      className={`max-w-[90%] p-4 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-tr-sm shadow-md'
                          : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-sm shadow-md'
                      }`}
                    >
                      {msg.text}
                      {msg.syllabus && (
                        <div className="mt-3 pt-3 border-t border-slate-700/60 text-[11px] text-amber-300 font-mono">
                          📚 Reference: {msg.syllabus}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center gap-2 text-slate-400 text-xs p-3 bg-slate-900/60 rounded-2xl w-fit">
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    <span>AI Tutor is formulating conceptual guidance...</span>
                  </div>
                )}
              </div>

              {/* Quick Prompt Suggestion Chips */}
              <div className="p-3 bg-slate-900/60 border-t border-slate-800/60 flex items-center gap-2 overflow-x-auto text-[11px]">
                <button
                  type="button"
                  onClick={() => handleActionPrompt('hint')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold whitespace-nowrap border border-slate-700/80 transition flex items-center gap-1.5"
                >
                  <span>💡</span>
                  <span>Give me a hint</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleActionPrompt('trap')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold whitespace-nowrap border border-slate-700/80 transition flex items-center gap-1.5"
                >
                  <span>🔍</span>
                  <span>Why is this a trap?</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleActionPrompt('syllabus')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold whitespace-nowrap border border-slate-700/80 transition flex items-center gap-1.5"
                >
                  <span>📖</span>
                  <span>Ministry textbook citation</span>
                </button>
              </div>

              {/* Interactive Chat Input */}
              <div className="p-3 sm:p-4 bg-slate-900/90 border-t border-slate-800">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask the AI Tutor anything about this question (English or Amharic)..."
                    className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white font-bold rounded-xl transition flex items-center justify-center shrink-0"
                  >
                    <span className="material-symbols-outlined text-lg">send</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* LAYER 3: The 4 Pillars of Our Agentic RAG Tutor (Deck Layer 3, z-30)      */}
      {/* ========================================================================= */}
      <section className="sticky top-0 min-h-screen z-30 bg-[#070e1c] px-4 sm:px-6 lg:px-12 xl:px-16 py-16 flex flex-col justify-center border-t border-slate-800 shadow-[0_-25px_60px_rgba(0,0,0,0.8)]">
        <div className="max-w-6xl mx-auto w-full space-y-10">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Architected for Ethiopian Education
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              How the AI Agentic Engine Accelerates Comprehension
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              Our AI isn't an arbitrary chatbot. It is a Retrieval-Augmented Generation (RAG) system 
              trained specifically on Ethiopian academic criteria and examination blueprint standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Bento Card 1 */}
            <div className="p-5 rounded-2xl bg-[#0B1527] border border-slate-800 hover:border-blue-500/40 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-xl">help_outline</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5">1. Socratic Teaching, Not Spoon-Feeding</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                When you ask for a hint, the AI prompts your memory on the underlying principle instead of blurting out the key. 
                This builds authentic conceptual mastery so you can solve variations on the actual exam day.
              </p>
            </div>

            {/* Bento Card 2 */}
            <div className="p-5 rounded-2xl bg-[#0B1527] border border-slate-800 hover:border-amber-500/40 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-xl">verified</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5">2. EAES & MoE Blueprint Citations</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Every response grounds itself in the Ethiopian national curriculum: Grade 12 ESUEE syllabus chapters, 
                MoE university exit blueprint domains, and Ethiopian Airlines training handbooks.
              </p>
            </div>

            {/* Bento Card 3 */}
            <div className="p-5 rounded-2xl bg-[#0B1527] border border-slate-800 hover:border-emerald-500/40 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-xl">warning</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5">3. Distractor & Misconception Diagnostics</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Examiners deliberately craft 3 plausible incorrect options. Our AI breaks down *why* an option was planted as a trap, 
                such as common arithmetic miscalculations or sign flips.
              </p>
            </div>

            {/* Bento Card 4 */}
            <div className="p-5 rounded-2xl bg-[#0B1527] border border-slate-800 hover:border-purple-500/40 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-xl">translate</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5">4. Full Bilingual Chat in English & Amharic</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Express your doubts naturally in Amharic (አማርኛ) or English. The assistant translates complex academic 
                jargon and renders mathematical equations seamlessly.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* LAYER 4: Comparison & Call to Action (Deck Layer 4, z-40)                 */}
      {/* ========================================================================= */}
      <section className="sticky top-0 min-h-[70vh] z-40 bg-[#0A162B] px-4 sm:px-6 lg:px-12 xl:px-16 py-12 flex flex-col justify-center border-t border-slate-800 shadow-[0_-25px_60px_rgba(0,0,0,0.8)]">
        <div className="max-w-4xl mx-auto w-full space-y-8">
          
          {/* Comparison Table */}
          <div className="rounded-2xl bg-[#070e1c] border border-slate-800 p-5 sm:p-6 overflow-x-auto shadow-2xl">
            <h3 className="text-base sm:text-lg font-bold text-white mb-4 text-center">
              Static PDF Answer Keys vs. Ethio Exam Hall AI Tutor
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Left: Traditional */}
              <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 space-y-2.5">
                <div className="flex items-center gap-2 text-red-400 font-bold text-xs sm:text-sm">
                  <span className="material-symbols-outlined text-base">cancel</span>
                  <span>Traditional Telegram / PDF Keys</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  <li className="flex items-start gap-1.5">
                    <span className="text-red-400 font-bold">•</span>
                    <span>Only displays "Answer: B" with zero explanation.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-red-400 font-bold">•</span>
                    <span>You cannot ask "Why didn't we use formula X?".</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-red-400 font-bold">•</span>
                    <span>No verification of whether the key is correct or an error.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-red-400 font-bold">•</span>
                    <span>Leads to passive memorization that fails on new questions.</span>
                  </li>
                </ul>
              </div>

              {/* Right: Ethio Exam Hall AI */}
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs sm:text-sm">
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  <span>Ethio Exam Hall Agentic AI Tutor</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-200">
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>Step-by-step mathematical and conceptual derivations.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>Interactive 2-way chat: ask any follow-up question anytime.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>Verified against official Ministry textbook chapters.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>Builds genuine deep intuition and exam confidence.</span>
                  </li>
                </ul>
              </div>

            </div>
          </div>

          {/* Bottom Call to Action Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-blue-900/60 via-indigo-900/60 to-slate-900/80 border border-blue-500/30 text-center space-y-3.5 shadow-2xl relative overflow-hidden">
            <h3 className="text-lg sm:text-xl font-bold text-white">
              Ready to Upgrade Your Exam Preparation?
            </h3>
            <p className="text-xs text-slate-300 max-w-lg mx-auto">
              Access all 1,200+ verified past papers across Grade 12, University Exit Exams, and Aviation Trainee pathways with full AI Agentic assistance.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <Link
                to="/register"
                className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <span>Get Started for Free</span>
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </Link>
              <Link
                to="/explore-exams"
                className="px-6 py-2.5 bg-slate-900/80 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm rounded-xl border border-slate-700 transition-all"
              >
                Browse Exam Catalog
              </Link>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}

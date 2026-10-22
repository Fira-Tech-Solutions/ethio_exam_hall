import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { adminApi } from '../services/api';

export default function AdminQuestionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(searchParams.get('examId') || '');
  const [examDetail, setExamDetail] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');

  // Modal State
  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | 'import' | null
  const [editingQuestionId, setEditingQuestionId] = useState(null);

  // Question Form State
  const [questionNumber, setQuestionNumber] = useState(1);
  const [domain, setDomain] = useState('General Curriculum');
  const [stem, setStem] = useState('');
  const [contextReference, setContextReference] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [marks, setMarks] = useState(1.0);
  const [explanation, setExplanation] = useState('');
  const [options, setOptions] = useState([
    { letter: 'A', text: '', isCorrect: true },
    { letter: 'B', text: '', isCorrect: false },
    { letter: 'C', text: '', isCorrect: false },
    { letter: 'D', text: '', isCorrect: false },
  ]);

  // Bulk Import State
  const [importJsonText, setImportJsonText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi.getExams().then((exList) => {
      setExams(exList || []);
      if (!selectedExamId && exList && exList.length > 0) {
        setSelectedExamId(String(exList[0].id));
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedExamId) return;
    loadExamQuestions();
  }, [selectedExamId]);

  async function loadExamQuestions() {
    setLoading(true);
    try {
      const [detail, qList] = await Promise.all([
        adminApi.getExamDetail(selectedExamId),
        adminApi.getExamQuestions(selectedExamId),
      ]);
      setExamDetail(detail || null);
      setQuestions(qList || []);
      setQuestionNumber((qList?.length || 0) + 1);
    } catch (err) {
      console.error('Error loading questions:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleCorrectChange = (targetLetter) => {
    setOptions(prev => prev.map(o => ({
      ...o,
      isCorrect: o.letter === targetLetter,
    })));
  };

  const handleOptionTextChange = (letter, text) => {
    setOptions(prev => prev.map(o => o.letter === letter ? { ...o, text } : o));
  };

  const openCreateModal = () => {
    setModalMode('create');
    setEditingQuestionId(null);
    setQuestionNumber(questions.length + 1);
    setDomain(examDetail?.curriculum_domain || 'General');
    setStem('');
    setContextReference('');
    setDifficulty('medium');
    setMarks(1.0);
    setExplanation('');
    setOptions([
      { letter: 'A', text: '', isCorrect: true },
      { letter: 'B', text: '', isCorrect: false },
      { letter: 'C', text: '', isCorrect: false },
      { letter: 'D', text: '', isCorrect: false },
    ]);
  };

  const openEditModal = (q) => {
    setModalMode('edit');
    setEditingQuestionId(q.id);
    setQuestionNumber(q.question_number || 1);
    setDomain(q.domain || '');
    setStem(q.stem || '');
    setContextReference(q.context_reference || '');
    setDifficulty(q.difficulty || 'medium');
    setMarks(q.marks || 1.0);
    setExplanation(q.explanation || '');

    if (Array.isArray(q.options) && q.options.length > 0) {
      setOptions(q.options.map(opt => ({
        letter: opt.letter,
        text: opt.text || '',
        isCorrect: Boolean(opt.isCorrect),
      })));
    } else {
      setOptions([
        { letter: 'A', text: '', isCorrect: true },
        { letter: 'B', text: '', isCorrect: false },
        { letter: 'C', text: '', isCorrect: false },
        { letter: 'D', text: '', isCorrect: false },
      ]);
    }
  };

  const handleDeleteQuestion = async (q) => {
    const confirmed = window.confirm(`Are you sure you want to delete Question #${q.question_number}?`);
    if (!confirmed) return;

    try {
      await adminApi.deleteQuestion(q.id);
      setQuestions(prev => prev.filter(item => item.id !== q.id));
    } catch (err) {
      alert(err.message || 'Failed to delete question.');
    }
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!stem.trim()) return;
    setSaving(true);
    try {
      const payload = {
        questionNumber: parseInt(questionNumber, 10),
        domain: domain.trim(),
        stem: stem.trim(),
        contextReference: contextReference.trim() || null,
        difficulty,
        marks: parseFloat(marks),
        verifiedStatus: true,
        explanation: explanation.trim() || null,
        options,
      };

      if (modalMode === 'create') {
        await adminApi.addQuestion(selectedExamId, payload);
      } else {
        await adminApi.updateQuestion(editingQuestionId, payload);
      }

      setModalMode(null);
      await loadExamQuestions();
    } catch (err) {
      alert(err.message || 'Operation failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkImportSubmit = async (e) => {
    e.preventDefault();
    if (!importJsonText.trim()) return;
    setSaving(true);
    try {
      const parsed = JSON.parse(importJsonText);
      if (!Array.isArray(parsed)) {
        throw new Error('Import data must be a JSON array of questions.');
      }
      await adminApi.bulkImportQuestions(selectedExamId, parsed);
      setModalMode(null);
      setImportJsonText('');
      await loadExamQuestions();
    } catch (err) {
      alert(err.message || 'Invalid JSON format. Please verify and try again.');
    } finally {
      setSaving(false);
    }
  };

  const filteredQuestions = questions.filter(q => {
    const matchSearch =
      q.stem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.domain && q.domain.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (q.options && q.options.some(o => o.text && o.text.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchDifficulty =
      selectedDifficulty === 'ALL' ||
      q.difficulty === selectedDifficulty;

    return matchSearch && matchDifficulty;
  });

  return (
    <div className="flex flex-col gap-space-lg p-gutter">
      
      {/* Top Selector & Action Bar */}
      <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-space-md shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="flex-1 max-w-xl">
          <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
            Active Examination Item Bank
          </label>
          <select
            value={selectedExamId}
            onChange={(e) => {
              setSelectedExamId(e.target.value);
              setSearchParams({ examId: e.target.value });
            }}
            className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-xl font-bold text-primary focus:outline-none focus:border-secondary cursor-pointer"
          >
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.code} — {ex.title} ({ex.year_ec} E.C.)
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          {/* Main Simulator Link */}
          {selectedExamId && (
            <a
              href={`http://localhost:3000/simulator/${selectedExamId}`}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2.5 bg-surface-container hover:bg-surface-container-high text-secondary hover:text-primary font-label-md font-bold rounded-xl flex items-center gap-1.5 transition-colors border border-outline-variant/30 text-xs"
              title="Launch in Student Simulator"
            >
              <span className="material-symbols-outlined text-[18px]">play_circle</span>
              <span className="hidden sm:inline">Test in Simulator</span>
            </a>
          )}

          <button
            onClick={() => setModalMode('import')}
            className="px-3.5 py-2.5 bg-surface-container hover:bg-surface-container-high text-primary font-label-md font-bold rounded-xl flex items-center gap-1.5 transition-colors border border-outline-variant/30 text-xs"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">file_upload</span>
            <span className="hidden sm:inline">Bulk JSON Import</span>
          </button>

          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-primary text-on-primary hover:bg-primary-container rounded-xl font-label-md font-bold flex items-center gap-1.5 transition-all shadow-sm shrink-0 text-xs"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>+ Add Question</span>
          </button>
        </div>

      </div>

      {/* Exam Context Card */}
      {examDetail && (
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-space-md flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-secondary text-sm">{examDetail.code}</span>
              <span className="bg-surface-container px-2 py-0.5 rounded font-semibold text-primary">
                {examDetail.category_name}
              </span>
              <span className="bg-surface-container px-2 py-0.5 rounded text-on-surface-variant">
                {examDetail.year_ec} E.C.
              </span>
            </div>
            <p className="font-semibold text-primary mt-1 text-[13px]">{examDetail.title}</p>
            {examDetail.curriculum_domain && (
              <span className="text-on-surface-variant mt-0.5 block">
                Domain: <strong className="text-on-surface">{examDetail.curriculum_domain}</strong>
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-center shrink-0">
            <div className="bg-surface-container-lowest px-3 py-1.5 rounded-xl border border-outline-variant/30">
              <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Total Items</span>
              <span className="font-mono font-black text-primary text-sm">{questions.length}</span>
            </div>
            <div className="bg-surface-container-lowest px-3 py-1.5 rounded-xl border border-outline-variant/30">
              <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Passing Score</span>
              <span className="font-mono font-black text-secondary text-sm">{examDetail.passing_score}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search questions by stem, domain, or option text..."
            className="w-full pl-9 pr-4 py-2 bg-surface-container-lowest border border-outline-variant/40 rounded-xl text-body-sm text-on-surface focus:outline-none focus:border-secondary"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="bg-surface-container-lowest border border-outline-variant/40 px-3 py-2 rounded-xl text-[12px] font-semibold text-on-surface focus:outline-none"
          >
            <option value="ALL">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Questions Item List */}
      <div className="flex flex-col gap-space-md">
        {loading ? (
          <div className="p-12 text-center text-on-surface-variant bg-surface-container-lowest rounded-2xl border border-outline-variant/40">
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-3 border-secondary border-t-transparent rounded-full animate-spin"></div>
              <span>Loading questions & authoritative answer keys...</span>
            </div>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant bg-surface-container-lowest rounded-2xl border border-outline-variant/40">
            <span className="material-symbols-outlined text-[36px] text-outline mb-1 block">quiz</span>
            <p className="font-bold text-on-surface">No questions found in this bank</p>
            <p className="text-xs text-on-surface-variant mt-1">Click "+ Add Question" or "Bulk JSON Import" to populate this exam.</p>
          </div>
        ) : (
          filteredQuestions.map((q) => (
            <div
              key={q.id}
              className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-space-md md:p-space-lg shadow-sm flex flex-col gap-3 transition-shadow hover:shadow-md"
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="w-7 h-7 rounded-lg bg-primary text-on-primary font-mono font-bold text-xs flex items-center justify-center shrink-0">
                    #{q.question_number}
                  </span>
                  {q.domain && (
                    <span className="bg-surface-container px-2 py-0.5 rounded text-[11px] font-semibold text-secondary">
                      {q.domain}
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    q.difficulty === 'hard' 
                      ? 'bg-error-container text-error' 
                      : q.difficulty === 'medium' 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {q.difficulty}
                  </span>
                  <span className="font-mono text-[11px] text-on-surface-variant">
                    {q.marks || 1} mark{q.marks > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Edit & Delete Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEditModal(q)}
                    className="p-1.5 text-outline hover:text-primary rounded-lg hover:bg-surface-container transition-colors"
                    title="Edit Question Item"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(q)}
                    className="p-1.5 text-outline hover:text-error rounded-lg hover:bg-surface-container transition-colors"
                    title="Delete Question Item"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>

              {/* Question Stem */}
              <div className="text-[14px] text-primary font-medium leading-relaxed">
                {q.stem}
              </div>

              {/* Context Reference */}
              {q.context_reference && (
                <div className="text-[12px] bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/30 text-on-surface-variant font-mono">
                  Context: {q.context_reference}
                </div>
              )}

              {/* Answer Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 text-[13px]">
                {q.options?.map((opt) => (
                  <div
                    key={opt.letter}
                    className={`p-2.5 rounded-xl border flex items-start gap-2.5 transition-colors ${
                      opt.isCorrect
                        ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-semibold shadow-2xs'
                        : 'bg-surface-container-low border-outline-variant/30 text-on-surface'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                      opt.isCorrect
                        ? 'bg-emerald-600 text-white'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}>
                      {opt.letter}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span>{opt.text}</span>
                      {opt.isCorrect && (
                        <span className="ml-2 inline-flex items-center gap-0.5 text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
                          <span className="material-symbols-outlined text-[13px]">check_circle</span>
                          Authoritative Key
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Explanation / Rationale */}
              {q.explanation && (
                <div className="mt-1 p-3 bg-surface-container rounded-xl flex items-start gap-2 text-[12px] text-on-surface">
                  <span className="material-symbols-outlined text-secondary text-[16px] shrink-0 mt-0.5">school</span>
                  <div>
                    <strong className="font-semibold text-primary block mb-0.5">Verified Academic Rationale:</strong>
                    <p className="leading-relaxed text-on-surface-variant">{q.explanation}</p>
                  </div>
                </div>
              )}

            </div>
          ))
        )}
      </div>

      {/* Add / Edit Question Modal */}
      {(modalMode === 'create' || modalMode === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/60 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-3xl max-w-2xl w-full p-space-lg md:p-space-xl shadow-2xl border border-outline-variant/40 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3 mb-4">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-primary font-bold">
                  {modalMode === 'create' ? 'Add Item to Question Bank' : 'Edit Question Item'}
                </h3>
                <span className="text-[12px] text-on-surface-variant font-mono">
                  {examDetail?.code} • Item #{questionNumber}
                </span>
              </div>
              <button
                onClick={() => setModalMode(null)}
                className="p-1 rounded-lg text-outline hover:text-primary"
                type="button"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            <form onSubmit={handleQuestionSubmit} className="flex flex-col gap-4 text-[13px]">
              
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-on-surface block mb-1">Item #</label>
                  <input
                    type="number"
                    value={questionNumber}
                    onChange={(e) => setQuestionNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-on-surface block mb-1">Curriculum Domain</label>
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="e.g. Operating Systems"
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-on-surface block mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl focus:outline-none"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-on-surface block mb-1">Question Stem (LaTeX supported) *</label>
                <textarea
                  rows={3}
                  required
                  value={stem}
                  onChange={(e) => setStem(e.target.value)}
                  placeholder="Enter the authoritative question statement or problem formulation..."
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl focus:outline-none focus:border-secondary"
                />
              </div>

              <div>
                <label className="font-bold text-on-surface block mb-1">Context / Source Passage Reference</label>
                <input
                  type="text"
                  value={contextReference}
                  onChange={(e) => setContextReference(e.target.value)}
                  placeholder="e.g. Passage A or Theorem 3.2"
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl focus:outline-none font-mono"
                />
              </div>

              {/* Answer Options Selector */}
              <div>
                <label className="font-bold text-on-surface block mb-1.5">
                  Answer Options (Select the authoritative correct option radio) *
                </label>
                <div className="flex flex-col gap-2">
                  {options.map((opt) => (
                    <div key={opt.letter} className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                        <input
                          type="radio"
                          name="correctOptionRadio"
                          checked={opt.isCorrect}
                          onChange={() => handleCorrectChange(opt.letter)}
                          className="w-4 h-4 text-secondary focus:ring-0 cursor-pointer"
                        />
                        <span className="font-mono font-bold text-primary w-5">{opt.letter}</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={opt.text}
                        onChange={(e) => handleOptionTextChange(opt.letter, e.target.value)}
                        placeholder={`Option ${opt.letter} response...`}
                        className={`flex-1 px-3 py-2 bg-surface-container-low border rounded-xl focus:outline-none ${
                          opt.isCorrect ? 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50/30' : 'border-outline-variant/40'
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-on-surface block mb-1">Step-by-Step Verified Academic Rationale</label>
                <textarea
                  rows={2}
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Explain why the selected option is authoritatively correct according to MoE curriculum..."
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 rounded-xl bg-surface-container text-on-surface font-label-md font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-md font-bold transition-all shadow-md disabled:opacity-50"
                >
                  {saving ? 'Saving...' : (modalMode === 'create' ? 'Add Item to Bank' : 'Save Changes')}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Bulk JSON Import Modal */}
      {modalMode === 'import' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/60 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-3xl max-w-2xl w-full p-space-lg md:p-space-xl shadow-2xl border border-outline-variant/40 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3 mb-4">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-primary font-bold">
                  Bulk JSON Question Import
                </h3>
                <span className="text-[12px] text-on-surface-variant font-mono">
                  Target Exam: {examDetail?.code}
                </span>
              </div>
              <button
                onClick={() => setModalMode(null)}
                className="p-1 rounded-lg text-outline hover:text-primary"
                type="button"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            <form onSubmit={handleBulkImportSubmit} className="flex flex-col gap-4 text-[13px]">
              <div>
                <label className="font-bold text-on-surface block mb-1">
                  Paste JSON Array of Questions
                </label>
                <p className="text-[11px] text-on-surface-variant mb-2">
                  Each object should have <code>stem</code>, <code>options</code> (array of <code>{'{ letter, text, isCorrect }'}</code>), <code>difficulty</code>, and optional <code>explanation</code>.
                </p>
                <textarea
                  rows={10}
                  required
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder={`[
  {
    "questionNumber": 1,
    "domain": "Systems",
    "stem": "Which layer of the OSI model manages end-to-end flow control?",
    "difficulty": "medium",
    "options": [
      { "letter": "A", "text": "Transport Layer", "isCorrect": true },
      { "letter": "B", "text": "Network Layer", "isCorrect": false },
      { "letter": "C", "text": "Data Link Layer", "isCorrect": false },
      { "letter": "D", "text": "Session Layer", "isCorrect": false }
    ],
    "explanation": "The Transport Layer (Layer 4) is responsible for end-to-end communication, segmentation, flow control, and error correction."
  }
]`}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl focus:outline-none font-mono text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 rounded-xl bg-surface-container text-on-surface font-label-md font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 rounded-xl bg-secondary text-on-secondary hover:bg-primary font-label-md font-bold transition-all shadow-md disabled:opacity-50"
                >
                  {saving ? 'Importing...' : 'Ingest JSON Questions'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

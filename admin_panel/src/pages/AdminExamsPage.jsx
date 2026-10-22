import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../services/api';

export default function AdminExamsPage() {
  const [exams, setExams] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter Dropdowns
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('ALL');

  // Bulk Selection
  const [selectedExamIds, setSelectedExamIds] = useState([]);

  // Ingest / Edit Modal State
  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | null
  const [editingExamId, setEditingExamId] = useState(null);

  // Form Fields
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [amharicTitle, setAmharicTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [categoryId, setCategoryId] = useState(1);
  const [yearEc, setYearEc] = useState(2016);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(120);
  const [totalQuestions, setTotalQuestions] = useState(100);
  const [passingScore, setPassingScore] = useState(50.0);
  const [bookletCode, setBookletCode] = useState('');
  const [accessTier, setAccessTier] = useState('free');
  const [status, setStatus] = useState('published');
  const [curriculumDomain, setCurriculumDomain] = useState('');
  const [institution, setInstitution] = useState('Ministry of Education (MoE)');
  const [sourceAttribution, setSourceAttribution] = useState('Ministry of Education Curriculum Archive');
  const [redistributionStatus, setRedistributionStatus] = useState('public_domain');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [exList, catList] = await Promise.all([
        adminApi.getExams(),
        adminApi.getCategories(),
      ]);
      setExams(exList || []);
      setCategories(catList || []);
    } catch (err) {
      console.error('Error loading exams:', err);
    } finally {
      setLoading(false);
    }
  }

  const openCreateModal = () => {
    setModalMode('create');
    setEditingExamId(null);
    setCode('');
    setTitle('');
    setAmharicTitle('');
    setSubject('');
    setCategoryId(categories[0]?.id || 1);
    setYearEc(2016);
    setTimeLimitMinutes(120);
    setTotalQuestions(100);
    setPassingScore(50.0);
    setBookletCode('');
    setAccessTier('free');
    setStatus('published');
    setCurriculumDomain('');
    setInstitution('Ministry of Education (MoE)');
    setSourceAttribution('Ministry of Education Curriculum Archive');
    setRedistributionStatus('public_domain');
  };

  const openEditModal = (exam) => {
    setModalMode('edit');
    setEditingExamId(exam.id);
    setCode(exam.code || '');
    setTitle(exam.title || '');
    setAmharicTitle(exam.amharic_title || '');
    setSubject(exam.subject || '');
    setCategoryId(exam.category_id || 1);
    setYearEc(exam.year_ec || 2016);
    setTimeLimitMinutes(exam.time_limit_minutes || 120);
    setTotalQuestions(exam.total_questions || 100);
    setPassingScore(exam.passing_score || 50.0);
    setBookletCode(exam.booklet_code || '');
    setAccessTier(exam.access_tier || 'free');
    setStatus(exam.status || 'published');
    setCurriculumDomain(exam.curriculum_domain || '');
    setInstitution(exam.institution || 'Ministry of Education (MoE)');
    setSourceAttribution(exam.source_attribution || '');
    setRedistributionStatus(exam.redistribution_status || 'public_domain');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        code: code.trim(),
        title: title.trim(),
        amharicTitle: amharicTitle.trim() || null,
        subject: subject.trim(),
        categoryId: parseInt(categoryId, 10),
        yearEc: parseInt(yearEc, 10),
        timeLimitMinutes: parseInt(timeLimitMinutes, 10),
        totalQuestions: parseInt(totalQuestions, 10),
        passingScore: parseFloat(passingScore),
        bookletCode: bookletCode.trim() || null,
        accessTier,
        status,
        curriculumDomain: curriculumDomain.trim() || null,
        institution: institution.trim() || 'Ministry of Education (MoE)',
        sourceAttribution: sourceAttribution.trim() || null,
        redistributionStatus,
      };

      if (modalMode === 'create') {
        await adminApi.createExam(payload);
      } else {
        await adminApi.updateExam(editingExamId, payload);
      }

      setModalMode(null);
      await loadData();
    } catch (err) {
      alert(err.message || 'Operation failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExam = async (exam) => {
    const confirmed = window.confirm(`Are you sure you want to delete exam "${exam.code}"? This will remove all associated questions and student attempt data.`);
    if (!confirmed) return;

    try {
      await adminApi.deleteExam(exam.id);
      setExams(prev => prev.filter(e => e.id !== exam.id));
      setSelectedExamIds(prev => prev.filter(id => id !== exam.id));
    } catch (err) {
      alert(err.message || 'Failed to delete exam.');
    }
  };

  const handleStatusChange = async (examId, newStatus) => {
    try {
      await adminApi.updateExam(examId, { status: newStatus });
      setExams(prev => prev.map(e => e.id === examId ? { ...e, status: newStatus } : e));
    } catch (err) {
      alert(err.message || 'Failed to update status.');
    }
  };

  const handleBulkStatus = async (targetStatus) => {
    if (selectedExamIds.length === 0) return;
    try {
      await adminApi.bulkUpdateExamStatus(selectedExamIds, targetStatus);
      setExams(prev => prev.map(e => selectedExamIds.includes(e.id) ? { ...e, status: targetStatus } : e));
      setSelectedExamIds([]);
    } catch (err) {
      alert(err.message || 'Failed to update in bulk.');
    }
  };

  const toggleSelectAll = (checked, currentList) => {
    if (checked) {
      const allIds = currentList.map(e => e.id);
      setSelectedExamIds(allIds);
    } else {
      setSelectedExamIds([]);
    }
  };

  const toggleSelectExam = (id) => {
    setSelectedExamIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // CSV Export
  const exportToCSV = (itemsToExport) => {
    if (itemsToExport.length === 0) {
      alert('No records available to export.');
      return;
    }

    const headers = ['ID', 'Exam Code', 'Title', 'Amharic Title', 'Category', 'Subject', 'Year E.C.', 'Access Tier', 'Status', 'Questions', 'Pass Score', 'Time Limit Min', 'Booklet'];
    const rows = itemsToExport.map(e => [
      e.id,
      `"${(e.code || '').replace(/"/g, '""')}"`,
      `"${(e.title || '').replace(/"/g, '""')}"`,
      `"${(e.amharic_title || '').replace(/"/g, '""')}"`,
      `"${(e.category_name || '').replace(/"/g, '""')}"`,
      `"${(e.subject || '').replace(/"/g, '""')}"`,
      e.year_ec || 2016,
      e.access_tier || 'free',
      e.status || 'published',
      e.question_count || 0,
      e.passing_score || 50,
      e.time_limit_minutes || 120,
      `"${(e.booklet_code || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ethio_exam_repository_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter Logic
  const filteredExams = exams.filter(e => {
    const matchSearch =
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.institution && e.institution.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchCategory =
      selectedCategory === 'ALL' ||
      String(e.category_id) === String(selectedCategory);

    const matchStatus =
      selectedStatus === 'ALL' ||
      e.status === selectedStatus;

    const matchYear =
      selectedYear === 'ALL' ||
      String(e.year_ec) === String(selectedYear);

    return matchSearch && matchCategory && matchStatus && matchYear;
  });

  const allSelected = filteredExams.length > 0 && filteredExams.every(e => selectedExamIds.includes(e.id));

  return (
    <div className="flex flex-col gap-space-lg p-gutter">
      
      {/* Title & Action Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-space-md shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[24px]">folder_special</span>
            <h1 className="font-headline-sm text-headline-sm text-primary font-bold">
              Exam Paper Repository & Document Pipeline
            </h1>
          </div>
          <p className="text-body-sm text-on-surface-variant mt-0.5">
            Administer verified national exam papers, curriculum booklet standards, passing cutoffs, and publication states.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToCSV(selectedExamIds.length > 0 ? exams.filter(e => selectedExamIds.includes(e.id)) : filteredExams)}
            className="px-3.5 py-2.5 bg-surface-container hover:bg-surface-container-high text-primary font-label-md font-bold rounded-xl flex items-center gap-1.5 transition-colors border border-outline-variant/30"
            type="button"
            title="Download CSV report"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Export CSV</span>
          </button>
          
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-primary text-on-primary hover:bg-primary-container rounded-xl font-label-md font-bold flex items-center gap-1.5 transition-all shadow-sm shrink-0"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>+ Ingest Exam Paper</span>
          </button>
        </div>
      </div>

      {/* Filter, Search & Status Controls */}
      <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-space-md shadow-sm flex flex-col lg:flex-row gap-space-md items-stretch lg:items-center justify-between">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[260px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search papers by exam code, institution, year, or subject..."
            className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-body-sm text-on-surface focus:outline-none focus:border-secondary"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-surface-container-low border border-outline-variant/40 px-3 py-2 rounded-xl text-[12px] font-semibold text-on-surface focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-surface-container-low border border-outline-variant/40 px-3 py-2 rounded-xl text-[12px] font-semibold text-on-surface focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="published">Published Live</option>
            <option value="review">Pending Review</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>

          {/* Academic Year */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-surface-container-low border border-outline-variant/40 px-3 py-2 rounded-xl text-[12px] font-semibold text-on-surface focus:outline-none"
          >
            <option value="ALL">All Years</option>
            <option value="2016">2016 E.C.</option>
            <option value="2015">2015 E.C.</option>
            <option value="2014">2014 E.C.</option>
          </select>

          {(searchTerm || selectedCategory !== 'ALL' || selectedStatus !== 'ALL' || selectedYear !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('ALL');
                setSelectedStatus('ALL');
                setSelectedYear('ALL');
              }}
              className="text-[11px] font-bold text-error hover:underline px-2 py-1"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Bulk Action Toolbar */}
      {selectedExamIds.length > 0 && (
        <div className="bg-primary text-on-primary px-4 py-2.5 rounded-xl shadow-md flex items-center justify-between gap-3 text-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim animate-pulse"></span>
            <span className="font-bold">
              {selectedExamIds.length} exam paper{selectedExamIds.length > 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkStatus('published')}
              className="px-3 py-1 bg-secondary text-on-secondary hover:bg-secondary-container rounded-lg font-bold transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[15px]">publish</span>
              <span>Batch Publish</span>
            </button>
            <button
              onClick={() => handleBulkStatus('review')}
              className="px-3 py-1 bg-surface-container-lowest/20 hover:bg-surface-container-lowest/30 rounded-lg font-bold transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[15px]">rule</span>
              <span>Set Review</span>
            </button>
            <button
              onClick={() => handleBulkStatus('draft')}
              className="px-3 py-1 bg-surface-container-lowest/20 hover:bg-surface-container-lowest/30 rounded-lg font-bold transition-colors"
            >
              Set Draft
            </button>
            <button
              onClick={() => setSelectedExamIds([])}
              className="text-on-primary-container hover:text-white font-bold ml-2"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Exams Data Table */}
      <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant/40 font-bold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => toggleSelectAll(e.target.checked, filteredExams)}
                    className="w-4 h-4 rounded text-secondary focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4">Exam Code & Academic Program</th>
                <th className="py-3 px-4">Category & Authority</th>
                <th className="py-3 px-4">Session / Year</th>
                <th className="py-3 px-4">Format & Time</th>
                <th className="py-3 px-4">Access Tier</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-on-surface-variant">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-3 border-secondary border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading examination resources...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredExams.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-[36px] text-outline mb-1 block">search_off</span>
                    No examination records match the current filters.
                  </td>
                </tr>
              ) : (
                filteredExams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedExamIds.includes(exam.id)}
                        onChange={() => toggleSelectExam(exam.id)}
                        className="w-4 h-4 rounded text-secondary focus:ring-0 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-4 min-w-[260px]">
                      <div className="flex items-start gap-2.5">
                        <span className="material-symbols-outlined text-secondary mt-0.5 text-[20px]">terminal</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-primary hover:text-secondary cursor-pointer transition-colors">
                              {exam.code}
                            </span>
                            {exam.booklet_code && (
                              <span className="bg-surface-container px-1.5 py-0.2 rounded font-mono text-[10px] text-secondary font-bold">
                                {exam.booklet_code}
                              </span>
                            )}
                          </div>
                          <span className="text-[12px] text-on-surface block font-medium mt-0.5 line-clamp-1">
                            {exam.title}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="bg-surface-container px-2 py-0.5 rounded text-[11px] font-semibold text-primary block w-fit">
                        {exam.category_name}
                      </span>
                      <span className="text-[11px] text-on-surface-variant mt-0.5 block truncate max-w-[160px]">
                        {exam.institution || 'Ministry of Education (MoE)'}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-primary">{exam.year_ec} E.C.</span>
                      <span className="text-[11px] text-on-surface-variant block">{exam.subject}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-semibold text-primary text-[12px]">
                        <span>{exam.question_count || exam.total_questions || 0} Qs</span>
                        <span className="text-outline">•</span>
                        <span>{exam.time_limit_minutes || 120} min</span>
                      </div>
                      <span className="text-[11px] text-on-surface-variant block mt-0.5 font-mono">
                        Pass: {exam.passing_score || 50}%
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        exam.access_tier === 'pro' 
                          ? 'bg-secondary-fixed text-on-secondary-fixed' 
                          : 'bg-surface-container text-on-surface'
                      }`}>
                        {exam.access_tier}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <select
                        value={exam.status}
                        onChange={(e) => handleStatusChange(exam.id, e.target.value)}
                        className={`text-[11px] font-bold rounded-lg px-2 py-1 border focus:outline-none cursor-pointer ${
                          exam.status === 'published' 
                            ? 'bg-surface-container text-tertiary-fixed-dim border-outline-variant/30' 
                            : 'bg-surface-container-low text-on-surface-variant border-outline-variant/40'
                        }`}
                      >
                        <option value="published">Published</option>
                        <option value="review">Review</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        
                        {/* Edit Exam Button */}
                        <button
                          onClick={() => openEditModal(exam)}
                          className="p-1.5 rounded-lg text-primary hover:bg-surface-container transition-colors"
                          title="Edit Exam Metadata"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>

                        {/* Questions Manager */}
                        <Link
                          to={`/questions?examId=${exam.id}`}
                          className="px-2 py-1 rounded-lg bg-surface-container text-secondary text-[11px] font-bold hover:bg-surface-container-high transition-colors flex items-center gap-1"
                          title="Open Question Bank"
                        >
                          <span className="material-symbols-outlined text-[15px]">quiz</span>
                          <span>{exam.question_count || 0}</span>
                        </Link>

                        {/* Main Site Preview */}
                        <a
                          href={`http://localhost:3000/exams/${exam.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-outline hover:text-primary transition-colors"
                          title="Preview Exam on Main Site"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </a>

                        {/* Direct Simulator Link */}
                        <a
                          href={`http://localhost:3000/simulator/${exam.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-outline hover:text-secondary transition-colors"
                          title="Launch in Student Simulator"
                        >
                          <span className="material-symbols-outlined text-[18px]">play_circle</span>
                        </a>

                        {/* Delete Exam Button */}
                        <button
                          onClick={() => handleDeleteExam(exam)}
                          className="p-1.5 text-outline hover:text-error transition-colors"
                          title="Delete Exam"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>

                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-space-sm px-space-md bg-surface-container-lowest border-t border-outline-variant/30 flex items-center justify-between text-on-surface-variant font-label-md text-[12px]">
          <span>
            Showing <strong className="text-primary">{filteredExams.length}</strong> of {exams.length} indexed exams
          </span>
          <span className="font-mono text-[11px]">
            SHA-256 Merkle Provenance Active
          </span>
        </div>
      </div>

      {/* Ingest / Edit Exam Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/60 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-3xl max-w-2xl w-full p-space-lg md:p-space-xl shadow-2xl border border-outline-variant/40 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3 mb-4">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-primary font-bold">
                  {modalMode === 'create' ? 'Ingest New Examination Resource' : 'Edit Examination Resource'}
                </h3>
                <span className="text-[12px] text-on-surface-variant">
                  Official national syllabus standards and copyright attribution
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

            <form onSubmit={handleFormSubmit} className="flex flex-col gap-4 text-[13px]">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-on-surface block mb-1">Exam Code *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. MOE-EXIT-CS-2016"
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl focus:outline-none focus:border-secondary font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-on-surface block mb-1">Booklet Code</label>
                  <input
                    type="text"
                    value={bookletCode}
                    onChange={(e) => setBookletCode(e.target.value)}
                    placeholder="e.g. 01-CS or BOOKLET-B"
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl focus:outline-none focus:border-secondary font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-on-surface block mb-1">Full Examination Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 2016 E.C. Ethiopian University Exit Examination: Computer Science"
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl focus:outline-none focus:border-secondary"
                />
              </div>

              <div>
                <label className="font-bold text-on-surface block mb-1">Amharic Title (Optional)</label>
                <input
                  type="text"
                  value={amharicTitle}
                  onChange={(e) => setAmharicTitle(e.target.value)}
                  placeholder="e.g. የ2016 ዓ.ም የኮምፒውተር ሳይንስ መውጫ ፈተና"
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl focus:outline-none focus:border-secondary font-ethiopic"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-on-surface block mb-1">Category *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-on-surface block mb-1">Subject *</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Computer Science"
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-on-surface block mb-1">Year (E.C.)</label>
                  <input
                    type="number"
                    value={yearEc}
                    onChange={(e) => setYearEc(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-on-surface block mb-1">Time Limit (Mins)</label>
                  <input
                    type="number"
                    value={timeLimitMinutes}
                    onChange={(e) => setTimeLimitMinutes(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-on-surface block mb-1">Passing Cutoff %</label>
                  <input
                    type="number"
                    step="0.5"
                    value={passingScore}
                    onChange={(e) => setPassingScore(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-on-surface block mb-1">Publication Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl focus:outline-none font-semibold"
                  >
                    <option value="published">Published Live</option>
                    <option value="review">Under Review</option>
                    <option value="draft">Draft Staging</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-on-surface block mb-1">Access Tier</label>
                  <select
                    value={accessTier}
                    onChange={(e) => setAccessTier(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl focus:outline-none"
                  >
                    <option value="free">Free Public Access</option>
                    <option value="pro">Pro Pass Exclusive</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-on-surface block mb-1">Redistribution Rights</label>
                  <select
                    value={redistributionStatus}
                    onChange={(e) => setRedistributionStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl focus:outline-none"
                  >
                    <option value="public_domain">Public Educational Domain</option>
                    <option value="institutional_fair_use">Institutional Fair Use</option>
                    <option value="licensed">Licensed Commercial Track</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-on-surface block mb-1">Institution & Issuing Authority</label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. Ministry of Education (MoE) or EAES National Board"
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-on-surface block mb-1">Curriculum Domain / Competency Topics</label>
                <input
                  type="text"
                  value={curriculumDomain}
                  onChange={(e) => setCurriculumDomain(e.target.value)}
                  placeholder="e.g. Software Engineering, Operating Systems, Networks & Databases"
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
                  {saving ? 'Saving...' : (modalMode === 'create' ? 'Confirm Ingestion' : 'Save Changes')}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../services/api';

export default function AdminAviationPage() {
  const [aviationExams, setAviationExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form Fields for new aviation module
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [amharicTitle, setAmharicTitle] = useState('');
  const [subject, setSubject] = useState('Aviation Aptitude & Flight Physics');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(90);
  const [passingScore, setPassingScore] = useState(70.0);
  const [accessTier, setAccessTier] = useState('pro');
  const [curriculumDomain, setCurriculumDomain] = useState('Spatial Orientation, Mechanical Comprehension & Flight Physics');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAviationModules();
  }, []);

  async function loadAviationModules() {
    setLoading(true);
    try {
      const data = await adminApi.getAviationModules();
      setAviationExams(data || []);
    } catch (err) {
      console.error('Error loading aviation modules:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateAviationModule = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.createExam({
        code: code.trim(),
        title: title.trim(),
        amharicTitle: amharicTitle.trim() || null,
        subject: subject.trim(),
        categoryId: 4, // Aviation category
        yearEc: 2016,
        yearGc: 2024,
        timeLimitMinutes: parseInt(timeLimitMinutes, 10),
        totalQuestions: 75,
        passingScore: parseFloat(passingScore),
        accessTier,
        status: 'published',
        institution: 'Ethiopian Airlines Aviation University',
        curriculumDomain: curriculumDomain.trim(),
        sourceAttribution: 'Ethiopian Airlines Training Academy Assessment Council',
        redistributionStatus: 'licensed',
      });
      setModalOpen(false);
      setCode('');
      setTitle('');
      await loadAviationModules();
    } catch (err) {
      alert(err.message || 'Failed to create aviation module.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-space-lg p-gutter">
      
      {/* Title & Action Strip */}
      <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-space-md shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[24px]">flight_takeoff</span>
            <h1 className="font-headline-sm text-headline-sm text-primary font-bold">
              Ethiopian Aviation University & Academy Module Manager
            </h1>
          </div>
          <p className="text-body-sm text-on-surface-variant mt-0.5">
            Administer specialized Pilot Cadet screening exams, Aircraft Maintenance Technician (AMT) modules, and aviation physics suites.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 bg-primary text-on-primary hover:bg-primary-container rounded-xl font-label-md font-bold flex items-center gap-1.5 transition-all shadow-sm shrink-0 text-xs"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>+ New Aviation Module</span>
        </button>
      </div>

      {/* Aviation KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-space-md shadow-sm">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-[11px] font-bold uppercase tracking-wider">Aviation Modules</span>
            <span className="material-symbols-outlined text-secondary text-[20px]">flight</span>
          </div>
          <div className="mt-2 font-mono text-[28px] font-black text-primary">
            {aviationExams.length}
          </div>
          <span className="text-[11px] text-tertiary-fixed-dim font-bold mt-1 block">
            Cadet & AMT Tracks Active
          </span>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-space-md shadow-sm">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-[11px] font-bold uppercase tracking-wider">Candidate Test Takers</span>
            <span className="material-symbols-outlined text-primary text-[20px]">group</span>
          </div>
          <div className="mt-2 font-mono text-[28px] font-black text-primary">
            {aviationExams.reduce((sum, e) => sum + parseInt(e.total_candidates_tested || 0, 10), 0)}
          </div>
          <span className="text-[11px] text-on-surface-variant font-medium mt-1 block">
            Screening simulator completions
          </span>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-space-md shadow-sm">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-[11px] font-bold uppercase tracking-wider">Aviation Questions</span>
            <span className="material-symbols-outlined text-secondary text-[20px]">quiz</span>
          </div>
          <div className="mt-2 font-mono text-[28px] font-black text-secondary">
            {aviationExams.reduce((sum, e) => sum + parseInt(e.question_count || 0, 10), 0)}
          </div>
          <span className="text-[11px] text-on-surface-variant font-medium mt-1 block">
            Spatial, technical & psychomotor items
          </span>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-space-md shadow-sm">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-[11px] font-bold uppercase tracking-wider">Aviation University Standard</span>
            <span className="material-symbols-outlined text-secondary text-[20px]">verified</span>
          </div>
          <div className="mt-2 font-mono text-[24px] font-black text-primary">
            70.0% Cutoff
          </div>
          <span className="text-[11px] text-on-surface-variant font-medium mt-1 block">
            Ethiopian Airlines Group licensed
          </span>
        </div>
      </div>

      {/* Aviation Modules Table */}
      <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant/40 font-bold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">Code & Discipline</th>
                <th className="py-3 px-4">Aviation Examination Title</th>
                <th className="py-3 px-4">Format & Time</th>
                <th className="py-3 px-4">Cadet Cutoff</th>
                <th className="py-3 px-4">Total Tested</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-on-surface-variant">
                    Loading aviation screening papers...
                  </td>
                </tr>
              ) : aviationExams.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-on-surface-variant">
                    No aviation modules recorded. Click "+ New Aviation Module" to create one.
                  </td>
                </tr>
              ) : (
                aviationExams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-secondary">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[18px]">flight</span>
                        <span>{exam.code}</span>
                      </div>
                      <span className="text-[11px] text-on-surface-variant font-normal block mt-0.5">
                        {exam.subject}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-sm">
                      <span className="font-semibold text-primary block">{exam.title}</span>
                      {exam.curriculum_domain && (
                        <span className="text-[11px] text-on-surface-variant line-clamp-1 mt-0.5">
                          {exam.curriculum_domain}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-[12px]">
                      <div>{exam.question_count || exam.total_questions || 0} Questions</div>
                      <span className="text-on-surface-variant text-[11px]">{exam.time_limit_minutes || 90} mins</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-secondary">
                      {exam.passing_score}% Cutoff
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-primary">
                      {exam.total_candidates_tested || 0} candidates
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-surface-container text-tertiary-fixed-dim px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">
                        {exam.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/questions?examId=${exam.id}`}
                          className="px-2.5 py-1 rounded-lg bg-surface-container text-secondary text-[11px] font-bold hover:bg-surface-container-high transition-colors"
                        >
                          Questions ({exam.question_count || 0})
                        </Link>
                        <a
                          href={`http://localhost:3000/simulator/${exam.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 text-outline hover:text-primary transition-colors"
                          title="Simulate Aviation Exam"
                        >
                          <span className="material-symbols-outlined text-[18px]">play_circle</span>
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Aviation Module Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/60 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-3xl max-w-xl w-full p-space-lg shadow-2xl border border-outline-variant/40">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3 mb-4">
              <div>
                <h3 className="font-headline-sm font-bold text-primary">
                  New Aviation Screening Module
                </h3>
                <span className="text-[12px] text-on-surface-variant">
                  Ethiopian Aviation University Cadet & AMT Standard
                </span>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-1 text-outline hover:text-primary">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateAviationModule} className="flex flex-col gap-3 text-[13px]">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-on-surface block mb-1">Module Code *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. EAA-CADET-2025"
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-on-surface block mb-1">Subject Discipline</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Aviation Aptitude & Flight Physics"
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-on-surface block mb-1">Examination Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Ethiopian Aviation Academy Pilot Cadet Screening Exam: Flight Physics"
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                    value={passingScore}
                    onChange={(e) => setPassingScore(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-on-surface block mb-1">Curriculum Competency Domain</label>
                <input
                  type="text"
                  value={curriculumDomain}
                  onChange={(e) => setCurriculumDomain(e.target.value)}
                  placeholder="e.g. Spatial Reasoning, Aerodynamics, Navigation"
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container text-on-surface font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-bold text-xs shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create Aviation Module'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

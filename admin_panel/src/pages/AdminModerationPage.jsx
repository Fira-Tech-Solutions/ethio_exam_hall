import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';

export default function AdminModerationPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeReport, setActiveReport] = useState(null);
  
  // Resolution form state
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [correctOptionLetter, setCorrectOptionLetter] = useState('A');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    setLoading(true);
    try {
      const data = await adminApi.getModerationReports();
      setReports(data || []);
      if (data && data.length > 0 && !activeReport) {
        setActiveReport(data[0]);
      }
    } catch (err) {
      console.error('Failed to load moderation reports:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleAction = async (status, defaultNotes, optionLetter = null) => {
    if (!activeReport) return;
    setSaving(true);
    try {
      await adminApi.resolveModerationReport(activeReport.id, {
        status,
        resolutionNotes: resolutionNotes || defaultNotes,
        correctOptionLetter: optionLetter || correctOptionLetter,
        questionId: activeReport.question_id || null,
      });
      alert(`Dispute #${activeReport.id} status updated to "${status}".`);
      setResolutionNotes('');
      await loadReports();
    } catch (err) {
      alert(err.message || 'Failed to update report resolution.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-space-lg p-gutter">
      
      {/* Title Header */}
      <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-space-md shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-error text-[24px]">gavel</span>
            <h1 className="font-headline-sm text-headline-sm text-primary font-bold">
              Content Moderation & Academic Dispute Queue
            </h1>
          </div>
          <p className="text-body-sm text-on-surface-variant mt-0.5">
            Investigate disputed answer keys, OCR transcription typos, and curriculum alignment challenges.
          </p>
        </div>

        <div className="bg-surface-container-low px-4 py-2 rounded-xl border border-outline-variant/30 text-right">
          <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Open Claims</span>
          <span className="font-mono text-headline-sm font-black text-error">
            {reports.filter(r => r.status === 'open' || r.status === 'reviewing').length}
          </span>
        </div>
      </div>

      {/* Interactive Dispute Resolution Console (from Stitch Design) */}
      {activeReport ? (
        <section className="bg-surface-container-lowest p-space-md md:p-space-lg rounded-2xl border border-outline-variant/40 shadow-sm flex flex-col gap-space-md">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/30 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-error-container text-error flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[18px]">rate_review</span>
              </span>
              <div>
                <h2 className="font-headline-sm text-headline-sm text-primary font-bold">
                  Active Dispute Workbench
                </h2>
                <span className="font-label-md text-label-md text-on-surface-variant">
                  Assigned to MoE Quality Panel • Ticket #{activeReport.id}
                </span>
              </div>
            </div>
            <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase ${
              activeReport.status === 'resolved' 
                ? 'bg-emerald-100 text-emerald-800' 
                : activeReport.status === 'reviewing' 
                  ? 'bg-secondary-fixed text-on-secondary-fixed' 
                  : 'bg-error-container text-error'
            }`}>
              {activeReport.status} • #{activeReport.id}
            </span>
          </div>

          <div className="bg-surface-container-low p-space-md rounded-xl flex flex-col gap-space-sm text-xs">
            <div className="flex flex-wrap items-center justify-between gap-1 text-[12px]">
              <span className="font-semibold text-primary">
                Target: <strong className="font-mono text-secondary">{activeReport.exam_code}</strong> — {activeReport.exam_title}
              </span>
              <span className="text-on-surface-variant">
                Reported by Candidate: <strong className="text-primary font-semibold">{activeReport.reported_by_name || 'Verified Scholar'}</strong> ({activeReport.reported_by_email})
              </span>
            </div>

            {/* Subject Question Description */}
            <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/30">
              <span className="font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider block mb-1 font-bold">
                Disputed Subject Formulation:
              </span>
              <p className="font-body-md text-body-md text-primary font-medium leading-relaxed">
                "{activeReport.description}"
              </p>
            </div>

            {/* Dispute Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm text-[13px]">
              <div className="p-3 bg-surface-container-lowest rounded-xl border border-error/30">
                <span className="font-label-md text-[11px] font-bold text-error uppercase block mb-1">
                  Current Question Status:
                </span>
                <p className="font-semibold text-on-surface">
                  Flagged for verification ({activeReport.dispute_type?.replace(/_/g, ' ') || 'Answer Key Dispute'})
                </p>
                <span className="text-[11px] text-outline block mt-1 font-mono">
                  Created: {new Date(activeReport.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </div>

              <div className="p-3 bg-surface-container-lowest rounded-xl border border-secondary/30">
                <span className="font-label-md text-[11px] font-bold text-secondary uppercase block mb-1">
                  Correct Option Selector:
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span>Authoritative Key:</span>
                  {['A', 'B', 'C', 'D'].map((letter) => (
                    <label key={letter} className="inline-flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="correctLetter"
                        value={letter}
                        checked={correctOptionLetter === letter}
                        onChange={(e) => setCorrectOptionLetter(e.target.value)}
                        className="text-secondary focus:ring-0"
                      />
                      <span className="font-bold font-mono">{letter}</span>
                    </label>
                  ))}
                </div>
                <span className="text-[11px] text-on-surface-variant block mt-1">
                  Selecting key updates option on live exam paper immediately upon acceptance.
                </span>
              </div>
            </div>

            {/* Optional Resolution Notes Input */}
            <div>
              <label className="font-bold text-on-surface block mb-1 text-[11px]">
                Administrative Resolution Rationale / Errata Notes:
              </label>
              <input
                type="text"
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Consensus valid. Updated answer key and verified curriculum reference..."
                className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:outline-none text-xs"
              />
            </div>

            {/* Moderation Controls Matching Stitch Reference */}
            <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-outline-variant/30">
              <button
                type="button"
                disabled={saving}
                onClick={() => handleAction('reviewing', 'Assigned to University Academic Panel for review.')}
                className="bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md px-3.5 py-2 rounded-xl transition-colors font-semibold"
              >
                Assign to Faculty Desk
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleAction('rejected', 'Dispute invalidated after curriculum review.')}
                className="bg-error-container text-error hover:bg-error hover:text-on-error font-label-md text-label-md px-3.5 py-2 rounded-xl transition-colors font-semibold"
              >
                Reject with Formal Rationale
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleAction('resolved', `Accepted correction. Updated key to Option ${correctOptionLetter}.`, correctOptionLetter)}
                className="bg-secondary text-on-secondary hover:bg-primary font-label-md text-label-md px-4 py-2 rounded-xl font-bold shadow-sm transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                Accept Correction & Push Live
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {/* Reports Table List */}
      <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-3 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between">
          <span className="font-bold text-primary text-xs uppercase tracking-wider">
            All Content Dispute Claims ({reports.length})
          </span>
          <span className="text-[11px] text-on-surface-variant font-mono">
            Click any row to load into workbench above
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant/40 font-bold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">Exam & Paper</th>
                <th className="py-3 px-4">Dispute Type</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-on-surface-variant">
                    Loading dispute reports...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-on-surface-variant">
                    No moderation disputes in queue.
                  </td>
                </tr>
              ) : (
                reports.map((rep) => (
                  <tr
                    key={rep.id}
                    onClick={() => setActiveReport(rep)}
                    className={`cursor-pointer transition-colors ${
                      activeReport?.id === rep.id ? 'bg-surface-container' : 'hover:bg-surface-container-low/50'
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-secondary">
                      <div>{rep.exam_code}</div>
                      <span className="text-[11px] text-on-surface font-normal line-clamp-1">
                        {rep.exam_title}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-primary">
                      <span className="bg-surface-container px-2 py-0.5 rounded text-[11px] uppercase">
                        {rep.dispute_type?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-sm text-on-surface">
                      <p className="line-clamp-2">{rep.description}</p>
                      {rep.resolution_notes && (
                        <p className="text-[11px] text-tertiary-fixed-dim font-medium mt-1">
                          Resolution: {rep.resolution_notes}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[12px] text-on-surface-variant">
                      <span className="font-semibold text-on-surface block">{rep.reported_by_name || 'Candidate'}</span>
                      <span className="text-[11px]">{rep.reported_by_email || 'Verified Student'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        rep.status === 'resolved' 
                          ? 'bg-surface-container text-tertiary-fixed-dim' 
                          : (rep.status === 'reviewing' ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-error-container text-error')
                      }`}>
                        {rep.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveReport(rep);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-surface-container text-primary font-bold text-[12px] hover:bg-surface-container-high transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

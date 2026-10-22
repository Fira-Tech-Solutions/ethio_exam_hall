import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../services/api';

export default function AdminOverviewPage() {
  const [data, setData] = useState(null);
  const [moderations, setModerations] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOverview() {
      try {
        const [overview, mods, logs] = await Promise.all([
          adminApi.getOverview(),
          adminApi.getModerationReports(),
          adminApi.getAuditLogs(),
        ]);
        setData(overview);
        setModerations(mods || []);
        setAuditLogs(logs || []);
      } catch (err) {
        console.error('Failed to load admin overview:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOverview();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="font-label-md text-on-surface-variant font-medium">Loading Control Center Pipeline...</span>
        </div>
      </div>
    );
  }

  const { metrics } = data || {};

  return (
    <div className="flex flex-col gap-space-xl p-gutter">
      
      {/* Top Banner / Ingestion Pipeline Status Strip */}
      <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-space-md shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="font-label-md text-[11px] font-bold text-secondary uppercase tracking-wider block">
            Operations Status
          </span>
          <h1 className="font-headline-sm text-headline-sm text-primary font-bold">
            Administrative Control Center & Content Pipeline
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-0.5">
            Oversee examination resource ingestion, copyright attributions, and academic dispute moderation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/users"
            className="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-primary rounded-xl font-label-md text-[13px] font-bold transition-all flex items-center gap-1.5"
            title="View Registered Users"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">group</span>
            <span>Users</span>
          </Link>
          <Link
            to="/exams"
            className="px-4 py-2 bg-primary text-on-primary hover:bg-primary-container rounded-xl font-label-md text-[13px] font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Ingest New Exam</span>
          </Link>
          <Link
            to="/moderation"
            className="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-primary rounded-xl font-label-md text-[13px] font-bold transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">gavel</span>
            <span>Moderation Queue</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        
        {/* Total Exams */}
        <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-space-md shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Exam Papers</span>
            <span className="material-symbols-outlined text-secondary text-[22px]">assignment</span>
          </div>
          <div className="mt-3">
            <div className="font-mono text-[32px] font-black text-primary leading-tight">
              {metrics?.totalExams || 0}
            </div>
            <span className="text-[12px] text-tertiary-fixed-dim font-bold mt-1 block">
              {metrics?.publishedExams || 0} Published Live
            </span>
          </div>
        </div>

        {/* Total Questions Bank */}
        <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-space-md shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Verified Questions</span>
            <span className="material-symbols-outlined text-tertiary-fixed-dim text-[22px]">quiz</span>
          </div>
          <div className="mt-3">
            <div className="font-mono text-[32px] font-black text-primary leading-tight">
              {metrics?.totalQuestions || 0}
            </div>
            <span className="text-[12px] text-secondary font-bold mt-1 block">
              100% Authoritative Answer Keys
            </span>
          </div>
        </div>

        {/* Active Candidates - Clickable Link to Users */}
        <Link
          to="/users"
          className="bg-surface-container-lowest border border-outline-variant/50 hover:border-secondary rounded-2xl p-space-md shadow-sm flex flex-col justify-between group transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider group-hover:text-secondary transition-colors">Registered Users</span>
            <span className="material-symbols-outlined text-primary text-[22px] group-hover:scale-110 transition-transform">group</span>
          </div>
          <div className="mt-3">
            <div className="font-mono text-[32px] font-black text-primary leading-tight">
              {metrics?.totalCandidates || 0}
            </div>
            <span className="text-[12px] text-secondary font-bold mt-1 flex items-center gap-1">
              <span>View Registered Users</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </span>
          </div>
        </Link>

        {/* Total Platform Revenue */}
        <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-space-md shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Total Revenue (ETB)</span>
            <span className="material-symbols-outlined text-secondary text-[22px]">payments</span>
          </div>
          <div className="mt-3">
            <div className="font-mono text-[28px] font-black text-secondary leading-tight truncate">
              ETB {metrics?.totalRevenueEtb || '0.00'}
            </div>
            <span className="text-[11px] text-on-surface-variant mt-1 block">
              Telebirr • CBE Birr • Chapa
            </span>
          </div>
        </div>

      </div>

      {/* 2-Column Tables Section: Content Moderation & Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        
        {/* Left: Content Moderation & Academic Dispute (7 cols) */}
        <div className="lg:col-span-7 bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-space-md md:p-space-lg shadow-sm flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-headline-sm text-headline-sm text-primary font-bold">
                Content Moderation & Academic Dispute
              </h2>
              <p className="text-[12px] text-on-surface-variant">Disputed answer keys and OCR transcription reports</p>
            </div>
            <Link to="/moderation" className="text-secondary font-bold text-[12px] hover:underline">
              View All ({moderations.length})
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            {moderations.slice(0, 4).map((mod) => (
              <div
                key={mod.id}
                className="p-3 rounded-xl border border-outline-variant/40 hover:bg-surface-container-low transition-colors flex items-start justify-between gap-3 text-[13px]"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-secondary bg-surface-container px-2 py-0.5 rounded">
                      {mod.exam_code}
                    </span>
                    <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold uppercase ${
                      mod.status === 'resolved' ? 'bg-surface-container text-tertiary-fixed-dim' : 'bg-error-container text-error'
                    }`}>
                      {mod.status}
                    </span>
                  </div>
                  <p className="text-on-surface font-semibold mt-1">
                    {mod.description}
                  </p>
                  <span className="text-[11px] text-on-surface-variant font-medium mt-0.5 block">
                    Reported by: {mod.reported_by_name || 'Candidate'}
                  </span>
                </div>

                <Link
                  to="/moderation"
                  className="px-2.5 py-1 rounded-lg bg-surface-container text-primary font-label-md text-[11px] font-bold shrink-0 hover:bg-surface-container-high transition-colors"
                >
                  Review
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Audit Trail & Ledger (5 cols) */}
        <div className="lg:col-span-5 bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-space-md md:p-space-lg shadow-sm flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-headline-sm text-headline-sm text-primary font-bold">
                Audit Trail & Ledger
              </h2>
              <p className="text-[12px] text-on-surface-variant">Immutable administrative action records</p>
            </div>
            <Link to="/audit-logs" className="text-secondary font-bold text-[12px] hover:underline">
              Full Log
            </Link>
          </div>

          <div className="flex flex-col gap-2 font-mono text-[12px]">
            {auditLogs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary">{log.action}</span>
                  <span className="text-[10px] text-on-surface-variant">
                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-[11px] text-on-surface-variant truncate">
                  User: <strong className="text-on-surface">{log.user_name || 'System'}</strong> • Type: {log.resource_type}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}

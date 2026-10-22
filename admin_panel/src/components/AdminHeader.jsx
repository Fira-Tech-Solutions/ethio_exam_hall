import React from 'react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminHeader() {
  const { adminUser } = useAdminAuth();

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-surface/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-outline-variant/30 z-40 flex items-center justify-between px-gutter">
      {/* Left status badge */}
      <div className="flex items-center gap-space-sm">
        <div className="inline-flex items-center gap-1.5 bg-primary-container text-on-primary px-space-sm py-1 rounded-xl shadow-sm">
          <span className="material-symbols-outlined text-[16px] text-tertiary-fixed">verified_user</span>
          <span className="font-label-md text-[11px] uppercase tracking-wider font-semibold">Super Administrator</span>
          <span className="text-on-primary-container text-[12px]">•</span>
          <span className="font-label-sm text-[11px] text-primary-fixed">MoE Content Operations</span>
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-surface-container-low px-space-sm py-1 rounded-full text-on-surface-variant font-label-md text-[11px] border border-outline-variant/30">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
          <span>PostgreSQL Live</span>
          <span className="text-outline-variant font-mono">/</span>
          <span className="font-mono font-bold text-secondary">Latency: 24ms</span>
        </div>
      </div>

      {/* Right context info & notifications */}
      <div className="flex items-center gap-space-md">
        <div className="hidden lg:flex items-center gap-space-xs bg-surface-container px-space-sm py-1 rounded-full text-[12px] border border-outline-variant/30">
          <span className="material-symbols-outlined text-secondary text-[16px]">military_tech</span>
          <span className="font-semibold text-on-surface">Target: MoE Exit Exam 2016 E.C.</span>
        </div>

        <Link
          to="/users"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-label-md text-[11px] font-bold border border-outline-variant/40 transition-colors shadow-2xs"
          title="Registered Users Directory"
        >
          <span className="material-symbols-outlined text-[16px] text-secondary">group</span>
          <span>Users</span>
        </Link>

        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noreferrer"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-secondary hover:text-primary font-label-md text-[11px] font-bold border border-outline-variant/40 transition-colors shadow-2xs"
          title="Open Public Candidate Portal in new tab"
        >
          <span className="material-symbols-outlined text-[15px]">open_in_new</span>
          <span>Candidate Portal (3000)</span>
        </a>

        <button
          aria-label="Notifications"
          className="relative w-9 h-9 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error"></span>
        </button>

        <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-label-md shadow-sm">
          {adminUser?.name?.charAt(0) || 'A'}
        </div>
      </div>
    </header>
  );
}

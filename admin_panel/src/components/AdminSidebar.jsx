import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminSidebar() {
  const { adminUser, logout } = useAdminAuth();

  const links = [
    { name: 'Overview', path: '/', icon: 'grid_view' },
    { name: 'Exam Repository', path: '/exams', icon: 'folder_special' },
    { name: 'Question Bank & Keys', path: '/questions', icon: 'edit_note' },
    { name: 'Content Moderation', path: '/moderation', icon: 'flag' },
    { name: 'Aviation Modules', path: '/aviation', icon: 'flight_takeoff', badge: 'Cadet/AMT' },
    { name: 'Users', path: '/users', icon: 'group' },
    { name: 'Financial Ledger', path: '/transactions', icon: 'payments' },
    { name: 'System Audit Trail', path: '/audit-logs', icon: 'history_toggle_off' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-low shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between py-space-md border-r border-outline-variant/30">
      <div className="flex flex-col">
        
        {/* Brand Header */}
        <div className="px-space-lg mb-space-lg flex items-center gap-space-sm">
          <img
            src="/images/logo.png"
            alt="Ethio Exam Hall Logo"
            className="h-9 w-auto object-contain"
            width="36"
            height="36"
            loading="eager"
          />
          <div>
            <span className="font-headline-sm text-headline-sm text-primary leading-tight block font-bold">
              Ethio Exam
            </span>
            <span className="font-label-md text-label-md text-on-surface-variant block">
              Control Center
            </span>
          </div>
        </div>

        {/* Target Academic Code Pill */}
        <div className="px-space-md mb-space-md">
          <div className="bg-surface-container p-space-sm rounded-xl border border-outline-variant/30">
            <span className="font-label-md text-[10px] text-on-surface-variant block uppercase tracking-wider font-semibold">
              Target Academic Code
            </span>
            <span className="font-label-lg text-label-lg text-secondary font-bold block mt-0.5 font-mono">
              ESUEE • MoE Exit 2016
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1 px-space-md">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-space-md py-2.5 rounded-xl font-label-lg text-label-lg transition-all ${
                  isActive
                    ? 'bg-primary-container text-on-primary font-bold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`
              }
            >
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-[20px]">{link.icon}</span>
                <span>{link.name}</span>
              </div>
              {link.badge && (
                <span className="px-1.5 py-0.2 text-[9px] uppercase font-bold bg-error text-on-error rounded-full">
                  {link.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Admin User Footer Box */}
      <div className="px-space-md flex flex-col gap-2">
        <div className="bg-surface-container-high p-space-sm rounded-xl flex items-center justify-between gap-space-sm border border-outline-variant/30">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-label-md shrink-0">
              {adminUser?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-lg text-[13px] text-on-surface font-bold truncate">
                {adminUser?.name || 'Super Administrator'}
              </span>
              <span className="font-label-md text-[10px] text-on-surface-variant truncate uppercase">
                {adminUser?.role || 'MoE Operations'}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-outline hover:text-error rounded-lg hover:bg-surface-container transition-colors"
            title="Sign Out"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>

        <a 
          href="http://localhost:3000" 
          target="_blank" 
          rel="noreferrer"
          className="text-[11px] text-secondary font-bold hover:underline flex items-center justify-center gap-1 py-1"
        >
          <span>View Public Platform ↗</span>
        </a>
      </div>
    </aside>
  );
}

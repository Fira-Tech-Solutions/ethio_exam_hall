import React, { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminSidebar({ mobileOpen, setMobileOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [lang, setLang] = useState('EN');

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: 'dashboard',
      badge: null,
    },
    {
      name: 'University Exam',
      path: '/university-exams',
      icon: 'account_balance',
      badge: 'Freshman',
    },
    {
      name: 'Exit Exam',
      path: '/exit-exams',
      icon: 'school',
      badge: 'MoE',
    },
    {
      name: 'Entrance Exam',
      path: '/entrance-exams',
      icon: 'menu_book',
      badge: 'Grade 12',
    },
    {
      name: 'Aviation Exam',
      path: '/aviation-exams',
      icon: 'flight',
      badge: 'Cadet/AMT',
      highlight: true,
    },
    {
      name: 'Subscription',
      path: '/subscription',
      icon: 'workspace_premium',
      badge: null,
    },
    {
      name: 'GPA Calculator',
      path: '/gpa-calculator',
      icon: 'calculate',
      badge: '4.0 Scale',
    },
    {
      name: 'University Insights',
      path: '/university-insights',
      icon: 'explore',
      badge: 'Guide',
    },
    {
      name: 'Profile & Security',
      path: '/profile',
      icon: 'manage_accounts',
      badge: user?.has_password ? null : 'Set Key',
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/sign-in');
  };

  const isActive = (itemPath) => {
    if (itemPath === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(itemPath);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0B1527] text-slate-200 border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top Header & Branding */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="h-20 px-6 flex items-center justify-between border-b border-slate-800/70 shrink-0">
            <Link to="/" className="flex items-center gap-3 group" title="Return to Public Website">
              <img 
                src="/images/logo.png" 
                alt="Ethio Exam Hall" 
                className="w-9 h-9 object-contain drop-shadow transition-transform group-hover:scale-105" 
              />
              <div className="flex flex-col">
                <span className="font-bold text-white text-base tracking-tight leading-tight group-hover:text-blue-400 transition-colors">
                  Ethio Exam Hall
                </span>
                <span className="text-[11px] text-amber-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Candidate Portal
                </span>
              </div>
            </Link>

            {/* Mobile close button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {/* Navigation Links */}
          <div className="px-3 py-3 flex-1 overflow-y-auto">
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Examination Modules
            </span>
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      active
                        ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span 
                        className={`material-symbols-outlined text-[20px] transition-colors ${
                          active ? 'text-slate-950' : item.highlight ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span>{item.name}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          active
                            ? 'bg-slate-950 text-amber-300'
                            : item.highlight
                            ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            {/* Public Website Navigation Shortcut */}
            <div className="pt-3 mt-3 border-t border-slate-800/80">
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Public Exploration
              </span>
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/70 transition-all border border-transparent hover:border-slate-700/60"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[18px] text-blue-400">public</span>
                  <span>Explore Public Site</span>
                </div>
                <span className="material-symbols-outlined text-xs text-slate-400 group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section: System Status & User Actions */}
        <div className="p-4 border-t border-slate-800/80 flex flex-col gap-3 bg-[#08101E]">
          {/* Admin Control Center Portal Link for Admins */}
          {(user?.role === 'admin' || user?.role === 'superadmin') && (
            <a
              href="http://localhost:3001"
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-blue-500/20 border border-amber-400/40 hover:border-amber-400 text-amber-300 hover:text-white flex items-center justify-between text-xs font-bold transition-all shadow-sm"
              title="Open Administrative Control Center in new tab"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-amber-400">admin_panel_settings</span>
                <span>Admin Control Center</span>
              </div>
              <span className="text-[11px] font-mono text-amber-400">3001 ↗</span>
            </a>
          )}

          {/* Platform System Telemetry Widget */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                National Exam Bank
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">ONLINE</span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Verified Papers:</span>
              <strong className="text-slate-200 font-mono">1,200+ Active</strong>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Curriculum:</span>
              <strong className="text-slate-200">MoE / EAA / AAU</strong>
            </div>
          </div>

          {/* Quick Actions: Language & Sign Out */}
          <div className="flex items-center justify-between pt-1">
            {/* Language Toggle */}
            <div className="flex items-center rounded-lg bg-slate-800/80 p-0.5 border border-slate-700/60">
              {['EN', 'AM'].map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors ${
                    lang === l ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-200 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
              title="End Candidate Session"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

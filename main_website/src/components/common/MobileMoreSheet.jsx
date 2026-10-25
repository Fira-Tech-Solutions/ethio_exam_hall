import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function MobileMoreSheet({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!open) return null;

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate('/sign-in');
  };

  const navGrid = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
      category: 'Workspace',
      authRequired: true,
    },
    {
      to: '/university-exams',
      label: 'Freshman Exams',
      icon: 'account_balance',
      category: 'Exams',
      authRequired: true,
    },
    {
      to: '/exit-exams',
      label: 'Exit Exams',
      icon: 'school',
      category: 'Exams',
      authRequired: true,
    },
    {
      to: '/entrance-exams',
      label: 'Grade 12 Entrance',
      icon: 'menu_book',
      category: 'Exams',
      authRequired: true,
    },
    {
      to: '/aviation-exams',
      label: 'Aviation Pilot/AMT',
      icon: 'flight',
      category: 'Exams',
      authRequired: true,
    },
    {
      to: '/aviation-portal',
      label: 'Aviation Portal',
      icon: 'connecting_airports',
      category: 'Special Portal',
      authRequired: false,
    },
    {
      to: '/gpa-calculator',
      label: 'GPA Calculator',
      icon: 'calculate',
      category: 'Tools',
      authRequired: true,
    },
    {
      to: '/assisted-with-ai',
      label: 'AI Tutor',
      icon: 'psychology',
      category: 'Tools',
      authRequired: false,
    },
    {
      to: '/university-insights',
      label: 'Campuses Guide',
      icon: 'explore',
      category: 'Directories',
      authRequired: false,
    },
    {
      to: '/subscription',
      label: 'My Subscription',
      icon: 'workspace_premium',
      category: 'Billing',
      authRequired: true,
    },
    {
      to: '/profile',
      label: 'Profile & Security',
      icon: 'manage_accounts',
      category: 'Account',
      authRequired: true,
    },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-Up Sheet Panel */}
      <div className="relative w-full bg-[#0B1527] border-t border-slate-800 rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden z-10 animate-in slide-in-from-bottom duration-250">
        
        {/* Grab Handle */}
        <div className="flex justify-center pt-3 pb-2 cursor-pointer" onClick={onClose}>
          <div className="w-12 h-1.5 rounded-full bg-slate-700/80" />
        </div>

        {/* User Status / Quick Card */}
        <div className="px-5 py-3 border-b border-slate-800/80 flex items-center justify-between">
          {user ? (
            <div className="flex items-center gap-3">
              {(user.photo_url || user.avatar_url || user.telegram?.avatarUrl) ? (
                <img
                  src={user.photo_url || user.avatar_url || user.telegram?.avatarUrl}
                  alt={user.name || 'User'}
                  className="w-11 h-11 rounded-2xl object-cover ring-2 ring-amber-400/80 shadow-md"
                />
              ) : (
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-black text-base ring-2 ring-amber-400/80">
                  {user.name?.charAt(0) || 'U'}
                </div>
              )}
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-white truncate">{user.name}</h4>
                <p className="text-[11px] text-amber-300 font-mono truncate">
                  {user.candidate_id || 'ETH-CANDIDATE'}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-slate-800 text-amber-400 flex items-center justify-center font-black text-xl">
                <span className="material-symbols-outlined">person</span>
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Guest Candidate</h4>
                <p className="text-[11px] text-slate-400">Sign in to sync your score</p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
            aria-label="Close sheet"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Sheet Content Scroll Area */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 safe-area-bottom">
          {/* Quick Shortcuts Grid */}
          <div className="grid grid-cols-4 gap-2.5">
            {navGrid
              .filter((item) => !item.authRequired || user)
              .map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center p-3 rounded-2xl text-center transition-all ${
                      isActive
                        ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30 shadow-sm'
                        : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 border border-slate-800/80'
                    }`
                  }
                >
                  <span className="material-symbols-outlined text-[22px] mb-1">
                    {item.icon}
                  </span>
                  <span className="text-[10px] font-semibold leading-tight line-clamp-2">
                    {item.label}
                  </span>
                </NavLink>
              ))}
          </div>

          {/* Admin shortcut if applicable */}
          {(user?.role === 'admin' || user?.role === 'superadmin') && (
            <a
              href="http://localhost:3001"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold"
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
                <span>Admin Control Center (Port 3001)</span>
              </div>
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            </a>
          )}

          {/* Action Row: Auth Sign In / Register or Sign Out */}
          {user ? (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 font-bold text-xs hover:bg-rose-500/20 active:scale-[0.98] transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                <span>Sign Out from Device</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <Link
                to="/sign-in"
                onClick={onClose}
                className="flex items-center justify-center py-3 px-4 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={onClose}
                className="flex items-center justify-center py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-xs"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

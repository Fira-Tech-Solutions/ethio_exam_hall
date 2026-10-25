import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function MobileAppHeader({ onOpenMore }) {
  const { user } = useAuth();
  const location = useLocation();

  // Dynamic native title mapping
  const routeTitles = {
    '/': 'Ethio Exam Hall',
    '/dashboard': 'Candidate Dashboard',
    '/explore-exams': 'Exam Catalog',
    '/university-exams': 'Freshman Courses',
    '/exit-exams': 'MoE Exit Exam',
    '/entrance-exams': 'Grade 12 Entrance',
    '/aviation-exams': 'Aviation Academy',
    '/aviation-portal': 'Aviation Portal',
    '/subscription': 'Subscription Pass',
    '/pricing': 'Premium Access',
    '/gpa-calculator': 'GPA Calculator',
    '/university-insights': 'Campus Guide',
    '/profile': 'Profile & Security',
    '/assisted-with-ai': 'AI Exam Assistant',
    '/ai-assistant': 'AI Exam Assistant',
  };

  const getPageTitle = () => {
    if (routeTitles[location.pathname]) return routeTitles[location.pathname];
    if (location.pathname.startsWith('/exams/')) return 'Exam Overview';
    if (location.pathname.startsWith('/analytics/')) return 'Score Report';
    return 'Ethio Exam Hall';
  };

  return (
    <header className="lg:hidden sticky top-0 z-30 bg-[#0B1527]/95 backdrop-blur-md border-b border-slate-800/80 text-white px-4 h-14 flex items-center justify-between safe-area-top shadow-[0_2px_15px_rgba(0,0,0,0.3)]">
      {/* Brand Icon / Logo */}
      <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 shrink-0 active:scale-95 transition-transform">
        <img
          src="/images/logo.png"
          alt="Logo"
          className="h-7 w-auto object-contain"
        />
        <div className="flex flex-col">
          <span className="font-bold text-sm tracking-tight text-white leading-tight">
            {getPageTitle()}
          </span>
          <span className="text-[10px] text-amber-300 font-semibold tracking-wide leading-none">
            ኢትዮ ፈተና
          </span>
        </div>
      </Link>

      {/* Right Action Icons: Profile Avatar or Sign In */}
      <div className="flex items-center gap-2">
        {user ? (
          <Link
            to="/profile"
            className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 active:scale-95 transition-transform"
            aria-label="Profile and Settings"
          >
            {(user.photo_url || user.avatar_url || user.telegram?.avatarUrl) ? (
              <img
                src={user.photo_url || user.avatar_url || user.telegram?.avatarUrl}
                alt={user.name || 'User'}
                className="w-7 h-7 rounded-lg object-cover ring-1 ring-amber-400"
              />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs ring-1 ring-amber-400">
                {user.name?.charAt(0) || 'U'}
              </div>
            )}
            <span className="material-symbols-outlined text-slate-400 text-base pr-0.5">
              tune
            </span>
          </Link>
        ) : (
          <Link
            to="/sign-in"
            className="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs active:scale-95 transition-transform shadow-sm"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminHeader({ onOpenMobileSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const dropdownRef = useRef(null);

  const todayEthiopian = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/sign-in');
  };

  // Telegram profile picture or fallback avatar
  const profilePhotoUrl =
    user?.photo_url ||
    user?.avatar_url ||
    user?.telegram?.avatarUrl ||
    user?.picture ||
    null;

  const userInitial = (
    user?.name?.charAt(0) ||
    user?.first_name?.charAt(0) ||
    'C'
  ).toUpperCase();

  const displayName = user?.name || user?.first_name || 'Candidate';
  const displayEmail = user?.email || (user?.username ? `@${user.username}` : 'Authenticated Account');
  const candidateId = user?.candidate_id || 'ETH-88492';

  return (
    <header className="h-16 lg:h-18 bg-[#0B1527] border-b border-slate-800 text-white px-4 md:px-8 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-[0_2px_15px_rgba(0,0,0,0.4)] backdrop-blur-md">
      {/* Left: Mobile Toggle & Breadcrumb / Status */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Open Sidebar Menu"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              National Examination Portal
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-xs font-bold text-white">
              Candidate Workspace
            </span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:block">
            {todayEthiopian} • Live Academic Assessment Network
          </span>
        </div>
      </div>

      {/* Right Corner: Public Website Link, Candidate ID Badge, Status & User Profile Data */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Switch to Public Website Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all shadow-sm"
          title="Visit Public Website & Catalogs"
        >
          <span className="material-symbols-outlined text-[16px] text-blue-400">public</span>
          <span className="hidden sm:inline">Public Website</span>
        </Link>

        {/* Candidate ID Chip (Desktop) */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-400">ID:</span>
          <strong className="text-amber-400">{candidateId}</strong>
        </div>

        {/* Admin Control Center Shortcut */}
        {(user?.role === 'admin' || user?.role === 'superadmin') && (
          <a
            href="http://localhost:3001"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-white border border-amber-400/40 text-xs font-bold transition-all shadow-sm"
            title="Launch Admin Control Center"
          >
            <span className="material-symbols-outlined text-[16px] text-amber-400">admin_panel_settings</span>
            <span>Admin Center (3001) ↗</span>
          </a>
        )}

        {/* User Profile Picture & Data Pill */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-3 p-1.5 pr-3 rounded-2xl hover:bg-slate-800/80 border border-transparent hover:border-slate-700/80 transition-all focus:outline-none focus:ring-2 focus:ring-amber-400"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            {/* User Profile Picture (Telegram Photo with initials fallback) */}
            <div className="relative">
              {profilePhotoUrl && !imgError ? (
                <img
                  src={profilePhotoUrl}
                  alt={displayName}
                  onError={() => setImgError(true)}
                  className="w-10 h-10 rounded-xl object-cover ring-2 ring-amber-400 shadow-sm"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black flex items-center justify-center text-base shadow-sm ring-2 ring-amber-400">
                  {userInitial}
                </div>
              )}
              {/* Online pulse indicator */}
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-slate-900"></span>
            </div>

            {/* User Name & Details */}
            <div className="hidden sm:flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white leading-tight">
                  {displayName}
                </span>
                <span className="material-symbols-outlined text-[14px] text-amber-400" title="Verified Account">
                  verified
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono leading-tight">
                {candidateId}
              </span>
            </div>

            <span className="material-symbols-outlined text-slate-400 text-lg transition-transform duration-200 hidden sm:block">
              {dropdownOpen ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {/* Profile Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-white">
              {/* Header inside dropdown */}
              <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-3">
                {profilePhotoUrl && !imgError ? (
                  <img
                    src={profilePhotoUrl}
                    alt={displayName}
                    className="w-11 h-11 rounded-xl object-cover ring-2 ring-amber-400"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black flex items-center justify-center text-lg ring-2 ring-amber-400">
                    {userInitial}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white truncate flex items-center gap-1">
                    {displayName}
                    <span className="material-symbols-outlined text-amber-400 text-xs">verified</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate font-mono">
                    {displayEmail}
                  </p>
                  <div className="mt-1 flex items-center gap-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {user?.role === 'admin' ? 'Administrator' : 'National Candidate'}
                    </span>
                    {user?.telegram?.username && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-0.5">
                        <span>@{user.telegram.username}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Quick Stats */}
              <div className="px-4 py-2.5 bg-slate-950 text-[11px] text-slate-400 flex items-center justify-between border-b border-slate-800">
                <span>Access Status:</span>
                <span className="font-bold text-emerald-400">
                  {user?.has_pro_access ? 'Pro Pass Active' : 'Verified Candidate'}
                </span>
              </div>

              {/* Menu items */}
              <div className="p-1">
                {(user?.role === 'admin' || user?.role === 'superadmin') && (
                  <a
                    href="http://localhost:3001"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 flex items-center gap-2.5 transition-colors mb-1"
                  >
                    <span className="material-symbols-outlined text-base text-amber-400">admin_panel_settings</span>
                    <span>Admin Control Center (3001) ↗</span>
                  </a>
                )}
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate('/');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-base text-blue-400">public</span>
                  <span>View Public Website</span>
                </button>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate('/dashboard');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-base text-slate-400">dashboard</span>
                  <span>My Dashboard</span>
                </button>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate('/subscription');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-base text-slate-400">workspace_premium</span>
                  <span>Subscription & Access</span>
                </button>
              </div>

              {/* Sign out */}
              <div className="p-1 border-t border-slate-800">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-base text-rose-400">logout</span>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

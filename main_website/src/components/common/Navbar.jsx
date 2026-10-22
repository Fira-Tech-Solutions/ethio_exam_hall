import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [lang, setLang] = useState('EN');
  const [scrolled, setScrolled] = useState(false);

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Explore', path: '/explore-exams' },
    { name: 'Assisted with AI', path: '/assisted-with-ai', badge: 'AI Tutor' },
    { name: 'Pricing', path: '/pricing' },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  // Determine navbar appearance: transparent over the fullscreen hero video until user scrolls
  const isTransparent = isHomePage && !scrolled && !mobileMenuOpen;

  return (
    <header
      className={`fixed top-0 w-full z-[100] transition-all duration-300 ${
        isTransparent
          ? 'bg-transparent text-white border-b border-white/10'
          : 'bg-[#0B1527]/95 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.25)] border-b border-slate-800 text-white'
      }`}
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="h-16 md:h-20 w-full px-4 md:px-6 lg:px-8 xl:px-12 flex items-center justify-between gap-space-md">
        
        {/* Brand Identity */}
        <Link to="/" className="flex items-center gap-2.5 md:gap-3 shrink-0 group">
          <img 
            src="/images/logo.png" 
            alt="Ethio Exam Hall Logo" 
            className="h-9 md:h-11 w-auto object-contain transition-transform group-hover:scale-105 drop-shadow" 
            width="44"
            height="44"
            loading="eager"
            fetchpriority="high"
          />
          <div className="flex flex-col">
            <span className="font-bold text-base md:text-lg text-white tracking-tight leading-none drop-shadow-sm">
              Ethio Exam Hall
            </span>
            <span className="hidden sm:block text-[11px] text-amber-300 font-semibold tracking-wide mt-1 drop-shadow-sm">
              ኢትዮ ፈተና • National Resource
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3.5 py-2 text-sm font-semibold transition-all rounded-xl inline-flex items-center gap-2 ${
                  active
                    ? 'bg-white/15 text-white font-bold backdrop-blur-sm'
                    : 'text-slate-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{link.name}</span>
                {link.badge && (
                  <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-amber-400 text-slate-950 rounded-full shadow-sm">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Actions & Profile */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === 'EN' ? 'አማ' : 'EN')}
            className="hidden sm:flex px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-white font-bold transition-colors items-center gap-1.5 backdrop-blur-sm border border-white/10"
            title="Switch Language (English / Amharic)"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px] text-amber-400">translate</span>
            <span>{lang === 'EN' ? 'EN | አማ' : 'አማ | EN'}</span>
          </button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl hover:bg-white/10 border border-white/10 transition-colors"
                type="button"
              >
                {(user.photo_url || user.avatar_url || user.telegram?.avatarUrl) ? (
                  <img
                    src={user.photo_url || user.avatar_url || user.telegram?.avatarUrl}
                    alt={user.name || 'User'}
                    className="w-9 h-9 rounded-xl object-cover ring-2 ring-amber-400 shadow-sm"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-black text-sm shadow-sm ring-2 ring-amber-400">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                )}
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs text-white font-bold leading-tight">
                    {user.name?.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-amber-300 font-semibold uppercase tracking-wider">
                    {user.has_pro_access ? 'Pro Pass Active' : 'Candidate'}
                  </span>
                </div>
                <span className="material-symbols-outlined text-slate-300 text-sm">expand_more</span>
              </button>

              {userDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700 py-2 z-50 text-slate-200"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-4 py-2.5 border-b border-slate-800">
                    <p className="font-bold text-white truncate text-sm">{user.name}</p>
                    <p className="text-slate-400 truncate text-[11px] font-mono">{user.email}</p>
                    <span className="mt-1 inline-block px-2 py-0.5 text-[10px] font-mono font-semibold bg-slate-800 text-amber-300 rounded">
                      ID: {user.candidate_id || 'ETH-CANDIDATE'}
                    </span>
                  </div>
                  
                  {(user?.role === 'admin' || user?.role === 'superadmin') && (
                    <a
                      href="http://localhost:3001"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-amber-300 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px] text-amber-400">admin_panel_settings</span>
                      Admin Control Center (3001) ↗
                    </a>
                  )}

                  <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 transition-colors">
                    <span className="material-symbols-outlined text-[18px] text-amber-400">dashboard</span>
                    Candidate Dashboard
                  </Link>
                  <Link to="/subscription" className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 transition-colors">
                    <span className="material-symbols-outlined text-[18px] text-amber-400">workspace_premium</span>
                    Manage Subscription
                  </Link>

                  <div className="border-t border-slate-800 mt-1 pt-1">
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors text-left font-semibold"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                to="/sign-in"
                className="px-4 py-2 text-sm text-slate-200 hover:text-white font-semibold transition-colors rounded-xl hover:bg-white/10"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 md:px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:brightness-110 text-sm font-bold rounded-xl shadow-lg transition-all flex items-center gap-1.5 active:scale-95"
              >
                <span>Get Started</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-white hover:bg-white/10 transition-colors"
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={mobileMenuOpen}
          >
            <span className="material-symbols-outlined text-[26px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950/95 backdrop-blur-xl border-b border-slate-800 px-6 py-5 shadow-2xl">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold ${
                  isActive(link.path)
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span>{link.name}</span>
                {link.badge && (
                  <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-amber-400 text-slate-950 rounded-full">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}

            {user ? (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-3 flex items-center gap-2 px-4 py-3 bg-amber-400 text-slate-950 rounded-xl font-bold justify-center"
              >
                <span className="material-symbols-outlined text-[20px]">dashboard</span>
                Go to Candidate Dashboard
              </Link>
            ) : (
              <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-slate-800">
                <Link
                  to="/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-center text-sm font-bold text-white bg-slate-800 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-center text-sm font-bold text-slate-950 bg-amber-400 rounded-xl"
                >
                  Create Candidate Account
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

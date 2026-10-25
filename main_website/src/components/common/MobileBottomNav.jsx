import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function MobileBottomNav({ onMoreClick }) {
  const { user } = useAuth();
  const location = useLocation();

  // Tab 1: Home for guests, Dashboard for logged in candidates
  const homeTarget = user ? '/dashboard' : '/';
  const isHomeActive = user
    ? location.pathname === '/dashboard'
    : location.pathname === '/';

  const navItems = [
    {
      to: homeTarget,
      label: user ? 'Dashboard' : 'Home',
      icon: user ? 'dashboard' : 'home',
      active: isHomeActive,
    },
    {
      to: '/explore-exams',
      label: 'Exams',
      icon: 'school',
      active: location.pathname.startsWith('/explore-exams') || location.pathname.startsWith('/exams/'),
    },
    {
      to: '/university-insights',
      label: 'Campuses',
      icon: 'account_balance',
      active: location.pathname.startsWith('/university-insights'),
    },
    {
      to: '/pricing',
      label: 'Pro Pass',
      icon: 'workspace_premium',
      active: location.pathname.startsWith('/pricing') || location.pathname.startsWith('/subscription'),
    },
  ];

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#0B1527]/95 backdrop-blur-xl border-t border-slate-800/80 lg:hidden safe-area-bottom shadow-[0_-4px_25px_rgba(0,0,0,0.45)]"
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-all duration-150 active:scale-90 ${
              item.active ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative flex items-center justify-center">
              <span className={`material-symbols-outlined text-[24px] transition-transform ${item.active ? 'scale-110 drop-shadow-[0_2px_8px_rgba(245,158,11,0.4)]' : ''}`}>
                {item.icon}
              </span>
              {item.active && (
                <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-1 truncate">
              {item.label}
            </span>
          </NavLink>
        ))}

        {/* More Menu Trigger */}
        <button
          type="button"
          onClick={onMoreClick}
          className="flex-1 flex flex-col items-center justify-center py-1 text-slate-400 hover:text-slate-200 active:scale-90 transition-all duration-150"
          aria-label="Open More Menu"
        >
          <div className="relative flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">
              apps
            </span>
          </div>
          <span className="text-[10px] tracking-tight mt-1 font-medium">
            More
          </span>
        </button>
      </div>
    </nav>
  );
}

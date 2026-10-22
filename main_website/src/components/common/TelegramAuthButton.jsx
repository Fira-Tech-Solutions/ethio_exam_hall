import React, { useState } from 'react';

/**
 * Official Telegram Airplane SVG Icon
 */
export function TelegramIcon({ className = "w-5 h-5" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  );
}

/**
 * Production-ready Telegram Authentication Button
 * @param {string} text - Button text (e.g. "Continue with Telegram" or "Sign up with Telegram")
 * @param {string} amharicText - Optional Amharic localized text
 * @param {boolean} isAm - Whether current locale is Amharic
 * @param {string} returnUrl - Target destination after successful auth (e.g. '/dashboard')
 * @param {string} className - Optional container styling overrides
 */
export default function TelegramAuthButton({
  text = "Continue with Telegram",
  amharicText = "በቴሌግራም ይቀጥሉ",
  isAm = false,
  returnUrl = "/dashboard",
  className = "",
  disabled = false,
}) {
  const [loading, setLoading] = useState(false);

  const handleTelegramAuth = (e) => {
    e.preventDefault();
    if (loading || disabled) return;
    setLoading(true);

    const rawBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api';
    const apiBase = rawBase.replace(/\/+$/, '');
    const startUrl = `${apiBase}/auth/telegram/start?redirect=${encodeURIComponent(returnUrl || '/dashboard')}`;

    // Direct browser navigation to Telegram authorization endpoint
    window.location.href = startUrl;
  };

  return (
    <button
      type="button"
      onClick={handleTelegramAuth}
      disabled={disabled || loading}
      aria-label={isAm ? amharicText : text}
      className={`w-full min-h-[48px] py-3 px-4 rounded-xl font-semibold text-sm tracking-wide text-white 
        bg-[#229ED9] hover:bg-[#1E8EC4] active:bg-[#1A7CAE] 
        shadow-md shadow-[#229ED9]/25 hover:shadow-lg hover:shadow-[#229ED9]/35 
        focus:outline-none focus:ring-2 focus:ring-[#229ED9] focus:ring-offset-2
        transform active:scale-[0.99] transition-all duration-150 
        flex items-center justify-center space-x-2.5 disabled:opacity-60 cursor-pointer ${className}`}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{isAm ? "ወደ ቴሌግራም በማገናኘት ላይ..." : "Connecting to Telegram..."}</span>
        </>
      ) : (
        <>
          <TelegramIcon className="w-5 h-5 flex-shrink-0" />
          <span className="font-bold">{isAm ? amharicText : text}</span>
        </>
      )}
    </button>
  );
}

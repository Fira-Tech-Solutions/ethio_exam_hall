import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TelegramIcon } from '../components/common/TelegramAuthButton';

export default function TelegramCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    async function processAuthentication() {
      try {
        const errorParam = searchParams.get('error');
        if (errorParam) {
          setError(decodeURIComponent(errorParam));
          setIsProcessing(false);
          return;
        }

        const returnUrl = searchParams.get('returnUrl') || '/dashboard';
        const safeDestination = returnUrl.startsWith('/') && !returnUrl.startsWith('//') ? returnUrl : '/dashboard';

        // 1. Direct JWT token received via query string
        let token = searchParams.get('token');

        // 2. Telegram Widget payload received via URL hash fragment or query
        if (!token) {
          let tgAuthResult = searchParams.get('tgAuthResult');
          if (!tgAuthResult && window.location.hash) {
            const hashStr = window.location.hash.startsWith('#') ? window.location.hash.substring(1) : window.location.hash;
            const hashParams = new URLSearchParams(hashStr);
            tgAuthResult = hashParams.get('tgAuthResult');
          }

          if (tgAuthResult) {
            const res = await fetch('/api/auth/telegram/widget-callback', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ tgAuthResult }),
              credentials: 'include',
            });
            const data = await res.json();
            if (!res.ok || !data.token) {
              throw new Error(data.error || 'Telegram verification failed.');
            }
            token = data.token;
          }
        }

        if (!token) {
          setError('No authentication token received from Telegram verification.');
          setIsProcessing(false);
          return;
        }

        // Hand off token to AuthContext and navigate to intended destination
        await loginWithToken(token);
        navigate(safeDestination, { replace: true });
      } catch (err) {
        console.error('Failed to establish session from Telegram authentication:', err);
        setError(err.message || 'Failed to authenticate Telegram session.');
        setIsProcessing(false);
      }
    }

    processAuthentication();
  }, [searchParams, loginWithToken, navigate]);

  return (
    <div className="w-full min-h-screen bg-[#070e1c] font-inter text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-600/10 blur-[120px] pointer-events-none -z-10" />

      <div className="w-full max-w-md bg-[#0B1527]/90 backdrop-blur-2xl rounded-3xl border border-slate-800 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] p-8 text-center relative overflow-hidden">
        {/* Top Accent Gradient Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-400" />

        {/* Brand Logo Header */}
        <div className="flex items-center justify-center space-x-3 mb-6 mt-2">
          <img
            src="/images/logo.png"
            alt="Ethio Exam Hall Logo"
            className="h-10 w-auto object-contain drop-shadow"
          />
          <div className="text-left">
            <span className="text-xl font-extrabold tracking-tight text-white block">Ethio Exam Hall</span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block">Candidate Verification</span>
          </div>
        </div>

        {isProcessing && (
          <div className="space-y-5 py-4">
            <div className="w-16 h-16 rounded-2xl bg-[#229ED9]/15 border border-[#229ED9]/30 text-[#229ED9] flex items-center justify-center mx-auto shadow-lg shadow-[#229ED9]/10">
              <TelegramIcon className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Authenticating with Telegram</h2>
              <p className="text-xs text-slate-400 mt-1">Verifying cryptographic ID token and establishing candidate session...</p>
            </div>
            <div className="flex justify-center">
              <div className="w-7 h-7 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        )}

        {error && (
          <div className="space-y-4 py-2">
            <div className="w-16 h-16 rounded-2xl bg-red-950/60 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto shadow-lg shadow-red-500/10">
              <span className="material-symbols-outlined text-3xl">error</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-red-400">Authentication Failed</h2>
              <p className="text-xs text-red-300 mt-2 p-3 bg-red-950/40 rounded-xl border border-red-500/20">{error}</p>
            </div>
            <div className="pt-2">
              <Link
                to="/sign-in"
                className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs tracking-wide transition shadow-lg shadow-blue-600/30"
              >
                Return to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

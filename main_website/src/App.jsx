import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import AdminSidebar from './components/common/AdminSidebar';
import AdminHeader from './components/common/AdminHeader';
import MobileBottomNav from './components/common/MobileBottomNav';
import MobileMoreSheet from './components/common/MobileMoreSheet';
import HomePage from './pages/HomePage';
import DiscoveryLibraryPage from './pages/DiscoveryLibraryPage';
import ExamDetailPage from './pages/ExamDetailPage';
import ExamSimulatorPage from './pages/ExamSimulatorPage';
import ScoreReportPage from './pages/ScoreReportPage';
import AviationPortalPage from './pages/AviationPortalPage';
import PricingPage from './pages/PricingPage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import UniversityExamsPage from './pages/UniversityExamsPage';
import ExitExamsPage from './pages/ExitExamsPage';
import EntranceExamsPage from './pages/EntranceExamsPage';
import AviationExamsDashboardPage from './pages/AviationExamsDashboardPage';
import SubscriptionPage from './pages/SubscriptionPage';
import GpaCalculatorPage from './pages/GpaCalculatorPage';
import UniversityInsightsPage from './pages/UniversityInsightsPage';
import UserProfilePage from './pages/UserProfilePage';
import { SignInPage } from './pages/AuthPages';
import RegisterPage from './pages/RegisterPage';
import TelegramCallbackPage from './pages/TelegramCallbackPage';
import { AppSkeletonLoader } from './components/common/SkeletonLoader';
import AssistedWithAiPage from './pages/AssistedWithAiPage';

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);

  useEffect(() => {
    // Auto-detect Telegram hash redirect on any landing page
    if (window.location.hash && window.location.hash.includes('tgAuthResult=')) {
      if (location.pathname !== '/auth/telegram/callback') {
        navigate(`/auth/telegram/callback${window.location.hash}`, { replace: true });
      }
    }
  }, [location.pathname, navigate]);

  // Auth pages have their own full-screen layout
  const isAuthRoute =
    location.pathname === '/sign-in' ||
    location.pathname === '/register' ||
    location.pathname.startsWith('/auth/');

  // Exam simulator runs full-screen distraction-free
  const isSimulator = location.pathname.startsWith('/simulator');

  // Candidate Dashboard Workspace Routes
  const isCandidateDashboardRoute =
    location.pathname === '/dashboard' ||
    location.pathname.startsWith('/university-exams') ||
    location.pathname.startsWith('/exit-exams') ||
    location.pathname.startsWith('/entrance-exams') ||
    location.pathname.startsWith('/aviation-exams') ||
    location.pathname.startsWith('/subscription') ||
    location.pathname.startsWith('/gpa-calculator') ||
    location.pathname.startsWith('/university-insights') ||
    location.pathname.startsWith('/profile') ||
    location.pathname.startsWith('/analytics');

  // While checking auth token on initial load, show modern skeleton loader
  if (loading) {
    return <AppSkeletonLoader />;
  }

  // 1. Full-screen auth route layout (sign-in, register, telegram callback)
  if (isAuthRoute) {
    // If user is already authenticated and visits sign-in, redirect to dashboard
    if (user && location.pathname !== '/auth/telegram/callback') {
      return <Navigate to="/dashboard" replace />;
    }
    return (
      <div className="min-h-screen bg-[#070e1c] font-inter text-slate-100 flex flex-col">
        <Routes>
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/telegram/callback" element={<TelegramCallbackPage />} />
        </Routes>
      </div>
    );
  }

  // 2. Exam Simulator: distraction-free mode
  if (isSimulator) {
    // Protected: candidate must be signed in to take exams
    if (!user) {
      return <Navigate to="/sign-in" replace state={{ from: location }} />;
    }
    return (
      <div className="min-h-screen bg-slate-900 text-white font-inter">
        <Routes>
          <Route path="/simulator/:examId" element={<ExamSimulatorPage />} />
        </Routes>
      </div>
    );
  }

  // 3. Authenticated Candidate Workspace Layout:
  // - Fixed Left Navigation Bar (AdminSidebar)
  // - Top Admin Header with User Profile Picture (Telegram) & candidate details
  // - ONLY renders when visiting candidate dashboard routes (/dashboard, /university-exams, etc.)
  // - Non-logged in visitors are redirected to /sign-in
  if (isCandidateDashboardRoute) {
    if (!user) {
      return <Navigate to="/sign-in" replace state={{ from: location }} />;
    }
    return (
      <div className="flex h-screen overflow-hidden bg-[#070e1c] font-inter text-slate-100">
        <AdminSidebar
          mobileOpen={mobileSidebarOpen}
          setMobileOpen={setMobileSidebarOpen}
        />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <AdminHeader onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
            <Routes>
              <Route path="/dashboard" element={<StudentDashboardPage />} />
              <Route path="/university-exams" element={<UniversityExamsPage />} />
              <Route path="/exit-exams" element={<ExitExamsPage />} />
              <Route path="/entrance-exams" element={<EntranceExamsPage />} />
              <Route path="/aviation-exams" element={<AviationExamsDashboardPage />} />
              <Route path="/subscription" element={<SubscriptionPage />} />
              <Route path="/gpa-calculator" element={<GpaCalculatorPage />} />
              <Route path="/university-insights" element={<UniversityInsightsPage />} />
              <Route path="/profile" element={<UserProfilePage />} />
              <Route path="/analytics/:attemptId" element={<ScoreReportPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
          {/* Native Mobile Bottom Navigation Bar & More Sheet */}
          <MobileBottomNav onMoreClick={() => setMoreSheetOpen(true)} />
          <MobileMoreSheet open={moreSheetOpen} onClose={() => setMoreSheetOpen(false)} />
        </div>
      </div>
    );
  }

  // 4. Public Accessibility (All visitors, both guests and signed-in candidates):
  // - Full access to explore the software at localhost:3000/ (HomePage)
  // - Explore exams, view exam details, view pricing, aviation tracks, AI assistant
  // - Public top Navbar & Footer
  // - Signed-in candidates see their avatar/profile menu in the Navbar with link to "Candidate Dashboard"
  return (
    <div className="flex flex-col min-h-screen bg-background font-inter text-on-surface relative">
      <Navbar onOpenMore={() => setMoreSheetOpen(true)} />
      <main className={`flex-1 w-full flex flex-col pb-20 lg:pb-0 ${location.pathname === '/' ? '' : 'pt-16 md:pt-20'}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<Navigate to="/explore-exams" replace />} />
          <Route path="/explore-exams" element={<DiscoveryLibraryPage />} />
          <Route path="/assisted-with-ai" element={<AssistedWithAiPage />} />
          <Route path="/ai-assistant" element={<AssistedWithAiPage />} />
          <Route path="/exams/:id" element={<ExamDetailPage />} />
          <Route path="/aviation-portal" element={<AviationPortalPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      {/* Native Mobile Bottom Navigation Bar & More Sheet */}
      <MobileBottomNav onMoreClick={() => setMoreSheetOpen(true)} />
      <MobileMoreSheet open={moreSheetOpen} onClose={() => setMoreSheetOpen(false)} />
    </div>
  );
}

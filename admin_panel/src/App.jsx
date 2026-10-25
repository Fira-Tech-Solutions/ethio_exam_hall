import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';
import AdminOverviewPage from './pages/AdminOverviewPage';
import AdminExamsPage from './pages/AdminExamsPage';
import AdminQuestionsPage from './pages/AdminQuestionsPage';
import AdminModerationPage from './pages/AdminModerationPage';
import AdminAviationPage from './pages/AdminAviationPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminTransactionsPage from './pages/AdminTransactionsPage';
import AdminAuditLogsPage from './pages/AdminAuditLogsPage';
import AdminUniversitiesPage from './pages/AdminUniversitiesPage';
import AdminSubscriptionsPage from './pages/AdminSubscriptionsPage';
import AdminLoginPage from './pages/AdminLoginPage';
import { useAdminAuth } from './context/AdminAuthContext';

export default function App() {
  const { adminUser, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-surface flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="font-label-md text-on-surface-variant font-medium">Validating Administrator Session...</span>
        </div>
      </div>
    );
  }

  if (!adminUser) {
    return <AdminLoginPage />;
  }

  return (
    <div className="min-h-screen bg-surface font-inter text-on-surface">
      <AdminSidebar />
      <div className="pl-64">
        <AdminHeader />
        <main className="w-full pt-16 min-h-screen bg-surface">
          <Routes>
            <Route path="/" element={<AdminOverviewPage />} />
            <Route path="/exams" element={<AdminExamsPage />} />
            <Route path="/universities" element={<AdminUniversitiesPage />} />
            <Route path="/subscriptions" element={<AdminSubscriptionsPage />} />
            <Route path="/questions" element={<AdminQuestionsPage />} />
            <Route path="/moderation" element={<AdminModerationPage />} />
            <Route path="/aviation" element={<AdminAviationPage />} />
            <Route path="/users" element={<AdminUsersPage />} />
            <Route path="/transactions" element={<AdminTransactionsPage />} />
            <Route path="/audit-logs" element={<AdminAuditLogsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

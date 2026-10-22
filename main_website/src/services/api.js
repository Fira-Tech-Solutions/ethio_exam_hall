const rawBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api';
const API_BASE = rawBase.replace(/\/+$/, '');

export async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const endpoint = path.startsWith('/') ? path : `/${path}`;
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.error || data?.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getMe: () => request('/auth/me'),
  updateOnboarding: (data) => request('/auth/onboarding', { method: 'PUT', body: JSON.stringify(data) }),
  getTelegramConfig: () => request('/auth/telegram/config'),
  linkTelegram: (idToken) => request('/auth/telegram/link', { method: 'POST', body: JSON.stringify({ idToken }) }),
  unlinkTelegram: () => request('/auth/telegram/unlink', { method: 'POST' }),

  // Exams & Catalog
  getCategories: () => request('/exams/categories'),
  getFeaturedExams: () => request('/exams/featured'),
  getExams: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/exams${query ? `?${query}` : ''}`);
  },
  getExamById: (id) => request(`/exams/${id}`),
  toggleBookmark: (id) => request(`/exams/${id}/bookmark`, { method: 'POST' }),
  getBookmarks: () => request('/exams/user/bookmarks'),

  // Practice & Simulator
  startAttempt: (examId, mode = 'mock') => request('/attempts/start', { method: 'POST', body: JSON.stringify({ examId, mode }) }),
  saveProgress: (attemptId, answers, timeSpentSeconds) => 
    request(`/attempts/${attemptId}/save-progress`, { method: 'POST', body: JSON.stringify({ answers, timeSpentSeconds }) }),
  submitAttempt: (attemptId, answers, timeSpentSeconds) => 
    request(`/attempts/${attemptId}/submit`, { method: 'POST', body: JSON.stringify({ answers, timeSpentSeconds }) }),
  getReport: (attemptId) => request(`/attempts/${attemptId}/report`),
  getAttemptHistory: () => request('/attempts/my/history'),

  // Drills & Dashboard
  createCustomDrill: (config) => request('/practice/custom-drill', { method: 'POST', body: JSON.stringify(config) }),
  getStudentDashboard: () => request('/practice/student-dashboard'),

  // Aviation
  getAviationDisciplines: () => request('/aviation/disciplines'),
  getAviationExams: () => request('/aviation/exams'),
  getAviationStats: () => request('/aviation/stats'),

  // Payments & Subscriptions
  getPlans: () => request('/payments/plans'),
  checkout: (checkoutData) => request('/payments/checkout', { method: 'POST', body: JSON.stringify({ checkoutData }) }),
  verifyPayment: (referenceCode) => request('/payments/verify', { method: 'POST', body: JSON.stringify({ referenceCode }) }),
  getSubscriptionStatus: () => request('/payments/my-status'),

  // AI Agentic RAG Tutor
  getAiRagAssist: (params) => request('/ai/rag-assist', { method: 'POST', body: JSON.stringify(params) }),
};

export default api;

let rawBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api';
rawBase = rawBase.replace(/\/+$/, '');
if (!rawBase.endsWith('/api') && rawBase.startsWith('http')) {
  rawBase += '/api';
}
const API_BASE = rawBase;

export async function request(path, options = {}) {
  const token = localStorage.getItem('admin_token');
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

export const adminApi = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMe: () => request('/auth/me'),

  // Admin Control Center - Exams
  getOverview: () => request('/admin/overview'),
  getExams: () => request('/admin/exams'),
  getExamDetail: (id) => request(`/admin/exams/${id}`),
  createExam: (examData) => request('/admin/exams', { method: 'POST', body: JSON.stringify(examData) }),
  updateExam: (id, examData) => request(`/admin/exams/${id}`, { method: 'PUT', body: JSON.stringify(examData) }),
  deleteExam: (id) => request(`/admin/exams/${id}`, { method: 'DELETE' }),
  bulkUpdateExamStatus: (examIds, status) => request('/admin/exams/bulk-status', { method: 'POST', body: JSON.stringify({ examIds, status }) }),

  // Question Bank
  getExamQuestions: (examId) => request(`/admin/exams/${examId}/questions`),
  addQuestion: (examId, questionData) => request(`/admin/exams/${examId}/questions`, { method: 'POST', body: JSON.stringify(questionData) }),
  updateQuestion: (id, questionData) => request(`/admin/questions/${id}`, { method: 'PUT', body: JSON.stringify(questionData) }),
  deleteQuestion: (id) => request(`/admin/questions/${id}`, { method: 'DELETE' }),
  bulkImportQuestions: (examId, questions) => request('/admin/questions/bulk-import', { method: 'POST', body: JSON.stringify({ examId, questions }) }),
  
  // Moderation & Claims
  getModerationReports: () => request('/admin/moderation'),
  resolveModerationReport: (id, resolution) => request(`/admin/moderation/${id}/resolve`, { method: 'POST', body: JSON.stringify(resolution) }),

  // Users & Candidate Rights
  getUsers: () => request('/admin/users'),
  updateUser: (id, userData) => request(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(userData) }),

  // Transactions & Financial Ledger
  getTransactions: () => request('/admin/transactions'),
  verifyTransaction: (id) => request(`/admin/transactions/${id}/verify`, { method: 'POST' }),

  // Aviation Modules
  getAviationModules: () => request('/admin/aviation/modules'),

  // Universities Directory Management
  getUniversities: () => request('/admin/universities'),
  createUniversity: (data) => request('/admin/universities', { method: 'POST', body: JSON.stringify(data) }),
  updateUniversity: (id, data) => request(`/admin/universities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUniversity: (id) => request(`/admin/universities/${id}`, { method: 'DELETE' }),

  // Subscription Plans Management
  getSubscriptionPlans: () => request('/admin/subscription-plans'),
  createSubscriptionPlan: (data) => request('/admin/subscription-plans', { method: 'POST', body: JSON.stringify(data) }),
  updateSubscriptionPlan: (id, data) => request(`/admin/subscription-plans/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSubscriptionPlan: (id) => request(`/admin/subscription-plans/${id}`, { method: 'DELETE' }),

  // Audit Logs & Categories
  getAuditLogs: () => request('/admin/audit-logs'),
  getCategories: () => request('/exams/categories'),
};

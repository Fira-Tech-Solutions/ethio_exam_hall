const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('../src/server');

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

async function apiFetch(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, {
    ...options,
    headers,
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

test('1. Health Check Endpoint returns healthy and connected database', async () => {
  const res = await apiFetch('/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.data.status, 'healthy');
  assert.ok(res.data.database.includes('PostgreSQL 16'));
});

test('2. Authentication - Student & Admin Login and Rejection of Bad Credentials', async () => {
  // Candidate login
  const studentRes = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'dawit@aau.edu.et', password: 'Password123!' }),
  });
  assert.equal(studentRes.status, 200);
  assert.ok(studentRes.data.token);
  assert.equal(studentRes.data.user.email, 'dawit@aau.edu.et');
  assert.equal(studentRes.data.user.role, 'student');

  // Super Admin login
  const adminRes = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@ethioexamhall.edu.et', password: 'Password123!' }),
  });
  assert.equal(adminRes.status, 200);
  assert.ok(adminRes.data.token);
  assert.equal(adminRes.data.user.role, 'superadmin');

  // Bad credentials
  const badRes = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'dawit@aau.edu.et', password: 'WrongPassword!' }),
  });
  assert.equal(badRes.status, 401);
});

test('3. Exam Discovery Library - Categories, Filtering, and Details', async () => {
  // Categories
  const catRes = await apiFetch('/api/exams/categories');
  assert.equal(catRes.status, 200);
  assert.ok(Array.isArray(catRes.data));
  assert.ok(catRes.data.some(c => c.code === 'exit'));
  assert.ok(catRes.data.some(c => c.code === 'aviation'));

  // Filter exams by category
  const listRes = await apiFetch('/api/exams?category=exit');
  assert.equal(listRes.status, 200);
  assert.ok(Array.isArray(listRes.data.exams));
  assert.ok(listRes.data.exams.length > 0);
  assert.ok(listRes.data.exams.some(e => e.code === 'MOE-EXIT-CS-2016'));

  // Exam Details
  const detailRes = await apiFetch('/api/exams/1');
  assert.equal(detailRes.status, 200);
  assert.equal(detailRes.data.exam.code, 'MOE-EXIT-CS-2016');
  assert.ok(detailRes.data.exam.booklet_code);
});

test('4. Exam Simulator - Question Shielding, Auto-Save, and Authoritative Grading', async () => {
  // Login as student
  const loginRes = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'dawit@aau.edu.et', password: 'Password123!' }),
  });
  const token = loginRes.data.token;

  // Start exam attempt
  const startRes = await apiFetch('/api/attempts/start', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ examId: 1, mode: 'mock' }),
  });
  assert.equal(startRes.status, 200);
  assert.ok(startRes.data.attemptId);
  assert.ok(startRes.data.questions.length > 0);

  // Security Verification: Authoritative is_correct must NEVER be exposed to candidate
  const firstQ = startRes.data.questions[0];
  assert.ok(firstQ.options.length > 0);
  for (const opt of firstQ.options) {
    assert.equal(opt.is_correct, undefined, 'CRITICAL: is_correct must NOT be leaked to client!');
  }

  const attemptId = startRes.data.attemptId;

  // Save intermediate progress
  const saveRes = await apiFetch(`/api/attempts/${attemptId}/save-progress`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      answers: {
        [firstQ.id]: { selected_option: 'A', is_flagged: true },
      },
      timeSpentSeconds: 45,
    }),
  });
  assert.equal(saveRes.status, 200);
  assert.equal(saveRes.data.success, true);

  // Authoritative server-side submit
  const submitRes = await apiFetch(`/api/attempts/${attemptId}/submit`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      answers: {
        [firstQ.id]: { selected_option: 'A', is_flagged: false },
      },
      timeSpentSeconds: 120,
    }),
  });
  assert.equal(submitRes.status, 200);
  assert.equal(submitRes.data.success, true);
  assert.ok(typeof submitRes.data.report.score === 'number');
  assert.ok(typeof submitRes.data.report.percentile === 'number');
  assert.ok(Array.isArray(submitRes.data.report.domainBreakdown));

  // Diagnostic Report
  const reportRes = await apiFetch(`/api/attempts/${attemptId}/report`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(reportRes.status, 200);
  assert.equal(reportRes.data.attemptId, attemptId);
});

test('5. Aviation Specialized Portal - Disciplines & Exams', async () => {
  const discRes = await apiFetch('/api/aviation/disciplines');
  assert.equal(discRes.status, 200);
  assert.ok(Array.isArray(discRes.data));
  assert.ok(discRes.data.some(d => d.id === 'pilot_cadet'));
  assert.ok(discRes.data.some(d => d.id === 'amt'));

  const examsRes = await apiFetch('/api/aviation/exams');
  assert.equal(examsRes.status, 200);
  assert.ok(Array.isArray(examsRes.data));
  assert.ok(examsRes.data.some(e => e.code === 'EAA-CADET-2024'));
});

test('6. Ethiopian Payments - Telebirr Checkout and Entitlement Activation', async () => {
  // Login as student Helen
  const loginRes = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'helen@gmail.com', password: 'Password123!' }),
  });
  const token = loginRes.data.token;

  // Fetch plans
  const plansRes = await apiFetch('/api/payments/plans');
  assert.equal(plansRes.status, 200);
  const premiumPlan = plansRes.data.find(p => p.code === 'premium_monthly');
  assert.ok(premiumPlan);

  // Initiate Telebirr checkout
  const checkoutRes = await apiFetch('/api/payments/checkout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      planId: premiumPlan.id,
      provider: 'telebirr',
      phoneOrAccount: '+251912345678',
    }),
  });
  assert.equal(checkoutRes.status, 201);
  assert.ok(checkoutRes.data.referenceCode.startsWith('TB-2026-'));

  // Verify Payment Reference
  const verifyRes = await apiFetch('/api/payments/verify', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ referenceCode: checkoutRes.data.referenceCode }),
  });
  assert.equal(verifyRes.status, 200);
  assert.equal(verifyRes.data.success, true);
  assert.ok(verifyRes.data.expiresAt);
});

test('7. Security Boundary - Role Enforcement on Admin Endpoints', async () => {
  // Student Dawit attempting to access /api/admin/overview
  const studentLogin = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'dawit@aau.edu.et', password: 'Password123!' }),
  });
  const studentToken = studentLogin.data.token;

  const deniedRes = await apiFetch('/api/admin/overview', {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  assert.equal(deniedRes.status, 403, 'Student must be denied access to admin endpoints!');

  // Super Admin accessing /api/admin/overview
  const adminLogin = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@ethioexamhall.edu.et', password: 'Password123!' }),
  });
  const adminToken = adminLogin.data.token;

  const allowedRes = await apiFetch('/api/admin/overview', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.equal(allowedRes.status, 200);
  assert.ok(allowedRes.data.metrics);
  assert.ok(allowedRes.data.metrics.totalExams > 0);
});

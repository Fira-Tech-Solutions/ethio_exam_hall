const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/server');
const { query } = require('../src/db');
const telegramService = require('../src/services/telegram.service');

let generateKeyPair, exportJWK, SignJWT;

let server;
let baseUrl;

// Test RSA key pair for cryptographic token simulation
let testKeyPair;
let testPublicJwks;
const TEST_CLIENT_ID = 'test_telegram_bot_client_123';
const TEST_CLIENT_SECRET = 'test_telegram_bot_secret_456';

test.before(async () => {
  // Dynamically load ESM jose package
  const jose = await import('jose');
  generateKeyPair = jose.generateKeyPair;
  exportJWK = jose.exportJWK;
  SignJWT = jose.SignJWT;

  // Configure test environment variables
  process.env.TELEGRAM_LOGIN_ENABLED = 'true';
  process.env.TELEGRAM_ALLOW_REGISTRATION = 'true';
  process.env.TELEGRAM_CLIENT_ID = TEST_CLIENT_ID;
  process.env.TELEGRAM_CLIENT_SECRET = TEST_CLIENT_SECRET;
  process.env.FRONTEND_URL = 'http://localhost:3000';
  process.env.BACKEND_URL = 'http://127.0.0.1:5000';

  // Generate cryptographic keys for OIDC JWKS tests
  testKeyPair = await generateKeyPair('RS256');
  const publicJwk = await exportJWK(testKeyPair.publicKey);
  publicJwk.kid = 'test-key-1';
  publicJwk.alg = 'RS256';
  publicJwk.use = 'sig';
  testPublicJwks = { keys: [publicJwk] };

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
  const headers = { ...(options.headers || {}) };
  if (!headers['Content-Type'] && options.body && typeof options.body === 'string') {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(url, {
    ...options,
    headers,
    redirect: 'manual', // Do not automatically follow redirects so we can inspect 302 responses
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, headers: res.headers, data };
}

// Helper to sign ID tokens for testing
async function createTestIdToken({
  sub = 'tg_987654321',
  name = 'Almaz Ayana',
  preferred_username = 'almazayana',
  nonce = null,
  issuer = 'https://oauth.telegram.org',
  audience = TEST_CLIENT_ID,
  expiresIn = '1h',
  key = testKeyPair.privateKey,
} = {}) {
  const jwt = new SignJWT({
    sub,
    id: 987654321,
    name,
    preferred_username,
    picture: 'https://cdn4.telesco.pe/photo.jpg',
    ...(nonce ? { nonce } : {}),
  })
    .setProtectedHeader({ alg: 'RS256', kid: 'test-key-1' })
    .setIssuer(issuer)
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime(expiresIn);

  return jwt.sign(key);
}

test('1. Telegram Auth Config Endpoint', async () => {
  const res = await apiFetch('/api/auth/telegram/config');
  assert.equal(res.status, 200);
  assert.equal(res.data.enabled, true);
  assert.equal(res.data.clientId, TEST_CLIENT_ID);
  assert.equal(res.data.allowRegistration, true);
});

test('2. Open Redirect Sanitization in telegram.service', () => {
  assert.equal(telegramService.sanitizeRedirectUrl('https://evil.com/phishing'), '/dashboard');
  assert.equal(telegramService.sanitizeRedirectUrl('//evil.com'), '/dashboard');
  assert.equal(telegramService.sanitizeRedirectUrl('/\\evil.com'), '/dashboard');
  assert.equal(telegramService.sanitizeRedirectUrl('javascript:alert(1)'), '/dashboard');
  assert.equal(telegramService.sanitizeRedirectUrl('/practice?subject=cs'), '/practice?subject=cs');
  assert.equal(telegramService.sanitizeRedirectUrl('/simulator/1'), '/simulator/1');
});

test('3. Start Telegram Auth: PKCE & State Generation', async () => {
  // Request JSON format (used by SPA)
  const res = await apiFetch('/api/auth/telegram/start?redirect=/practice&format=json');
  assert.equal(res.status, 200);
  assert.ok(res.data.authorizationUrl);
  assert.ok(res.data.state);

  const authUrl = new URL(res.data.authorizationUrl);
  assert.equal(authUrl.origin, 'https://oauth.telegram.org');
  assert.equal(authUrl.pathname, '/auth');
  assert.equal(authUrl.searchParams.get('client_id'), TEST_CLIENT_ID);
  assert.equal(authUrl.searchParams.get('response_type'), 'code');
  assert.equal(authUrl.searchParams.get('code_challenge_method'), 'S256');
  assert.ok(authUrl.searchParams.get('code_challenge'));
  assert.ok(authUrl.searchParams.get('nonce'));

  // Verify transaction in DB
  const dbTx = await query('SELECT * FROM auth_transactions WHERE state = $1', [res.data.state]);
  assert.equal(dbTx.rows.length, 1);
  assert.equal(dbTx.rows[0].redirect_url, '/practice');
  assert.equal(dbTx.rows[0].consumed_at, null);
});

test('4. Start Telegram Auth: Browser 302 Redirect', async () => {
  const res = await apiFetch('/api/auth/telegram/start?redirect=/dashboard');
  assert.equal(res.status, 302);
  const location = res.headers.get('location');
  assert.ok(location.startsWith('https://oauth.telegram.org/auth?'));
});

test('5. Callback Rejects Missing Code or State', async () => {
  const noCode = await apiFetch('/api/auth/telegram/callback?state=random_state');
  assert.equal(noCode.status, 302);
  const loc1 = noCode.headers.get('location');
  assert.ok(loc1.includes('/sign-in?error='));

  const noState = await apiFetch('/api/auth/telegram/callback?code=some_code');
  assert.equal(noState.status, 302);
  const loc2 = noState.headers.get('location');
  assert.ok(loc2.includes('/sign-in?error='));
});

test('6. Callback Rejects Telegram Authorization Cancellation', async () => {
  const res = await apiFetch('/api/auth/telegram/callback?error=access_denied&error_description=User+cancelled+login');
  assert.equal(res.status, 302);
  const loc = res.headers.get('location');
  assert.ok(loc.includes('/sign-in?error='));
  assert.ok(loc.includes('User+cancelled+login') || loc.includes('cancelled'));
});

test('7. Callback Rejects Expired or Replayed Transaction', async () => {
  // Insert an already expired transaction
  const expiredState = 'test_expired_state_' + Date.now();
  await query(`
    INSERT INTO auth_transactions (state, code_verifier, nonce, redirect_url, expires_at)
    VALUES ($1, 'verifier123', 'nonce123', '/dashboard', NOW() - INTERVAL '1 minute')
  `, [expiredState]);

  const resExpired = await apiFetch(`/api/auth/telegram/callback?code=mock_code&state=${expiredState}`);
  assert.equal(resExpired.status, 302);
  assert.ok(resExpired.headers.get('location').includes('expired'));

  // Test single-use consumption (prevent replay)
  const freshState = 'test_fresh_state_' + Date.now();
  await query(`
    INSERT INTO auth_transactions (state, code_verifier, nonce, redirect_url, expires_at)
    VALUES ($1, 'verifier123', 'nonce123', '/dashboard', NOW() + INTERVAL '10 minutes')
  `, [freshState]);

  // First consumption: should succeed in consuming
  const consumed = await telegramService.consumeAuthTransaction(freshState);
  assert.equal(consumed.state, freshState);

  // Second consumption: MUST fail
  await assert.rejects(
    () => telegramService.consumeAuthTransaction(freshState),
    /already been used/
  );
});

test('8. Cryptographic Token Verification (JWKS & Claims)', async () => {
  const nonce = 'test_nonce_' + Date.now();
  const validToken = await createTestIdToken({ nonce });

  // Valid verification using local test JWKS
  const claims = await telegramService.verifyIdToken(validToken, {
    expectedNonce: nonce,
    customJwks: testPublicJwks,
  });
  assert.equal(claims.stableSubject, 'tg_987654321');
  assert.equal(claims.preferred_username, 'almazayana');

  // Tampered signature
  const tamperedToken = validToken.slice(0, -6) + 'abcdef';
  await assert.rejects(
    () => telegramService.verifyIdToken(tamperedToken, { expectedNonce: nonce, customJwks: testPublicJwks }),
    /signature verification failed/
  );

  // Wrong issuer
  const wrongIssuerToken = await createTestIdToken({ issuer: 'https://evil-oauth.com', nonce });
  await assert.rejects(
    () => telegramService.verifyIdToken(wrongIssuerToken, { expectedNonce: nonce, customJwks: testPublicJwks }),
    /unexpected "iss" claim value/
  );

  // Wrong audience
  const wrongAudToken = await createTestIdToken({ audience: 'different_client_id', nonce });
  await assert.rejects(
    () => telegramService.verifyIdToken(wrongAudToken, { expectedNonce: nonce, customJwks: testPublicJwks }),
    /unexpected "aud" claim value/
  );

  // Expired token
  const expiredToken = await createTestIdToken({ expiresIn: '-10s', nonce });
  await assert.rejects(
    () => telegramService.verifyIdToken(expiredToken, { expectedNonce: nonce, customJwks: testPublicJwks }),
    /"exp" claim timestamp check failed/
  );

  // Mismatched nonce
  await assert.rejects(
    () => telegramService.verifyIdToken(validToken, { expectedNonce: 'different_nonce', customJwks: testPublicJwks }),
    /Token nonce mismatch/
  );
});

test('9. New User Student Registration via Telegram', async () => {
  const newSubject = 'tg_new_student_' + Date.now();
  const testName = 'Kenenisa Bekele';
  const testUsername = 'kenenisab';

  // Insert transaction
  const state = 'state_new_reg_' + Date.now();
  const nonce = 'nonce_new_reg_' + Date.now();
  await query(`
    INSERT INTO auth_transactions (state, code_verifier, nonce, redirect_url, expires_at)
    VALUES ($1, 'code_verifier_kenenisa', $2, '/dashboard', NOW() + INTERVAL '10 minutes')
  `, [state, nonce]);

  // Mock code exchange & token verify on telegram service
  const origExchange = telegramService.exchangeCodeForTokens;
  const origVerify = telegramService.verifyIdToken;

  telegramService.exchangeCodeForTokens = async () => ({ id_token: 'mock_jwt_new_user' });
  telegramService.verifyIdToken = async () => ({
    iss: 'https://oauth.telegram.org',
    aud: TEST_CLIENT_ID,
    sub: newSubject,
    id: 11223344,
    stableSubject: newSubject,
    name: testName,
    preferred_username: testUsername,
    picture: 'https://telegram.org/kenenisa.jpg',
  });

  try {
    const callbackRes = await apiFetch(`/api/auth/telegram/callback?code=valid_code&state=${state}`);
    assert.equal(callbackRes.status, 302);

    const redirectUrl = callbackRes.headers.get('location');
    assert.ok(redirectUrl.includes('/auth/telegram/callback?token='));
    assert.ok(redirectUrl.includes('returnUrl=%2Fdashboard'));

    // Check Set-Cookie header for HttpOnly session cookie
    const setCookie = callbackRes.headers.get('set-cookie');
    assert.ok(setCookie.includes('auth_token='));
    assert.ok(setCookie.includes('HttpOnly'));

    // Verify DB user was created with role 'student' and linked Telegram identity
    const userRes = await query(`
      SELECT u.*, uei.provider, uei.provider_subject
      FROM users u
      JOIN user_external_identities uei ON uei.user_id = u.id
      WHERE uei.provider = 'telegram' AND uei.provider_subject = $1
    `, [newSubject]);

    assert.equal(userRes.rows.length, 1);
    const createdUser = userRes.rows[0];
    assert.equal(createdUser.name, testName);
    assert.equal(createdUser.role, 'student', 'New Telegram users MUST be assigned role student');
    assert.equal(createdUser.password_hash, null, 'Telegram users should have no plain/empty password');
    assert.ok(createdUser.candidate_id.startsWith('ETH-'));

    // Verify audit log
    const auditRes = await query(`
      SELECT * FROM audit_logs WHERE user_id = $1 AND action = 'telegram_register'
    `, [createdUser.id]);
    assert.equal(auditRes.rows.length, 1);
  } finally {
    telegramService.exchangeCodeForTokens = origExchange;
    telegramService.verifyIdToken = origVerify;
  }
});

test('10. Returning User Login via Existing Telegram Identity', async () => {
  const existingSubject = 'tg_returning_' + Date.now();

  // Create an existing user and link Telegram identity
  const userInsert = await query(`
    INSERT INTO users (name, email, role, candidate_id)
    VALUES ('Tirunesh Dibaba', $1, 'student', $2)
    RETURNING id;
  `, [`tirunesh_${Date.now()}@test.com`, `ETH-${Math.floor(10000 + Math.random() * 90000)}`]);
  const userId = userInsert.rows[0].id;

  await query(`
    INSERT INTO user_external_identities (user_id, provider, provider_subject, provider_username, provider_display_name)
    VALUES ($1, 'telegram', $2, 'tiruneshd', 'Tirunesh Dibaba');
  `, [userId, existingSubject]);

  // Initiate login transaction
  const state = 'state_returning_' + Date.now();
  await query(`
    INSERT INTO auth_transactions (state, code_verifier, nonce, redirect_url, expires_at)
    VALUES ($1, 'verifier_returning', 'nonce_ret', '/simulator/2', NOW() + INTERVAL '10 minutes')
  `, [state]);

  const origExchange = telegramService.exchangeCodeForTokens;
  const origVerify = telegramService.verifyIdToken;

  telegramService.exchangeCodeForTokens = async () => ({ id_token: 'mock_jwt_returning' });
  telegramService.verifyIdToken = async () => ({
    iss: 'https://oauth.telegram.org',
    aud: TEST_CLIENT_ID,
    sub: existingSubject,
    stableSubject: existingSubject,
    name: 'Tirunesh Dibaba Updated',
    preferred_username: 'tiruneshd',
  });

  try {
    const callbackRes = await apiFetch(`/api/auth/telegram/callback?code=valid_code&state=${state}`);
    assert.equal(callbackRes.status, 302);
    const redirectUrl = callbackRes.headers.get('location');
    assert.ok(redirectUrl.includes('/auth/telegram/callback?token='));
    assert.ok(redirectUrl.includes('returnUrl=%2Fsimulator%2F2'));

    // Ensure NO duplicate user was created
    const countRes = await query(`
      SELECT count(*) FROM user_external_identities WHERE provider = 'telegram' AND provider_subject = $1
    `, [existingSubject]);
    assert.equal(parseInt(countRes.rows[0].count, 10), 1);
  } finally {
    telegramService.exchangeCodeForTokens = origExchange;
    telegramService.verifyIdToken = origVerify;
  }
});

test('11. Account Linking: Authenticated User Links Telegram', async () => {
  // Login as existing student Dawit
  const loginRes = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'dawit@aau.edu.et', password: 'Password123!' }),
  });
  const token = loginRes.data.token;
  const dawitId = loginRes.data.user.id;

  const dawitSubject = 'tg_dawit_unique_' + Date.now();
  const origVerify = telegramService.verifyIdToken;

  telegramService.verifyIdToken = async () => ({
    iss: 'https://oauth.telegram.org',
    aud: TEST_CLIENT_ID,
    sub: dawitSubject,
    stableSubject: dawitSubject,
    name: 'Dawit Mengistu',
    preferred_username: 'dawitm',
  });

  try {
    // 1. Link telegram account to Dawit
    const linkRes = await apiFetch('/api/auth/telegram/link', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ idToken: 'valid_mock_token' }),
    });
    assert.equal(linkRes.status, 200);
    assert.equal(linkRes.data.success, true);

    // Verify Dawit's profile now reflects linked Telegram
    const meRes = await apiFetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(meRes.status, 200);
    assert.equal(meRes.data.user.telegram.linked, true);
    assert.equal(meRes.data.user.telegram.username, 'dawitm');

    // 2. Conflict Prevention: Attempting to link the SAME telegram account to Helen must fail with 409
    const helenLogin = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'helen@gmail.com', password: 'Password123!' }),
    });
    const helenToken = helenLogin.data.token;

    const conflictRes = await apiFetch('/api/auth/telegram/link', {
      method: 'POST',
      headers: { Authorization: `Bearer ${helenToken}` },
      body: JSON.stringify({ idToken: 'valid_mock_token' }),
    });
    assert.equal(conflictRes.status, 409);
    assert.ok(conflictRes.data.error.includes('already linked to another user'));
  } finally {
    telegramService.verifyIdToken = origVerify;
  }
});

test('12. Logout Endpoint Clears Cookie Session', async () => {
  const res = await apiFetch('/api/auth/logout', { method: 'POST' });
  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
  const setCookie = res.headers.get('set-cookie');
  assert.ok(setCookie.includes('auth_token=;'));
});

test('13. Security Boundary: Telegram Student Cannot Access Admin Endpoints', async () => {
  // Create a Telegram user
  const newSubject = 'tg_student_boundary_' + Date.now();
  const userInsert = await query(`
    INSERT INTO users (name, email, role, candidate_id)
    VALUES ('Student Boundary Test', $1, 'student', $2)
    RETURNING id, role;
  `, [`boundary_${Date.now()}@test.com`, `ETH-${Math.floor(10000 + Math.random() * 90000)}`]);
  const user = userInsert.rows[0];

  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'ethio_exam_hall_jwt_super_secret_dev_key_2026');

  // Attempt to access admin dashboard
  const adminRes = await apiFetch('/api/admin/overview', {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(adminRes.status, 403, 'Telegram authenticated students must be denied administrative access');
});

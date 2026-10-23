const crypto = require('crypto');
const { query } = require('../db');
require('dotenv').config();

const TELEGRAM_ISSUER = process.env.TELEGRAM_ISSUER || 'https://oauth.telegram.org';
const TELEGRAM_AUTH_ENDPOINT = process.env.TELEGRAM_AUTH_ENDPOINT || `${TELEGRAM_ISSUER}/auth`;
const TELEGRAM_TOKEN_ENDPOINT = process.env.TELEGRAM_TOKEN_ENDPOINT || `${TELEGRAM_ISSUER}/token`;
const TELEGRAM_JWKS_URI = process.env.TELEGRAM_JWKS_URI || `${TELEGRAM_ISSUER}/.well-known/jwks.json`;

// Helper to load ESM 'jose' package dynamically inside CommonJS
let _jose = null;
async function getJose() {
  if (!_jose) {
    _jose = await import('jose');
  }
  return _jose;
}

// Cache remote JWKS set
let remoteJwks = null;
async function getJwksResolver(customJwks) {
  const { createLocalJWKSet, createRemoteJWKSet } = await getJose();
  if (customJwks) {
    return createLocalJWKSet(customJwks);
  }
  if (!remoteJwks) {
    remoteJwks = createRemoteJWKSet(new URL(TELEGRAM_JWKS_URI));
  }
  return remoteJwks;
}

/**
 * Base64URL-encode a buffer
 */
function base64UrlEncode(buffer) {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Generate a cryptographically secure random state (32 bytes)
 */
function generateState() {
  return base64UrlEncode(crypto.randomBytes(32));
}

/**
 * Generate a cryptographically secure PKCE code verifier (43-128 chars)
 */
function generateCodeVerifier() {
  return base64UrlEncode(crypto.randomBytes(48));
}

/**
 * Generate a PKCE S256 code challenge from a verifier
 */
function generateCodeChallenge(verifier) {
  return base64UrlEncode(crypto.createHash('sha256').update(verifier).digest());
}

/**
 * Generate a cryptographically secure nonce
 */
function generateNonce() {
  return base64UrlEncode(crypto.randomBytes(24));
}

/**
 * Validates that an internal destination URL is safe (prevents open redirects)
 */
function sanitizeRedirectUrl(rawUrl, fallback = '/dashboard') {
  if (!rawUrl || typeof rawUrl !== 'string') return fallback;
  const trimmed = rawUrl.trim();
  // Must start with '/' but not '//' or '/\' to prevent protocol-relative redirects
  if (trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.startsWith('/\\')) {
    // Ensure no control characters or carriage returns
    if (/^[\w\-./?=&%#]+$/.test(trimmed)) {
      return trimmed;
    }
  }
  return fallback;
}

/**
 * Start a new Telegram authentication transaction
 */
async function createAuthTransaction(options = {}) {
  const clientId = process.env.TELEGRAM_CLIENT_ID;
  const redirectUri = process.env.TELEGRAM_REDIRECT_URI || `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/telegram/callback`;

  if (!clientId) {
    throw new Error('Telegram authentication is not configured: TELEGRAM_CLIENT_ID is missing.');
  }

  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const nonce = generateNonce();
  const sanitizedRedirect = sanitizeRedirectUrl(options.redirectUrl, '/dashboard');

  // Expire transaction after 10 minutes
  await query(`
    INSERT INTO auth_transactions (state, code_verifier, nonce, redirect_url, provider, expires_at)
    VALUES ($1, $2, $3, $4, 'telegram', NOW() + INTERVAL '10 minutes')
  `, [state, codeVerifier, nonce, sanitizedRedirect]);

  let origin = process.env.TELEGRAM_ORIGIN;
  if (!origin) {
    try {
      origin = new URL(redirectUri).origin;
    } catch {
      origin = 'https://oauth.telegram.org';
    }
  }

  const params = new URLSearchParams({
    client_id: clientId,
    bot_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid profile',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    nonce,
    origin,
  });

  const authorizationUrl = `${TELEGRAM_AUTH_ENDPOINT}?${params.toString()}`;

  return {
    state,
    authorizationUrl,
    redirectUri,
  };
}

/**
 * Consume an existing transaction by state (atomic, prevents replay)
 */
async function consumeAuthTransaction(state) {
  if (!state || typeof state !== 'string') {
    throw new Error('Missing or invalid authentication state.');
  }

  const result = await query(`
    UPDATE auth_transactions
    SET consumed_at = NOW()
    WHERE state = $1
      AND consumed_at IS NULL
      AND expires_at > NOW()
    RETURNING *;
  `, [state]);

  if (result.rows.length === 0) {
    throw new Error('Authentication transaction is expired, invalid, or has already been used.');
  }

  return result.rows[0];
}

/**
 * Exchange authorization code for tokens with Telegram
 */
async function exchangeCodeForTokens({ code, codeVerifier, redirectUri }) {
  const clientId = process.env.TELEGRAM_CLIENT_ID;
  const clientSecret = process.env.TELEGRAM_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Telegram client credentials are not configured on the server.');
  }

  const effectiveRedirectUri = redirectUri || process.env.TELEGRAM_REDIRECT_URI || `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/telegram/callback`;

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const bodyParams = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: effectiveRedirectUri,
    client_id: clientId,
    code_verifier: codeVerifier,
  });

  const response = await fetch(TELEGRAM_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`,
      'Accept': 'application/json',
    },
    body: bodyParams.toString(),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorDescription = data?.error_description || data?.error || `Token exchange failed with HTTP ${response.status}`;
    const err = new Error(errorDescription);
    err.status = response.status;
    err.details = data;
    throw err;
  }

  if (!data?.id_token) {
    throw new Error('Telegram token response did not contain an id_token.');
  }

  return data;
}

/**
 * Verify ID token signature and claims using Telegram's published JWKS
 */
async function verifyIdToken(idToken, { expectedNonce, customJwks } = {}) {
  const clientId = process.env.TELEGRAM_CLIENT_ID;
  if (!idToken || typeof idToken !== 'string') {
    throw new Error('Missing ID token for verification.');
  }

  const jwksResolver = await getJwksResolver(customJwks);
  const { jwtVerify } = await getJose();

  const { payload } = await jwtVerify(idToken, jwksResolver, {
    issuer: TELEGRAM_ISSUER,
    audience: clientId ? String(clientId) : undefined,
    algorithms: ['RS256', 'ES256', 'EdDSA', 'ES256K'],
  });

  // Check nonce if requested
  if (expectedNonce && payload.nonce && payload.nonce !== expectedNonce) {
    throw new Error('Token nonce mismatch: possible replay attack.');
  }

  // Extract stable subject identifier (sub or id)
  const subjectId = payload.sub || (payload.id ? String(payload.id) : null);
  if (!subjectId) {
    throw new Error('ID token does not contain a valid subject claim (sub or id).');
  }

  return {
    ...payload,
    stableSubject: String(subjectId),
  };
}

/**
 * Verify Telegram Login Widget cryptographic signature (HMAC-SHA256)
 */
function verifyTelegramWidgetData(authData) {
  if (!authData || typeof authData !== 'object') {
    throw new Error('Missing or invalid Telegram authentication data.');
  }

  const { hash, ...fields } = authData;
  if (!hash) {
    throw new Error('Telegram authentication data is missing hash signature.');
  }

  const botToken = process.env.TELEGRAM_CLIENT_SECRET;
  if (!botToken) {
    throw new Error('Telegram client secret (bot token) is not configured on the backend.');
  }

  // 1. Verify freshness (within 24 hours to prevent replay)
  const authTimestamp = parseInt(authData.auth_date, 10);
  const now = Math.floor(Date.now() / 1000);
  if (!authTimestamp || Math.abs(now - authTimestamp) > 86400) {
    throw new Error('Telegram authentication data has expired.');
  }

  // 2. Build data_check_string: alphabetical sort of key=value pairs joined with \n
  const dataCheckString = Object.keys(fields)
    .sort()
    .map((k) => `${k}=${fields[k]}`)
    .join('\n');

  // 3. Compute secret key: SHA-256 hash of bot token
  const secretKey = crypto.createHash('sha256').update(botToken).digest();

  // 4. Compute HMAC-SHA256 signature
  const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  // 5. Constant-time comparison
  const hashBuffer = Buffer.from(hash, 'hex');
  const calculatedBuffer = Buffer.from(calculatedHash, 'hex');
  if (hashBuffer.length !== calculatedBuffer.length || !crypto.timingSafeEqual(hashBuffer, calculatedBuffer)) {
    throw new Error('Telegram authentication signature verification failed.');
  }

  const stableSubject = String(authData.id);
  const fullName = [authData.first_name, authData.last_name].filter(Boolean).join(' ') || authData.username || 'Telegram User';

  return {
    ...authData,
    stableSubject,
    name: fullName,
    preferred_username: authData.username || null,
    picture: authData.photo_url || null,
  };
}

module.exports = {
  TELEGRAM_ISSUER,
  TELEGRAM_AUTH_ENDPOINT,
  TELEGRAM_TOKEN_ENDPOINT,
  TELEGRAM_JWKS_URI,
  generateState,
  generateCodeVerifier,
  generateCodeChallenge,
  generateNonce,
  sanitizeRedirectUrl,
  createAuthTransaction,
  consumeAuthTransaction,
  exchangeCodeForTokens,
  verifyIdToken,
  verifyTelegramWidgetData,
  getJwksResolver,
};

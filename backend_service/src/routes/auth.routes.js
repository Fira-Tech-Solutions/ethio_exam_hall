const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, pool } = require('../db');
const { authenticate, JWT_SECRET } = require('../middleware/auth');
const telegramService = require('../services/telegram.service');

function setAuthCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
}

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, target_track, institution } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const candidateId = `ETH-${Math.floor(10000 + Math.random() * 90000)}`;

    const userRes = await query(`
      INSERT INTO users (name, email, password_hash, role, target_track, institution, candidate_id, is_verified)
      VALUES ($1, $2, $3, 'student', $4, $5, $6, TRUE)
      RETURNING id, name, email, role, target_track, institution, candidate_id, is_verified, created_at;
    `, [name.trim(), email.toLowerCase().trim(), passwordHash, target_track || 'exit', institution || 'Addis Ababa University', candidateId]);

    const user = userRes.rows[0];
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    setAuthCookie(res, token);

    res.status(201).json({
      message: 'Account registered successfully.',
      token,
      user,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const identifier = (email || '').trim();
    const userRes = await query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1) OR UPPER(candidate_id) = UPPER($1)',
      [identifier]
    );
    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password credentials.' });
    }

    const user = userRes.rows[0];
    if (!user.password_hash) {
      return res.status(401).json({
        error: 'This account was created with Telegram. Please use Telegram Sign-In to access your account.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password credentials.' });
    }

    // Check active subscription
    const subRes = await query(`
      SELECT us.*, sp.name as plan_name, sp.code as plan_code 
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = $1 AND us.status = 'active' AND us.expires_at > NOW()
      ORDER BY us.expires_at DESC LIMIT 1
    `, [user.id]);

    const activeSubscription = subRes.rows[0] || null;
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    setAuthCookie(res, token);

    res.json({
      message: 'Sign in successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        target_track: user.target_track,
        institution: user.institution,
        candidate_id: user.candidate_id,
        is_verified: user.is_verified,
        has_pro_access: Boolean(activeSubscription) || user.role === 'admin' || user.role === 'superadmin',
        active_subscription: activeSubscription,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('auth_token', { path: '/' });
  res.json({ success: true, message: 'Logged out successfully.' });
});

// Get current profile with subscription and linked identities
router.get('/me', authenticate, async (req, res) => {
  try {
    const subRes = await query(`
      SELECT us.*, sp.name as plan_name, sp.code as plan_code 
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = $1 AND us.status = 'active' AND us.expires_at > NOW()
      ORDER BY us.expires_at DESC LIMIT 1
    `, [req.user.id]);

    const extRes = await query(`
      SELECT provider, provider_username, provider_display_name, avatar_url, created_at
      FROM user_external_identities
      WHERE user_id = $1
    `, [req.user.id]);

    const telegramIdentity = extRes.rows.find(e => e.provider === 'telegram') || null;
    const activeSubscription = subRes.rows[0] || null;

    const avatarUrl = req.user.avatar_url || telegramIdentity?.avatar_url || null;

    res.json({
      user: {
        ...req.user,
        avatar_url: avatarUrl,
        photo_url: avatarUrl,
        has_pro_access: Boolean(activeSubscription) || req.user.role === 'admin' || req.user.role === 'superadmin',
        active_subscription: activeSubscription,
        telegram: telegramIdentity ? {
          linked: true,
          username: telegramIdentity.provider_username,
          displayName: telegramIdentity.provider_display_name,
          avatarUrl: telegramIdentity.avatar_url,
          linkedAt: telegramIdentity.created_at,
        } : { linked: false },
      },
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Server error fetching profile.' });
  }
});

// Update Candidate Profile (Name, Email, Institution, Track, Avatar)
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, email, target_track, institution, avatar_url } = req.body;

    // Email validation and uniqueness check
    if (email && email.trim().toLowerCase() !== req.user.email.toLowerCase()) {
      const cleanEmail = email.trim().toLowerCase();
      // Ensure email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        return res.status(400).json({ error: 'Please provide a valid email address.' });
      }

      const existing = await query('SELECT id FROM users WHERE email = $1 AND id != $2', [cleanEmail, req.user.id]);
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'This email is already registered to another account.' });
      }
    }

    const cleanEmail = email ? email.trim().toLowerCase() : req.user.email;
    const cleanName = name ? name.trim() : req.user.name;

    const updateRes = await query(`
      UPDATE users
      SET name = COALESCE($1, name),
          email = COALESCE($2, email),
          target_track = COALESCE($3, target_track),
          institution = COALESCE($4, institution),
          avatar_url = COALESCE($5, avatar_url),
          updated_at = NOW()
      WHERE id = $6
      RETURNING id, name, email, role, target_track, institution, candidate_id, is_verified, avatar_url,
                (password_hash IS NOT NULL) as has_password;
    `, [cleanName, cleanEmail, target_track, institution, avatar_url, req.user.id]);

    const updatedUser = updateRes.rows[0];

    // Log to audit trail
    await query(`
      INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details)
      VALUES ($1, 'UPDATE_PROFILE', 'users', $1, $2);
    `, [req.user.id, JSON.stringify({ name: cleanName, email: cleanEmail, institution })]);

    res.json({
      message: 'Profile updated successfully.',
      user: {
        ...updatedUser,
        photo_url: updatedUser.avatar_url,
      },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: error.message || 'Failed to update profile.' });
  }
});

// Set or Change Account Password
router.put('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    // Check if user currently has a password set
    const userRow = await query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    const currentHash = userRow.rows[0]?.password_hash;

    // If user already has a password, verify current password
    if (currentHash) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required to change password.' });
      }
      const isMatch = await bcrypt.compare(currentPassword, currentHash);
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password is incorrect.' });
      }
    }

    // Hash new password and save
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await query(`
      UPDATE users
      SET password_hash = $1,
          updated_at = NOW()
      WHERE id = $2;
    `, [newHash, req.user.id]);

    // Log security event
    await query(`
      INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details)
      VALUES ($1, 'SET_PASSWORD', 'users', $1, $2);
    `, [req.user.id, JSON.stringify({ action: currentHash ? 'changed_password' : 'set_initial_password' })]);

    res.json({
      message: currentHash ? 'Password changed successfully.' : 'Password set successfully! You can now sign in with your email and password.',
      has_password: true,
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: error.message || 'Failed to update password.' });
  }
});

// Update Onboarding preferences
router.put('/onboarding', authenticate, async (req, res) => {
  try {
    const { target_track, institution } = req.body;
    const updateRes = await query(`
      UPDATE users 
      SET target_track = COALESCE($1, target_track),
          institution = COALESCE($2, institution),
          updated_at = NOW()
      WHERE id = $3
      RETURNING id, name, email, role, target_track, institution, candidate_id, is_verified;
    `, [target_track, institution, req.user.id]);

    res.json({
      message: 'Candidate preferences updated.',
      user: updateRes.rows[0],
    });
  } catch (error) {
    console.error('Onboarding update error:', error);
    res.status(500).json({ error: 'Server error updating preferences.' });
  }
});

// ====================================================================
// Telegram Authentication (OpenID Connect with PKCE)
// ====================================================================

// Public Telegram Auth Configuration
router.get('/telegram/config', (req, res) => {
  const isEnabled = process.env.TELEGRAM_LOGIN_ENABLED !== 'false' && Boolean(process.env.TELEGRAM_CLIENT_ID);
  res.json({
    enabled: isEnabled,
    clientId: process.env.TELEGRAM_CLIENT_ID || null,
    botUsername: process.env.TELEGRAM_BOT_USERNAME || null,
    allowRegistration: process.env.TELEGRAM_ALLOW_REGISTRATION !== 'false',
  });
});

// Step A: Initiate Telegram Authorization Flow
router.get('/telegram/start', async (req, res) => {
  try {
    if (process.env.TELEGRAM_LOGIN_ENABLED === 'false') {
      return res.status(403).json({ error: 'Telegram authentication is currently disabled.' });
    }

    const redirectParam = req.query.redirect || req.query.returnUrl || '/dashboard';
    const sanitizedRedirect = telegramService.sanitizeRedirectUrl(redirectParam, '/dashboard');
    const transaction = await telegramService.createAuthTransaction({ redirectUrl: sanitizedRedirect });

    // Respond with JSON if requested by SPA fetch, otherwise 302 redirect
    const wantsJson = req.query.format === 'json' ||
      (req.headers.accept && req.headers.accept.includes('application/json') && !req.headers.accept.includes('text/html'));

    if (wantsJson) {
      return res.json({
        authorizationUrl: transaction.authorizationUrl,
        state: transaction.state,
        redirectUri: transaction.redirectUri,
      });
    }

    return res.redirect(transaction.authorizationUrl);
  } catch (error) {
    console.error('Telegram start error:', error);
    return res.status(500).json({ error: error.message || 'Failed to initiate Telegram login.' });
  }
});

// Step B: Handle Telegram Callback
router.get('/telegram/callback', async (req, res) => {
  const frontendBase = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/+$/, '');
  const signInUrl = `${frontendBase}/sign-in`;
  const { code, state, error, error_description } = req.query;

  // Handle Telegram user cancellation or authorization errors
  if (error) {
    const errorMsg = error_description || error || 'Telegram authorization was cancelled or denied.';
    console.warn('Telegram auth returned error:', error, error_description);
    return res.redirect(`${signInUrl}?error=${encodeURIComponent(errorMsg)}`);
  }

  if (!code || !state) {
    return res.redirect(`${signInUrl}?error=${encodeURIComponent('Missing authorization code or state from Telegram callback.')}`);
  }

  let transaction;
  try {
    transaction = await telegramService.consumeAuthTransaction(state);
  } catch (err) {
    console.warn('Telegram state verification failed:', err.message);
    return res.redirect(`${signInUrl}?error=${encodeURIComponent(err.message || 'Authentication session has expired or is invalid.')}`);
  }

  const client = await pool.connect();
  try {
    // 1. Exchange authorization code with Telegram token endpoint
    const tokens = await telegramService.exchangeCodeForTokens({
      code,
      codeVerifier: transaction.code_verifier,
      redirectUri: process.env.TELEGRAM_REDIRECT_URI,
    });

    // 2. Cryptographically verify ID token against JWKS
    const verifiedClaims = await telegramService.verifyIdToken(tokens.id_token, {
      expectedNonce: transaction.nonce,
    });

    const telegramSubject = verifiedClaims.stableSubject;
    let user;

    await client.query('BEGIN');

    // 3. Resolve user by external identity
    const existingIdentity = await client.query(`
      SELECT u.*, uei.provider_username, uei.provider_display_name, uei.avatar_url
      FROM user_external_identities uei
      JOIN users u ON uei.user_id = u.id
      WHERE uei.provider = 'telegram' AND uei.provider_subject = $1
    `, [telegramSubject]);

    if (existingIdentity.rows.length > 0) {
      user = existingIdentity.rows[0];

      // Update provider profile info if changed
      await client.query(`
        UPDATE user_external_identities
        SET provider_username = COALESCE($1, provider_username),
            provider_display_name = COALESCE($2, provider_display_name),
            avatar_url = COALESCE($3, avatar_url),
            claims_json = $4,
            updated_at = NOW()
        WHERE provider = 'telegram' AND provider_subject = $5
      `, [
        verifiedClaims.preferred_username || null,
        verifiedClaims.name || null,
        verifiedClaims.picture || null,
        JSON.stringify(verifiedClaims),
        telegramSubject,
      ]);
    } else {
      // Check registration policy
      const allowRegistration = process.env.TELEGRAM_ALLOW_REGISTRATION !== 'false';
      if (!allowRegistration) {
        await client.query('ROLLBACK');
        return res.redirect(`${signInUrl}?error=${encodeURIComponent('Registration is currently closed for new users.')}`);
      }

      // Create new student account (default student role, never admin)
      const candidateId = `ETH-${Math.floor(10000 + Math.random() * 90000)}`;
      const displayName = (verifiedClaims.name || verifiedClaims.preferred_username || 'Telegram Candidate').trim();
      const placeholderEmail = `tg_${telegramSubject}@users.ethioexamhall.local`;

      const userInsert = await client.query(`
        INSERT INTO users (name, email, password_hash, role, target_track, institution, candidate_id, is_verified)
        VALUES ($1, $2, NULL, 'student', 'exit', 'Addis Ababa University', $3, TRUE)
        RETURNING id, name, email, role, target_track, institution, candidate_id, is_verified, created_at;
      `, [displayName, placeholderEmail, candidateId]);

      user = userInsert.rows[0];

      // Link verified Telegram identity
      await client.query(`
        INSERT INTO user_external_identities (user_id, provider, provider_subject, provider_username, provider_display_name, avatar_url, claims_json)
        VALUES ($1, 'telegram', $2, $3, $4, $5, $6)
      `, [
        user.id,
        telegramSubject,
        verifiedClaims.preferred_username || null,
        verifiedClaims.name || null,
        verifiedClaims.picture || null,
        JSON.stringify(verifiedClaims),
      ]);

      // Audit log entry
      await client.query(`
        INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details)
        VALUES ($1, 'telegram_register', 'user', $1, $2)
      `, [user.id, JSON.stringify({ provider: 'telegram', subject: telegramSubject, candidateId })]);
    }

    await client.query('COMMIT');

    // 4. Issue application session token
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    setAuthCookie(res, token);

    // 5. Safe redirect to frontend destination
    const targetDestination = telegramService.sanitizeRedirectUrl(transaction.redirect_url, '/dashboard');
    const callbackRedirectUrl = `${frontendBase}/auth/telegram/callback?token=${encodeURIComponent(token)}&returnUrl=${encodeURIComponent(targetDestination)}`;
    return res.redirect(callbackRedirectUrl);
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Telegram callback processing error:', error);
    const userSafeMessage = error.message && !error.message.includes('password') && !error.message.includes('secret')
      ? error.message
      : 'Authentication failed. Please try again.';
    return res.redirect(`${signInUrl}?error=${encodeURIComponent(userSafeMessage)}`);
  } finally {
    client.release();
  }
});

// Step C: Handle Telegram Widget Authentication (via #tgAuthResult payload)
router.post('/telegram/widget-callback', async (req, res) => {
  try {
    let authData = req.body;
    // If sent as raw base64 encoded string from #tgAuthResult=...
    if (req.body.tgAuthResult) {
      try {
        const decodedStr = Buffer.from(req.body.tgAuthResult, 'base64').toString('utf8');
        authData = JSON.parse(decodedStr);
      } catch (err) {
        return res.status(400).json({ error: 'Invalid base64 payload in tgAuthResult.' });
      }
    }

    const verified = telegramService.verifyTelegramWidgetData(authData);
    const telegramSubject = verified.stableSubject;

    const client = await pool.connect();
    let user;
    try {
      await client.query('BEGIN');

      const existingIdentity = await client.query(`
        SELECT u.*, uei.provider_username, uei.provider_display_name, uei.avatar_url
        FROM user_external_identities uei
        JOIN users u ON uei.user_id = u.id
        WHERE uei.provider = 'telegram' AND uei.provider_subject = $1
      `, [telegramSubject]);

      if (existingIdentity.rows.length > 0) {
        user = existingIdentity.rows[0];
        await client.query(`
          UPDATE user_external_identities
          SET provider_username = COALESCE($1, provider_username),
              provider_display_name = COALESCE($2, provider_display_name),
              avatar_url = COALESCE($3, avatar_url),
              claims_json = $4,
              updated_at = NOW()
          WHERE provider = 'telegram' AND provider_subject = $5
        `, [
          verified.preferred_username || null,
          verified.name || null,
          verified.picture || null,
          JSON.stringify(verified),
          telegramSubject,
        ]);
      } else {
        const allowRegistration = process.env.TELEGRAM_ALLOW_REGISTRATION !== 'false';
        if (!allowRegistration) {
          await client.query('ROLLBACK');
          return res.status(403).json({ error: 'Registration is currently closed for new users.' });
        }

        const candidateId = `ETH-${Math.floor(10000 + Math.random() * 90000)}`;
        const placeholderEmail = `tg_${telegramSubject}@users.ethioexamhall.local`;

        const userInsert = await client.query(`
          INSERT INTO users (name, email, password_hash, role, target_track, institution, candidate_id, is_verified)
          VALUES ($1, $2, NULL, 'student', 'exit', 'Addis Ababa University', $3, TRUE)
          RETURNING id, name, email, role, target_track, institution, candidate_id, is_verified, created_at;
        `, [verified.name, placeholderEmail, candidateId]);

        user = userInsert.rows[0];

        await client.query(`
          INSERT INTO user_external_identities (user_id, provider, provider_subject, provider_username, provider_display_name, avatar_url, claims_json)
          VALUES ($1, 'telegram', $2, $3, $4, $5, $6)
        `, [
          user.id,
          telegramSubject,
          verified.preferred_username || null,
          verified.name || null,
          verified.picture || null,
          JSON.stringify(verified),
        ]);

        await client.query(`
          INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details)
          VALUES ($1, 'telegram_widget_register', 'user', $1, $2)
        `, [user.id, JSON.stringify({ provider: 'telegram', subject: telegramSubject, candidateId })]);
      }

      await client.query('COMMIT');
    } catch (dbErr) {
      await client.query('ROLLBACK');
      throw dbErr;
    } finally {
      client.release();
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    setAuthCookie(res, token);

    const userWithAvatar = {
      ...user,
      avatar_url: verified.picture || null,
      photo_url: verified.picture || null,
    };

    return res.json({
      message: 'Telegram authentication successful.',
      token,
      user: userWithAvatar,
      redirectUrl: '/dashboard',
    });
  } catch (error) {
    console.error('Widget callback error:', error);
    return res.status(400).json({ error: error.message || 'Telegram verification failed.' });
  }
});

// Step G: Link Telegram to an existing authenticated account
router.post('/telegram/link', authenticate, async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: 'Missing Telegram ID token to link.' });
    }

    const verifiedClaims = await telegramService.verifyIdToken(idToken);
    const telegramSubject = verifiedClaims.stableSubject;

    // Check if Telegram account is already linked to a different local user
    const existing = await query(`
      SELECT user_id FROM user_external_identities
      WHERE provider = 'telegram' AND provider_subject = $1
    `, [telegramSubject]);

    if (existing.rows.length > 0) {
      if (existing.rows[0].user_id !== req.user.id) {
        return res.status(409).json({ error: 'This Telegram account is already linked to another user.' });
      }
      return res.json({ message: 'Telegram account is already linked to your profile.', success: true });
    }

    // Link Telegram identity to current user
    await query(`
      INSERT INTO user_external_identities (user_id, provider, provider_subject, provider_username, provider_display_name, avatar_url, claims_json)
      VALUES ($1, 'telegram', $2, $3, $4, $5, $6)
      ON CONFLICT (provider, provider_subject) DO UPDATE
      SET user_id = EXCLUDED.user_id, updated_at = NOW();
    `, [
      req.user.id,
      telegramSubject,
      verifiedClaims.preferred_username || null,
      verifiedClaims.name || null,
      verifiedClaims.picture || null,
      JSON.stringify(verifiedClaims),
    ]);

    // Audit log
    await query(`
      INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details)
      VALUES ($1, 'telegram_link', 'user', $1, $2)
    `, [req.user.id, JSON.stringify({ provider: 'telegram', subject: telegramSubject })]);

    res.json({
      message: 'Telegram account successfully linked.',
      success: true,
    });
  } catch (error) {
    console.error('Account linking error:', error);
    res.status(500).json({ error: error.message || 'Failed to link Telegram account.' });
  }
});

// Unlink Telegram account from profile
router.post('/telegram/unlink', authenticate, async (req, res) => {
  try {
    // Prevent unlinking if user has no password (would lock them out)
    const userCheck = await query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    if (!userCheck.rows[0] || !userCheck.rows[0].password_hash) {
      return res.status(400).json({
        error: 'Cannot unlink Telegram: you do not have a password set. Set a password first before unlinking.',
      });
    }

    await query(`
      DELETE FROM user_external_identities
      WHERE user_id = $1 AND provider = 'telegram'
    `, [req.user.id]);

    await query(`
      INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details)
      VALUES ($1, 'telegram_unlink', 'user', $1, '{}')
    `, [req.user.id]);

    res.json({ message: 'Telegram account successfully unlinked.', success: true });
  } catch (error) {
    console.error('Account unlinking error:', error);
    res.status(500).json({ error: 'Failed to unlink Telegram account.' });
  }
});

module.exports = router;

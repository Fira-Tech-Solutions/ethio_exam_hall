const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const examRoutes = require('./routes/exam.routes');
const attemptRoutes = require('./routes/attempt.routes');
const practiceRoutes = require('./routes/practice.routes');
const aviationRoutes = require('./routes/aviation.routes');
const paymentRoutes = require('./routes/payment.routes');
const adminRoutes = require('./routes/admin.routes');
const aiRoutes = require('./routes/ai.routes');
const { pool } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (!process.env.CORS_ORIGIN || process.env.CORS_ORIGIN === '*') {
      return callback(null, origin);
    }
    const origins = process.env.CORS_ORIGIN.split(',').map(s => s.trim());
    if (origins.includes(origin)) {
      return callback(null, origin);
    }
    return callback(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbCheck = await pool.query('SELECT NOW() as db_time');
    res.json({
      status: 'healthy',
      service: 'Ethio Exam Hall Backend API',
      database: 'PostgreSQL 16 (Connected)',
      dbTime: dbCheck.rows[0].db_time,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'degraded',
      error: error.message,
    });
  }
});

// Telegram Widget Callback Bridge & Root Status Endpoint
app.get('/', (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ethio Exam Hall - Telegram Authentication</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #E5EBF4;
      margin: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      color: #10233F;
    }
    .card {
      background: white;
      border-radius: 24px;
      padding: 40px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
      max-width: 440px;
      width: 90%;
      text-align: center;
    }
    .logo {
      width: 52px;
      height: 52px;
      background: linear-gradient(135deg, #10233F 0%, #2457D6 100%);
      border-radius: 14px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: white;
      margin-bottom: 20px;
      margin-left: auto;
      margin-right: auto;
    }
    .spinner {
      border: 3px solid rgba(36, 87, 214, 0.15);
      border-top-color: #2457D6;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      animation: spin 0.8s linear infinite;
      margin: 20px auto;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    h2 { margin: 0 0 8px; font-size: 20px; font-weight: 700; color: #10233F; }
    p { margin: 0; color: #64748B; font-size: 14px; line-height: 1.5; }
    .error-box {
      display: none;
      background: #FEF2F2;
      border: 1px solid #FEE2E2;
      color: #B91C1C;
      padding: 12px;
      border-radius: 12px;
      margin-top: 16px;
      font-size: 13px;
      word-break: break-word;
    }
    .btn {
      display: inline-block;
      margin-top: 20px;
      background: #10233F;
      color: white;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      transition: background 0.2s;
    }
    .btn:hover {
      background: #1e3a8a;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">
      <svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
    </div>
    <div id="loading">
      <div class="spinner"></div>
      <h2 id="title">Authenticating Candidate</h2>
      <p id="subtitle">Verifying your Telegram identity and establishing candidate session...</p>
    </div>
    <div id="error-box" class="error-box"></div>
    <div id="action-btn" style="display:none;">
      <a href="${frontendUrl}/sign-in" class="btn">Return to Sign In</a>
    </div>
  </div>
  <script>
    (async function() {
      const frontendUrl = "${frontendUrl}";
      const hash = window.location.hash;
      const search = window.location.search;
      let tgAuthResult = null;

      if (hash) {
        const hashParams = new URLSearchParams(hash.startsWith('#') ? hash.substring(1) : hash);
        tgAuthResult = hashParams.get('tgAuthResult');
      }
      if (!tgAuthResult && search) {
        const searchParams = new URLSearchParams(search);
        tgAuthResult = searchParams.get('tgAuthResult');
      }

      if (!tgAuthResult) {
        document.querySelector('.spinner').style.display = 'none';
        document.getElementById('title').textContent = 'Ethio Exam Hall API Gateway';
        document.getElementById('subtitle').innerHTML = 'Backend Service is healthy and active.<br><br><a href="' + frontendUrl + '" class="btn">Open Student Portal</a>';
        return;
      }

      try {
        const response = await fetch('/api/auth/telegram/widget-callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tgAuthResult }),
          credentials: 'include'
        });

        const data = await response.json();
        if (!response.ok || !data.token) {
          throw new Error(data.error || 'Telegram verification failed.');
        }

        // Successfully verified! Redirect to frontend with token
        window.location.href = frontendUrl + '/auth/telegram/callback?token=' + encodeURIComponent(data.token) + '&returnUrl=/dashboard';
      } catch (err) {
        document.querySelector('.spinner').style.display = 'none';
        document.getElementById('title').textContent = 'Authentication Failed';
        document.getElementById('subtitle').textContent = 'Could not verify your Telegram credentials.';
        const errBox = document.getElementById('error-box');
        errBox.textContent = err.message || 'Verification error';
        errBox.style.display = 'block';
        document.getElementById('action-btn').style.display = 'block';
      }
    })();
  </script>
</body>
</html>`);
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/attempts', attemptRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/aviation', aviationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    error: 'Internal server error occurred.',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

if (require.main === module) {
  const os = require('os');
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Ethio Exam Hall API server running:`);
    console.log(`   - Local:   http://localhost:${PORT}`);
    
    // Display all available local network IP addresses
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          console.log(`   - Network: http://${iface.address}:${PORT}`);
        }
      }
    }
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  });
}

module.exports = app;

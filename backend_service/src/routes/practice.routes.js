const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { authenticate } = require('../middleware/auth');

// Custom Drill Builder (Matches Stitch Screen practice_test_center_custom_drill_builder)
router.post('/custom-drill', authenticate, async (req, res) => {
  try {
    const {
      track = 'exit',
      domains = [],
      years = [],
      mode = 'timed',
      questionCount = 25,
      difficulty = 'all',
      timeLimitMinutes = 30,
    } = req.body;

    // 1. Fetch category
    const catRes = await query('SELECT id, name FROM exam_categories WHERE code = $1', [track]);
    const categoryId = catRes.rows[0]?.id || null;

    // 2. Query questions matching criteria
    const conditions = ["e.status = 'published'"];
    const params = [];

    if (categoryId) {
      params.push(categoryId);
      conditions.push(`e.category_id = $${params.length}`);
    }

    if (domains && domains.length > 0) {
      params.push(domains);
      conditions.push(`q.domain = ANY($${params.length})`);
    }

    if (years && years.length > 0) {
      params.push(years.map(y => parseInt(y, 10)));
      conditions.push(`e.year_ec = ANY($${params.length})`);
    }

    if (difficulty && difficulty !== 'all') {
      params.push(difficulty);
      conditions.push(`q.difficulty = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const questionsSql = `
      SELECT q.id, q.question_number, q.domain, q.stem, q.context_reference, q.difficulty, q.marks,
             e.title as exam_title, e.code as exam_code, e.id as exam_id
      FROM questions q
      JOIN exams e ON q.exam_id = e.id
      ${whereClause}
      ORDER BY RANDOM()
      LIMIT $${params.length + 1};
    `;

    params.push(parseInt(questionCount, 10));

    let questionsRes = await query(questionsSql, params);

    // Fallback if specific domain query returns few questions
    if (questionsRes.rows.length === 0) {
      questionsRes = await query(`
        SELECT q.id, q.question_number, q.domain, q.stem, q.context_reference, q.difficulty, q.marks,
               e.title as exam_title, e.code as exam_code, e.id as exam_id
        FROM questions q
        JOIN exams e ON q.exam_id = e.id
        ORDER BY RANDOM()
        LIMIT $1;
      `, [parseInt(questionCount, 10)]);
    }

    // 3. Create practice session
    const sessionRes = await query(`
      INSERT INTO practice_sessions (user_id, title, category_code, domains, question_count, difficulty, mode, time_limit_minutes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, created_at;
    `, [
      req.user.id,
      `Custom Drill • ${catRes.rows[0]?.name || 'Curriculum'}`,
      track,
      JSON.stringify(domains),
      questionsRes.rows.length,
      difficulty,
      mode,
      timeLimitMinutes,
    ]);

    const session = sessionRes.rows[0];

    // 4. Create in-progress attempt for this drill session
    const primaryExamId = questionsRes.rows[0]?.exam_id || 1;
    const attemptRes = await query(`
      INSERT INTO exam_attempts (user_id, exam_id, practice_session_id, mode, status, started_at)
      VALUES ($1, $2, $3, 'drill', 'in_progress', NOW())
      RETURNING id, started_at;
    `, [req.user.id, primaryExamId, session.id]);

    const attemptId = attemptRes.rows[0].id;

    // Attach options WITHOUT answer keys
    const drillQuestions = [];
    for (const q of questionsRes.rows) {
      const optionsRes = await query(`
        SELECT option_letter, option_text, subtext
        FROM answer_options
        WHERE question_id = $1
        ORDER BY option_letter ASC;
      `, [q.id]);

      drillQuestions.push({
        ...q,
        options: optionsRes.rows,
      });
    }

    res.json({
      sessionId: session.id,
      attemptId,
      track,
      mode,
      timeLimitMinutes: mode === 'timed' ? timeLimitMinutes : null,
      questionCount: drillQuestions.length,
      questions: drillQuestions,
    });
  } catch (error) {
    console.error('Custom drill error:', error);
    res.status(500).json({ error: 'Failed to generate custom drill session.' });
  }
});

// Student Dashboard Metrics (Matches Stitch Screen ethio_exam_hall_student_dashboard)
router.get('/student-dashboard', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Fetch recent attempts
    const recentAttemptsRes = await query(`
      SELECT a.id, a.exam_id, a.mode, a.score, a.total_possible, a.percentage, a.passed,
             a.percentile, a.time_spent_seconds, a.submitted_at,
             e.title as exam_title, e.code as exam_code, e.subject, ec.name as category_name
      FROM exam_attempts a
      LEFT JOIN exams e ON a.exam_id = e.id
      LEFT JOIN exam_categories ec ON e.category_id = ec.id
      WHERE a.user_id = $1 AND a.status = 'submitted'
      ORDER BY a.submitted_at DESC
      LIMIT 5;
    `, [userId]);

    // 2. Aggregate statistics
    const statsRes = await query(`
      SELECT 
        COUNT(id)::int as total_attempts,
        COALESCE(AVG(percentage), 0)::numeric(5,2) as avg_score,
        COALESCE(MAX(percentile), 0)::numeric(5,2) as top_percentile,
        COALESCE(SUM(time_spent_seconds), 0)::int as total_time_spent
      FROM exam_attempts
      WHERE user_id = $1 AND status = 'submitted';
    `, [userId]);

    const stats = statsRes.rows[0];

    // Total questions answered
    const questionsAnsweredRes = await query(`
      SELECT COUNT(aa.id)::int as total_questions_answered,
             COUNT(CASE WHEN aa.is_correct = TRUE THEN 1 END)::int as total_correct
      FROM attempt_answers aa
      JOIN exam_attempts a ON aa.attempt_id = a.id
      WHERE a.user_id = $1;
    `, [userId]);

    const questionStats = questionsAnsweredRes.rows[0];

    // 3. Curated Recommendations for candidate's target track
    const targetTrack = req.user.target_track || 'exit';
    const curatedRes = await query(`
      SELECT e.id, e.title, e.code, e.subject, e.year_ec, e.total_questions, e.time_limit_minutes,
             e.access_tier, ec.name as category_name, ec.code as category_code
      FROM exams e
      JOIN exam_categories ec ON e.category_id = ec.id
      WHERE ec.code = $1 AND e.status = 'published'
      ORDER BY e.year_ec DESC, e.id DESC
      LIMIT 4;
    `, [targetTrack]);

    // 4. Saved Bookmarks
    const bookmarksRes = await query(`
      SELECT e.id, e.title, e.code, e.year_ec, e.subject, e.access_tier, ec.name as category_name
      FROM bookmarks b
      JOIN exams e ON b.exam_id = e.id
      JOIN exam_categories ec ON e.category_id = ec.id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
      LIMIT 4;
    `, [userId]);

    // 5. Active Subscription
    const subRes = await query(`
      SELECT us.*, sp.name as plan_name, sp.code as plan_code
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = $1 AND us.status = 'active' AND us.expires_at > NOW()
      ORDER BY us.expires_at DESC LIMIT 1;
    `, [userId]);

    const activeSubscription = subRes.rows[0] || null;

    res.json({
      candidate: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        candidate_id: req.user.candidate_id,
        institution: req.user.institution,
        target_track: targetTrack,
        is_verified: req.user.is_verified,
        has_pro_access: Boolean(activeSubscription) || req.user.role === 'admin' || req.user.role === 'superadmin',
        active_subscription: activeSubscription,
      },
      readiness: {
        score: parseFloat(stats.avg_score) || 78.0,
        label: parseFloat(stats.avg_score) >= 70 ? 'Competitive Threshold • High Readiness' : 'Developing Competency',
        percentile: parseFloat(stats.top_percentile) || 89.4,
        totalAttempts: stats.total_attempts,
        studyHours: (stats.total_time_spent / 3600).toFixed(1),
        questionsAnswered: questionStats.total_questions_answered,
        accuracy: questionStats.total_questions_answered > 0 
          ? Math.round((questionStats.total_correct / questionStats.total_questions_answered) * 100) 
          : 0,
      },
      recentSessions: recentAttemptsRes.rows,
      curatedExams: curatedRes.rows,
      bookmarks: bookmarksRes.rows,
    });
  } catch (error) {
    console.error('Student dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch student dashboard metrics.' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { authenticate } = require('../middleware/auth');
const { gradeAttempt } = require('../services/scoring.service');

// Start an Examination Session
router.post('/start', authenticate, async (req, res) => {
  try {
    const { examId, mode = 'mock' } = req.body;
    if (!examId) {
      return res.status(400).json({ error: 'examId is required to start an exam.' });
    }

    // 1. Fetch exam
    const examRes = await query('SELECT * FROM exams WHERE id = $1', [examId]);
    if (examRes.rows.length === 0) {
      return res.status(404).json({ error: 'Exam not found.' });
    }
    const exam = examRes.rows[0];

    // 2. Entitlement verification
    if (exam.access_tier === 'pro' && req.user.role === 'student') {
      const subRes = await query(`
        SELECT id FROM user_subscriptions 
        WHERE user_id = $1 AND status = 'active' AND expires_at > NOW()
      `, [req.user.id]);

      if (subRes.rows.length === 0) {
        return res.status(403).json({
          error: 'This examination is part of the Pro Institutional Access track. Please upgrade your subscription to access.',
          requires_pro: true,
        });
      }
    }

    // 3. Create or resume exam attempt
    // Check if there is already an in-progress attempt for this exam
    let attemptId;
    let startedAt;
    const existingRes = await query(`
      SELECT id, started_at FROM exam_attempts 
      WHERE user_id = $1 AND exam_id = $2 AND status = 'in_progress'
      ORDER BY started_at DESC LIMIT 1
    `, [req.user.id, examId]);

    if (existingRes.rows.length > 0) {
      attemptId = existingRes.rows[0].id;
      startedAt = existingRes.rows[0].started_at;
    } else {
      const newAttemptRes = await query(`
        INSERT INTO exam_attempts (user_id, exam_id, mode, status, started_at)
        VALUES ($1, $2, $3, 'in_progress', NOW())
        RETURNING id, started_at;
      `, [req.user.id, examId, mode]);
      attemptId = newAttemptRes.rows[0].id;
      startedAt = newAttemptRes.rows[0].started_at;
    }

    // 4. Fetch questions and options WITHOUT authoritative is_correct keys!
    const questionsRes = await query(`
      SELECT id, question_number, domain, stem, context_reference, difficulty, marks
      FROM questions
      WHERE exam_id = $1
      ORDER BY question_number ASC;
    `, [examId]);

    const questions = [];
    for (const q of questionsRes.rows) {
      const optionsRes = await query(`
        SELECT option_letter, option_text, subtext
        FROM answer_options
        WHERE question_id = $1
        ORDER BY option_letter ASC;
      `, [q.id]);

      questions.push({
        ...q,
        options: optionsRes.rows,
      });
    }

    // 5. Fetch any existing answers/flags for resuming
    const savedAnswersRes = await query(`
      SELECT question_id, selected_option, is_flagged
      FROM attempt_answers
      WHERE attempt_id = $1;
    `, [attemptId]);

    const savedAnswers = {};
    savedAnswersRes.rows.forEach(a => {
      savedAnswers[a.question_id] = {
        selected_option: a.selected_option,
        is_flagged: a.is_flagged,
      };
    });

    res.json({
      attemptId,
      startedAt,
      exam: {
        id: exam.id,
        title: exam.title,
        code: exam.code,
        booklet_code: exam.booklet_code,
        time_limit_minutes: exam.time_limit_minutes,
        total_questions: exam.total_questions,
        passing_score: exam.passing_score,
      },
      candidate: {
        name: req.user.name,
        candidate_id: req.user.candidate_id,
        institution: req.user.institution,
      },
      questions,
      savedAnswers,
    });
  } catch (error) {
    console.error('Error starting attempt:', error);
    res.status(500).json({ error: 'Failed to initialize exam session.' });
  }
});

// Save intermediate progress during exam (auto-save every 10-30s)
router.post('/:id/save-progress', authenticate, async (req, res) => {
  try {
    const attemptId = parseInt(req.params.id, 10);
    const { answers, timeSpentSeconds } = req.body;

    // Verify ownership
    const attemptRes = await query('SELECT id, status FROM exam_attempts WHERE id = $1 AND user_id = $2', [attemptId, req.user.id]);
    if (attemptRes.rows.length === 0) {
      return res.status(404).json({ error: 'Attempt not found or unauthorized.' });
    }
    if (attemptRes.rows[0].status !== 'in_progress') {
      return res.status(400).json({ error: 'Attempt is already submitted or closed.' });
    }

    // Upsert answers
    if (answers && typeof answers === 'object') {
      for (const [questionIdStr, data] of Object.entries(answers)) {
        const questionId = parseInt(questionIdStr, 10);
        const selected = data.selected_option || null;
        const isFlagged = Boolean(data.is_flagged);

        await query(`
          INSERT INTO attempt_answers (attempt_id, question_id, selected_option, is_flagged)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (attempt_id, question_id) 
          DO UPDATE SET selected_option = $3, is_flagged = $4, answered_at = NOW();
        `, [attemptId, questionId, selected, isFlagged]);
      }
    }

    if (timeSpentSeconds) {
      await query('UPDATE exam_attempts SET time_spent_seconds = $1 WHERE id = $2', [parseInt(timeSpentSeconds, 10), attemptId]);
    }

    res.json({ success: true, savedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Save progress error:', error);
    res.status(500).json({ error: 'Failed to save progress.' });
  }
});

// Authoritative Submission & Scoring
router.post('/:id/submit', authenticate, async (req, res) => {
  try {
    const attemptId = parseInt(req.params.id, 10);
    const { answers, timeSpentSeconds } = req.body;

    // Verify ownership
    const attemptRes = await query('SELECT id, status FROM exam_attempts WHERE id = $1 AND user_id = $2', [attemptId, req.user.id]);
    if (attemptRes.rows.length === 0) {
      return res.status(404).json({ error: 'Attempt not found or unauthorized.' });
    }

    // Save final answers
    if (answers && typeof answers === 'object') {
      for (const [questionIdStr, data] of Object.entries(answers)) {
        const questionId = parseInt(questionIdStr, 10);
        const selected = data.selected_option || null;
        const isFlagged = Boolean(data.is_flagged);

        await query(`
          INSERT INTO attempt_answers (attempt_id, question_id, selected_option, is_flagged)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (attempt_id, question_id) 
          DO UPDATE SET selected_option = $3, is_flagged = $4;
        `, [attemptId, questionId, selected, isFlagged]);
      }
    }

    if (timeSpentSeconds) {
      await query('UPDATE exam_attempts SET time_spent_seconds = $1 WHERE id = $2', [parseInt(timeSpentSeconds, 10), attemptId]);
    }

    // Authoritative Server-Side Scoring
    const diagnosticReport = await gradeAttempt(attemptId);

    res.json({
      success: true,
      report: diagnosticReport,
    });
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({ error: 'Authoritative exam grading failed.' });
  }
});

// Get Diagnostic Score Report & Performance Analytics
router.get('/:id/report', authenticate, async (req, res) => {
  try {
    const attemptId = parseInt(req.params.id, 10);
    const attemptRes = await query('SELECT id, user_id, status FROM exam_attempts WHERE id = $1', [attemptId]);

    if (attemptRes.rows.length === 0) {
      return res.status(404).json({ error: 'Attempt report not found.' });
    }

    if (attemptRes.rows[0].user_id !== req.user.id && req.user.role === 'student') {
      return res.status(403).json({ error: 'Unauthorized to view this report.' });
    }

    const report = await gradeAttempt(attemptId);
    res.json(report);
  } catch (error) {
    console.error('Report fetch error:', error);
    res.status(500).json({ error: 'Failed to retrieve diagnostic score report.' });
  }
});

// Candidate Attempt History
router.get('/my/history', authenticate, async (req, res) => {
  try {
    const historyRes = await query(`
      SELECT a.*, e.title as exam_title, e.code as exam_code, e.subject, ec.name as category_name
      FROM exam_attempts a
      JOIN exams e ON a.exam_id = e.id
      JOIN exam_categories ec ON e.category_id = ec.id
      WHERE a.user_id = $1 AND a.status = 'submitted'
      ORDER BY a.submitted_at DESC
      LIMIT 20;
    `, [req.user.id]);

    res.json(historyRes.rows);
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch exam history.' });
  }
});

module.exports = router;

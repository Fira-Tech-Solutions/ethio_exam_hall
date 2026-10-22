const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { authenticate, requireRole } = require('../middleware/auth');

// Protect all admin routes
router.use(authenticate, requireRole('admin', 'superadmin'));

// Admin Dashboard Overview Metrics
router.get('/overview', async (req, res) => {
  try {
    const examStats = await query(`
      SELECT 
        COUNT(id)::int as total_exams,
        COUNT(CASE WHEN status = 'published' THEN 1 END)::int as published_exams,
        COUNT(CASE WHEN status = 'review' THEN 1 END)::int as pending_review
      FROM exams;
    `);

    const questionStats = await query(`
      SELECT COUNT(id)::int as total_questions,
             COUNT(CASE WHEN verified_status = TRUE THEN 1 END)::int as verified_questions
      FROM questions;
    `);

    const userStats = await query(`
      SELECT COUNT(id)::int as total_users,
             COUNT(CASE WHEN role = 'student' THEN 1 END)::int as student_count
      FROM users;
    `);

    const disputeStats = await query(`
      SELECT COUNT(id)::int as total_disputes,
             COUNT(CASE WHEN status = 'open' OR status = 'reviewing' THEN 1 END)::int as active_disputes
      FROM moderation_reports;
    `);

    const revenueStats = await query(`
      SELECT COALESCE(SUM(amount), 0)::numeric(10,2) as total_revenue
      FROM payment_transactions
      WHERE status = 'completed';
    `);

    res.json({
      systemStatus: 'Production DataStore Live',
      syncLatency: '24ms',
      superAdmin: req.user.name,
      metrics: {
        totalExams: examStats.rows[0].total_exams,
        publishedExams: examStats.rows[0].published_exams,
        pendingReview: examStats.rows[0].pending_review,
        totalQuestions: questionStats.rows[0].total_questions,
        verifiedQuestions: questionStats.rows[0].verified_questions,
        totalCandidates: userStats.rows[0].student_count,
        activeDisputes: disputeStats.rows[0].active_disputes,
        totalRevenueEtb: revenueStats.rows[0].total_revenue,
      },
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    res.status(500).json({ error: 'Failed to fetch admin overview.' });
  }
});

// Admin Exams List
router.get('/exams', async (req, res) => {
  try {
    const examsRes = await query(`
      SELECT e.*, ec.name as category_name,
             (SELECT COUNT(id)::int FROM questions WHERE exam_id = e.id) as question_count,
             d.file_name, d.file_size, d.total_pages
      FROM exams e
      JOIN exam_categories ec ON e.category_id = ec.id
      LEFT JOIN exam_documents d ON e.id = d.exam_id
      ORDER BY e.created_at DESC;
    `);
    res.json(examsRes.rows);
  } catch (error) {
    console.error('Admin exams fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch administrative exams.' });
  }
});

// Create New Exam Resource
router.post('/exams', async (req, res) => {
  try {
    const {
      categoryId, code, title, amharicTitle, yearEc, yearGc, subject,
      institution, timeLimitMinutes, totalQuestions, passingScore,
      accessTier = 'free', status = 'published', curriculumDomain,
      bookletCode, sourceAttribution, redistributionStatus = 'public_domain'
    } = req.body;

    if (!code || !title || !subject) {
      return res.status(400).json({ error: 'Exam code, title, and subject are required.' });
    }

    const insertRes = await query(`
      INSERT INTO exams (
        category_id, code, title, amharic_title, year_ec, year_gc, subject, institution,
        time_limit_minutes, total_questions, passing_score, access_tier, status,
        curriculum_domain, booklet_code, source_attribution, redistribution_status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *;
    `, [
      categoryId || 1, code.trim(), title.trim(), amharicTitle,
      yearEc || 2016, yearGc || 2024, subject.trim(),
      institution || 'Ministry of Education (MoE)',
      timeLimitMinutes || 120, totalQuestions || 100, passingScore || 50.0,
      accessTier, status, curriculumDomain, bookletCode,
      sourceAttribution, redistributionStatus
    ]);

    const newExam = insertRes.rows[0];

    // Record audit log
    await query(`
      INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details)
      VALUES ($1, 'CREATE_EXAM', 'exams', $2, $3)
    `, [req.user.id, newExam.id, JSON.stringify({ code: newExam.code, title: newExam.title })]);

    res.status(201).json(newExam);
  } catch (error) {
    console.error('Create exam error:', error);
    res.status(500).json({ error: 'Failed to create exam.' });
  }
});

// Admin Single Exam Detail
router.get('/exams/:id', async (req, res) => {
  try {
    const examId = parseInt(req.params.id, 10);
    const examRes = await query(`
      SELECT e.*, ec.name as category_name,
             (SELECT COUNT(id)::int FROM questions WHERE exam_id = e.id) as question_count,
             d.file_name, d.file_size, d.total_pages
      FROM exams e
      JOIN exam_categories ec ON e.category_id = ec.id
      LEFT JOIN exam_documents d ON e.id = d.exam_id
      WHERE e.id = $1;
    `, [examId]);

    if (examRes.rows.length === 0) {
      return res.status(404).json({ error: 'Exam not found.' });
    }

    res.json(examRes.rows[0]);
  } catch (error) {
    console.error('Fetch single exam error:', error);
    res.status(500).json({ error: 'Failed to fetch exam details.' });
  }
});

// Update Exam Status & Complete Details
router.put('/exams/:id', async (req, res) => {
  try {
    const examId = parseInt(req.params.id, 10);
    const {
      status, accessTier, title, amharicTitle, passingScore, code, subject,
      institution, timeLimitMinutes, totalQuestions, yearEc, yearGc,
      curriculumDomain, bookletCode, sourceAttribution, redistributionStatus, categoryId
    } = req.body;

    const updateRes = await query(`
      UPDATE exams
      SET status = COALESCE($1, status),
          access_tier = COALESCE($2, access_tier),
          title = COALESCE($3, title),
          amharic_title = COALESCE($4, amharic_title),
          passing_score = COALESCE($5, passing_score),
          code = COALESCE($6, code),
          subject = COALESCE($7, subject),
          institution = COALESCE($8, institution),
          time_limit_minutes = COALESCE($9, time_limit_minutes),
          total_questions = COALESCE($10, total_questions),
          year_ec = COALESCE($11, year_ec),
          year_gc = COALESCE($12, year_gc),
          curriculum_domain = COALESCE($13, curriculum_domain),
          booklet_code = COALESCE($14, booklet_code),
          source_attribution = COALESCE($15, source_attribution),
          redistribution_status = COALESCE($16, redistribution_status),
          category_id = COALESCE($17, category_id),
          updated_at = NOW()
      WHERE id = $18
      RETURNING *;
    `, [
      status, accessTier, title, amharicTitle, passingScore, code, subject,
      institution, timeLimitMinutes, totalQuestions, yearEc, yearGc,
      curriculumDomain, bookletCode, sourceAttribution, redistributionStatus, categoryId,
      examId
    ]);

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ error: 'Exam not found.' });
    }

    // Record audit log
    await query(`
      INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details)
      VALUES ($1, 'UPDATE_EXAM', 'exams', $2, $3)
    `, [req.user.id, examId, JSON.stringify({ status, accessTier, title: updateRes.rows[0].title })]);

    res.json(updateRes.rows[0]);
  } catch (error) {
    console.error('Update exam error:', error);
    res.status(500).json({ error: 'Failed to update exam.' });
  }
});

// Delete Exam
router.delete('/exams/:id', async (req, res) => {
  try {
    const examId = parseInt(req.params.id, 10);

    const checkRes = await query('SELECT code, title FROM exams WHERE id = $1', [examId]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ error: 'Exam not found.' });
    }
    const examInfo = checkRes.rows[0];

    await query('BEGIN');
    // Cascade-delete attempt answers and attempts
    await query('DELETE FROM attempt_answers WHERE attempt_id IN (SELECT id FROM exam_attempts WHERE exam_id = $1)', [examId]);
    await query('DELETE FROM exam_attempts WHERE exam_id = $1', [examId]);
    await query('DELETE FROM bookmarks WHERE exam_id = $1', [examId]);
    await query('DELETE FROM moderation_reports WHERE exam_id = $1', [examId]);
    // Cascade-delete options and questions
    await query('DELETE FROM answer_options WHERE question_id IN (SELECT id FROM questions WHERE exam_id = $1)', [examId]);
    await query('DELETE FROM questions WHERE exam_id = $1', [examId]);
    await query('DELETE FROM exam_documents WHERE exam_id = $1', [examId]);
    await query('DELETE FROM exams WHERE id = $1', [examId]);
    await query('COMMIT');

    // Audit log
    await query(`
      INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details)
      VALUES ($1, 'DELETE_EXAM', 'exams', $2, $3)
    `, [req.user.id, examId, JSON.stringify(examInfo)]);

    res.json({ success: true, message: `Exam ${examInfo.code} deleted successfully.` });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Delete exam error:', error);
    res.status(500).json({ error: 'Failed to delete exam.' });
  }
});

// Bulk Update Exams Status (Bulk Verify, Batch Publish, Archive)
router.post('/exams/bulk-status', async (req, res) => {
  try {
    const { examIds = [], status } = req.body;
    if (!Array.isArray(examIds) || examIds.length === 0 || !status) {
      return res.status(400).json({ error: 'examIds array and status are required.' });
    }

    const updateRes = await query(`
      UPDATE exams
      SET status = $1, updated_at = NOW()
      WHERE id = ANY($2::int[])
      RETURNING id, code, status;
    `, [status, examIds]);

    await query(`
      INSERT INTO audit_logs (user_id, action, resource_type, details)
      VALUES ($1, 'BULK_STATUS_UPDATE', 'exams', $2)
    `, [req.user.id, JSON.stringify({ count: updateRes.rowCount, status, examIds })]);

    res.json({ success: true, updated: updateRes.rowCount, records: updateRes.rows });
  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({ error: 'Failed to update exams in bulk.' });
  }
});

// Authoritative Questions List for Admin (Includes is_correct without starting attempt)
router.get('/exams/:id/questions', async (req, res) => {
  try {
    const examId = parseInt(req.params.id, 10);

    const questionsRes = await query(`
      SELECT q.*, 
        COALESCE(
          json_agg(
            json_build_object(
              'id', ao.id,
              'letter', ao.option_letter,
              'text', ao.option_text,
              'subtext', ao.subtext,
              'isCorrect', ao.is_correct
            ) ORDER BY ao.option_letter
          ) FILTER (WHERE ao.id IS NOT NULL),
          '[]'::json
        ) as options
      FROM questions q
      LEFT JOIN answer_options ao ON q.id = ao.question_id
      WHERE q.exam_id = $1
      GROUP BY q.id
      ORDER BY q.question_number ASC, q.id ASC;
    `, [examId]);

    res.json(questionsRes.rows);
  } catch (error) {
    console.error('Admin questions fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch authoritative questions.' });
  }
});

// Ingest Question & Options
router.post('/exams/:id/questions', async (req, res) => {
  try {
    const examId = parseInt(req.params.id, 10);
    const {
      questionNumber, domain, stem, contextReference, difficulty = 'medium',
      marks = 1.0, verifiedStatus = true, explanation, options = []
    } = req.body;

    if (!stem || options.length === 0) {
      return res.status(400).json({ error: 'Question stem and at least one answer option are required.' });
    }

    await query('BEGIN');

    const qRes = await query(`
      INSERT INTO questions (exam_id, question_number, domain, stem, context_reference, difficulty, marks, verified_status, explanation)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id;
    `, [examId, questionNumber || 1, domain, stem, contextReference, difficulty, marks, verifiedStatus, explanation]);

    const questionId = qRes.rows[0].id;

    for (const opt of options) {
      await query(`
        INSERT INTO answer_options (question_id, option_letter, option_text, subtext, is_correct)
        VALUES ($1, $2, $3, $4, $5);
      `, [questionId, opt.letter, opt.text, opt.subtext || null, Boolean(opt.isCorrect)]);
    }

    // Update total questions on exam
    await query(`
      UPDATE exams 
      SET total_questions = (SELECT COUNT(id)::int FROM questions WHERE exam_id = $1)
      WHERE id = $1;
    `, [examId]);

    await query('COMMIT');
    res.status(201).json({ success: true, questionId });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Add question error:', error);
    res.status(500).json({ error: 'Failed to add question.' });
  }
});

// Update Existing Question & Options
router.put('/questions/:id', async (req, res) => {
  try {
    const questionId = parseInt(req.params.id, 10);
    const {
      questionNumber, domain, stem, contextReference, difficulty,
      marks, verifiedStatus, explanation, options = []
    } = req.body;

    await query('BEGIN');

    const updateRes = await query(`
      UPDATE questions
      SET question_number = COALESCE($1, question_number),
          domain = COALESCE($2, domain),
          stem = COALESCE($3, stem),
          context_reference = COALESCE($4, context_reference),
          difficulty = COALESCE($5, difficulty),
          marks = COALESCE($6, marks),
          verified_status = COALESCE($7, verified_status),
          explanation = COALESCE($8, explanation),
          updated_at = NOW()
      WHERE id = $9
      RETURNING *;
    `, [questionNumber, domain, stem, contextReference, difficulty, marks, verifiedStatus, explanation, questionId]);

    if (updateRes.rows.length === 0) {
      await query('ROLLBACK');
      return res.status(404).json({ error: 'Question not found.' });
    }

    if (Array.isArray(options) && options.length > 0) {
      // Re-sync options
      await query('DELETE FROM answer_options WHERE question_id = $1', [questionId]);
      for (const opt of options) {
        await query(`
          INSERT INTO answer_options (question_id, option_letter, option_text, subtext, is_correct)
          VALUES ($1, $2, $3, $4, $5);
        `, [questionId, opt.letter, opt.text, opt.subtext || null, Boolean(opt.isCorrect)]);
      }
    }

    await query('COMMIT');

    // Audit log
    await query(`
      INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details)
      VALUES ($1, 'UPDATE_QUESTION', 'questions', $2, $3)
    `, [req.user.id, questionId, JSON.stringify({ questionNumber, domain })]);

    res.json({ success: true, question: updateRes.rows[0] });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Update question error:', error);
    res.status(500).json({ error: 'Failed to update question.' });
  }
});

// Delete Question
router.delete('/questions/:id', async (req, res) => {
  try {
    const questionId = parseInt(req.params.id, 10);

    const qRes = await query('SELECT exam_id FROM questions WHERE id = $1', [questionId]);
    if (qRes.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found.' });
    }
    const examId = qRes.rows[0].exam_id;

    await query('BEGIN');
    await query('DELETE FROM answer_options WHERE question_id = $1', [questionId]);
    await query('DELETE FROM questions WHERE id = $1', [questionId]);
    await query(`
      UPDATE exams 
      SET total_questions = (SELECT COUNT(id)::int FROM questions WHERE exam_id = $1)
      WHERE id = $1;
    `, [examId]);
    await query('COMMIT');

    await query(`
      INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details)
      VALUES ($1, 'DELETE_QUESTION', 'questions', $2, $3)
    `, [req.user.id, questionId, JSON.stringify({ examId })]);

    res.json({ success: true, message: 'Question deleted successfully.' });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Delete question error:', error);
    res.status(500).json({ error: 'Failed to delete question.' });
  }
});

// Bulk Import Questions into Exam
router.post('/questions/bulk-import', async (req, res) => {
  try {
    const { examId, questions = [] } = req.body;
    if (!examId || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'examId and questions array are required.' });
    }

    await query('BEGIN');

    let insertedCount = 0;
    for (const q of questions) {
      const qRes = await query(`
        INSERT INTO questions (exam_id, question_number, domain, stem, context_reference, difficulty, marks, verified_status, explanation)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id;
      `, [
        examId,
        q.questionNumber || (insertedCount + 1),
        q.domain || 'General',
        q.stem,
        q.contextReference || null,
        q.difficulty || 'medium',
        q.marks || 1.0,
        true,
        q.explanation || null
      ]);

      const questionId = qRes.rows[0].id;
      if (Array.isArray(q.options)) {
        for (const opt of q.options) {
          await query(`
            INSERT INTO answer_options (question_id, option_letter, option_text, subtext, is_correct)
            VALUES ($1, $2, $3, $4, $5);
          `, [questionId, opt.letter, opt.text, opt.subtext || null, Boolean(opt.isCorrect)]);
        }
      }
      insertedCount++;
    }

    await query(`
      UPDATE exams 
      SET total_questions = (SELECT COUNT(id)::int FROM questions WHERE exam_id = $1)
      WHERE id = $1;
    `, [examId]);

    await query('COMMIT');

    await query(`
      INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details)
      VALUES ($1, 'BULK_IMPORT_QUESTIONS', 'exams', $2, $3)
    `, [req.user.id, examId, JSON.stringify({ count: insertedCount })]);

    res.json({ success: true, imported: insertedCount });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Bulk import error:', error);
    res.status(500).json({ error: 'Failed to bulk import questions.' });
  }
});

// Moderation & Disputes Queue
router.get('/moderation', async (req, res) => {
  try {
    const reportsRes = await query(`
      SELECT mr.*, e.title as exam_title, e.code as exam_code, u.name as reported_by_name, u.email as reported_by_email
      FROM moderation_reports mr
      JOIN exams e ON mr.exam_id = e.id
      LEFT JOIN users u ON mr.reported_by = u.id
      ORDER BY mr.created_at DESC;
    `);
    res.json(reportsRes.rows);
  } catch (error) {
    console.error('Moderation queue error:', error);
    res.status(500).json({ error: 'Failed to fetch moderation reports.' });
  }
});

// Resolve Moderation Dispute & optionally update correct key
router.post('/moderation/:id/resolve', async (req, res) => {
  try {
    const reportId = parseInt(req.params.id, 10);
    const { status, resolutionNotes, correctOptionLetter, questionId } = req.body;

    await query('BEGIN');

    // If accepting correction and target question/option specified, update the authoritative key
    if (status === 'resolved' && questionId && correctOptionLetter) {
      // Set all options to false first, then target option to true
      await query(`
        UPDATE answer_options
        SET is_correct = (option_letter = $1)
        WHERE question_id = $2;
      `, [correctOptionLetter.toUpperCase(), questionId]);

      // Mark question as verified
      await query(`
        UPDATE questions
        SET verified_status = TRUE, updated_at = NOW()
        WHERE id = $1;
      `, [questionId]);
    }

    const updateRes = await query(`
      UPDATE moderation_reports
      SET status = $1, resolution_notes = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING *;
    `, [status || 'resolved', resolutionNotes || 'Resolved by Super Administrator', reportId]);

    // Record audit log
    await query(`
      INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details)
      VALUES ($1, 'RESOLVE_DISPUTE', 'moderation_reports', $2, $3)
    `, [req.user.id, reportId, JSON.stringify({ status, resolutionNotes, correctOptionLetter, questionId })]);

    await query('COMMIT');
    res.json(updateRes.rows[0]);
  } catch (error) {
    await query('ROLLBACK');
    console.error('Resolve dispute error:', error);
    res.status(500).json({ error: 'Failed to resolve dispute.' });
  }
});

// Candidates & Users Management
router.get('/users', async (req, res) => {
  try {
    const usersRes = await query(`
      SELECT u.id, u.name, u.email, u.role, u.target_track, u.institution,
             u.candidate_id, u.is_verified, u.created_at,
             (SELECT avatar_url FROM user_external_identities WHERE user_id = u.id ORDER BY updated_at DESC LIMIT 1) as avatar_url,
             (SELECT COUNT(id)::int FROM exam_attempts WHERE user_id = u.id) as total_attempts,
             (SELECT COUNT(id)::int FROM user_subscriptions WHERE user_id = u.id AND status = 'active') as active_subscriptions
      FROM users u
      ORDER BY u.created_at DESC;
    `);
    res.json(usersRes.rows);
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ error: 'Failed to fetch candidate directory.' });
  }
});

// Update User (Role, Verification, Institution)
router.put('/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { role, isVerified, institution, candidateId, targetTrack } = req.body;

    const updateRes = await query(`
      UPDATE users
      SET role = COALESCE($1, role),
          is_verified = COALESCE($2, is_verified),
          institution = COALESCE($3, institution),
          candidate_id = COALESCE($4, candidate_id),
          target_track = COALESCE($5, target_track),
          updated_at = NOW()
      WHERE id = $6
      RETURNING id, name, email, role, institution, candidate_id, is_verified, target_track;
    `, [role, isVerified, institution, candidateId, targetTrack, userId]);

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    await query(`
      INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details)
      VALUES ($1, 'UPDATE_USER_RIGHTS', 'users', $2, $3)
    `, [req.user.id, userId, JSON.stringify({ role, isVerified, candidateId })]);

    res.json(updateRes.rows[0]);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user rights.' });
  }
});

// Transactions Ledger
router.get('/transactions', async (req, res) => {
  try {
    const txRes = await query(`
      SELECT tx.*, u.name as candidate_name, u.email as candidate_email, sp.name as plan_name
      FROM payment_transactions tx
      JOIN users u ON tx.user_id = u.id
      JOIN subscription_plans sp ON tx.plan_id = sp.id
      ORDER BY tx.created_at DESC;
    `);
    res.json(txRes.rows);
  } catch (error) {
    console.error('Transactions fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions.' });
  }
});

// Manually Verify / Approve Transaction (CBE Birr slip verification)
router.post('/transactions/:id/verify', async (req, res) => {
  try {
    const txId = parseInt(req.params.id, 10);

    await query('BEGIN');
    const txRes = await query(`
      SELECT * FROM payment_transactions WHERE id = $1
    `, [txId]);

    if (txRes.rows.length === 0) {
      await query('ROLLBACK');
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    const tx = txRes.rows[0];

    // Update transaction to completed
    const updatedTx = await query(`
      UPDATE payment_transactions
      SET status = 'completed', updated_at = NOW()
      WHERE id = $1
      RETURNING *;
    `, [txId]);

    // Activate subscription entitlement
    const planRes = await query('SELECT * FROM subscription_plans WHERE id = $1', [tx.plan_id]);
    const plan = planRes.rows[0];
    const durationDays = plan ? plan.duration_days : 30;

    await query(`
      INSERT INTO user_subscriptions (user_id, plan_id, start_date, end_date, status, auto_renew)
      VALUES ($1, $2, NOW(), NOW() + ($3 || ' days')::interval, 'active', FALSE)
      ON CONFLICT DO NOTHING;
    `, [tx.user_id, tx.plan_id, durationDays]);

    await query(`
      INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details)
      VALUES ($1, 'MANUAL_PAYMENT_VERIFY', 'payment_transactions', $2, $3)
    `, [req.user.id, txId, JSON.stringify({ reference: tx.reference_code, amount: tx.amount })]);

    await query('COMMIT');
    res.json({ success: true, transaction: updatedTx.rows[0] });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Verify transaction error:', error);
    res.status(500).json({ error: 'Failed to verify transaction.' });
  }
});

// Aviation Modules & Screening Exams
router.get('/aviation/modules', async (req, res) => {
  try {
    const aviationRes = await query(`
      SELECT e.*, 
             (SELECT COUNT(id)::int FROM questions WHERE exam_id = e.id) as question_count,
             (SELECT COUNT(id)::int FROM exam_attempts WHERE exam_id = e.id) as total_candidates_tested
      FROM exams e
      JOIN exam_categories ec ON e.category_id = ec.id
      WHERE ec.is_aviation = TRUE OR e.code LIKE 'EAA%'
      ORDER BY e.created_at DESC;
    `);
    res.json(aviationRes.rows);
  } catch (error) {
    console.error('Aviation modules error:', error);
    res.status(500).json({ error: 'Failed to fetch aviation modules.' });
  }
});

// Audit Trail & Logs
router.get('/audit-logs', async (req, res) => {
  try {
    const logsRes = await query(`
      SELECT al.*, u.name as user_name, u.role as user_role
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 100;
    `);
    res.json(logsRes.rows);
  } catch (error) {
    console.error('Audit logs fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs.' });
  }
});

module.exports = router;


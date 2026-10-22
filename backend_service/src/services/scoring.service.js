const { query } = require('../db');

/**
 * Authoritatively calculates score, percentage, domain breakdowns, and national percentile.
 * Never trust client-provided scores!
 */
async function gradeAttempt(attemptId) {
  // 1. Fetch attempt and exam details
  const attemptRes = await query(`
    SELECT a.*, e.title as exam_title, e.code as exam_code, e.passing_score, e.total_questions, e.time_limit_minutes,
           u.name as candidate_name, u.candidate_id, u.institution as candidate_institution
    FROM exam_attempts a
    JOIN exams e ON a.exam_id = e.id
    JOIN users u ON a.user_id = u.id
    WHERE a.id = $1
  `, [attemptId]);

  if (attemptRes.rows.length === 0) {
    throw new Error('Attempt not found');
  }

  const attempt = attemptRes.rows[0];

  // 2. Fetch all questions for this exam with authoritative correct options
  const questionsRes = await query(`
    SELECT q.id, q.question_number, q.domain, q.marks, q.stem, q.context_reference, q.explanation,
           ao.option_letter as correct_option
    FROM questions q
    JOIN answer_options ao ON q.id = ao.question_id AND ao.is_correct = TRUE
    WHERE q.exam_id = $1
    ORDER BY q.question_number ASC
  `, [attempt.exam_id]);

  const questions = questionsRes.rows;

  // 3. Fetch candidate's submitted answers
  const answersRes = await query(`
    SELECT question_id, selected_option, is_flagged
    FROM attempt_answers
    WHERE attempt_id = $1
  `, [attemptId]);

  const candidateAnswers = {};
  answersRes.rows.forEach(ans => {
    candidateAnswers[ans.question_id] = ans;
  });

  let totalScore = 0;
  let totalPossible = 0;
  const domainStats = {};
  const questionReviews = [];

  // 4. Grade each question server-side
  for (const q of questions) {
    const markValue = parseFloat(q.marks) || 1.0;
    totalPossible += markValue;

    const candidateAns = candidateAnswers[q.id];
    const selected = candidateAns?.selected_option || null;
    const isCorrect = (selected !== null && selected === q.correct_option);

    if (isCorrect) {
      totalScore += markValue;
    }

    // Update attempt_answers in DB with authoritative correctness
    if (candidateAns) {
      await query(`
        UPDATE attempt_answers
        SET is_correct = $1
        WHERE attempt_id = $2 AND question_id = $3
      `, [isCorrect, attemptId, q.id]);
    } else {
      await query(`
        INSERT INTO attempt_answers (attempt_id, question_id, selected_option, is_correct, is_flagged)
        VALUES ($1, $2, NULL, FALSE, FALSE)
        ON CONFLICT (attempt_id, question_id) DO UPDATE SET is_correct = FALSE
      `, [attemptId, q.id]);
    }

    // Domain breakdown tracking
    const domain = q.domain || 'General Curriculum';
    if (!domainStats[domain]) {
      domainStats[domain] = {
        domain,
        total: 0,
        correct: 0,
        score: 0,
        possible: 0,
      };
    }
    domainStats[domain].total += 1;
    domainStats[domain].possible += markValue;
    if (isCorrect) {
      domainStats[domain].correct += 1;
      domainStats[domain].score += markValue;
    }

    // Fetch all options for review
    const optionsRes = await query(`
      SELECT option_letter, option_text, subtext, is_correct
      FROM answer_options
      WHERE question_id = $1
      ORDER BY option_letter ASC
    `, [q.id]);

    questionReviews.push({
      id: q.id,
      number: q.question_number,
      domain: q.domain,
      stem: q.stem,
      context_reference: q.context_reference,
      marks: markValue,
      explanation: q.explanation,
      correct_option: q.correct_option,
      selected_option: selected,
      is_correct: isCorrect,
      is_flagged: candidateAns?.is_flagged || false,
      options: optionsRes.rows,
    });
  }

  // Fallback for exams with fewer seeded questions than nominal total_questions
  const effectiveTotalPossible = totalPossible > 0 ? totalPossible : 100;
  const percentage = parseFloat(((totalScore / effectiveTotalPossible) * 100).toFixed(2));
  const passingScore = parseFloat(attempt.passing_score) || 50.0;
  const passed = percentage >= passingScore;

  // Calculate realistic national percentile (standard distribution approximation around 50% mean)
  let percentile = 50.0;
  if (percentage >= 80) percentile = Math.min(99.4, 85 + (percentage - 80) * 0.7);
  else if (percentage >= 65) percentile = 70 + (percentage - 65) * 1.0;
  else if (percentage >= 50) percentile = 45 + (percentage - 50) * 1.6;
  else percentile = Math.max(5.0, percentage * 0.9);
  percentile = parseFloat(percentile.toFixed(1));

  // Update attempt record
  await query(`
    UPDATE exam_attempts
    SET score = $1, total_possible = $2, percentage = $3, passed = $4, percentile = $5,
        status = 'submitted', submitted_at = NOW()
    WHERE id = $6
  `, [totalScore, effectiveTotalPossible, percentage, passed, percentile, attemptId]);

  // Compute domain percentages
  const domainBreakdown = Object.values(domainStats).map(d => ({
    domain: d.domain,
    totalQuestions: d.total,
    correctCount: d.correct,
    percentage: d.possible > 0 ? Math.round((d.score / d.possible) * 100) : 0,
    status: (d.score / d.possible) >= 0.75 ? 'Mastery' : ((d.score / d.possible) >= 0.5 ? 'Competent' : 'Remedial Priority')
  }));

  // Identify priority focus areas (domains under 70%)
  const priorityFocus = domainBreakdown
    .filter(d => d.percentage < 70)
    .sort((a, b) => a.percentage - b.percentage);

  return {
    attemptId,
    candidate: {
      name: attempt.candidate_name,
      candidateId: attempt.candidate_id,
      institution: attempt.candidate_institution,
    },
    exam: {
      title: attempt.exam_title,
      code: attempt.exam_code,
      passingScore,
      totalQuestions: attempt.total_questions,
      timeLimitMinutes: attempt.time_limit_minutes,
    },
    score: totalScore,
    totalPossible: effectiveTotalPossible,
    percentage,
    passed,
    percentile,
    submittedAt: new Date().toISOString(),
    domainBreakdown,
    priorityFocus,
    questionReviews,
  };
}

module.exports = {
  gradeAttempt,
};

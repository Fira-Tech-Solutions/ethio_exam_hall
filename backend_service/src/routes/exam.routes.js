const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { optionalAuth, authenticate } = require('../middleware/auth');

// Get all exam categories
router.get('/categories', async (req, res) => {
  try {
    const categoriesRes = await query(`
      SELECT ec.*, COUNT(e.id)::int as exam_count
      FROM exam_categories ec
      LEFT JOIN exams e ON ec.id = e.category_id AND e.status = 'published'
      GROUP BY ec.id
      ORDER BY ec.display_order ASC;
    `);
    res.json(categoriesRes.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch exam categories.' });
  }
});

// Featured exams for homepage
router.get('/featured', async (req, res) => {
  try {
    const featuredRes = await query(`
      SELECT e.*, ec.name as category_name, ec.code as category_code, ec.icon as category_icon,
             d.total_pages, d.file_name
      FROM exams e
      JOIN exam_categories ec ON e.category_id = ec.id
      LEFT JOIN exam_documents d ON e.id = d.exam_id
      WHERE e.status = 'published'
      ORDER BY e.id ASC
      LIMIT 6;
    `);
    res.json(featuredRes.rows);
  } catch (error) {
    console.error('Error fetching featured exams:', error);
    res.status(500).json({ error: 'Failed to fetch featured exams.' });
  }
});

// Search & Filter Exam Discovery Library
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, subject, year, access_tier, search, sort, page = 1, limit = 12 } = req.query;

    const conditions = ["e.status = 'published'"];
    const params = [];

    if (category && category !== 'all') {
      params.push(category);
      conditions.push(`ec.code = $${params.length}`);
    }

    if (subject && subject !== 'all') {
      params.push(subject);
      conditions.push(`e.subject = $${params.length}`);
    }

    if (year && year !== 'all') {
      params.push(parseInt(year, 10));
      conditions.push(`e.year_ec = $${params.length}`);
    }

    if (access_tier && access_tier !== 'all') {
      params.push(access_tier);
      conditions.push(`e.access_tier = $${params.length}`);
    }

    if (search && search.trim() !== '') {
      params.push(`%${search.trim().toLowerCase()}%`);
      conditions.push(`(
        LOWER(e.title) LIKE $${params.length} OR 
        LOWER(e.code) LIKE $${params.length} OR 
        LOWER(e.subject) LIKE $${params.length} OR 
        LOWER(e.institution) LIKE $${params.length} OR 
        LOWER(COALESCE(e.curriculum_domain, '')) LIKE $${params.length}
      )`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    let orderBy = 'ORDER BY e.year_ec DESC, e.id DESC';
    if (sort === 'oldest') orderBy = 'ORDER BY e.year_ec ASC';
    else if (sort === 'title') orderBy = 'ORDER BY e.title ASC';
    else if (sort === 'questions') orderBy = 'ORDER BY e.total_questions DESC';

    // Count query
    const countSql = `
      SELECT COUNT(e.id)::int as total
      FROM exams e
      JOIN exam_categories ec ON e.category_id = ec.id
      ${whereClause}
    `;
    const countRes = await query(countSql, params);
    const totalItems = countRes.rows[0].total;

    // Items query with pagination
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    params.push(parseInt(limit, 10));
    params.push(offset);

    const itemsSql = `
      SELECT e.*, ec.name as category_name, ec.code as category_code, ec.icon as category_icon,
             d.total_pages, d.file_name,
             EXISTS(SELECT 1 FROM bookmarks b WHERE b.exam_id = e.id AND b.user_id = ${req.user ? req.user.id : -1}) as is_bookmarked
      FROM exams e
      JOIN exam_categories ec ON e.category_id = ec.id
      LEFT JOIN exam_documents d ON e.id = d.exam_id
      ${whereClause}
      ${orderBy}
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;

    const itemsRes = await query(itemsSql, params);

    res.json({
      exams: itemsRes.rows,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalItems,
        totalPages: Math.ceil(totalItems / parseInt(limit, 10)),
      },
    });
  } catch (error) {
    console.error('Error querying exams:', error);
    res.status(500).json({ error: 'Failed to search exams.' });
  }
});

// Exam Details by ID (Matches Stitch Screen exam_detail_document_preview)
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const examId = parseInt(req.params.id, 10);
    const examRes = await query(`
      SELECT e.*, ec.name as category_name, ec.code as category_code, ec.icon as category_icon,
             d.id as document_id, d.file_name, d.file_path, d.file_size, d.total_pages, d.watermark_text,
             d.source_url,
             EXISTS(SELECT 1 FROM bookmarks b WHERE b.exam_id = e.id AND b.user_id = ${req.user ? req.user.id : -1}) as is_bookmarked,
             (SELECT COUNT(id)::int FROM questions WHERE exam_id = e.id) as question_bank_count
      FROM exams e
      JOIN exam_categories ec ON e.category_id = ec.id
      LEFT JOIN exam_documents d ON e.id = d.exam_id
      WHERE e.id = $1;
    `, [examId]);

    if (examRes.rows.length === 0) {
      return res.status(404).json({ error: 'Examination resource not found.' });
    }

    const exam = examRes.rows[0];

    // Fetch related exams in same category
    const relatedRes = await query(`
      SELECT id, title, code, year_ec, subject, access_tier, total_questions
      FROM exams
      WHERE category_id = $1 AND id != $2 AND status = 'published'
      LIMIT 3;
    `, [exam.category_id, examId]);

    // Check user's entitlement
    let hasAccess = exam.access_tier === 'free';
    if (!hasAccess && req.user) {
      if (req.user.role === 'admin' || req.user.role === 'superadmin') {
        hasAccess = true;
      } else {
        const subRes = await query(`
          SELECT id FROM user_subscriptions 
          WHERE user_id = $1 AND status = 'active' AND expires_at > NOW()
        `, [req.user.id]);
        hasAccess = subRes.rows.length > 0;
      }
    }

    res.json({
      exam: {
        ...exam,
        user_has_access: hasAccess,
      },
      relatedExams: relatedRes.rows,
    });
  } catch (error) {
    console.error('Error fetching exam details:', error);
    res.status(500).json({ error: 'Failed to fetch exam details.' });
  }
});

// Bookmark Toggle
router.post('/:id/bookmark', authenticate, async (req, res) => {
  try {
    const examId = parseInt(req.params.id, 10);
    const existing = await query('SELECT id FROM bookmarks WHERE user_id = $1 AND exam_id = $2', [req.user.id, examId]);

    if (existing.rows.length > 0) {
      await query('DELETE FROM bookmarks WHERE user_id = $1 AND exam_id = $2', [req.user.id, examId]);
      return res.json({ bookmarked: false, message: 'Bookmark removed.' });
    } else {
      await query('INSERT INTO bookmarks (user_id, exam_id) VALUES ($1, $2)', [req.user.id, examId]);
      return res.json({ bookmarked: true, message: 'Exam bookmarked to your library.' });
    }
  } catch (error) {
    console.error('Bookmark error:', error);
    res.status(500).json({ error: 'Failed to update bookmark.' });
  }
});

// Get User Bookmarks
router.get('/user/bookmarks', authenticate, async (req, res) => {
  try {
    const bookmarksRes = await query(`
      SELECT e.*, ec.name as category_name, b.created_at as bookmarked_at
      FROM bookmarks b
      JOIN exams e ON b.exam_id = e.id
      JOIN exam_categories ec ON e.category_id = ec.id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC;
    `, [req.user.id]);
    res.json(bookmarksRes.rows);
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    res.status(500).json({ error: 'Failed to fetch bookmarks.' });
  }
});

// Public Universities Directory Endpoints
router.get('/universities/all', async (req, res) => {
  try {
    const unisRes = await query(`
      SELECT * FROM universities
      WHERE is_active = TRUE
      ORDER BY id ASC;
    `);
    res.json(unisRes.rows);
  } catch (error) {
    console.error('Error fetching universities:', error);
    res.status(500).json({ error: 'Failed to fetch universities.' });
  }
});

router.get('/universities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const isNum = !isNaN(id);
    const uniRes = await query(
      `SELECT * FROM universities WHERE ${isNum ? 'id = $1' : 'code = $1'} LIMIT 1;`,
      [isNum ? parseInt(id, 10) : id]
    );
    if (uniRes.rows.length === 0) {
      return res.status(404).json({ error: 'University not found.' });
    }
    res.json(uniRes.rows[0]);
  } catch (error) {
    console.error('Error fetching university:', error);
    res.status(500).json({ error: 'Failed to fetch university details.' });
  }
});

module.exports = router;

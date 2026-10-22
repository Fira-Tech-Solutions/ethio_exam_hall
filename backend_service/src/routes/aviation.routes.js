const express = require('express');
const router = express.Router();
const { query } = require('../db');

// Aviation Specialized Portal Overview & Disciplines
router.get('/disciplines', async (req, res) => {
  const disciplines = [
    {
      id: 'pilot_cadet',
      title: 'Commercial Pilot Cadet',
      code: 'EAA-CP-CADET',
      icon: 'flight_takeoff',
      description: 'Comprehensive aptitude covering flight physics, spatial orientation, rapid mental arithmetic, and multi-tasking.',
      passingRequirement: '70% Minimum Threshold',
      modulesCount: 14,
      totalQuestions: 850,
      badge: 'High Competition',
    },
    {
      id: 'amt',
      title: 'Aircraft Maintenance Technician (AMT)',
      code: 'EAA-AMT-EASA',
      icon: 'build',
      description: 'Airframe mechanics, turbine powerplant theory, basic avionics, and engineering workshop physics.',
      passingRequirement: '65% Technical Cutoff',
      modulesCount: 12,
      totalQuestions: 620,
      badge: 'EASA / ECAA Standard',
    },
    {
      id: 'cabin_crew',
      title: 'Cabin Crew & Flight Attendant',
      code: 'EAA-CC-RECRUIT',
      icon: 'airline_seat_recline_extra',
      description: 'English fluency, aviation situational judgment, customer service ethics, and emergency safety protocol aptitude.',
      passingRequirement: '75% Verbal & Situational',
      modulesCount: 8,
      totalQuestions: 450,
      badge: 'Customer Excellence',
    },
    {
      id: 'dispatch',
      title: 'Flight Operations & Dispatch',
      code: 'EAA-FOD-MET',
      icon: 'radar',
      description: 'Aviation meteorology, navigation radio aids, fuel planning algorithms, and air traffic control terminology.',
      passingRequirement: '70% ICAO Standard',
      modulesCount: 10,
      totalQuestions: 540,
      badge: 'Flight Operations',
    },
  ];

  res.json(disciplines);
});

// Aviation Exams
router.get('/exams', async (req, res) => {
  try {
    const examsRes = await query(`
      SELECT e.*, ec.name as category_name, ec.code as category_code,
             (SELECT COUNT(id)::int FROM questions WHERE exam_id = e.id) as question_count
      FROM exams e
      JOIN exam_categories ec ON e.category_id = ec.id
      WHERE ec.is_aviation = TRUE AND e.status = 'published'
      ORDER BY e.year_ec DESC, e.id ASC;
    `);

    res.json(examsRes.rows);
  } catch (error) {
    console.error('Aviation exams error:', error);
    res.status(500).json({ error: 'Failed to fetch aviation exams.' });
  }
});

// Aviation Portal Stats
router.get('/stats', async (req, res) => {
  res.json({
    activeCandidates: 2840,
    cadetPassRate: '88.4%',
    verifiedPastPapers: 42,
    partnerAcademies: ['Ethiopian Aviation University', 'Hawassa Pilot Training Center', 'African Civil Aviation Training'],
  });
});

module.exports = router;

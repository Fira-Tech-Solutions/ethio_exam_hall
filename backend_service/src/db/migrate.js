const fs = require('fs');
const path = require('path');
const { pool } = require('./index');

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('🔄 Running PostgreSQL migrations for Ethio Exam Hall...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    await client.query(sql);
    // Ensure existing databases allow null password_hash for OAuth/Telegram users
    await client.query('ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;');
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;');

    // Ensure 'freshman' exam category exists
    await client.query(`
      INSERT INTO exam_categories (code, name, amharic_name, description, icon, badge_text, is_aviation, display_order)
      VALUES ('freshman', 'Freshman Program Courses', 'የዩኒቨርሲቲ አንደኛ ዓመት የጋራ ትምህርቶች', 'First-year common higher education courses across Ethiopian universities.', 'menu_book', 'Freshman Track', FALSE, 7)
      ON CONFLICT (code) DO NOTHING;
    `);

    // Ensure initial universities exist if table is empty
    const uniCount = await client.query('SELECT COUNT(id)::int as count FROM universities;');
    if (uniCount.rows[0].count === 0) {
      console.log('🏛️ Initializing default universities directory in database...');
      const defaultUnis = [
        {
          code: 'aau',
          name: 'Addis Ababa University',
          amharic_name: 'አዲስ አበባ ዩኒቨርሲቲ',
          short_code: 'AAU',
          generation: 'First Generation / Autonomous Flagship',
          category: 'Research Flagship',
          established: 1950,
          president: 'Dr. Samuel Kifle (Interim)',
          main_campus: 'Sidist Kilo, Addis Ababa',
          city: 'Addis Ababa',
          logo_url: '/images/inst_logos/aau.png',
          accent: 'from-blue-600 to-indigo-800',
          crest_color: 'bg-blue-900',
          campuses: ['Sidist Kilo (Main)', 'Arat Kilo (Natural Sciences)', 'Black Lion (Health Sciences)', 'AAiT (Technology)', 'FBE (Business)', 'Yared School of Music'],
          students: '48,000+',
          climate: 'Temperate highland (16°C - 24°C)',
          badge: 'Premier National University',
          map_coords: { lat: 9.0463, lng: 38.7618 },
          map_query: 'Addis+Ababa+University+Sidist+Kilo+Ethiopia',
          overview: 'The oldest and most prestigious higher learning institution in Ethiopia. AAU functions as an autonomous research flagship university with world-renowned faculties in medicine, jurisprudence, engineering (AAiT), and computational sciences.',
          unique_features: [
            'Tikur Anbessa (Black Lion) Hospital — Largest tertiary specialized referral hospital and medical training center in Ethiopia.',
            'Addis Ababa Institute of Technology (AAiT) — Premier engineering campus with railway, power, and software faculties.',
            'Institute of Ethiopian Studies (IES) & National Ethnographic Museum located on main campus.',
            'Only university in Ethiopia designated as fully autonomous by the Ministry of Education.',
          ],
          gallery: [
            { url: '/images/categories/aau-gat.jpg', caption: 'AAU Ras Makonnen Hall & Historic Campus' },
            { url: '/images/categories/exit-exam.jpg', caption: 'Kennedy Memorial Library & Study Halls' },
            { url: '/images/categories/tvet-coc.jpg', caption: 'AAiT Specialized Technology Workshops' },
          ],
          faculties: [
            { name: 'College of Health Sciences', depts: ['Medicine (MD)', 'Dental Medicine', 'Pharmacy', 'Nursing', 'Public Health', 'Medical Radiologic Technology'] },
            { name: 'Addis Ababa Institute of Technology (AAiT)', depts: ['Software Engineering', 'Electrical & Computer Eng.', 'Mechanical Eng.', 'Civil & Environmental Eng.', 'Chemical Eng.', 'Biomedical Eng.'] },
            { name: 'College of Law & Governance', depts: ['Public Law', 'Private Law', 'International Law', 'Human Rights', 'Federal Studies'] },
            { name: 'College of Natural & Computational Sciences', depts: ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Biotechnology', 'Statistics'] },
            { name: 'College of Business & Economics (FBE)', depts: ['Accounting & Finance', 'Economics', 'Management', 'Marketing Management', 'Public Administration'] },
          ],
          cutoffs: 'Top national ranking; minimum 480+ in ESUEE for engineering & health science tracks.',
        },
        {
          code: 'astu',
          name: 'Adama Science & Technology University',
          amharic_name: 'አዳማ ሳይንስና ቴክኖሎጂ ዩኒቨርሲቲ',
          short_code: 'ASTU',
          generation: 'Science & Technology University',
          category: 'STEM Excellence',
          established: 1993,
          president: 'Dr. Lemi Guta',
          main_campus: 'Adama, Oromia (Near Express Way)',
          city: 'Adama',
          logo_url: '/images/inst_logos/astu.png',
          accent: 'from-emerald-600 to-teal-800',
          crest_color: 'bg-emerald-900',
          campuses: ['Main Technological Campus (Adama)'],
          students: '18,000+',
          climate: 'Warm semi-arid rift valley (20°C - 30°C)',
          badge: 'Center of Excellence (CoE)',
          map_coords: { lat: 8.5614, lng: 39.2905 },
          map_query: 'Adama+Science+and+Technology+University+Ethiopia',
          overview: 'Specialized national Center of Excellence directly chartered to produce elite scientists, researchers, and engineers. ASTU operates with specialized research institutes, advanced robotics laboratories, and incubation hubs.',
          unique_features: [
            'Center of Excellence in Advanced Materials Science and Engineering.',
            'Center of Excellence in Space Science, Satellite Technology & Robotics.',
            'High-speed supercomputing cluster and clean-room fabrication research facilities.',
            'Specialized entrance selection test administered in addition to national matriculation.',
          ],
          gallery: [
            { url: '/images/categories/tvet-coc.jpg', caption: 'Advanced Materials & Robotics Labs' },
            { url: '/images/categories/esuee-grade12.jpg', caption: 'Central Technology Library & ICT Hub' },
          ],
          faculties: [
            { name: 'School of Electrical & Information Engineering', depts: ['Computer Science & Eng.', 'Electronics & Communications Eng.', 'Control & Instrumentation', 'Power Systems Engineering'] },
            { name: 'School of Mechanical, Chemical & Materials Eng.', depts: ['Mechanical Design & Manufacturing', 'Aerospace Engineering', 'Materials Science', 'Chemical Process Engineering'] },
            { name: 'School of Civil Engineering & Architecture', depts: ['Structural Engineering', 'Water Resources Eng.', 'Architecture & Urban Planning', 'Geotechnical Eng.'] },
            { name: 'School of Applied Natural Sciences', depts: ['Applied Physics', 'Industrial Chemistry', 'Computational Mathematics', 'Applied Geology'] },
          ],
          cutoffs: 'Special ASTU Entrance Aptitude Exam required; top 5% national STEM percentiles.',
        },
        {
          code: 'aastu',
          name: 'Addis Ababa Science & Technology University',
          amharic_name: 'አዲስ አበባ ሳይንስና ቴክኖሎጂ ዩኒቨርሲቲ',
          short_code: 'AASTU',
          generation: 'Science & Technology University',
          category: 'Applied Innovation',
          established: 2011,
          president: 'Dr. Dereje Engida',
          main_campus: 'Kilinto Industrial Zone, Addis Ababa',
          city: 'Addis Ababa',
          logo_url: '/images/inst_logos/Ministry_of_Education_(Ethiopia).png',
          accent: 'from-amber-600 to-yellow-800',
          crest_color: 'bg-amber-900',
          campuses: ['Kilinto Tech Park Campus'],
          students: '12,000+',
          climate: 'Mild highland climate (15°C - 23°C)',
          badge: 'Tech Innovation Hub',
          map_coords: { lat: 8.8872, lng: 38.8078 },
          map_query: 'Addis+Ababa+Science+and+Technology+University+Kilinto',
          overview: 'Strategically located within the Kilinto industrial innovation corridor, AASTU bridges university research with Ethiopian industrial development, pharmaceutical manufacturing, and software hubs.',
          unique_features: [
            'Center of Excellence in Artificial Intelligence, Big Data & High Performance Computing.',
            'Center of Excellence in Mineral Exploration & Mineral Processing.',
            'Biotechnology and Vaccine Research Incubation Center.',
            'Direct industry apprenticeships with Ethiopian industrial parks.',
          ],
          gallery: [
            { url: '/images/categories/exit-exam.jpg', caption: 'Kilinto Innovation & Incubator Complex' },
            { url: '/images/categories/banking-aptitude.jpg', caption: 'AI & Machine Learning Innovation Center' },
          ],
          faculties: [
            { name: 'College of Electrical & Mechanical Engineering', depts: ['Software Engineering', 'Electromechanical Engineering', 'Automotive Eng.', 'Robotics & Automation'] },
            { name: 'College of Architecture & Civil Engineering', depts: ['Civil Engineering', 'Mining Engineering', 'Architecture', 'Construction Tech & Management'] },
            { name: 'College of Biological & Chemical Engineering', depts: ['Biotechnology', 'Environmental Engineering', 'Food Process Engineering'] },
            { name: 'College of Applied Sciences', depts: ['Industrial Mathematics', 'Geology', 'Nanotechnology', 'Industrial Chemistry'] },
          ],
          cutoffs: 'AASTU Institutional Entrance Exam + Grade 12 national matriculation qualification.',
        },
        {
          code: 'ju',
          name: 'Jimma University',
          amharic_name: 'ጅማ ዩኒቨርሲቲ',
          short_code: 'JU',
          generation: 'First Generation Flagship',
          category: 'Community-Based Education',
          established: 1999,
          president: 'Dr. Jemal Abafita',
          main_campus: 'Jimma, Oromia',
          city: 'Jimma',
          logo_url: '/images/inst_logos/ju.png',
          accent: 'from-teal-600 to-emerald-900',
          crest_color: 'bg-teal-900',
          campuses: ['Main Campus', 'Kite Kebele Campus', 'Jimma Institute of Technology (JiT)', 'Agriculture & Veterinary Campus'],
          students: '42,000+',
          climate: 'Lush tropical highland (18°C - 28°C)',
          badge: 'Community Pioneer',
          map_coords: { lat: 7.6756, lng: 36.8564 },
          map_query: 'Jimma+University+Main+Campus+Jimma+Ethiopia',
          overview: 'Internationally recognized for Community-Based Education (CBE) and the "We Are In The Community" philosophy.',
          unique_features: [
            'Jimma University Medical Center (JUMC) — Premier teaching and referral hospital serving Southwest Ethiopia.',
            'Jimma Institute of Technology (JiT) — Cutting-edge research in hydraulic, civil, and software engineering.',
          ],
          gallery: [
            { url: '/images/categories/esuee-grade12.jpg', caption: 'Jimma Central Botanical & Teaching Campus' },
          ],
          faculties: [
            { name: 'Faculty of Medical Sciences', depts: ['Medicine (MD)', 'Dentistry', 'Anesthesia', 'Ophthalmology', 'Medical Laboratory Sciences'] },
            { name: 'Jimma Institute of Technology (JiT)', depts: ['Biomedical Engineering', 'Computer Science & Software', 'Civil & Environmental Eng.'] },
          ],
          cutoffs: 'MoE national matriculation quota; strong medical sciences preference.',
        },
        {
          code: 'hu',
          name: 'Hawassa University',
          amharic_name: 'ሀዋሳ ዩኒቨርሲቲ',
          short_code: 'HU',
          generation: 'First Generation Comprehensive',
          category: 'Applied Innovation',
          established: 2000,
          president: 'Dr. Ayano Berasso',
          main_campus: 'Hawassa, Sidama',
          city: 'Hawassa',
          logo_url: '/images/inst_logos/hu.png',
          accent: 'from-sky-600 to-cyan-900',
          crest_color: 'bg-sky-900',
          campuses: ['Main Campus', 'College of Medicine & Health Sciences', 'Wondo Genet College of Forestry', 'IOT (Institute of Tech)'],
          students: '36,000+',
          climate: 'Pleasant lakeside rift valley (17°C - 27°C)',
          badge: 'Forestry & Lake Ecology Hub',
          map_coords: { lat: 7.0504, lng: 38.4855 },
          map_query: 'Hawassa+University+Main+Campus+Hawassa+Ethiopia',
          overview: 'Renowned for agricultural sciences, agro-forestry at Wondo Genet, and high-impact medical research.',
          unique_features: [
            'Wondo Genet College of Forestry and Natural Resources.',
            'Hawassa Comprehensive Specialized Hospital.',
          ],
          gallery: [
            { url: '/images/categories/tvet-coc.jpg', caption: 'Hawassa Lakeside ICT & Research Center' },
          ],
          faculties: [
            { name: 'College of Medicine & Health Sciences', depts: ['Medicine (MD)', 'Public Health', 'Pharmacy', 'Nursing', 'Midwifery'] },
            { name: 'Institute of Technology (IOT)', depts: ['Civil Engineering', 'Electrical & Computer Engineering', 'Mechanical Engineering'] },
          ],
          cutoffs: 'Competitive admission; prominent national forestry and health sciences cutoff thresholds.',
        }
      ];

      for (const u of defaultUnis) {
        await client.query(`
          INSERT INTO universities (
            code, name, amharic_name, short_code, category, generation, established, president,
            main_campus, city, students, climate, badge, logo_url, accent, crest_color,
            map_coords, map_query, overview, campuses, unique_features, gallery, faculties, cutoffs
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
          ON CONFLICT (code) DO NOTHING;
        `, [
          u.code, u.name, u.amharic_name, u.short_code, u.category, u.generation, u.established, u.president,
          u.main_campus, u.city, u.students, u.climate, u.badge, u.logo_url, u.accent, u.crest_color,
          JSON.stringify(u.map_coords), u.map_query, u.overview, JSON.stringify(u.campuses),
          JSON.stringify(u.unique_features), JSON.stringify(u.gallery), JSON.stringify(u.faculties), u.cutoffs
        ]);
      }
      console.log('✅ Default universities seeded.');
    }
    console.log('✅ PostgreSQL migrations completed successfully.');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  migrate();
}

module.exports = migrate;

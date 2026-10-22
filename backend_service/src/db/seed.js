const bcrypt = require('bcryptjs');
const { pool } = require('./index');

async function seed() {
  const client = await pool.connect();
  try {
    console.log('🌱 Seeding Ethiopian Exam Hall database with authentic curriculum data...');

    await client.query('BEGIN');

    // Clean existing data for clean seed
    await client.query(`
      TRUNCATE TABLE 
        audit_logs, moderation_reports, payment_transactions, user_subscriptions, 
        subscription_plans, bookmarks, attempt_answers, exam_attempts, practice_sessions, 
        answer_options, questions, exam_documents, exams, exam_categories, users 
      RESTART IDENTITY CASCADE
    `);

    // 1. Seed Users
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password123!', salt);

    const userRes = await client.query(`
      INSERT INTO users (name, email, password_hash, role, target_track, institution, candidate_id, is_verified)
      VALUES 
        ('Abebe Bekele', 'admin@ethioexamhall.edu.et', $1, 'superadmin', 'exit', 'Ministry of Education', 'ADMIN-001', TRUE),
        ('Dawit Mengistu', 'dawit@aau.edu.et', $1, 'student', 'exit', 'Addis Ababa University', 'ETH-88492', TRUE),
        ('Helen Tadesse', 'helen@gmail.com', $1, 'student', 'aviation', 'Ethiopian Aviation Academy', 'ETH-91043', TRUE),
        ('Yonas Kebede', 'yonas@astu.edu.et', $1, 'student', 'esuee', 'Adama Science & Technology University', 'ETH-44219', TRUE)
      RETURNING id, email, role, name;
    `, [passwordHash]);

    const adminUser = userRes.rows.find(u => u.role === 'superadmin');
    const studentDawit = userRes.rows.find(u => u.email === 'dawit@aau.edu.et');
    const studentHelen = userRes.rows.find(u => u.email === 'helen@gmail.com');

    // 2. Seed Exam Categories
    const catRes = await client.query(`
      INSERT INTO exam_categories (code, name, amharic_name, description, icon, badge_text, is_aviation, display_order)
      VALUES
        ('esuee', 'Grade 12 (ESUEE)', 'የ12ኛ ክፍል ብሔራዊ ፈተና', 'Ethiopian Secondary University Entrance Examination past papers and model questions.', 'school', 'National Matriculation', FALSE, 1),
        ('exit', 'University Exit Exam', 'የከፍተኛ ትምህርት መውጫ ፈተና', 'Ministry of Education undergraduate exit examinations across all accredited degree programs.', 'verified_user', 'MoE Mandatory', FALSE, 2),
        ('gat', 'AAU GAT (Postgraduate)', 'አ.አ.ዩ ጂ.ኤ.ቲ ፈተና', 'Addis Ababa University Graduate Admission Test for Masters and PhD candidates.', 'psychology', 'Postgraduate Entrance', FALSE, 3),
        ('aviation', 'Airline & Aviation Prep', 'የአቪዬሽን እና ካዴት አካዳሚ', 'Ethiopian Airlines Aviation University Cadet Pilot, AMT, and Cabin Crew exams.', 'flight', 'Aviation Track', TRUE, 4),
        ('banking', 'Bank Trainee Aptitude', 'የባንክ ቅጥር ፈተና', 'Commercial Bank of Ethiopia (CBE) and private banking graduate trainee assessments.', 'account_balance', 'Banking Sector', FALSE, 5),
        ('coc', 'TVET & CoC Certification', 'የሙያ ብቃት ማረጋገጫ (CoC)', 'Center of Competence vocational skill and theory testing resources.', 'engineering', 'CoC Certified', FALSE, 6)
      RETURNING id, code, name;
    `);

    const catMap = {};
    catRes.rows.forEach(c => { catMap[c.code] = c.id; });

    // 3. Seed Subscription Plans
    const planRes = await client.query(`
      INSERT INTO subscription_plans (code, name, billing_interval, duration_days, price_etb, price_usd, badge, features_json, is_active)
      VALUES
        ('free', 'Free Student Plan', 'monthly', 3650, 0.00, 0.00, 'Free Forever', 
         '["Access to 5,000+ past exam papers (PDF)", "Standard timed drill simulator (basic)", "Community discussion forum access", "Official answer keys with basic keys"]'::jsonb, TRUE),
        ('premium_monthly', 'Premium Exam Pass', 'monthly', 30, 349.00, 6.99, 'Most Popular', 
         '["Unlimited full-length mock examinations", "Interactive exam simulator with real timer", "Step-by-step verified worked rationales", "National percentile and cutoff analytics", "Custom drill builder by curriculum domain"]'::jsonb, TRUE),
        ('premium_annual', 'Premium Exam Pass (Annual)', 'annual', 365, 2990.00, 59.99, 'Save 28%', 
         '["Everything in Premium Monthly", "Offline document downloading enabled", "Priority academic dispute resolution", "Targeted remedial revision modules", "365 days unlimited examination access"]'::jsonb, TRUE),
        ('aviation_monthly', 'Aviation & Professional Prep', 'monthly', 30, 699.00, 12.99, 'Specialized Portal', 
         '["Pilot Cadet entrance mock examinations", "Aircraft Maintenance Technician (AMT) drills", "Aviation spatial, psychomotor & math suites", "Ethiopian Airlines aptitude benchmark tests", "Verified interview question banks"]'::jsonb, TRUE),
        ('aviation_annual', 'Aviation & Professional Prep (Annual)', 'annual', 365, 5990.00, 119.99, 'Best Value', 
         '["Complete aviation portal access for 1 full year", "1-on-1 interview preparation rubrics", "All University Exit & GAT features included", "Continuous curriculum syllabus updates"]'::jsonb, TRUE)
      RETURNING id, code, price_etb;
    `);

    const planMap = {};
    planRes.rows.forEach(p => { planMap[p.code] = p.id; });

    // 4. Seed Exams
    const examRes = await client.query(`
      INSERT INTO exams (
        category_id, code, title, amharic_title, year_ec, year_gc, subject, institution, 
        time_limit_minutes, total_questions, passing_score, access_tier, status, curriculum_domain, 
        booklet_code, source_attribution, redistribution_status
      )
      VALUES
        ($1, 'MOE-EXIT-CS-2016', '2016 E.C. Ethiopian University Exit Examination: Computer Science & Software Engineering', 'የ2016 ዓ.ም የኮምፒውተር ሳይንስ መውጫ ፈተና', 2016, 2024, 'Computer Science', 'Ministry of Education (MoE)', 120, 100, 50.0, 'free', 'published', 'Software Engineering, Systems, Networks & Databases', '01-CS', 'Official National Exit Examination Repository • MoE Ethiopia', 'public_domain'),
        ($1, 'MOE-EXIT-LAW-2016', '2016 E.C. Ethiopian University Exit Examination: Law & Jurisprudence', 'የ2016 ዓ.ም የህግ መውጫ ፈተና', 2016, 2024, 'Law', 'Ministry of Education (MoE)', 150, 100, 50.0, 'pro', 'published', 'Constitutional Law, Criminal Law, Civil Code & International Law', '03-LAW', 'Federal Ministry of Education Examination Directorate', 'institutional_fair_use'),
        ($1, 'MOE-EXIT-MED-2016', '2016 E.C. Medical Doctor Licensing & Exit Examination: Medicine & Health Sciences', 'የህክምና ዶክትሬት ፈተና', 2016, 2024, 'Medicine', 'Ministry of Health & MoE', 180, 120, 60.0, 'pro', 'published', 'Internal Medicine, Surgery, Pediatrics & Obstetrics', 'MED-01', 'Ethiopian Medical Association & MoE Council', 'licensed'),
        ($2, 'ESUEE-MATHS-2016', '2016 E.C. Grade 12 National Examination: Mathematics (Natural Science)', 'የ2016 ዓ.ም የ12ኛ ክፍል ሂሳብ ፈተና', 2016, 2024, 'Mathematics', 'Educational Assessment and Examination Service (EAES)', 120, 65, 50.0, 'free', 'published', 'Calculus, Algebra, Vectors, Statistics & Probability', 'BOOKLET-B', 'EAES Official Publication for Secondary Matriculation', 'public_domain'),
        ($2, 'ESUEE-PHYSICS-2016', '2016 E.C. Grade 12 National Examination: Physics (Natural Science)', 'የ2016 ዓ.ም የ12ኛ ክፍል ፊዚክስ ፈተና', 2016, 2024, 'Physics', 'Educational Assessment and Examination Service (EAES)', 120, 60, 50.0, 'free', 'published', 'Mechanics, Electromagnetism, Thermodynamics & Optics', 'BOOKLET-A', 'EAES National Secondary School Archive', 'public_domain'),
        ($3, 'AAU-GAT-2024', 'Addis Ababa University Graduate Admission Test (GAT) 2016 E.C. Model', 'የአዲስ አበባ ዩኒቨርሲቲ ጂ.ኤ.ቲ ፈተና', 2016, 2024, 'Aptitude', 'Addis Ababa University (AAU)', 90, 80, 50.0, 'free', 'published', 'Verbal Reasoning, Quantitative Aptitude & Analytical Writing', 'GAT-M4', 'AAU Testing Center & Registrar Office', 'public_domain'),
        ($4, 'EAA-CADET-2024', 'Ethiopian Aviation Academy Pilot Cadet Entrance Examination: Aptitude & Technical Physics', 'የፓይለት ካዴት መግቢያ ፈተና', 2016, 2024, 'Aviation Aptitude', 'Ethiopian Airlines Aviation University', 90, 75, 70.0, 'pro', 'published', 'Spatial Orientation, Mechanical Comprehension & Flight Physics', 'CADET-777', 'Ethiopian Airlines Training Academy Assessment Council', 'licensed'),
        ($4, 'EAA-AMT-TECH-2024', 'Aircraft Maintenance Technician (AMT) Entrance Examination: Applied Mechanics & Electrical Systems', 'የአውሮፕላን ጥገና ቴክኒሽያን መግቢያ ፈተና', 2016, 2024, 'Applied Physics', 'Ethiopian Aviation University', 90, 60, 65.0, 'pro', 'published', 'Avionics, Hydraulics, Turbine Principles & Applied Electricity', 'AMT-101', 'EAA Technical Training Standards Unit', 'licensed'),
        ($5, 'CBE-TRAINEE-2024', 'Commercial Bank of Ethiopia (CBE) Graduate Trainee Aptitude Exam 2016 E.C.', 'የኢትዮጵያ ንግድ ባንክ የቅጥር ፈተና', 2016, 2024, 'Banking Aptitude', 'Commercial Bank of Ethiopia', 60, 50, 60.0, 'free', 'published', 'Quantitative Reasoning, English, Commercial Law & Financial Concepts', 'CBE-GT', 'CBE Human Capital Talent Acquisition', 'public_domain')
      RETURNING id, code, title;
    `, [catMap['exit'], catMap['esuee'], catMap['gat'], catMap['aviation'], catMap['banking']]);

    const examMap = {};
    examRes.rows.forEach(e => { examMap[e.code] = e.id; });

    // 5. Seed Documents
    await client.query(`
      INSERT INTO exam_documents (exam_id, file_name, file_path, file_size, mime_type, total_pages, watermark_text, source_url, uploaded_by)
      VALUES
        ($1, 'MoE_Exit_Exam_CS_2016EC_Official.pdf', 'documents/exit_exam_cs_2016.pdf', 2450000, 'application/pdf', 18, 'ETHIO EXAM HALL • OFFICIAL PREVIEW • 2016 E.C.', 'https://moe.gov.et/repository', $2),
        ($3, 'ESUEE_Grade12_Maths_2016EC.pdf', 'documents/esuee_maths_2016.pdf', 1850000, 'application/pdf', 14, 'ETHIO EXAM HALL • EAES VERIFIED ARCHIVE', 'https://eaes.et/exams', $2),
        ($4, 'Ethiopian_Aviation_Academy_Pilot_Cadet_Specimen.pdf', 'documents/aviation_cadet_2024.pdf', 3120000, 'application/pdf', 22, 'ETHIO EXAM HALL • LICENSED AVIATION PREPARATION TRACK', 'https://corporate.ethiopianairlines.com/aviation-academy', $2)
    `, [examMap['MOE-EXIT-CS-2016'], adminUser.id, examMap['ESUEE-MATHS-2016'], examMap['EAA-CADET-2024']]);

    // 6. Seed Questions for MoE University Exit Exam CS 2016
    const exitExamId = examMap['MOE-EXIT-CS-2016'];

    const qData = [
      {
        num: 24,
        domain: 'Domain 3: Operating Systems & Systems Architecture',
        stem: 'In modern multi-threaded operating systems, when multiple processes compete for a shared resource without adequate synchronization primitives, a race condition can occur. Which of the following synchronization mechanisms guarantees mutual exclusion while avoiding busy waiting (spinlocks) by placing competing threads into a sleep/waiting state?',
        context: 'Posix / Kernel Dispatching Model: Assume symmetric multiprocessing (SMP) dispatching with preemptive kernel scheduling. Synchronization must operate efficiently across uniprocessor and multiprocessor systems without indefinite CPU thread-state spinning.',
        difficulty: 'medium',
        marks: 1.0,
        explanation: 'Counting semaphores and mutexes implemented with kernel wait-queues (such as futex in modern Unix/Linux kernels) transition blocked threads to a SLEEP/WAITING state, yielding the CPU to other schedulable threads instead of burning cycles in a spinlock while loop.',
        options: [
          { letter: 'A', text: 'Counting Semaphore with wait() [P] and signal() [V] operations and process blocking', subtext: 'Uses kernel wait-queues and thread sleeping', correct: true },
          { letter: 'B', text: 'Test-and-Set hardware instruction in a tight while loop', subtext: 'Executes active CPU register polling continuously on memory bus', correct: false },
          { letter: 'C', text: 'Disabling interrupts on all CPU cores in user mode', subtext: 'Privileged supervisor instruction; unavailable in user space', correct: false },
          { letter: 'D', text: "Dekker's algorithm utilizing software busy-wait flags", subtext: 'Requires busy waiting and does not utilize sleep primitives', correct: false }
        ]
      },
      {
        num: 25,
        domain: 'Domain 2: Database Systems & Data Modeling',
        stem: 'Consider a relational database transaction executing an UPDATE on account balances. To prevent lost updates and dirty reads under high concurrency, which ANSI SQL isolation level guarantees serializability by locking ranges of keys to completely prevent phantom reads?',
        context: 'ACID Concurrency Control: Multi-Version Concurrency Control (MVCC) and Two-Phase Locking (2PL) benchmarks in banking transactions.',
        difficulty: 'hard',
        marks: 1.0,
        explanation: 'The SERIALIZABLE isolation level is the highest ANSI SQL level. It ensures that transactions execute as if serially scheduled, preventing dirty reads, non-repeatable reads, and phantom reads through predicate locking or serializable snapshot isolation (SSI).',
        options: [
          { letter: 'A', text: 'Read Committed', subtext: 'Allows non-repeatable reads and phantom reads', correct: false },
          { letter: 'B', text: 'Repeatable Read', subtext: 'Guarantees consistent reads but may allow phantom inserts without gap locks', correct: false },
          { letter: 'C', text: 'Serializable', subtext: 'Highest isolation tier preventing all concurrency anomalies including phantom rows', correct: true },
          { letter: 'D', text: 'Read Uncommitted', subtext: 'Lowest isolation allowing dirty and uncommitted reads', correct: false }
        ]
      },
      {
        num: 26,
        domain: 'Domain 1: Software Engineering & Architecture',
        stem: 'In microservices architecture, when a sequence of distributed local transactions must coordinate across disparate services without relying on distributed two-phase commit (2PC) locks, which architectural pattern is recommended to maintain eventual data consistency via compensating actions?',
        context: 'Distributed Systems & Transaction Management: Event-driven architecture with asynchronous choreography or orchestration.',
        difficulty: 'medium',
        marks: 1.0,
        explanation: 'The Saga Pattern coordinates distributed transactions across services as a series of local transactions. If one step fails, compensating transactions are executed in reverse order to rollback previous successful operations.',
        options: [
          { letter: 'A', text: 'Saga Pattern (Choreography or Orchestration)', subtext: 'Coordinates local transactions with explicit compensating rollback steps', correct: true },
          { letter: 'B', text: 'Circuit Breaker Pattern', subtext: 'Prevents cascading failures by halting calls to failing remote dependencies', correct: false },
          { letter: 'C', text: 'CQRS (Command Query Responsibility Segregation)', subtext: 'Separates read models from write models', correct: false },
          { letter: 'D', text: 'Strangler Fig Pattern', subtext: 'Progressively migrates legacy monolithic features to microservices', correct: false }
        ]
      },
      {
        num: 27,
        domain: 'Domain 4: Computer Networks & Distributed Systems',
        stem: 'During the TCP three-way handshake, if an attacker floods a target server with SYN packets without completing the handshake with the expected ACK packets, exhausting the server SYN backlog queue, which defense mechanism replaces server state allocation with cryptographically generated initial sequence numbers?',
        context: 'Transport Layer Security: Transmission Control Protocol RFC 793 and RFC 4987 Denial-of-Service mitigation.',
        difficulty: 'medium',
        marks: 1.0,
        explanation: 'SYN Cookies encode the connection state (client MSS, timestamp, secret key) into the server 32-bit Initial Sequence Number (ISN). The server allocates zero state in memory until the client returns the final ACK packet with ISN + 1.',
        options: [
          { letter: 'A', text: 'SYN Cookies', subtext: 'Calculates cryptographic ISN and defers state allocation until ACK receipt', correct: true },
          { letter: 'B', text: 'Nagle Algorithm', subtext: 'Buffers small packets to reduce header overhead', correct: false },
          { letter: 'C', text: 'Sliding Window Expansion', subtext: 'Increases throughput over high latency networks', correct: false },
          { letter: 'D', text: 'Diffie-Hellman Key Exchange', subtext: 'Used for establishing shared cryptographic symmetric secrets', correct: false }
        ]
      },
      {
        num: 28,
        domain: 'Domain 5: Algorithms & Complexity Analysis',
        stem: 'What is the tight asymptotic worst-case time complexity of finding the Single-Source Shortest Path (SSSP) in a directed graph with V vertices and E non-negative edge weights using a Binary Heap implementation of Dijkstra’s Algorithm?',
        context: 'Graph Theory & Optimization: Dense vs sparse graph vertex extraction and edge relaxation.',
        difficulty: 'medium',
        marks: 1.0,
        explanation: "Dijkstra's algorithm with a binary min-heap performs V extract-min operations (each O(log V)) and at most E decrease-key/relaxation operations (each O(log V)), yielding a total asymptotic bound of O((V + E) log V).",
        options: [
          { letter: 'A', text: 'O(V²)', subtext: 'Complexity of standard array-based implementation', correct: false },
          { letter: 'B', text: 'O((V + E) log V)', subtext: 'Optimal bound using min-heap priority queue', correct: true },
          { letter: 'C', text: 'O(V × E)', subtext: 'Worst-case time complexity of Bellman-Ford algorithm', correct: false },
          { letter: 'D', text: 'O(V³)', subtext: 'Time complexity of Floyd-Warshall all-pairs shortest path', correct: false }
        ]
      }
    ];

    for (const q of qData) {
      const qRes = await client.query(`
        INSERT INTO questions (exam_id, question_number, domain, stem, context_reference, difficulty, marks, verified_status, explanation)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id;
      `, [exitExamId, q.num, q.domain, q.stem, q.context, q.difficulty, q.marks, true, q.explanation]);

      const questionId = qRes.rows[0].id;

      for (const opt of q.options) {
        await client.query(`
          INSERT INTO answer_options (question_id, option_letter, option_text, subtext, is_correct)
          VALUES ($1, $2, $3, $4, $5);
        `, [questionId, opt.letter, opt.text, opt.subtext, opt.correct]);
      }
    }

    // 7. Seed Aviation Academy Questions for EAA-CADET-2024
    const cadetExamId = examMap['EAA-CADET-2024'];
    const cadetQuestions = [
      {
        num: 1,
        domain: 'Aviation Physics & Aerodynamics',
        stem: 'According to Bernoulli’s Principle applied to an aircraft cambered airfoil, how does airflow acceleration over the upper surface generate aerodynamic lift?',
        context: 'Fluid Dynamics & Subsonic Lift: Incompressible steady airflow over NACA 4-digit airfoil section.',
        difficulty: 'medium',
        marks: 1.0,
        explanation: 'As airflow velocity increases over the convex upper camber of the wing, static pressure decreases relative to the flatter lower surface. The resulting pressure differential exerts an upward lift force perpendicular to the relative wind.',
        options: [
          { letter: 'A', text: 'Air velocity increases over the upper surface, creating a localized pressure drop and net upward force', subtext: 'Bernoulli differential pressure principle', correct: true },
          { letter: 'B', text: 'Air pressure increases over the top surface pushing the wing downward', subtext: 'Contradicts conservation of energy in streamlines', correct: false },
          { letter: 'C', text: 'Ground effect increases kinetic friction directly proportional to airspeed', subtext: 'Ground effect occurs only within one wingspan of the runway surface', correct: false },
          { letter: 'D', text: 'Exhaust thrust from turbofan engines generates pure aerodynamic lift independent of wings', subtext: 'Thrust counters drag, not weight in level flight', correct: false }
        ]
      },
      {
        num: 2,
        domain: 'Spatial Reasoning & Cockpit Instrumentation',
        stem: 'An aircraft heading indicator displays 090° (due East) while the magnetic compass indicates 090°. The pilot initiates a coordinated right standard-rate turn to 180° (due South). In the Northern Hemisphere, which compass lag/lead error characteristic occurs during turns through East and West?',
        context: 'Flight Instrument Principles: Magnetic compass dip error and acceleration characteristics.',
        difficulty: 'hard',
        marks: 1.0,
        explanation: 'Northerly turning errors in the Northern Hemisphere (ANDS: Accelerate North, Decelerate South) cause compass lead or lag when turning from North or South headings. On East and West headings, acceleration or deceleration causes pitch deflection rather than turning error.',
        options: [
          { letter: 'A', text: 'The compass accurately displays heading changes through 090° without northerly turning lag', subtext: 'Turning error is maximal when turning from headings of North or South', correct: true },
          { letter: 'B', text: 'The compass will rotate backwards by 45 degrees', subtext: 'Incorrect oscillation mode', correct: false },
          { letter: 'C', text: 'The compass becomes completely inverted at standard rate', subtext: 'Physically impossible in unaccelerated coordinated flight', correct: false },
          { letter: 'D', text: 'The heading indicator freezes until the turn is concluded', subtext: 'Gyroscopic heading indicators operate smoothly without magnetic dip', correct: false }
        ]
      }
    ];

    for (const q of cadetQuestions) {
      const qRes = await client.query(`
        INSERT INTO questions (exam_id, question_number, domain, stem, context_reference, difficulty, marks, verified_status, explanation)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id;
      `, [cadetExamId, q.num, q.domain, q.stem, q.context, q.difficulty, q.marks, true, q.explanation]);

      const questionId = qRes.rows[0].id;
      for (const opt of q.options) {
        await client.query(`
          INSERT INTO answer_options (question_id, option_letter, option_text, subtext, is_correct)
          VALUES ($1, $2, $3, $4, $5);
        `, [questionId, opt.letter, opt.text, opt.subtext, opt.correct]);
      }
    }

    // 8. Seed Sample Completed Exam Attempt for Dawit Mengistu
    // Matches Stitch screen diagnostic_score_report_performance_analytics
    const attemptRes = await client.query(`
      INSERT INTO exam_attempts (
        user_id, exam_id, mode, started_at, submitted_at, time_spent_seconds, 
        score, total_possible, percentage, passed, percentile, status
      )
      VALUES (
        $1, $2, 'mock', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '30 minutes', 
        5400, 78.0, 100.0, 78.0, TRUE, 89.4, 'submitted'
      )
      RETURNING id;
    `, [studentDawit.id, exitExamId]);

    const sampleAttemptId = attemptRes.rows[0].id;

    // Fetch questions to record attempt answers
    const qRows = await client.query(`SELECT id, question_number FROM questions WHERE exam_id = $1`, [exitExamId]);
    for (const q of qRows.rows) {
      const correctOptRes = await client.query(`SELECT option_letter FROM answer_options WHERE question_id = $1 AND is_correct = TRUE`, [q.id]);
      const correctLetter = correctOptRes.rows[0]?.option_letter || 'A';
      
      // Let Q24 be correct, Q25 be correct, Q26 be correct, Q27 be correct, Q28 be incorrect for realistic report
      const selected = (q.question_number === 28) ? 'A' : correctLetter;
      const isCorrect = (selected === correctLetter);

      await client.query(`
        INSERT INTO attempt_answers (attempt_id, question_id, selected_option, is_correct, is_flagged)
        VALUES ($1, $2, $3, $4, $5)
      `, [sampleAttemptId, q.id, selected, isCorrect, (q.question_number === 24)]);
    }

    // 9. Seed Active Subscription for Dawit
    await client.query(`
      INSERT INTO user_subscriptions (user_id, plan_id, starts_at, expires_at, status, payment_ref)
      VALUES ($1, $2, NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days', 'active', 'TELE-BIRR-992149')
    `, [studentDawit.id, planMap['premium_monthly']]);

    // 10. Seed Payment Transactions
    await client.query(`
      INSERT INTO payment_transactions (user_id, plan_id, provider, amount, currency, reference_code, phone_or_account, status, verified_at)
      VALUES
        ($1, $2, 'telebirr', 349.00, 'ETB', 'TB-2026-8812904', '+251911489201', 'completed', NOW() - INTERVAL '5 days'),
        ($3, $4, 'cbe_birr', 699.00, 'ETB', 'CBE-TX-9901423', '1000192847291', 'completed', NOW() - INTERVAL '2 days'),
        ($1, $2, 'chapa', 349.00, 'ETB', 'CHP-REF-0098231', 'dawit@aau.edu.et', 'pending', NULL)
    `, [studentDawit.id, planMap['premium_monthly'], studentHelen.id, planMap['aviation_monthly']]);

    // 11. Seed Bookmarks
    await client.query(`
      INSERT INTO bookmarks (user_id, exam_id)
      VALUES 
        ($1, $2),
        ($1, $3)
    `, [studentDawit.id, exitExamId, examMap['EAA-CADET-2024']]);

    // 12. Seed Moderation Reports
    await client.query(`
      INSERT INTO moderation_reports (exam_id, reported_by, dispute_type, description, status, resolution_notes)
      VALUES
        ($1, $2, 'incorrect_answer_key', 'Disputed Option C on 2016 Exit Exam Law Q14 regarding federal jurisdiction in tax arbitration.', 'reviewing', 'Assigned to MoE Law Curriculum Faculty Member for secondary review.'),
        ($3, $2, 'ocr_typo', 'Page 12 mathematical formula subscript rendering distorted in OCR extraction.', 'resolved', 'Clean vector replacement formula re-uploaded by Super Admin.')
    `, [examMap['MOE-EXIT-LAW-2016'], studentDawit.id, examMap['ESUEE-MATHS-2016']]);

    // 13. Seed Audit Logs
    await client.query(`
      INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address)
      VALUES
        ($1, 'PUBLISH_EXAM', 'exams', $2, '{"code": "MOE-EXIT-CS-2016", "title": "2016 E.C. Computer Science Exit Exam"}'::jsonb, '197.156.103.42'),
        ($1, 'VERIFY_CURRICULUM_BATCH', 'questions', 5, '{"verified_by": "MoE Quality Assurance Division", "count": 100}'::jsonb, '197.156.103.42'),
        ($3, 'SUBMIT_EXAM', 'exam_attempts', $4, '{"score": 78, "percentile": 89.4}'::jsonb, '196.188.241.15')
    `, [adminUser.id, exitExamId, studentDawit.id, sampleAttemptId]);

    await client.query('COMMIT');
    console.log('✅ Database successfully seeded with Ethiopian Exam Hall curriculum data!');
    console.log(`   - Sample Super Admin: admin@ethioexamhall.edu.et / Password123!`);
    console.log(`   - Sample Candidate:   dawit@aau.edu.et / Password123!`);
    console.log(`   - Completed Attempt ID for Analytics: ${sampleAttemptId}`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  seed();
}

module.exports = seed;

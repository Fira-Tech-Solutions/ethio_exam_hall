-- Ethio Exam Hall PostgreSQL Schema

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  role VARCHAR(50) DEFAULT 'student',
  target_track VARCHAR(100) DEFAULT 'exit',
  institution VARCHAR(255) DEFAULT 'Addis Ababa University',
  candidate_id VARCHAR(50) UNIQUE,
  is_verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exam_categories (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  amharic_name VARCHAR(255),
  description TEXT,
  icon VARCHAR(50) DEFAULT 'school',
  badge_text VARCHAR(100),
  is_aviation BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS exams (
  id SERIAL PRIMARY KEY,
  category_id INT REFERENCES exam_categories(id) ON DELETE SET NULL,
  code VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  amharic_title VARCHAR(255),
  year_ec INT,
  year_gc INT,
  subject VARCHAR(100) NOT NULL,
  institution VARCHAR(255) DEFAULT 'Ministry of Education (MoE)',
  time_limit_minutes INT DEFAULT 120,
  total_questions INT DEFAULT 100,
  passing_score NUMERIC(5,2) DEFAULT 50.0,
  access_tier VARCHAR(20) DEFAULT 'free',
  status VARCHAR(20) DEFAULT 'published',
  curriculum_domain VARCHAR(255),
  booklet_code VARCHAR(50),
  source_attribution TEXT,
  redistribution_status VARCHAR(50) DEFAULT 'public_domain',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exam_documents (
  id SERIAL PRIMARY KEY,
  exam_id INT REFERENCES exams(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT DEFAULT 0,
  mime_type VARCHAR(100) DEFAULT 'application/pdf',
  total_pages INT DEFAULT 1,
  watermark_text VARCHAR(255) DEFAULT 'ETHIO EXAM HALL • OFFICIAL CANDIDATE PREVIEW',
  source_url TEXT,
  uploaded_by INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  exam_id INT REFERENCES exams(id) ON DELETE CASCADE,
  question_number INT NOT NULL,
  domain VARCHAR(255),
  stem TEXT NOT NULL,
  context_reference TEXT,
  difficulty VARCHAR(20) DEFAULT 'medium',
  marks NUMERIC(4,1) DEFAULT 1.0,
  verified_status BOOLEAN DEFAULT TRUE,
  explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS answer_options (
  id SERIAL PRIMARY KEY,
  question_id INT REFERENCES questions(id) ON DELETE CASCADE,
  option_letter VARCHAR(5) NOT NULL,
  option_text TEXT NOT NULL,
  subtext TEXT,
  is_correct BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS practice_sessions (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  category_code VARCHAR(50),
  domains JSONB DEFAULT '[]',
  question_count INT DEFAULT 20,
  difficulty VARCHAR(20) DEFAULT 'all',
  mode VARCHAR(20) DEFAULT 'timed',
  time_limit_minutes INT DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exam_attempts (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  exam_id INT REFERENCES exams(id) ON DELETE SET NULL,
  practice_session_id INT REFERENCES practice_sessions(id) ON DELETE SET NULL,
  mode VARCHAR(50) DEFAULT 'mock',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  time_spent_seconds INT DEFAULT 0,
  score NUMERIC(5,2) DEFAULT 0,
  total_possible NUMERIC(5,2) DEFAULT 0,
  percentage NUMERIC(5,2) DEFAULT 0,
  passed BOOLEAN DEFAULT FALSE,
  percentile NUMERIC(5,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'in_progress',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attempt_answers (
  id SERIAL PRIMARY KEY,
  attempt_id INT REFERENCES exam_attempts(id) ON DELETE CASCADE,
  question_id INT REFERENCES questions(id) ON DELETE CASCADE,
  selected_option VARCHAR(5),
  is_correct BOOLEAN DEFAULT FALSE,
  is_flagged BOOLEAN DEFAULT FALSE,
  answered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(attempt_id, question_id)
);

CREATE TABLE IF NOT EXISTS bookmarks (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  exam_id INT REFERENCES exams(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, exam_id)
);

CREATE TABLE IF NOT EXISTS subscription_plans (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  billing_interval VARCHAR(20) DEFAULT 'monthly',
  duration_days INT DEFAULT 30,
  price_etb NUMERIC(10,2) NOT NULL,
  price_usd NUMERIC(10,2) NOT NULL,
  badge VARCHAR(100),
  features_json JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  plan_id INT REFERENCES subscription_plans(id) ON DELETE CASCADE,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  payment_ref VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS payment_transactions (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  plan_id INT REFERENCES subscription_plans(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'ETB',
  reference_code VARCHAR(100) UNIQUE NOT NULL,
  phone_or_account VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS moderation_reports (
  id SERIAL PRIMARY KEY,
  exam_id INT REFERENCES exams(id) ON DELETE CASCADE,
  question_id INT REFERENCES questions(id) ON DELETE SET NULL,
  reported_by INT REFERENCES users(id) ON DELETE SET NULL,
  dispute_type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'open',
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id INT,
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_exams_category ON exams(category_id);
CREATE INDEX IF NOT EXISTS idx_exams_year ON exams(year_ec);
CREATE INDEX IF NOT EXISTS idx_exams_status ON exams(status);
CREATE INDEX IF NOT EXISTS idx_questions_exam ON questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_options_question ON answer_options(question_id);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON exam_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_exam ON exam_attempts(exam_id);
CREATE INDEX IF NOT EXISTS idx_attempt_answers_attempt ON attempt_answers(attempt_id);

-- External Authentication & OAuth Providers (e.g., Telegram OpenID Connect)
CREATE TABLE IF NOT EXISTS user_external_identities (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  provider_subject VARCHAR(255) NOT NULL,
  provider_username VARCHAR(255),
  provider_display_name VARCHAR(255),
  avatar_url TEXT,
  claims_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, provider_subject)
);

CREATE INDEX IF NOT EXISTS idx_external_identities_user ON user_external_identities(user_id);
CREATE INDEX IF NOT EXISTS idx_external_identities_lookup ON user_external_identities(provider, provider_subject);

-- Ephemeral OIDC/PKCE Auth Transactions
CREATE TABLE IF NOT EXISTS auth_transactions (
  id SERIAL PRIMARY KEY,
  state VARCHAR(255) UNIQUE NOT NULL,
  code_verifier VARCHAR(255) NOT NULL,
  nonce VARCHAR(255),
  redirect_url VARCHAR(1000) DEFAULT '/dashboard',
  provider VARCHAR(50) NOT NULL DEFAULT 'telegram',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_auth_transactions_state ON auth_transactions(state);

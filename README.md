# Ethio Exam Hall (ኢትዮ ፈተና) — Full-Stack Platform

A high-trust, responsive digital testing and academic resource environment tailored to Ethiopian secondary and tertiary students, educators, and Ethiopian Airlines certification candidates.

Built faithfully from Google Stitch designs adhering to `DESIGN.md` tokens, institutional typography (Manrope & Inter), and official Ministry of Education curriculum specifications.

---

## 1. System Architecture & Autonomous Services

Every service in this repository is designed as an **independent, self-contained micro-application** that can be developed, tested, built, containerized, and deployed directly from within its own codebase directory:

- **[`db/`](file:///home/sami/Projects/ethio_exam_hall/db/)**: Isolated PostgreSQL 16 database (`postgres:16-alpine`), mapped to host port `5433` (to avoid host port collisions). Contains its own compose spec and README.
- **[`backend_service/`](file:///home/sami/Projects/ethio_exam_hall/backend_service/)**: Node.js 24 + Express + PostgreSQL REST API with JWT auth, authoritative server-side grading, and Ethiopian payment rails. Contains its own `Dockerfile`, `docker-compose.yml`, migrations, seeders, and 7-scenario test suite.
- **[`main_website/`](file:///home/sami/Projects/ethio_exam_hall/main_website/)**: Public portal and candidate exam simulator built with React 18, Vite, and Tailwind CSS. Features dynamic `VITE_API_URL` configuration and its own multi-stage Nginx `Dockerfile`.
- **[`admin_panel/`](file:///home/sami/Projects/ethio_exam_hall/admin_panel/)**: Administrative control center and content pipeline built with React 18, Vite, and Tailwind CSS. Fully standalone with dynamic `VITE_API_URL` configuration and its own Nginx `Dockerfile`.

---

## 2. Running Services Independently Inside Their Codebases

### Database Service (`db/`)
```bash
cd db
docker compose up -d
# Running on localhost:5433
```

### Backend Service (`backend_service/`)
```bash
cd backend_service
cp .env.example .env

# Install, migrate, and seed
npm install
npm run migrate
npm run seed

# Run automated tests
npm test

# Run server (development or production)
npm run dev    # Development with watch mode
npm start      # Production server (Port 5000)

# Docker deployment
docker build -t ethio-backend .
docker run -d -p 5000:5000 --env-file .env ethio-backend
```

### Main Website (`main_website/`)
```bash
cd main_website
cp .env.example .env

# Run server (development or production preview)
npm install
npm run dev      # Development server at http://localhost:3000
npm run build    # Compile production bundle
npm start        # Standalone production preview at http://localhost:3000

# Standalone Docker deployment
docker build --build-arg VITE_API_URL=http://127.0.0.1:5000/api -t ethio-main-web .
docker run -d -p 3000:80 ethio-main-web
```

### Admin Panel (`admin_panel/`)
```bash
cd admin_panel
cp .env.example .env

# Run server (development or production preview)
npm install
npm run dev      # Development server at http://localhost:3001
npm run build    # Compile production bundle
npm start        # Standalone production preview at http://localhost:3001

# Standalone Docker deployment
docker build --build-arg VITE_API_URL=http://127.0.0.1:5000/api -t ethio-admin-panel .
docker run -d -p 3001:80 ethio-admin-panel
```

---

## 3. Root Convenience Scripts (Optional)

For local multi-service orchestration from the root workspace, root scripts remain available:

```bash
npm run db:up           # Start PostgreSQL container
npm run backend:start   # Start backend service
npm run main:dev        # Start main website in dev
npm run admin:dev       # Start admin panel in dev
npm run build:all       # Compile all frontend production builds
npm test                # Run backend automated integration tests
```

---

## 4. Design-to-Application Feature Mapping

| Google Stitch Design Reference | Application & Route | Capabilities & Features |
| :--- | :--- | :--- |
| `ethio_exam_hall_homepage` | `main_website/` (`/`) | Hero section, category cards, how-it-works, featured exam grid, aviation spotlight, and trust metrics. |
| `national_exam_discovery_library` | `main_website/` (`/explore-exams`) | Multi-facet filtering by category, subject, academic year (E.C.), access tier, search input, and pagination. |
| `exam_detail_document_preview` | `main_website/` (`/exams/:id`) | Academic PDF preview canvas, watermark overlay, page controls, metadata, copyright provenance, related exams. |
| `transparent_pricing_ethiopian_payments` | `main_website/` (`/pricing`) | Monthly/Annual toggle, Free Student vs Pro Pass vs Aviation Prep, interactive Ethiopian checkout (Telebirr, CBE Birr, Chapa). |
| `airline_aviation_exam_prep_specialized_portal` | `main_website/` (`/aviation-portal`) | Pilot Cadet, AMT, Cabin Crew, and Dispatcher tracks, competency drills, and standardized mock arena. |
| `ethio_exam_hall_student_dashboard` | `main_website/` (`/dashboard`) | Candidate verification, readiness index, study hours, questions mastered, recent attempts, curated track recommendations. |
| `practice_test_center_custom_drill_builder` | `main_website/` (`/practice`) | 4-step configurator: track selection, domain filtering, year/difficulty sieve, timed vs untimed mode, question density. |
| `interactive_exam_simulator_2016_exit_exam` | `main_website/` (`/simulator/:examId`) | MoE timed countdown, question palette grid, auto-save pulse, review flags, shielded answer keys, submission warnings. |
| `diagnostic_score_report_performance_analytics` | `main_website/` (`/analytics/:attemptId`) | Authoritative score, national percentile, domain competency breakdown, cutoff analytics, interactive rationale reviews. |
| Candidate Authentication & Onboarding | `main_website/` (`/sign-in`, `/register`) | Candidate registration with target track, institution, candidate ID (`ETH-XXXXX`), demo logins. |
| `administrative_control_center_content_pipeline` | `admin_panel/` (`/`, `/exams`, etc.) | Super Admin operations, resource ingestion pipeline, question bank audit, moderation queue, financial ledger, audit logs. |

---

## 5. Demo Accounts & Seed Credentials

- **Super Administrator**:
  - Email: `admin@ethioexamhall.edu.et`
  - Password: `Password123!`
  - Role: `superadmin`
- **Verified Candidate**:
  - Email: `dawit@aau.edu.et`
  - Password: `Password123!`
  - Candidate ID: `ETH-88492`
  - Target Track: University Exit Exam (Computer Science)
  - Pre-seeded completed attempt available for immediate review at `/analytics/1`.
- **Aviation Prep Candidate**:
  - Email: `helen@gmail.com`
  - Password: `Password123!`
  - Target Track: Ethiopian Aviation Academy Pilot Cadet

# Ethio Exam Hall — Backend Service & Examination Engine

Standalone REST API, authoritative scoring engine, document access control, and Ethiopian payment rails abstraction for the Ethio Exam Hall platform.

---

## 1. Environment Configuration

Copy the example environment file and adjust credentials if needed:
```bash
cp .env.example .env
```

Key environment variables:
| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | API server listening port | `5000` |
| `DB_HOST` | PostgreSQL host | `127.0.0.1` |
| `DB_PORT` | PostgreSQL port | `5433` (or `5432`) |
| `DB_NAME` | Database name | `ethio_exam_hall` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `postgres` |
| `DATABASE_URL` | Optional full connection string (overrides discrete DB options) | `undefined` |
| `CORS_ORIGIN` | Allowed CORS origins (`*` or comma-separated URLs) | `*` |
| `JWT_SECRET` | Secret key for JWT signing | `ethio_exam_hall_jwt_super_secret_dev_key_2026` |
| `JWT_EXPIRES_IN` | Token validity duration | `7d` |

---

## 2. Installation & Standalone Execution

All commands are executed directly inside `backend_service/`:

```bash
# Install dependencies
npm install

# Run database schema migration
npm run migrate

# Seed authentic Ethiopian curriculum data & test accounts
npm run seed

# Run automated integration test suite (7 tests)
npm test

# Start production server
npm start

# Start development server with file watch mode
npm run dev
```

Server endpoints will be active at:
- **API Base**: `http://127.0.0.1:5000/api`
- **Health Check**: `http://127.0.0.1:5000/api/health`

---

## 3. Independent Docker Deployment

To build and run the backend container independently:
```bash
# Build image
docker build -t ethio-exam-hall-backend .

# Run container pointing to an external PostgreSQL instance
docker run -d \
  --name ethio_backend \
  -p 5000:5000 \
  -e DB_HOST=172.17.0.1 \
  -e DB_PORT=5433 \
  -e DB_USER=postgres \
  -e DB_PASSWORD=postgres \
  -e DB_NAME=ethio_exam_hall \
  ethio-exam-hall-backend
```

Or run with docker-compose:
```bash
docker compose up -d
```

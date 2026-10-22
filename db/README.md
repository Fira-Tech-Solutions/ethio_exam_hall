# Ethio Exam Hall — PostgreSQL Database Service

Isolated PostgreSQL 16 database environment for the Ethio Exam Hall platform.

---

## 1. Quick Start

Run directly inside the `db/` directory:

```bash
# Start the database in background
docker compose up -d

# Check container health status
docker compose ps

# View database logs
docker compose logs -f

# Stop the database
docker compose down

# Stop and remove persistent data volume (WARNING: deletes all database records)
docker compose down -v
```

---

## 2. Network & Configuration

| Setting | Value | Description |
| :--- | :--- | :--- |
| **Image** | `postgres:16-alpine` | Lightweight, secure Alpine Linux build |
| **Container Name** | `ethio_exam_hall_db` | Dedicated container name |
| **Host Port** | `5433` | Mapped to host port `5433` (container port `5432`) to avoid conflicts |
| **Database** | `ethio_exam_hall` | Default application database |
| **Username** | `postgres` | Superuser |
| **Password** | `postgres` | Superuser password |
| **Volume** | `ethio_exam_hall_pgdata` | Docker volume for persistence across restarts |

---

## 3. Connecting via CLI or GUI Clients

- **Host**: `127.0.0.1`
- **Port**: `5433`
- **Database**: `ethio_exam_hall`
- **User**: `postgres`
- **Password**: `postgres`
- **Connection String**: `postgresql://postgres:postgres@127.0.0.1:5433/ethio_exam_hall`

```bash
# Connect using psql CLI inside container
docker exec -it ethio_exam_hall_db psql -U postgres -d ethio_exam_hall
```

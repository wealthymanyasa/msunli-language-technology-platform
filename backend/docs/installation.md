# Installation Guide

## MSUNLI Language Technology Platform

---

## Prerequisites

- Python 3.11 or higher
- PostgreSQL 14+ (for production) or SQLite (for local development)
- Redis 6+ (optional, for caching and rate limiting)
- Docker and Docker Compose (recommended for production)

---

## Option 1: Docker (Recommended)

### Step 1: Clone the repository

```bash
git clone https://github.com/wealthymanyasa/msunli-language-technology-platform.git
cd msunli-language-technology-platform/backend
```

### Step 2: Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set a secure `JWT_SECRET`.

### Step 3: Start services

```bash
docker-compose -f docker/docker-compose.yml up -d
```

This starts:
- `api` - FastAPI application on port 8000
- `db` - PostgreSQL 15 on port 5432
- `redis` - Redis 7 on port 6379

### Step 4: Run migrations

```bash
docker-compose -f docker/docker-compose.yml exec api alembic upgrade head
```

### Step 5: Seed initial data

```bash
docker-compose -f docker/docker-compose.yml exec api python scripts/seed.py
```

### Step 6: Verify

```bash
curl http://localhost:8000/health
```

---

## Option 2: Local Development

### Step 1: Clone and setup

```bash
git clone https://github.com/wealthymanyasa/msunli-language-technology-platform.git
cd msunli-language-technology-platform/backend
```

### Step 2: Create virtual environment

```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# Linux/macOS
python3 -m venv .venv
source .venv/bin/activate
```

### Step 3: Install dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Configure environment

```bash
cp .env.example .env
```

Update `.env` with your local PostgreSQL and Redis connection strings:
```ini
DATABASE_URL=postgresql://user:password@localhost:5432/zilp
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-key-change-this
```

### Step 5: Create database

```bash
psql -U postgres -c "CREATE DATABASE zilp;"
psql -U postgres -c "CREATE USER zilp WITH PASSWORD 'zilp_secret';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE zilp TO zilp;"
```

### Step 6: Run migrations

```bash
alembic upgrade head
```

### Step 7: Start services

```bash
# Terminal 1: Redis (if not running)
redis-server

# Terminal 2: PostgreSQL (if not running)

# Terminal 3: Start the API
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Step 8: Seed data

```bash
python scripts/seed.py
```

### Step 9: Verify

```bash
curl http://localhost:8000/health
```

---

## Running Tests

```bash
# Run all tests
pytest tests/ -v

# Run with coverage
pytest tests/ -v --cov=app --cov-report=term-missing

# Run specific test file
pytest tests/test_api.py -v

# Run specific test class
pytest tests/test_cleaner.py -v -k "TestTextCleaner"
```

---

## Troubleshooting

### PostgreSQL connection refused
Ensure PostgreSQL is running and accessible:
```bash
pg_isready -h localhost -p 5432
```

### Redis connection refused
Ensure Redis is running:
```bash
redis-cli ping
# Should return: PONG
```

### ModuleNotFoundError
Ensure the virtual environment is activated and dependencies are installed:
```bash
pip install -r requirements.txt
```

### Alembic migration issues
Reset the database:
```bash
alembic downgrade base
alembic upgrade head
```

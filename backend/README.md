# MSUNLI Language Technology Platform (ZILP)

> Production-grade text processing platform for Zimbabwean indigenous languages.

[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688.svg)](https://fastapi.tiangolo.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Features

- **Multi-Language Support**: Shona (sn), Ndebele (nd), Tonga (to), Nambya (nm), English (en)
- **Text Cleaning**: URL removal, HTML stripping, emoji removal, diacritics normalization, number removal
- **Tokenization**: Language-aware word tokenization with stopword removal
- **Full Pipeline Processing**: Clean -> Normalize -> Detect Language -> Tokenize -> Stopword Removal -> Frequency Analysis
- **Language Detection**: Heuristic-based detection for all supported languages
- **Authentication**: JWT-based auth with access & refresh tokens, API key support
- **User Management**: Registration, login, role-based access, request history
- **Data Persistence**: PostgreSQL with SQLAlchemy ORM, Alembic migrations, soft deletes, UUID PKs
- **Caching**: Redis for tokenization, language detection, and statistics caching
- **Rate Limiting**: Redis-backed rate limiting with configurable thresholds
- **Structured Logging**: JSON-formatted logs with request IDs, correlation IDs, execution times
- **Dockerized**: Production-ready Docker Compose with API, PostgreSQL, and Redis services
- **Extensible Architecture**: Plugin-ready for Phase 2-5 features (POS tagging, NER, ML models, RAG)

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/wealthymanyasa/msunli-language-technology-platform.git
cd msunli-language-technology-platform/backend

# Copy environment configuration
cp .env.example .env

# Start services with Docker
docker-compose -f docker/docker-compose.yml up -d

# Run database migrations
docker-compose -f docker/docker-compose.yml exec api alembic upgrade head

# Seed initial users
docker-compose -f docker/docker-compose.yml exec api python scripts/seed.py
```

The API will be available at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

---

## API Endpoints

### System

| Method | Path        | Description              |
|--------|-------------|--------------------------|
| GET    | `/`         | API root with version    |
| GET    | `/health`   | Health check             |
| GET    | `/version`  | Version information      |

### Authentication

| Method | Path              | Description                |
|--------|-------------------|----------------------------|
| POST   | `/auth/register`  | Register a new user        |
| POST   | `/auth/login`     | Login (form data)          |
| POST   | `/auth/login/json`| Login (JSON body)          |
| POST   | `/auth/refresh`   | Refresh access token       |
| GET    | `/auth/me`        | Get current user profile   |

### Text Processing

| Method | Path                     | Description                  |
|--------|--------------------------|------------------------------|
| POST   | `/api/v1/clean`          | Clean and normalize text     |
| POST   | `/api/v1/tokenize`       | Tokenize text                |
| POST   | `/api/v1/process`        | Full processing pipeline     |
| POST   | `/api/v1/detect-language`| Detect text language         |
| POST   | `/api/v1/tokenize/batch` | Batch tokenize multiple texts|
| GET    | `/api/v1/statistics`     | Get text statistics          |

---

## Example Usage

```bash
# Register a user
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","username":"testuser","password":"securepass123!"}'

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser&password=securepass123!"

# Process text
curl -X POST http://localhost:8000/api/v1/process \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"text": "Ndiri kuenda kuchikoro nhasi."}'

# Detect language
curl -X POST http://localhost:8000/api/v1/detect-language \
  -H "Content-Type: application/json" \
  -d '{"text": "Ndiri kuenda kuchikoro nhasi."}'

# Tokenize in Shona
curl -X POST http://localhost:8000/api/v1/tokenize \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"text": "Mhuri yese yakaungana pamba pavakuru.", "language": "sn"}'

# Batch tokenize
curl -X POST http://localhost:8000/api/v1/tokenize/batch \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"texts": ["Mhuri yese yakaungana.", "Vana vaitamba panze."], "language": "sn"}'
```

---

## Architecture

```
backend/
├── app/
│   ├── main.py              # FastAPI application entry point
│   ├── api/                 # API route handlers (auth, text processing)
│   ├── core/                # Configuration, dependencies, logging
│   ├── services/            # Business logic (cleaner, tokenizer, processor)
│   ├── repositories/        # Data access layer
│   ├── models/              # SQLAlchemy ORM models
│   ├── schemas/             # Pydantic request/response schemas
│   ├── middleware/          # Request logging, rate limiting
│   ├── linguistics/         # Language processors (Shona, Ndebele, etc.)
│   ├── ml/                  # ML models extension point (Phase 3+)
│   ├── cache/               # Redis caching layer
│   ├── auth/                # JWT and security utilities
│   └── monitoring/          # Statistics and monitoring
├── tests/                   # Unit, integration, and API tests
├── migrations/              # Alembic database migrations
├── docs/                    # Documentation
├── docker/                  # Docker Compose and Dockerfile
└── scripts/                 # Utility scripts (seeding)
```

---

## Environment Variables

| Variable                     | Default           | Description                        |
|------------------------------|-------------------|------------------------------------|
| `DATABASE_URL`               | See .env.example  | PostgreSQL connection string        |
| `REDIS_URL`                  | See .env.example  | Redis connection string             |
| `JWT_SECRET`                 | (required)        | JWT signing secret                  |
| `JWT_ALGORITHM`              | HS256             | JWT signing algorithm               |
| `JWT_EXPIRATION_MINUTES`     | 30                | Access token TTL                    |
| `JWT_REFRESH_EXPIRATION_DAYS`| 7                 | Refresh token TTL                   |
| `API_RATE_LIMIT`             | 100               | Max requests per window             |
| `API_RATE_LIMIT_WINDOW`      | 60                | Rate limit window in seconds        |
| `LOG_LEVEL`                  | INFO              | Logging level                       |
| `LOG_FORMAT`                 | json              | Log format (json or text)           |

---

## Development

```bash
# Create virtual environment
python -m venv .venv
.venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Run tests
pytest tests/ -v --cov=app

# Format code
black app/ tests/
isort app/ tests/

# Type check
mypy app/
```

---

## Adding a New Language

1. Create `app/linguistics/<language>.py` extending `BaseLanguageProcessor`
2. Define stopwords, prefixes, clitics in a `LanguageConfig`
3. Register it in `app/services/processor.py` `__init__`
4. Add it to `app/linguistics/__init__.py`
5. Update `TokenizerConfig.for_language()` in `app/services/tokenizer.py`

---

## License

MIT License - see LICENSE file.

## Acknowledgments

Built with [FastAPI](https://fastapi.tiangolo.com), [SQLAlchemy](https://www.sqlalchemy.org), [Redis](https://redis.io), [PostgreSQL](https://www.postgresql.org).

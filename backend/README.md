<div align="center">
  <br/>
  <h1>MSUNLI Language Technology Platform</h1>
  <h3>Zimbabwean Indigenous Language Processing · Production-Grade NLP</h3>
  <br/>
  <p>
    <img src="https://img.shields.io/badge/python-3.11%2B-3776AB?logo=python&logoColor=white" alt="Python 3.11+">
    <img src="https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi&logoColor=white" alt="FastAPI">
    <img src="https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL">
    <img src="https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white" alt="Redis">
    <img src="https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white" alt="Docker">
    <img src="https://img.shields.io/badge/license-MIT-yellow" alt="License: MIT">
    <img src="https://img.shields.io/badge/tests-89%20passing-brightgreen" alt="Tests: 89 passing">
  </p>
  <br/>
</div>

---

## Overview

MSUNLI Language Technology Platform is a production-grade, multi-lingual text processing API built for Zimbabwean indigenous languages. It provides text cleaning, language detection, tokenization, and frequency analysis for **Shona**, **Ndebele**, **Tonga**, **Nambya**, and **English** — with an extensible architecture designed to support any language.

Built on **FastAPI**, backed by **PostgreSQL** and **Redis**, secured with **JWT authentication**, and fully containerized with **Docker**.

---

## Why MSUNLI?

Most African languages are underserved in NLP tooling. This platform bridges that gap by providing:

- **Language-aware tokenization** with stopword removal for Bantu languages
- **Heuristic language detection** that works without external dependencies or internet
- **Extensible architecture** — adding a new language is a single file
- **Production readiness** — auth, rate limiting, structured logging, persistent storage, caching

---

## Features

### Core NLP
| Feature | Description |
|---------|-------------|
| **Text Cleaning** | URL stripping, HTML removal, emoji sanitization, diacritics normalization, number removal, Unicode normalization |
| **Tokenization** | Language-aware word splitting with stopword removal |
| **Language Detection** | Heuristic scoring across all supported languages (no external APIs) |
| **Full Pipeline** | Clean → Normalize → Detect → Tokenize → Stopword Removal → Frequency Analysis |
| **Batch Processing** | Process multiple texts in a single request |

### Infrastructure
| Feature | Description |
|---------|-------------|
| **Authentication** | JWT access & refresh tokens, API key support, bcrypt password hashing |
| **User Management** | Registration, login, role-based access (user/admin), request history |
| **PostgreSQL** | SQLAlchemy ORM, Alembic migrations, UUID primary keys, soft deletes |
| **Redis Caching** | Tokenization, language detection, statistics caching, rate limiting counters |
| **Rate Limiting** | Per-IP, per-endpoint throttling with configurable windows |
| **Structured Logging** | JSON-formatted logs with request IDs, correlation IDs, execution times |
| **Docker** | Multi-service orchestration with health checks |

### Extensibility
| Phase | Planned Features |
|-------|-----------------|
| **Phase 2** | POS Tagging, Lemmatization, Morphological Analysis, Named Entity Recognition |
| **Phase 3** | ML-based language identification (FastText, XGBoost, Transformers) |
| **Phase 4** | Terminology services, multilingual glossaries, concept linking |
| **Phase 5** | Vector search, embeddings, RAG APIs, LLM integration |

---

## Quick Start

### Prerequisites

- Python 3.11+
- Docker & Docker Compose (recommended)
- PostgreSQL 15+ (if running locally)
- Redis 7+ (if running locally)

### Docker (Recommended)

```bash
# Clone
git clone https://github.com/wealthymanyasa/msunli-language-technology-platform.git
cd msunli-language-technology-platform/backend

# Configure
cp .env.example .env
# Edit .env — set a strong JWT_SECRET

# Launch
docker compose -f docker/docker-compose.yml up -d

# Migrate & seed
docker compose -f docker/docker-compose.yml exec api alembic upgrade head
docker compose -f docker/docker-compose.yml exec api python scripts/seed.py

# Verify
curl http://localhost:8000/health
```

### Local Development

```bash
# Environment
python -m venv .venv && source .venv/bin/activate  # Linux/macOS
python -m venv .venv && .venv\Scripts\activate     # Windows

# Dependencies
pip install -r requirements.txt

# Database
createdb zilp
alembic upgrade head
python scripts/seed.py

# Start
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## API Reference

### System

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | No | API root with metadata |
| GET | `/health` | No | Health check (DB, Redis, languages) |
| GET | `/version` | No | Version & runtime information |
| GET | `/docs` | No | Interactive Swagger documentation |
| GET | `/redoc` | No | ReDoc documentation |

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Create account |
| POST | `/auth/login` | No | Login (form data, OAuth2 compatible) |
| POST | `/auth/login/json` | No | Login (JSON body) |
| POST | `/auth/refresh` | No | Refresh access token |
| GET | `/auth/me` | JWT/API Key | Current user profile |

### Text Processing

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/clean` | Optional | Clean & normalize text |
| POST | `/api/v1/tokenize` | Optional | Language-aware tokenization |
| POST | `/api/v1/process` | Optional | Full pipeline processing |
| POST | `/api/v1/detect-language` | No | Detect text language |
| POST | `/api/v1/tokenize/batch` | Optional | Batch tokenization |
| GET | `/api/v1/statistics` | Optional | Word frequency analysis |

> **Auth**: `Optional` means the endpoint works without authentication but persists request history when authenticated. `No` means no auth required.

---

## Example Workflows

### 1. Language Detection

```bash
curl -s -X POST http://localhost:8000/api/v1/detect-language \
  -H "Content-Type: application/json" \
  -d '{"text": "Ndiri kuenda kuchikoro nhasi."}' | jq
```

```json
{
  "language": "Shona",
  "language_code": "sn",
  "confidence": 0.98
}
```

### 2. Full Pipeline Processing

```bash
curl -s -X POST http://localhost:8000/api/v1/process \
  -H "Content-Type: application/json" \
  -d '{"text": "Ndiri kuenda kuchikoro nhasi."}' | jq
```

```json
{
  "original_text": "Ndiri kuenda kuchikoro nhasi.",
  "cleaned_text": "ndiri kuenda kuchikoro nhasi",
  "language": "Shona",
  "language_code": "sn",
  "detected_language": "Shona",
  "detection_confidence": 0.98,
  "tokens": ["ndiri", "kuenda", "kuchikoro", "nhasi"],
  "token_count": 4,
  "unique_words": 4,
  "word_frequency": {
    "ndiri": 1, "kuenda": 1, "kuchikoro": 1, "nhasi": 1
  },
  "execution_time_ms": 2.45
}
```

### 3. Authenticated Usage

```bash
# Register
curl -s -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","username":"dev","password":"Str0ng!Pass"}' | jq

# Login
TOKEN=$(curl -s -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=dev&password=Str0ng!Pass" | jq -r '.access_token')

# Use token
curl -s -X POST http://localhost:8000/api/v1/tokenize \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text": "Mhuri yese yakaungana pamba pavakuru.", "language": "sn"}' | jq
```

### 4. Shona Tokenization

```bash
curl -s -X POST http://localhost:8000/api/v1/tokenize \
  -H "Content-Type: application/json" \
  -d '{"text": "Mhuri yese yakaungana pamba pavakuru.", "language": "sn"}'
```

```json
{
  "tokens": ["mhuri", "yese", "yakaungana", "pamba", "pavakuru"],
  "token_count": 5,
  "language": "Shona",
  "language_code": "sn"
}
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Layer                          │
│              CLI · Web · Mobile · Integrations               │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP/HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        API Layer                             │
│     Auth Routes          Text Routes         System Routes   │
│    /auth/register      /api/v1/tokenize      /health         │
│    /auth/login         /api/v1/process       /version        │
│    /auth/refresh       /api/v1/detect-lang    /docs          │
│    /auth/me            /api/v1/statistics                   │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Middleware Layer                          │
│     Request Logging (correlation ID)  ·  Rate Limiting       │
│     Auth Validation                   ·  CORS                │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Service Layer                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  ┌─────────┐ │
│  │ Cleaner  │  │Tokenizer │  │  Processor   │  │ Detector│ │
│  └────┬─────┘  └────┬─────┘  └──────┬───────┘  └────┬────┘ │
└───────┼──────────────┼───────────────┼───────────────┼───────┘
        ▼              ▼              ▼               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Linguistics Layer                           │
│  ┌──────┐ ┌────────┐ ┌───────┐ ┌────────┐ ┌─────────────┐  │
│  │Shona │ │Ndebele │ │ Tonga │ │ Nambya │ │   English   │  │
│  └──────┘ └────────┘ └───────┘ └────────┘ └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
        │              │              │               │
        ▼              ▼              ▼               ▼
┌─────────────────────────────────────────────────────────────┐
│                       Data Layer                              │
│  ┌──────────────────────┐  ┌──────────────────────────────┐  │
│  │      PostgreSQL      │  │         Redis                │  │
│  │  Users · Processes   │  │  Cache · Rate Limits         │  │
│  └──────────────────────┘  └──────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Request Flow

```
Client ──► FastAPI ──► LoggingMiddleware ──► RateLimiter ──► Auth ──► Handler
                                                                          │
                                    ┌─────────────────────────────────────┤
                                    ▼                                     ▼
                            TextCleaner                           LanguageDetector
                            Tokenizer                             TextProcessor
                            ─────────                             ─────────────
                            Return response                      Clean + Detect
                                                                  Tokenize + Freq
                                                                  Return response
                                    │
                                    ▼
                              Redis Cache
                              (check/store)
                                    │
                                    ▼
                             PostgreSQL
                             (persist if auth'd)
                                    │
                                    ▼
                              JSON Response
```

---

## Supported Languages

| Code | Language | Family | Speakers | Status |
|------|----------|--------|----------|--------|
| `sn` | Shona | Bantu | ~15M | ✅ Production |
| `nd` | Ndebele | Bantu | ~5M | ✅ Production |
| `to` | Tonga | Bantu | ~2M | ✅ Production |
| `nm` | Nambya | Bantu | ~100K | ✅ Production |
| `en` | English | Germanic | ~1.5B | ✅ Production |

### Adding a New Language

The language framework is designed for extensibility. Adding a new language requires no changes to core infrastructure:

```python
# 1. Create app/linguistics/your_language.py
from app.linguistics.base import BaseLanguageProcessor, LanguageConfig

MY_LANG_CONFIG = LanguageConfig(
    code="xx",
    name="My Language",
    stopwords={"set", "of", "stopwords"},
    prefixes={"set", "of", "prefixes"},
)

class MyLanguageProcessor(BaseLanguageProcessor):
    def clean(self, text): ...
    def tokenize(self, text, **kwargs): ...

# 2. Register in app/services/processor.py
self._processors["xx"] = MyLanguageProcessor()

# 3. Register in app/services/tokenizer.py
configs["xx"] = TokenizerConfig(language="xx", ...)

# 4. Register in app/linguistics/__init__.py
from .my_language import MyLanguageProcessor
```

---

## Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `REDIS_URL` | Yes | — | Redis connection string |
| `JWT_SECRET` | Yes | — | JWT signing secret (min 32 chars) |
| `JWT_ALGORITHM` | No | `HS256` | JWT signing algorithm |
| `JWT_EXPIRATION_MINUTES` | No | `30` | Access token lifetime |
| `JWT_REFRESH_EXPIRATION_DAYS` | No | `7` | Refresh token lifetime |
| `API_RATE_LIMIT` | No | `100` | Max requests per window |
| `API_RATE_LIMIT_WINDOW` | No | `60` | Window duration (seconds) |
| `CORS_ORIGINS` | No | `["*"]` | Allowed CORS origins |
| `LOG_LEVEL` | No | `INFO` | Logging granularity |
| `LOG_FORMAT` | No | `json` | Log format (`json` or `text`) |
| `DEBUG` | No | `false` | Enable debug mode |

---

## Development

```bash
# Tests
pytest tests/ -v                          # All tests
pytest tests/ -v --cov=app                # With coverage
pytest tests/test_api.py -v               # API tests only

# Code quality
black app/ tests/                         # Format
isort app/ tests/                         # Sort imports
flake8 app/ tests/                        # Lint
mypy app/                                 # Type check

# Database migrations
alembic revision --autogenerate -m "desc" # Create migration
alembic upgrade head                      # Apply
alembic downgrade -1                      # Roll back
```

---

## Deployment

### Production Checklist

- [ ] Set `JWT_SECRET` to a cryptographic random string (`openssl rand -hex 32`)
- [ ] Change PostgreSQL credentials
- [ ] Enable Redis password authentication
- [ ] Restrict `CORS_ORIGINS` to your domain(s)
- [ ] Set `DEBUG=false`
- [ ] Set `LOG_LEVEL=WARNING` or `ERROR`
- [ ] Configure HTTPS via reverse proxy (Nginx, Traefik)
- [ ] Set up automated database backups
- [ ] Configure resource limits in Docker Compose

### Docker Compose (Production)

```bash
docker compose -f docker/docker-compose.yml --env-file .env.production up -d
```

---

## Testing

```
✅ 89 tests · 6 test modules · all passing
```

| Module | Tests | Scope |
|--------|-------|-------|
| `test_api.py` | 18 | System, clean, tokenize, process, detect, batch, statistics, validation |
| `test_cleaner.py` | 11 | URL/HTML/emoji removal, diacritics, numbers, whitespace, stats |
| `test_tokenizer.py` | 11 | Config creation, tokenization, parametrized edge cases |
| `test_linguistics.py` | 14 | All 5 languages: clean, tokenize, detect, analyze |
| `test_processor.py` | 12 | Service orchestration, batch, statistics, error handling |
| `test_auth.py` | 8 | JWT creation/decoding, password hashing, API key generation |
| `test_repositories.py` | 4 | Data access layer with mocked database |

---

## Project Structure

```
backend/
├── app/                         # Application source
│   ├── main.py                  # FastAPI entry, lifespan, exception handlers
│   ├── api/                     # Route handlers
│   │   ├── auth.py              #   Auth endpoints
│   │   └── routes.py            #   Text processing endpoints
│   ├── core/                    # Foundation
│   │   ├── config.py            #   Settings (pydantic-settings)
│   │   ├── dependencies.py      #   DI (auth, rate limit)
│   │   └── logging_conf.py      #   Structured JSON logging
│   ├── services/                # Business logic
│   │   ├── cleaner.py           #   Text cleaning engine
│   │   ├── tokenizer.py         #   Tokenizer with config
│   │   └── processor.py         #   Pipeline orchestrator
│   ├── repositories/            # Data access layer
│   │   ├── base_repository.py   #   Generic CRUD with soft deletes
│   │   ├── user_repository.py   #   User queries
│   │   └── text_repository.py   #   Text process queries
│   ├── models/                  # SQLAlchemy ORM
│   │   ├── base.py              #   Engine, session, timestamp mixin
│   │   ├── user.py              #   User model
│   │   └── text_process.py      #   TextProcess model
│   ├── schemas/                 # Pydantic models
│   │   ├── auth.py              #   Auth request/response
│   │   └── text.py              #   Text processing request/response
│   ├── middleware/              # HTTP middleware
│   │   ├── logging_middleware.py #   Request ID, correlation ID
│   │   └── rate_limit_middleware.py
│   ├── linguistics/             # Language processors
│   │   ├── base.py              #   Abstract base class
│   │   ├── shona.py             #   Shona (sn)
│   │   ├── ndebele.py           #   Ndebele (nd)
│   │   ├── tonga.py             #   Tonga (to)
│   │   ├── nambya.py            #   Nambya (nm)
│   │   └── english.py           #   English (en)
│   ├── cache/                   # Caching
│   │   └── redis.py             #   Redis client wrapper
│   ├── auth/                    # Security
│   │   ├── jwt.py               #   Token creation/validation
│   │   └── security.py          #   Password hashing, API keys
│   ├── ml/                      # (Phase 3+ extension point)
│   └── monitoring/              # (extension point)
├── tests/                       # Test suite (89 tests)
├── migrations/                  # Alembic migrations
│   ├── alembic.ini
│   ├── env.py
│   ├── script.py.mako
│   └── versions/001_initial_schema.py
├── docker/                      # Containerization
│   ├── Dockerfile               #   Production image
│   ├── docker-compose.yml       #   Multi-service orchestration
│   └── .dockerignore
├── docs/                        # Documentation
│   ├── api.md                   #   Full API reference
│   ├── architecture.md          #   System design
│   ├── installation.md          #   Setup guide
│   └── deployment.md            #   Production deployment
├── scripts/                     # Utilities
│   └── seed.py                  #   Initial user seeding
├── requirements.txt
├── .env.example
├── .gitignore
└── README.md
```

---

## Roadmap

```
Phase 1 (Current)          Phase 2 (Next)            Phase 3 (Future)
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│ Text Cleaning   │       │ POS Tagging     │       │ ML Language ID  │
│ Tokenization    │  ──►  │ Lemmatization   │  ──►  │ FastText        │
│ Language Detect │       │ Morphological   │       │ XGBoost         │
│ Auth & Users    │       │ NER             │       │ Transformers    │
│ PostgreSQL      │       │                 │       │                 │
│ Redis Cache     │       │                 │       │                 │
└─────────────────┘       └─────────────────┘       └─────────────────┘

Phase 4                      Phase 5
┌─────────────────┐       ┌─────────────────┐
│ Terminology     │       │ Vector Search   │
│ Glossaries      │  ──►  │ Embeddings      │
│ Concept Linking │       │ RAG APIs        │
│                 │       │ LLM Integration │
└─────────────────┘       └─────────────────┘
```

---

## Contributing

Contributions are welcome. To add a new language, see the [Adding a New Language](#adding-a-new-language) section. For code changes:

1. Fork the repository
2. Create a feature branch
3. Write tests for your changes
4. Ensure all 89 tests pass: `pytest tests/ -v`
5. Submit a pull request

---

## License

MIT License. See [LICENSE](../LICENSE) for details.

---

## Acknowledgments

- Built with [FastAPI](https://fastapi.tiangolo.com), [SQLAlchemy](https://www.sqlalchemy.org), [Redis](https://redis.io), [PostgreSQL](https://www.postgresql.org)
- Language data curated with guidance from linguistic resources for Shona, Ndebele, Tonga, and Nambya
- Inspired by the need for equitable NLP tooling for African languages

---

<div align="center">
  <sub>Preserving and promoting Zimbabwean indigenous languages through technology</sub>
</div>

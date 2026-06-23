# Architecture Overview

## MSUNLI Language Technology Platform

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  (CLI, Web App, Mobile App, Third-party Integrations)        │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP/HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        API Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Auth Routes   │  │ Text Routes  │  │ System Routes    │  │
│  │ /auth/*       │  │ /api/v1/*   │  │ /health, /version│  │
│  └──────┬───────┘  └──────┬───────┘  └──────────────────┘  │
└─────────┼──────────────────┼────────────────────────────────┘
          │                  │
          ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    Middleware Layer                            │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │ Request Logging   │  │ Rate Limiting    │                 │
│  │ (correlation ID)  │  │ (Redis-backed)   │                 │
│  └──────────────────┘  └──────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
          │                  │
          ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                     Service Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ TextCleaner   │  │  Tokenizer   │  │  TextProcessor   │  │
│  │ (clean text)  │  │ (tokenize)   │  │  (orchestrator)  │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
└─────────┼──────────────────┼──────────────────┼────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                  Linguistics Layer                             │
│  ┌──────────┐┌──────────┐┌──────────┐┌──────────┐┌───────┐ │
│  │  Shona   ││ Ndebele  ││  Tonga   ││  Nambya  ││English│ │
│  └──────────┘└──────────┘└──────────┘└──────────┘└───────┘ │
└─────────────────────────────────────────────────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    Cache Layer                                 │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    Redis Cache                          │  │
│  │  (tokenization, detection, statistics, rate limiting)   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Layer                                   │
│  ┌──────────────────────┐  ┌──────────────────────────────┐ │
│  │      PostgreSQL       │  │       Redis                  │ │
│  │  (users, processes)   │  │  (cache, sessions, limits)   │ │
│  └──────────────────────┘  └──────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Request Flow

```
Client Request
    │
    ▼
FastAPI Application
    │
    ▼
RequestLoggingMiddleware (adds request_id, correlation_id)
    │
    ▼
RateLimitMiddleware (checks Redis for rate limits)
    │
    ▼
Auth Dependency (validates JWT or API key)
    │
    ▼
Route Handler
    │
    ├── Text Cleaning ──► TextCleaner ──► Linguistics Layer
    ├── Tokenization ──► Tokenizer ──► Linguistics Layer
    ├── Full Process ──► TextProcessor
    │                       ├── TextCleaner
    │                       ├── Language Detector
    │                       ├── Tokenizer
    │                       └── Frequency Analyzer
    ├── Language Detection ──► Linguistics Layer
    └── Statistics ──► TextProcessor
    │
    ▼
Redis Cache (check/store)
    │
    ▼
PostgreSQL (persist request)
    │
    ▼
JSON Response
```

## Data Flow for /api/v1/process

```
Input: {"text": "Ndiri kuenda kuchikoro nhasi."}
    │
    ▼
1. Text Cleaning
   - Remove URLs, emails, HTML, emojis
   - Normalize unicode, punctuation
   - Lowercase
   Result: "ndiri kuenda kuchikoro nhasi"
    │
    ▼
2. Language Detection
   - Run heuristic detection against all processors
   - Pick highest confidence match
   Result: {"code": "sn", "name": "Shona", "confidence": 0.98}
    │
    ▼
3. Tokenization
   - Get Shona processor
   - Split into words
   Result: ["ndiri", "kuenda", "kuchikoro", "nhasi"]
    │
    ▼
4. Stopword Removal
   - Filter against Shona stopwords
   Result: ["ndiri", "kuenda", "kuchikoro", "nhasi"]
    │
    ▼
5. Frequency Analysis
   - Count word occurrences
   Result: {"ndiri": 1, "kuenda": 1, "kuchikoro": 1, "nhasi": 1}
    │
    ▼
Output: {
    "language": "Shona",
    "confidence": 0.98,
    "tokens": ["ndiri", "kuenda", "kuchikoro", "nhasi"],
    "token_count": 4,
    ...
}
```

## Architecture Decisions

### Why SQLAlchemy + Alembic?
- Industry-standard ORM for Python
- Alembic provides additive migrations (never drop data)
- UUID primary keys for distributed compatibility
- Soft deletes prevent accidental data loss

### Why Redis?
- In-memory caching for tokenization results (5-min TTL)
- Language detection caching (10-min TTL)
- Statistics caching (10-min TTL)
- Rate limiting counters with automatic expiry

### Why Layered Architecture?
- **Separation of concerns**: Each layer has a single responsibility
- **Testability**: Each layer can be mocked and tested independently
- **Extensibility**: New languages = new linguistics module. New features = new service.
- **Maintainability**: Clear boundaries prevent tight coupling

### Extensibility Points

```
Phase 2: POS Tagging, Lemmatization
  → Add app/linguistics/analyzers/ directory
  → Extend BaseLanguageProcessor with analyze_pos(), lemmatize()

Phase 3: ML Language Identification
  → Add app/ml/detectors/ directory
  → Implement BaseLanguageDetector interface
  → Swap in TextProcessor.detect_language()

Phase 4: Terminology Services
  → Add app/services/terminology.py
  → Add app/models/glossary.py
  → Add terminology API routes

Phase 5: Vectors, Embeddings, RAG
  → Add app/ml/embeddings/ directory
  → Add app/services/rag.py
  → Add vector search API routes
```

## Security Architecture

- **Password Hashing**: bcrypt via passlib
- **JWT Tokens**: HS256 with configurable expiry
- **Refresh Tokens**: Separate token type with 7-day TTL
- **API Keys**: SHA-256 hashed, prefix `zilp_`
- **Rate Limiting**: Per-IP, per-endpoint, Redis-backed
- **Input Validation**: Pydantic schemas with strict validation
- **SQL Injection**: Prevented by SQLAlchemy parameterized queries

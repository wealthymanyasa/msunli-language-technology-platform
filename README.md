<div align="center">
  <br/>
  <h1>MSUNLI Language Technology Platform</h1>
  <h3><em>Zimbabwean Indigenous Language Processing · Production-Grade NLP</em></h3>
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

A production-grade, multi-lingual text processing platform for **Shona**, **Ndebele**, **Tonga**, **Nambya**, and **English** — built for Zimbabwean indigenous languages, designed for any language.

---

## Repository Structure

```
msunli-language-technology-platform/
│
├── backend/                         # 🎯 Main application
│   ├── app/                         #   FastAPI application source
│   ├── tests/                       #   89 tests — all passing
│   ├── migrations/                  #   Alembic database migrations
│   ├── docker/                      #   Dockerfile + docker-compose
│   ├── docs/                        #   Architecture, API, deployment docs
│   ├── scripts/                     #   Utility scripts
│   ├── requirements.txt             #   Python dependencies
│   ├── .env.example                 #   Environment template
│   └── README.md                    #   Full platform documentation
│
├── msunli-text-processor/           # 📦 Legacy repo (merged)
├── text-processor/                  # 📦 Legacy repo (merged)
│
└── README.md                        # ← You are here
```

The entire platform lives under **`backend/`**. See [`backend/README.md`](backend/README.md) for complete documentation.

---

## Quick Start

```bash
cd backend
cp .env.example .env
docker compose -f docker/docker-compose.yml up -d
docker compose -f docker/docker-compose.yml exec api alembic upgrade head
docker compose -f docker/docker-compose.yml exec api python scripts/seed.py
curl http://localhost:8000/health
```

---

## What is this?

MSUNLI Language Technology Platform is a **production-grade NLP API** that provides:

| Capability | Description |
|---|---|
| **Text Cleaning** | Remove URLs, HTML, emojis, diacritics, numbers — normalize Unicode |
| **Language Detection** | Identify Shona, Ndebele, Tonga, Nambya, English without external APIs |
| **Tokenization** | Language-aware word splitting with stopword removal |
| **Full Pipeline** | Clean → Normalize → Detect → Tokenize → Stopword Removal → Frequency Analysis |
| **Batch Processing** | Process hundreds of texts in a single request |

Backed by **PostgreSQL** (persistence), **Redis** (caching & rate limiting), **JWT** (auth), and **Docker** (deployment).

---

## Supported Languages

| Code | Language | Family | Native Speakers |
|------|----------|--------|-----------------|
| `sn` | Shona | Bantu (Niger-Congo) | ~15 million |
| `nd` | Ndebele | Bantu (Niger-Congo) | ~5 million |
| `to` | Tonga | Bantu (Niger-Congo) | ~2 million |
| `nm` | Nambya | Bantu (Niger-Congo) | ~100,000 |
| `en` | English | Germanic | 1.5+ billion |

---

## Origin

This platform is the result of merging two existing repositories:

1. **`msunli-text-processor/`** — contributed JWT authentication, PostgreSQL + Redis integration, rate limiting, user management, batch processing, and request persistence.
2. **`text-processor/`** — contributed the text cleaning engine, language-aware tokenization, structured logging, proper validation, testing structure, and cleaner NLP components.

Both legacy directories are preserved for reference. The merged platform lives entirely in **`backend/`**.

---

## Architecture (High-Level)

```
Client
  │
  ▼
API Layer ──► Middleware (logging, rate limiting)
  │
  ▼
Services (cleaner, tokenizer, processor)
  │
  ▼
Linguistics (Shona, Ndebele, Tonga, Nambya, English)
  │
  ▼
Data Layer (PostgreSQL + Redis)
```

The architecture is **extensible by design**. Adding a new language requires one file and one registration line. ML models, vector search, and RAG can be added in future phases without refactoring.

---

## Documentation

| Document | Description |
|---|---|
| [`backend/README.md`](backend/README.md) | Full platform documentation (features, API, examples, config) |
| [`backend/docs/api.md`](backend/docs/api.md) | Complete API reference with request/response examples |
| [`backend/docs/architecture.md`](backend/docs/architecture.md) | System design, data flow, architecture decisions |
| [`backend/docs/installation.md`](backend/docs/installation.md) | Local and Docker setup guide |
| [`backend/docs/deployment.md`](backend/docs/deployment.md) | Production deployment, scaling, security |

---

## Testing

```
✅ 89 tests · 7 test modules · all passing
```

```bash
cd backend
pytest tests/ -v --cov=app
```

---

## Roadmap

```
Phase 1 ✅  │  Phase 2 🔜  │  Phase 3 🔮  │  Phase 4 🔮  │  Phase 5 🔮
────────────┼──────────────┼──────────────┼──────────────┼──────────────
Clean       │  POS Tagging │  ML Lang ID  │  Terminology │  Vector Search
Tokenize    │  Lemmatize   │  FastText    │  Glossaries  │  Embeddings
Lang Detect │  Morphology  │  XGBoost     │  Concept     │  RAG APIs
Auth        │  NER         │  Transformer │  Linking     │  LLM Integration
PostgreSQL  │              │              │              │
Redis       │              │              │              │
Docker      │              │              │              │
```

---

## License

MIT

---

<div align="center">
  <sub>Preserving and promoting Zimbabwean indigenous languages through technology</sub>
</div>

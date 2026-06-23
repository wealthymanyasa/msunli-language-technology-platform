# API Documentation

## MSUNLI Language Technology Platform v1.0.0

---

## Base URL

```
http://localhost:8000
```

## Authentication

### POST /auth/register

Create a new user account.

**Request:**
```json
{
    "email": "user@example.com",
    "username": "testuser",
    "password": "securepass123!"
}
```

**Response (201):**
```json
{
    "id": "uuid",
    "email": "user@example.com",
    "username": "testuser",
    "is_active": true,
    "role": "user",
    "created_at": "2026-06-23T12:00:00",
    "updated_at": "2026-06-23T12:00:00"
}
```

### POST /auth/login

Login using form data (OAuth2 compatible).

**Request (form-data):**
```
username: testuser
password: securepass123!
```

**Response (200):**
```json
{
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "bearer"
}
```

### POST /auth/refresh

Refresh an expired access token.

**Request:**
```json
{
    "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "bearer"
}
```

### GET /auth/me

Get current authenticated user profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
    "id": "uuid",
    "email": "user@example.com",
    "username": "testuser",
    "is_active": true,
    "role": "user",
    "api_key": "zilp_...",
    "created_at": "2026-06-23T12:00:00",
    "updated_at": "2026-06-23T12:00:00",
    "last_login_at": null
}
```

---

## Text Processing

### POST /api/v1/clean

Clean and normalize text. No authentication required.

**Request:**
```json
{
    "text": "Hello, World! Check https://example.com 😊",
    "remove_diacritics": false,
    "remove_numbers": true,
    "remove_emojis": true
}
```

**Response (200):**
```json
{
    "cleaned_text": "hello world check",
    "original_length": 47,
    "cleaned_length": 17,
    "removed_characters": 30
}
```

### POST /api/v1/tokenize

Tokenize text into words. Language auto-detection if not specified.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
    "text": "Mhuri yese yakaungana pamba pavakuru.",
    "language": "sn",
    "remove_stopwords": false
}
```

**Response (200):**
```json
{
    "cleaned_text": "mhuri yese yakaungana pamba pavakuru",
    "tokens": ["mhuri", "yese", "yakaungana", "pamba", "pavakuru"],
    "token_count": 5,
    "language": "Shona",
    "language_code": "sn",
    "detected_language": "Shona",
    "detection_confidence": 0.85,
    "execution_time_ms": 1.23
}
```

### POST /api/v1/process

Full processing pipeline: Clean → Normalize → Language Detection → Tokenize → Stopword Removal → Frequency Analysis.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
    "text": "Ndiri kuenda kuchikoro nhasi.",
    "language": null
}
```

**Response (200):**
```json
{
    "original_text": "Ndiri kuenda kuchikoro nhasi.",
    "cleaned_text": "ndiri kuenda kuchikoro nhasi",
    "language": "Shona",
    "language_code": "sn",
    "detected_language": "Shona",
    "detection_confidence": 0.98,
    "tokens": ["ndiri", "kuenda", "kuchikoro", "nhasi"],
    "tokens_without_stopwords": ["ndiri", "kuenda", "kuchikoro", "nhasi"],
    "token_count": 4,
    "token_count_without_stopwords": 4,
    "unique_words": 4,
    "word_frequency": {
        "ndiri": 1,
        "kuenda": 1,
        "kuchikoro": 1,
        "nhasi": 1
    },
    "execution_time_ms": 2.45
}
```

### POST /api/v1/detect-language

Detect the language of a text.

**Request:**
```json
{
    "text": "Ndiri kuenda kuchikoro nhasi."
}
```

**Response (200):**
```json
{
    "language": "Shona",
    "language_code": "sn",
    "confidence": 0.98
}
```

### POST /api/v1/tokenize/batch

Process multiple texts in a single request.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
    "texts": [
        "Mhuri yese yakaungana.",
        "Vana vaitamba panze."
    ],
    "language": "sn",
    "remove_stopwords": false
}
```

**Response (200):**
```json
{
    "results": [
        {
            "cleaned_text": "mhuri yese yakaungana",
            "tokens": ["mhuri", "yese", "yakaungana"],
            "token_count": 3,
            "language": "Shona",
            "language_code": "sn",
            "detected_language": null,
            "detection_confidence": null,
            "execution_time_ms": 1.1
        },
        {
            "cleaned_text": "vana vaitamba panze",
            "tokens": ["vana", "vaitamba", "panze"],
            "token_count": 3,
            "language": "Shona",
            "language_code": "sn",
            "detected_language": null,
            "detection_confidence": null,
            "execution_time_ms": 0.9
        }
    ]
}
```

### GET /api/v1/statistics

Get text statistics including word frequency analysis.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `text` (required): Text to analyze
- `language` (optional): Language code

**Response (200):**
```json
{
    "language": "Shona",
    "language_code": "sn",
    "total_words": 4,
    "unique_words": 4,
    "total_characters": 30,
    "cleaned_characters": 25,
    "words_without_stopwords": 4,
    "stopwords_removed": 0,
    "word_frequency": {
        "ndiri": 1,
        "kuenda": 1,
        "kuchikoro": 1,
        "nhasi": 1
    },
    "execution_time_ms": 1.5
}
```

---

## System

### GET /

API root with metadata.

**Response (200):**
```json
{
    "name": "MSUNLI Language Technology Platform",
    "version": "1.0.0",
    "documentation": "/docs",
    "health": "/health",
    "version_endpoint": "/version"
}
```

### GET /health

Health check endpoint.

**Response (200):**
```json
{
    "status": "healthy",
    "version": "1.0.0",
    "database_ready": true,
    "redis_ready": true,
    "supported_languages": [
        {"code": "sn", "name": "Shona"},
        {"code": "nd", "name": "Ndebele"},
        {"code": "to", "name": "Tonga"},
        {"code": "nm", "name": "Nambya"},
        {"code": "en", "name": "English"}
    ]
}
```

### GET /version

Version information.

**Response (200):**
```json
{
    "app_name": "MSUNLI Language Technology Platform",
    "app_version": "1.0.0",
    "python": "3.11.5",
    "languages_supported": [
        {"code": "sn", "name": "Shona"}
    ],
    "framework": "FastAPI"
}
```

---

## Error Codes

| Status | Code       | Description                      |
|--------|------------|----------------------------------|
| 400    | Bad Request| Invalid input or validation error|
| 401    | Unauthorized| Missing or invalid token        |
| 404    | Not Found  | Resource not found               |
| 422    | Validation | Request validation failed        |
| 429    | Rate Limit | Too many requests                |
| 500    | Server Error| Internal server error           |

## Supported Languages

| Code | Language |
|------|----------|
| sn   | Shona    |
| nd   | Ndebele  |
| to   | Tonga    |
| nm   | Nambya   |
| en   | English  |

## Rate Limiting

Default: 100 requests per 60 seconds per IP address per endpoint.

Headers included in responses:
- `X-Request-ID`: Unique request identifier
- `X-Correlation-ID`: Correlation ID for request tracing
- `X-Execution-Time-Ms`: Server-side processing time

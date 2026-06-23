# Deployment Guide

## MSUNLI Language Technology Platform

---

## Production Checklist

Before deploying to production:

- [ ] Set strong `JWT_SECRET` (min 32 characters, use `openssl rand -hex 32`)
- [ ] Change PostgreSQL passwords
- [ ] Enable Redis authentication
- [ ] Configure CORS origins explicitly (not `["*"]`)
- [ ] Set `DEBUG=false`
- [ ] Set `LOG_LEVEL=WARNING` or `ERROR`
- [ ] Set appropriate rate limits
- [ ] Enable HTTPS/TLS
- [ ] Set up database backups
- [ ] Configure monitoring and alerting
- [ ] Review and apply security patches

---

## Docker Deployment

### Production Docker Compose

```yaml
version: "3.8"

services:
  api:
    build:
      context: .
      dockerfile: docker/Dockerfile
    ports:
      - "8000:8000"
    environment:
      - PYTHONPATH=/app
      - DATABASE_URL=postgresql://zilp:${DB_PASSWORD}@db:5432/zilp
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - LOG_LEVEL=ERROR
      - CORS_ORIGINS=${CORS_ORIGINS}
    restart: always
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: "1"
          memory: 1G
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  db:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=zilp
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=zilp
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./docker/init-db.sh:/docker-entrypoint-initdb.d/init-db.sh
    restart: always
    deploy:
      resources:
        limits:
          cpus: "2"
          memory: 2G
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U zilp -d zilp"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: always
    deploy:
      resources:
        limits:
          cpus: "0.5"
          memory: 256M
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./docker/ssl:/etc/nginx/ssl:ro
    depends_on:
      - api
    restart: always

volumes:
  postgres_data:
  redis_data:
```

### Environment File (.env.production)

```ini
DB_PASSWORD=super-secure-db-password
REDIS_PASSWORD=super-secure-redis-password
JWT_SECRET=your-256-bit-secret-key-here
CORS_ORIGINS=["https://app.example.com"]
```

---

## Kubernetes Deployment

### api-deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: zilp-api
  labels:
    app: zilp-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: zilp-api
  template:
    metadata:
      labels:
        app: zilp-api
    spec:
      containers:
      - name: api
        image: zilp/api:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: zilp-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: zilp-secrets
              key: redis-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: zilp-secrets
              key: jwt-secret
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 10
        resources:
          limits:
            cpu: "1"
            memory: 1Gi
          requests:
            cpu: "0.5"
            memory: 512Mi
```

---

## Database Migrations

### Initial deployment

```bash
alembic upgrade head
```

### Rolling back

```bash
# Roll back one migration
alembic downgrade -1

# Roll back to initial state
alembic downgrade base
```

### Creating new migrations

```bash
# Auto-detect schema changes
alembic revision --autogenerate -m "description_of_change"

# Create empty migration
alembic revision -m "description_of_change"
```

**Important**: Always verify auto-generated migrations before applying.

---

## Monitoring

### Health Check Endpoint

```bash
curl https://api.example.com/health
```

Response:
```json
{
    "status": "healthy",
    "version": "1.0.0",
    "database_ready": true,
    "redis_ready": true,
    "supported_languages": [...]
}
```

### Logging

All logs are JSON-structured. Example:

```json
{
    "timestamp": "2026-06-23T12:00:00.123456",
    "level": "INFO",
    "logger": "app.api.routes",
    "message": "POST /api/v1/tokenize -> 200",
    "request_id": "uuid",
    "correlation_id": "uuid",
    "execution_time": 15.23,
    "method": "POST",
    "path": "/api/v1/tokenize",
    "status_code": 200
}
```

---

## Scaling

### Horizontal Scaling
- Add more API replicas behind a load balancer
- Use Redis Sentinel or Cluster for high availability
- Configure PostgreSQL replication for read replicas

### Performance Tuning
- Adjust `uvicorn --workers` based on CPU cores (2 x num_cores)
- Tune PostgreSQL `max_connections` based on replica count
- Adjust Redis `maxmemory` policy
- Review rate limit thresholds based on traffic patterns

### Caching Strategy
- Tokenization results: TTL 5 minutes
- Language detection: TTL 10 minutes
- Statistics: TTL 10 minutes
- Rate limiting: TTL = window size

---

## Security

### HTTPS
```nginx
# docker/nginx.conf
server {
    listen 443 ssl;
    server_name api.example.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    location / {
        proxy_pass http://api:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Database Backup

```bash
# Automated backup script
pg_dump -U zilp -h localhost zilp > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Secrets Management

Never commit secrets to version control. Use:
- Environment variables (.env files outside version control)
- Docker secrets
- Kubernetes secrets
- HashiCorp Vault
- AWS Secrets Manager / Parameter Store

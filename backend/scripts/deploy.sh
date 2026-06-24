#!/usr/bin/env bash
# =============================================================================
# ZILP — Manual Deployment Script (fallback)
# Use this for manual recovery or testing. The CI/CD pipeline uses



# actions/checkout@v4 + rsync instead of git pull.
# Usage:
#   cd /opt/zilp && git pull && bash scripts/deploy.sh
# =============================================================================

set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-/opt/zilp}"
COMPOSE_FILE="${COMPOSE_FILE:-backend/docker/docker-compose.yml}"
HEALTH_ENDPOINT="${HEALTH_ENDPOINT:-http://localhost:8000/health}"
MAX_HEALTH_RETRIES="${MAX_HEALTH_RETRIES:-12}"
RETRY_INTERVAL="${RETRY_INTERVAL:-5}"

log() {
    echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] $*"
}

log "=== ZILP Deployment ==="

# Step 1: Navigate
cd "$DEPLOY_DIR"
log "Working directory: $(pwd)"

# Step 2: Sync code
log "Fetching latest code..."
git fetch origin
git checkout dev
git pull origin dev
COMMIT_HASH=$(git rev-parse --short HEAD)
COMMIT_MSG=$(git log -1 --pretty=%s)
log "Synced to commit: $COMMIT_HASH — $COMMIT_MSG"

# Step 3: Build
log "Building Docker images..."
docker compose -f "$COMPOSE_FILE" build

# Step 4: Restart
log "Restarting services..."
docker compose -f "$COMPOSE_FILE" up -d --remove-orphans

# Step 5: Wait
log "Waiting ${RETRY_INTERVAL}s for stabilization..."
sleep "${RETRY_INTERVAL}"

# Step 6: Health check
log "Running health check..."
for i in $(seq 1 "$MAX_HEALTH_RETRIES"); do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_ENDPOINT" 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
        RESPONSE=$(curl -s "$HEALTH_ENDPOINT")
        log "✅ Health check passed (attempt $i/$MAX_HEALTH_RETRIES)"
        log "Response: $RESPONSE"
        echo "$(date -u +'%Y-%m-%dT%H:%M:%SZ') | DEPLOY OK | $COMMIT_HASH | $COMMIT_MSG" >> "$DEPLOY_DIR/deploy-logs/deployments.log"
        exit 0
    fi
    log "⏳ Health check returned $HTTP_CODE (attempt $i/$MAX_HEALTH_RETRIES), retrying..."
    sleep "$RETRY_INTERVAL"
done

log "❌ Health check failed after $MAX_HEALTH_RETRIES attempts"
echo "$(date -u +'%Y-%m-%dT%H:%M:%SZ') | DEPLOY FAILED | $COMMIT_HASH | $COMMIT_MSG" >> "$DEPLOY_DIR/deploy-logs/deployments.log"
exit 1

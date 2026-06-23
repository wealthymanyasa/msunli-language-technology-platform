#!/usr/bin/env bash
# =============================================================================
# ZILP — Rollback Script
# Reverts the deployment to the last known good commit.
#
# Usage:
#   bash scripts/rollback.sh                    # rollback to previous commit
#   bash scripts/rollback.sh <commit-hash>      # rollback to specific commit
# =============================================================================

set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-/opt/zilp}"
COMPOSE_FILE="${COMPOSE_FILE:-docker/docker-compose.yml}"
HEALTH_ENDPOINT="${HEALTH_ENDPOINT:-http://localhost:8000/health}"
MAX_HEALTH_RETRIES="${MAX_HEALTH_RETRIES:-12}"
RETRY_INTERVAL="${RETRY_INTERVAL:-5}"

log() {
    echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] $*"
}

cd "$DEPLOY_DIR"

TARGET_COMMIT="${1:-HEAD~1}"

log "=== ZILP Rollback ==="
log "Target commit: $TARGET_COMMIT"

# Step 1: Stash any local changes
git stash --include-untracked 2>/dev/null || true

# Step 2: Checkout target
log "Checking out $TARGET_COMMIT..."
if git checkout "$TARGET_COMMIT" 2>/dev/null; then
    ROLLBACK_HASH=$(git rev-parse --short HEAD)
    log "Rolled back to: $ROLLBACK_HASH — $(git log -1 --pretty=%s)"
else
    log "❌ Failed to checkout $TARGET_COMMIT"
    log "Available recent commits:"
    git log --oneline -10
    exit 1
fi

# Step 3: Rebuild
log "Rebuilding Docker images..."
docker compose -f "$COMPOSE_FILE" build

# Step 4: Restart
log "Restarting services..."
docker compose -f "$COMPOSE_FILE" up -d --remove-orphans

# Step 5: Wait
sleep "$RETRY_INTERVAL"

# Step 6: Health check
log "Running health check..."
for i in $(seq 1 "$MAX_HEALTH_RETRIES"); do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_ENDPOINT" 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
        RESPONSE=$(curl -s "$HEALTH_ENDPOINT")
        log "✅ Rollback health check passed (attempt $i/$MAX_HEALTH_RETRIES)"
        log "Response: $RESPONSE"
        echo "$(date -u +'%Y-%m-%dT%H:%M:%SZ') | ROLLBACK OK | $ROLLBACK_HASH" >> "$DEPLOY_DIR/deploy-logs/deployments.log"
        exit 0
    fi
    log "⏳ Health check returned $HTTP_CODE (attempt $i/$MAX_HEALTH_RETRIES), retrying..."
    sleep "$RETRY_INTERVAL"
done

log "❌ Rollback health check failed after $MAX_HEALTH_RETRIES attempts"
log "⚠️  Manual intervention required. Data volumes are intact."
log "⚠️  Previous state was at: $(git rev-parse --short HEAD)"
exit 1

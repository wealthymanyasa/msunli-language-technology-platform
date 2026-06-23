#!/usr/bin/env bash
# =============================================================================
# ZILP — Health Check Script
# Polls the /health endpoint until success or timeout.
#
# Usage:
#   bash scripts/healthcheck.sh
#   bash scripts/healthcheck.sh --wait 30 --interval 5
# =============================================================================

set -euo pipefail

HEALTH_ENDPOINT="${HEALTH_ENDPOINT:-http://localhost:8000/health}"
MAX_RETRIES="${1:-12}"
RETRY_INTERVAL="${2:-5}"

log() {
    echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] $*"
}

log "Checking API health at $HEALTH_ENDPOINT..."

for i in $(seq 1 "$MAX_RETRIES"); do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_ENDPOINT" 2>/dev/null || echo "000")

    if [ "$HTTP_CODE" = "200" ]; then
        RESPONSE=$(curl -s "$HEALTH_ENDPOINT")
        log "✅ API is healthy (attempt $i/$MAX_RETRIES)"
        echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
        exit 0
    fi

    log "⏳ Status $HTTP_CODE (attempt $i/$MAX_RETRIES), retrying in ${RETRY_INTERVAL}s..."
    sleep "$RETRY_INTERVAL"
done

log "❌ API health check FAILED after $MAX_RETRIES attempts"
exit 1

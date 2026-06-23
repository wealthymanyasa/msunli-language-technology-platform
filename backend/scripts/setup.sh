#!/usr/bin/env bash
# =============================================================================
# ZILP — Server Initial Setup Script
# Run ONCE on the production server (185.162.125.127) before first deployment.
#
# Usage: ssh root@185.162.125.127 'bash -s' < setup.sh
# =============================================================================

set -euo pipefail

echo "============================================"
echo "  ZILP — Server Setup"
echo "============================================"

# ── Prerequisites ────────────────────────────────────────────────────────────
echo "[1/7] Installing system dependencies..."
apt-get update -qq
apt-get install -y -qq \
    apt-transport-https \
    ca-certificates \
    curl \
    software-properties-common \
    git \
    nginx \
    ufw

# ── Docker ──────────────────────────────────────────────────────────────────
echo "[2/7] Installing Docker..."
if ! command -v docker &>/dev/null; then
    curl -fsSL https://get.docker.com | bash
    systemctl enable docker
    systemctl start docker
fi

# ── Docker Compose Plugin ───────────────────────────────────────────────────
echo "[3/7] Installing Docker Compose plugin..."
if ! docker compose version &>/dev/null; then
    apt-get install -y -qq docker-compose-plugin
fi

# ── GitHub Self-Hosted Runner ───────────────────────────────────────────────
echo "[4/7] Setting up GitHub Actions runner..."
RUNNER_DIR="/opt/actions-runner"
if [ ! -d "$RUNNER_DIR" ]; then
    mkdir -p "$RUNNER_DIR"
    cd "$RUNNER_DIR"
    curl -o actions-runner-linux-x64.tar.gz -L \
        "https://github.com/actions/runner/releases/latest/download/actions-runner-linux-x64-2.318.0.tar.gz"
    tar xzf actions-runner-linux-x64.tar.gz
    echo ""
    echo " ⚠️  RUN THE FOLLOWING COMMAND MANUALLY:"
    echo "    cd $RUNNER_DIR && ./config.sh --url https://github.com/YOUR_ORG/YOUR_REPO --token YOUR_TOKEN --labels self-hosted,prod,zilp --name deployerunner"
    echo "    cd $RUNNER_DIR && ./svc.sh install && ./svc.sh start"
    echo ""
    echo "    See: https://github.com/YOUR_ORG/YOUR_REPO/settings/actions/runners"
fi

# ── Deployment Directory ────────────────────────────────────────────────────
echo "[5/7] Creating deployment directory..."
mkdir -p /opt/zilp
mkdir -p /opt/zilp/deploy-logs

# ── Clone Repository ────────────────────────────────────────────────────────
echo "[6/7] Cloning repository..."
if [ ! -d "/opt/zilp/.git" ]; then
    cd /opt/zilp
    git clone https://github.com/YOUR_ORG/YOUR_REPO.git .
    git checkout dev
fi

# ── Nginx Configuration ─────────────────────────────────────────────────────
echo "[7/7] Configuring Nginx..."
if [ -f "docker/nginx.conf" ]; then
    cp docker/nginx.conf /etc/nginx/sites-available/zilp
    if [ ! -f "/etc/nginx/sites-enabled/zilp" ]; then
        ln -s /etc/nginx/sites-available/zilp /etc/nginx/sites-enabled/
    fi
    rm -f /etc/nginx/sites-enabled/default

    # Create SSL directory for certificates
    mkdir -p /etc/nginx/ssl
    echo " ⚠️  Place SSL certificates in /etc/nginx/ssl/"
    echo "    zilp.crt and zilp.key"
    echo "    Or update nginx.conf to use a different certificate path."

    nginx -t && systemctl restart nginx
fi

# ── Firewall ────────────────────────────────────────────────────────────────
echo "[*] Configuring firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# ── Create .env file ────────────────────────────────────────────────────────
if [ ! -f "/opt/zilp/.env" ]; then
    cat > /opt/zilp/.env << 'ENVEOF'
APP_NAME=ZILP Language Technology Platform
APP_VERSION=1.0.0
DEBUG=false
LOG_LEVEL=INFO
LOG_FORMAT=json

POSTGRES_USER=zilp
POSTGRES_PASSWORD=CHANGE_ME_NOW
POSTGRES_DB=zilp
DATABASE_URL=postgresql://zilp:CHANGE_ME_NOW@db:5432/zilp

REDIS_URL=redis://redis:6379

JWT_SECRET=CHANGE_ME_TO_A_CRYPTOGRAPHIC_RANDOM_STRING
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=30
JWT_REFRESH_EXPIRATION_DAYS=7

API_RATE_LIMIT=100
API_RATE_LIMIT_WINDOW=60
CORS_ORIGINS=["*"]
ENVEOF
    echo "[!] DEFAULT .env CREATED — EDIT /opt/zilp/.env WITH REAL SECRETS"
fi

# ── Summary ─────────────────────────────────────────────────────────────────
echo ""
echo "============================================"
echo "  ✅ ZILP Server Setup Complete"
echo "============================================"
echo "  Deployment directory: /opt/zilp"
echo "  Deploy logs:          /opt/zilp/deploy-logs/"
echo "  Nginx config:         /etc/nginx/sites-available/zilp"
echo "  Runner directory:     /opt/actions-runner"
echo ""
echo "  NEXT STEPS:"
echo "  1. Edit /opt/zilp/.env with real secrets"
echo "  2. Configure and start the GitHub runner (see step 4)"
echo "  3. Place SSL certs in /etc/nginx/ssl/"
echo "  4. Push to dev branch to trigger first deployment"
echo "============================================"

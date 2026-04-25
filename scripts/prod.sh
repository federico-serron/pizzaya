#!/usr/bin/env bash
# ============================================================
# PizzaYA — Production Environment Startup Script
# ============================================================
# Builds and starts the production stack in detached mode.
# Usage: ./scripts/prod.sh
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

echo "============================================"
echo "  PizzaYA — Starting Production Environment"
echo "============================================"
echo ""

# Ensure .env exists
if [ ! -f .env ]; then
    echo "[!] .env file not found. Copying from .env.example..."
    cp .env.example .env
    echo "[!] Please edit .env with your production secrets before running this script."
    exit 1
fi

# Warn if using default secrets
if grep -q "your-super-secret-key-change-in-production" .env 2>/dev/null; then
    echo "[!] WARNING: Default JWT_SECRET detected in .env"
    echo "[!] Please change JWT_SECRET to a strong random value before deploying to production."
    echo ""
fi

echo "[*] Building production images (this may take a few minutes)..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache

echo ""
echo "[*] Starting production containers..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

echo ""
echo "[*] Running database migrations..."
sleep 5
docker compose exec backend alembic upgrade head || echo "[!] Migration may have failed (DB might not be ready yet)"

echo ""
echo "============================================"
echo "  Production environment is running!"
echo ""
echo "  Frontend : http://localhost"
echo "  Backend  : http://localhost:8000"
echo "  API Docs : http://localhost:8000/docs"
echo ""
echo "  Useful commands:"
echo "    docker compose logs -f              # follow all logs"
echo "    docker compose exec backend bash    # shell into backend"
echo "    make backup                         # backup database"
echo "    make stop                           # stop all services"
echo "============================================"

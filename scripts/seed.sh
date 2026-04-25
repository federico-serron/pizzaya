#!/usr/bin/env bash
# ============================================================
# PizzaYA — Database Seed Script
# ============================================================
# Runs the seed command inside the backend container.
# Creates admin user, customer user, categories, and products.
# Usage: ./scripts/seed.sh
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

echo "============================================"
echo "  PizzaYA — Seeding Database"
echo "============================================"

docker compose exec backend python -m app.seed

echo ""
echo "[✓] Seed complete!"
echo "    Admin   : admin@pizzaya.com.uy / Admin123!"
echo "    Cliente : cliente@test.com / Cliente123!"

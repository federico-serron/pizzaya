#!/usr/bin/env bash
# ============================================================
# PizzaYA — Development Environment Startup Script
# ============================================================
# Starts the full development stack with hot reload enabled.
# Usage: ./scripts/dev.sh
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

echo "============================================"
echo "  PizzaYA — Starting Development Environment"
echo "============================================"
echo ""

# Ensure .env exists for docker compose
if [ ! -f .env ]; then
    echo "[!] .env file not found. Copying from .env.example..."
    cp .env.example .env
    echo "[✓] .env created from .env.example"
fi

echo "[*] Building and starting containers..."
docker compose up --build

echo ""
echo "============================================"
echo "  Dev environment stopped."
echo "============================================"

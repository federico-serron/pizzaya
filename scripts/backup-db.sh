#!/usr/bin/env bash
# ============================================================
# PizzaYA — PostgreSQL Database Backup Script
# ============================================================
# Creates a compressed SQL dump of the database.
# Usage: ./scripts/backup-db.sh
# Output: backups/pizzaya_backup_YYYY-MM-DD_HHMMSS.sql.gz
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${PROJECT_ROOT}/backups"
TIMESTAMP="$(date +%Y-%m-%d_%H%M%S)"
BACKUP_FILE="${BACKUP_DIR}/pizzaya_backup_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "============================================"
echo "  PizzaYA — Database Backup"
echo "============================================"
echo ""
echo "  Backup file: ${BACKUP_FILE}"
echo ""

# Load environment variables
if [ -f "${PROJECT_ROOT}/.env" ]; then
    set -a
    source "${PROJECT_ROOT}/.env"
    set +a
fi

DB_USER="${POSTGRES_USER:-pizzaya}"
DB_NAME="${POSTGRES_DB:-pizzaya}"
CONTAINER="pizzaya-db"

echo "[*] Creating backup from container '${CONTAINER}'..."

docker compose exec -T db pg_dump \
    -U "${DB_USER}" \
    -d "${DB_NAME}" \
    --no-owner \
    --no-acl \
    | gzip > "${BACKUP_FILE}"

echo ""
echo "[✓] Backup created successfully!"
echo "    File: ${BACKUP_FILE}"
echo "    Size: $(du -h "${BACKUP_FILE}" | cut -f1)"
echo ""
echo "  To restore:"
echo "    gunzip < ${BACKUP_FILE} | docker compose exec -T db psql -U ${DB_USER} -d ${DB_NAME}"

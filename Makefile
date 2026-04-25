# ============================================================
# PizzaYA — Makefile
# ============================================================
# Common commands for development and operations.
# Tab-indented (required for Makefiles) — use actual tabs in the file.
# ============================================================

.PHONY: dev prod stop down seed lint test backup clean help

# --------------------------------------------------
# Development
# --------------------------------------------------
dev:
	docker compose up --build

dev-detached:
	docker compose up --build -d

# --------------------------------------------------
# Production
# --------------------------------------------------
prod:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d

# --------------------------------------------------
# Stop / Cleanup
# --------------------------------------------------
stop:
	docker compose down

down:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml down

clean: stop
	docker compose down -v
	docker system prune -f

# --------------------------------------------------
# Database seed
# --------------------------------------------------
seed:
	docker compose exec backend python -m app.seed

# --------------------------------------------------
# Linting
# --------------------------------------------------
lint-backend:
	docker compose exec backend ruff check .

lint-frontend:
	docker compose exec frontend npx eslint src/

lint: lint-backend lint-frontend

# --------------------------------------------------
# Testing
# --------------------------------------------------
test-backend:
	docker compose exec backend pytest

test-frontend:
	docker compose exec frontend npx vitest run

test: test-backend test-frontend

# --------------------------------------------------
# Database backup
# --------------------------------------------------
backup:
	chmod +x scripts/backup-db.sh && ./scripts/backup-db.sh

# --------------------------------------------------
# Shell access
# --------------------------------------------------
shell-backend:
	docker compose exec backend bash

shell-db:
	docker compose exec db psql -U pizzaya -d pizzaya

# --------------------------------------------------
# Logs
# --------------------------------------------------
logs:
	docker compose logs -f

logs-backend:
	docker compose logs -f backend

logs-frontend:
	docker compose logs -f frontend

logs-db:
	docker compose logs -f db

# --------------------------------------------------
# Alembic migrations
# --------------------------------------------------
migrate:
	docker compose exec backend alembic upgrade head

# --------------------------------------------------
# Help
# --------------------------------------------------
help:
	@echo "PizzaYA Makefile commands:"
	@echo ""
	@echo "  dev              Start development environment"
	@echo "  dev-detached     Start dev in background"
	@echo "  prod             Start production environment"
	@echo "  stop             Stop all containers"
	@echo "  down             Stop and remove containers"
	@echo "  clean            Stop + remove volumes"
	@echo "  seed             Seed the database"
	@echo "  lint             Run linters on backend and frontend"
	@echo "  test             Run backend and frontend tests"
	@echo "  backup           Backup the PostgreSQL database"
	@echo "  shell-backend    Open a shell in the backend container"
	@echo "  shell-db         Open a psql shell in the database"
	@echo "  logs             Follow all container logs"
	@echo "  migrate          Run Alembic migrations"
	@echo "  help             Show this help message"

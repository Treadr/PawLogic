.PHONY: help dev-up dev-down dev-logs migrate seed test lint format mobile-start mobile-typecheck

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# -- Docker / Infrastructure --

dev-up: ## Start all services (DB, Redis, API, Worker)
	docker compose up -d --build

dev-down: ## Stop all services
	docker compose down

dev-logs: ## Follow API container logs
	docker compose logs -f api

dev-db: ## Start only PostgreSQL and Redis
	docker compose up -d db redis

# -- Backend (run from backend/) --

migrate: ## Run Alembic migrations
	cd backend && alembic upgrade head

migrate-new: ## Create a new migration (usage: make migrate-new MSG="add xyz")
	cd backend && alembic revision --autogenerate -m "$(MSG)"

seed: ## Seed demo data
	cd backend && python -m scripts.seed_demo

seed-reset: ## Reset and re-seed demo data
	cd backend && python -m scripts.seed_demo --reset

test: ## Run backend tests
	cd backend && python -m pytest tests/ -v --tb=short

test-cov: ## Run tests with coverage
	cd backend && python -m pytest tests/ -v --tb=short --cov=app --cov-report=term-missing

lint: ## Lint backend code with ruff
	cd backend && ruff check app/

format: ## Format backend code with ruff
	cd backend && ruff format app/

api-local: ## Run API server locally (no Docker)
	cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# -- Mobile App --

mobile-install: ## Install mobile dependencies
	cd mobile && npm install

mobile-start: ## Start Expo dev server
	cd mobile && npx expo start

mobile-typecheck: ## Run TypeScript check on mobile app
	cd mobile && npx tsc --noEmit

mobile-ios: ## Start on iOS simulator
	cd mobile && npx expo start --ios

mobile-android: ## Start on Android emulator
	cd mobile && npx expo start --android

# Makefile
# Usage:
#   make migrate       # apply all migrations in order
#   make redo FILE=... # re-run a single migration file
#   make verify        # quick sanity queries
#   make psql          # open a psql session

# Load env vars from .env if present
ifneq (,$(wildcard .env.local))
  include .env.local
  export
endif

# Fail fast if DATABASE_URL missing
ifeq ($(strip $(DATABASE_URL)),)
  $(error DATABASE_URL is not set. Put it in .env or your shell)
endif

MIGRATIONS_DIR := db/migrations
# Sort files lexicographically; prefix migrations with sortable timestamps
MIGRATION_FILES := $(shell ls -1 $(MIGRATIONS_DIR)/*.sql | sort)

PSQL := psql "$(DATABASE_URL)" -v ON_ERROR_STOP=1

.PHONY: migrate
migrate:
	@echo "Applying migrations to $$DATABASE_URL"
	@for f in $(MIGRATION_FILES); do \
	  echo "==> $$f"; \
	  $(PSQL) -f "$$f"; \
	done
	@echo "All migrations applied ✅"

# Re-run a single file: make redo FILE=db/migrations/20250911_0002_rls.sql
.PHONY: redo
redo:
	@if [ -z "$(FILE)" ]; then echo "Usage: make redo FILE=<path/to/file.sql>"; exit 2; fi
	@echo "Re-applying $(FILE)"
	@$(PSQL) -f "$(FILE)"
	@echo "Done ✅"

.PHONY: psql
psql:
	@$(PSQL)

.PHONY: verify
verify:
	@echo "Checking tables & counts…"
	@$(PSQL) -X -c "\dt public.*"
	@$(PSQL) -X -c "select table_name, is_insertable_into from information_schema.tables where table_schema='public' order by table_name;"
	@$(PSQL) -X -c "select 'reviews policies', count(*) from pg_policies where schemaname='public' and tablename='reviews';"
	@$(PSQL) -X -c "select 'favorites policies', count(*) from pg_policies where schemaname='public' and tablename='favorites';"
	@$(PSQL) -X -c "select 'site_stats rows', count(*) from public.site_stats;"

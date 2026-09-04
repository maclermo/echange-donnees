PHONY: build
build:
	@npm ci && npm run build && docker compose up --build --force-recreate --no-deps

PHONY: stop
stop:
	@docker compose down -v --rmi all --remove-orphans

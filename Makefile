.PHONY: help start stop install test package compose

help: ## Show this help
	@egrep -h '\s##\s' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

start: ## Starts docker-compose and the application
	@echo "Starting Docker containers"
	@docker-compose up -d postgres rabbitmq
	# @echo "Installing NestJS CLI"
	# @npm i -g @nestjs/cli
	# @echo "Installing dependencies"
	# @npm ci
	@echo "Starting application"
	@npm run start:dev

stop: ## Stops docker-compose
	@echo "Stopping PostgresSQL"
	@docker-compose down

install: ## Installs dependencies
	@echo "Installing dependencies"
	@npm ci

test: ## Runs test suite
	@echo "Running tests"
	@npm run test

compose: ## Starts docker-compose
	@echo "Starting Docker containers"
	@docker-compose up -d postgres rabbitmq
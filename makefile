.PHONY: up down restart logs db generate studio ollama-pull api-db-start setup

up:
	docker compose up -d --build

down:
	docker compose down

restart:
	docker compose restart

logs:
	docker compose logs -f app

db:
	docker compose exec app npx prisma migrate dev

generate:
	docker compose exec app npx prisma generate

studio:
	docker compose exec app npx prisma studio --port 5555 --browser none --url file:/data/app.db

ollama-pull:
	docker compose exec ollama ollama pull llama3.2

api-db-start:
	docker compose exec app npx prisma migrate dev
	docker compose exec app npx prisma generate
	docker compose restart app

setup:
	make up
	sleep 5
	make ollama-pull
	make api-db-start
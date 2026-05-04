up:
	docker compose up -d --build

down:
	docker compose down

logs:
	docker compose logs -f

db:
	docker compose exec app npx prisma migrate dev

studio:
	docker compose exec app npx prisma studio --port 5555 --browser none
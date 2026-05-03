# Steam Profiles / Steam Platinum Tracker

[English](#english) | [Português](#português)

---

# English

## Summary

Steam Profiles is a local web application that tracks Steam game completion in a more “PlayStation-like” way.

The goal is to calculate a custom platinum status for Steam games by separating base game achievements from DLC/extra achievements.

---

## Installation

```bash
git clone https://github.com/YOUR_USERNAME/steamProfiles.git
cd steamProfiles
```

Create `.env`:

```env
STEAM_API_KEY=
STEAM_ID=
DATABASE_URL=file:/data/app.db
```

Run:

```bash
docker compose up --build
```

App runs at:

```
http://localhost:3000
```

---

## Database Setup

```bash
docker compose exec app sh
npx prisma migrate dev
npx prisma generate
```

---

## API

Sync Steam games:

```bash
curl -X POST http://localhost:3000/api/steam/sync
```


Disclaimer

This project was developed as a learning experience. I am still a beginner, especially regarding security practices. Therefore, I do not take responsibility for any issues, vulnerabilities, or damages that may occur from using this software.

---

# Português

## Resumo

Steam Profiles é uma app local para acompanhar o progresso dos jogos Steam de forma semelhante à PlayStation.

---

## Instalação

```bash
git clone https://github.com/YOUR_USERNAME/steamProfiles.git
cd steamProfiles
```

Criar `.env`:

```env
STEAM_API_KEY=
STEAM_ID=
DATABASE_URL=file:/data/app.db
```

Executar:

```bash
docker compose up --build
```

A app fica disponível em:

```
http://localhost:3000
```

---

## Base de Dados

```bash
docker compose exec app sh
npx prisma migrate dev
npx prisma generate
```

---

## API

Sincronizar jogos:

```bash
curl -X POST http://localhost:3000/api/steam/sync
```

Aviso

Este projeto foi desenvolvido como parte do meu processo de aprendizagem. Ainda sou iniciante, especialmente em termos de segurança. Assim, não me responsabilizo por quaisquer problemas, vulnerabilidades ou danos que possam surgir ao utilizar este software.
# Steam Profiles / Steam Platinum Tracker

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)
![Docker](https://img.shields.io/badge/Docker-ready-blue?logo=docker)
![Prisma](https://img.shields.io/badge/Prisma-SQLite-2D3748?logo=prisma)
![Ollama](https://img.shields.io/badge/Ollama-local_AI-green)
![Status](https://img.shields.io/badge/status-learning_project-orange)

[English](#english) | [Português](#português)

---

# English

## Summary

Steam Profiles is a local Steam completion tracker.

It syncs your Steam library and achievements, shows completion progress, rare achievements, hidden achievements, and generates AI-powered guides using Ollama.

---

## Installation

```bash
git clone https://github.com/YOUR_USERNAME/steamProfiles.git
cd steamProfiles
```

Create your environment file:

```bash
cp web/.env.example web/.env
```

Edit `web/.env`:

```env
STEAM_API_KEY=your_steam_api_key_here
STEAM_ID=your_steam_id_here

DATABASE_URL=file:/data/app.db

OLLAMA_URL=http://ollama:11434
OLLAMA_MODEL=llama3.2
```

---

## Start the app

```bash
make up
```

Download AI model:

```bash
make ollama-pull
```

Setup database:

```bash
make db
make generate
```

App:

```
http://localhost:3000
```

Prisma Studio:

```bash
make studio
```

```
http://localhost:5555
```

---

## Commands

```bash
make up
make down
make restart
make logs
make db
make generate
make studio
make ollama-pull
make setup
```

---

## API

```bash
curl -X POST http://localhost:3000/api/steam/sync
```

```bash
curl -X POST http://localhost:3000/api/steam/sync-achievements/APP_ID
```

---

## Disclaimer

This project was developed as a learning experience. I am still a beginner and do not take responsibility for any issues or vulnerabilities.

---

# Português

## Resumo

Steam Profiles é uma aplicação local para acompanhar o progresso dos jogos Steam.

Inclui sincronização de conquistas, raridade, conquistas ocultas e geração de guias com IA local (Ollama).

---

## Instalação

```bash
git clone https://github.com/YOUR_USERNAME/steamProfiles.git
cd steamProfiles
```

Criar `.env`:

```bash
cp web/.env.example web/.env
```

Editar:

```env
STEAM_API_KEY=your_steam_api_key_here
STEAM_ID=your_steam_id_here

DATABASE_URL=file:/data/app.db

OLLAMA_URL=http://ollama:11434
OLLAMA_MODEL=llama3.2
```

---

## Iniciar

```bash
make up
make ollama-pull
make db
make generate
```

App:

```
http://localhost:3000
```

Prisma:

```bash
make studio
```

```
http://localhost:5555
```

---

## Aviso

Este projeto foi desenvolvido como aprendizagem. Não me responsabilizo por problemas ou vulnerabilidades.

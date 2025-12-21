# Projeto São Carlo Acutis (Full-Stack)

Projeto de estudo full-stack com:
- Front-end: React + TypeScript + Tailwind
- Back-end: Java + Spring Boot
- Banco: PostgreSQL (Neon)
- Monorepo: /frontend e /backend

## Estrutura
- `frontend/` -> aplicação React
- `backend/` -> API Spring Boot

## Requisitos
- Node.js (LTS)
- Java 17+ (recomendado)
- Maven (ou Gradle)
- Conta no Neon (PostgreSQL)

## Como rodar (dev)

### 1) Backend
```bash
cd backend
# configure o application.yml / env vars antes de rodar
./mvnw spring-boot:run

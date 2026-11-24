# Carlo Acutis

Plataforma web educativa e devocional sobre a vida, a espiritualidade e o legado de São Carlo Acutis. O projeto combina conteúdo biográfico público organizado por temas com um quiz interativo por temporadas (acessível em modo visitante ou autenticado), progressão por XP/títulos, sequência diária (streak), conquistas, ligas paroquiais e painel administrativo.

## Escopo atual

- Página inicial pública com apresentação de São Carlo Acutis, temas em destaque e atalho direto para o quiz.
- Conteúdo biográfico dividido em três áreas temáticas:
  - **Vida e Legado**: família, fé, animais, amigos e escola.
  - **Fé e Devoção**: Eucaristia, Nossa Senhora, espiritualidade e comunicação.
  - **Caminho da Santidade**: cultura digital, partida, milagres e canonização (`07/09/2025`).
- **Quiz Carlo Acutis** com validação de respostas no servidor (sem expor o gabarito ao navegador):
  - **Temporadas:** cards com descrição, barra de progresso (`respondidas/total`), explicação educativa pós-resposta e notificações celebrativas de conquistas e mudança de título.
  - **Desafio Diário:** 3 perguntas determinísticas por data UTC com placar compartilhável em grade de emojis no WhatsApp.
  - **Modo Relâmpago:** perguntas aleatórias cronometradas (20s), contador de combo (`2x`, `3x 🔥`) e recorde pessoal salvo no navegador.
  - **Modo Visitante e Autenticado:** jogue imediatamente sem cadastro (progresso local) ou crie uma conta gratuita para persistência no Neon, conquistas, streak diário e ranking por liga.
- Cadastro, login, logout e persistência de sessão via autenticação própria (`scrypt` + cookie `HttpOnly` validado na tabela `sessions`).
- Ligas paroquiais: criação (até 3 por usuário), entrada por código, saída e ranking dos participantes sem exposição de e-mails.
- Área administrativa (`/admin`) protegida por papel `admin` no servidor para gestão de temporadas/perguntas com trilha de auditoria.

## Tecnologias

- **Frontend:** React 19 + TypeScript 5.9 + Vite 7 + React Router DOM 7 + Tailwind CSS 3.4 + Framer Motion 12
- **Backend Serverless:** Vercel Functions (`api/*`, Node.js 24 LTS)
- **Banco de Dados:** Neon PostgreSQL Serverless (`@neondatabase/serverless`)
- **Testes:** Vitest 2 + Testing Library + jsdom
- **Deploy:** Vercel (SPA + Serverless Functions no mesmo repositório)

## Estrutura do projeto

```text
.
├── api/                    # Vercel Functions (Node.js)
│   ├── _lib/               # Conexão lazy Neon, auth scrypt/cookie, gamificação e HTTP
│   ├── admin/              # Gestão administrativa de temporadas e perguntas (/api/admin/*)
│   ├── auth/               # Cadastro, login, logout e sessão (/api/auth/*)
│   ├── leagues/            # Criação, entrada, saída e ranking (/api/leagues/*)
│   ├── profile/            # Conquistas do usuário (/api/profile/achievements)
│   └── quiz/               # Temporadas, perguntas sem gabarito e correção (/api/quiz/*)
├── db/
│   ├── schema.sql          # Schema PostgreSQL idempotente, índices e seeds
│   └── migrate.mjs         # Script de aplicação do schema no Neon
├── public/                 # Favicon e arquivos estáticos
├── src/
│   ├── assets/             # Imagens otimizadas da interface
│   ├── components/         # Navbar, Quiz, Section, Timeline, ErrorBoundary, layout/*
│   ├── context/            # AuthContext (consumindo /api/auth/me)
│   ├── data/               # Conteúdo biográfico e catálogo de navegação
│   ├── pages/              # Home, DetailPages, QuizPage, Login, Register, Profile, Admin, NotFound
│   ├── services/           # Cliente HTTP tipado (api.ts)
│   ├── types/              # Contratos TypeScript compartilhados (api.types.ts)
│   └── utils/              # Funções puras de quiz, progresso visitante e Web Audio
├── vercel.json             # Rewrites preservando /api/* + cabeçalhos HTTP de segurança (incluindo CSP)
└── package.json
```

## Pré-requisitos

- Node.js 20 ou superior (recomendado Node.js 24 LTS)
- npm
- Banco PostgreSQL no Neon (provisionado via Vercel Marketplace ou [neon.tech](https://neon.tech))

## Configuração local

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Copie `.env.example` para `.env` (ou `.env.local`) e preencha `DATABASE_URL` com a string de conexão do seu banco Neon:

   ```env
   DATABASE_URL=postgresql://usuario:senha@ep-seu-banco-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require
   ```

   **Importante:** `DATABASE_URL` é usada apenas no servidor (`api/*` e `db/migrate.mjs`). Nunca exponha credenciais de banco em variáveis com prefixo `VITE_`.

3. Aplique o schema idempotente e os seeds iniciais no Neon:

   ```bash
   npm run db:migrate
   ```

4. Inicie o ambiente de desenvolvimento (SPA + rotas `/api/*` conectadas ao Neon já funcionam juntas no Vite):

   ```bash
   npm run dev
   ```

   A aplicação ficará disponível em `http://localhost:5173`. *(Opcionalmente, `npx vercel dev` também pode ser usado; no Windows ele requer o **Modo de Desenvolvedor** ativado para permitir symlinks do cache da CLI.)*

## Scripts disponíveis

```bash
npm run dev           # Servidor Vite (frontend)
npm run build         # Verificação TypeScript (app + api) e build de produção
npm run lint          # Verificação ESLint (src + api)
npm run typecheck     # Verificação TypeScript sem emitir arquivos
npm run test          # Suíte de testes unitários e de handlers (Vitest)
npm run check         # Lint + typecheck + testes
npm run db:migrate    # Aplica db/schema.sql no banco Neon de forma idempotente
npm run preview       # Pré-visualização do build de produção
```

## Operação e manutenção

### Criar um administrador

Após criar uma conta pelo `/cadastro`, promova o usuário no SQL Editor do Neon:

```sql
UPDATE public.users SET role = 'admin' WHERE LOWER(email) = 'email-da-pessoa@exemplo.com';
```

### Ordem de deploy e rollback

1. Conecte a store Neon ao projeto na Vercel (garantindo `DATABASE_URL` em Production e Preview).
2. Aplique eventuais alterações de banco (`npm run db:migrate`) **antes** do deploy do frontend que depende delas.
3. Faça o deploy na Vercel (Git push ou `vercel --prod`). Em caso de problema, o deploy pode ser revertido instantaneamente pelo painel da Vercel.

## Modelo de dados (`db/schema.sql`)

- `users`: nome, e-mail único, `password_hash` (`scrypt`), XP, papel (`user`/`admin`) e `liga_id`.
- `sessions`: sessões ativas armazenadas apenas como `SHA-256` do token do cookie `HttpOnly`.
- `ligas`: grupos paroquiais com código de acesso único e referência ao criador.
- `temporadas` e `perguntas`: conteúdo do quiz com controle de ordem e arquivamento (`ativa = false`).
- `respostas_usuario`: histórico único `(user_id, pergunta_id)` garantindo +100 XP somente na primeira tentativa correta.
- `streaks`, `conquistas` e `usuario_conquistas`: gamificação idempotente controlada exclusivamente no servidor.
- `auditoria_admin`: registro de alterações feitas pelo painel administrativo.

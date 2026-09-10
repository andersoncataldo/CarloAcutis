# Carlo Acutis

Plataforma web educativa e interativa sobre a vida, a espiritualidade e o legado de Carlo Acutis. O projeto combina conteúdo biográfico organizado por temas com um quiz protegido por autenticação, progressão por XP e participação em ligas paroquiais.

## Escopo atual

- Página inicial com apresentação de Carlo Acutis, conteúdos em destaque e acesso às áreas principais.
- Conteúdo biográfico dividido em três áreas:
  - **Vida e Legado**: família, fé, amigos, escola e ações de Carlo.
   - **Fé e Devoção**: Eucaristia, Nossa Senhora, espiritualidade e comunicação.
   - **Caminho da Santidade**: atuação digital, morte, milagres e processo de canonização.
- Cadastro, login, logout e persistência de sessão por meio do Supabase Auth.
- Perfil autenticado com acompanhamento de XP, nível e participação em liga.
- Quiz autenticado com perguntas organizadas por temporadas, registro das respostas e concessão de XP no banco de dados.
- Ligas paroquiais: criação, entrada por código, saída e ranking dos participantes.
- Área administrativa protegida para gerenciamento do conteúdo do quiz.
- Layout responsivo, navegação por rotas e animações de interface.

## Tecnologias

- React 19 e TypeScript
- Vite
- React Router DOM
- Tailwind CSS
- Framer Motion
- Supabase (`@supabase/supabase-js`) para autenticação, banco de dados e funções RPC

## Estrutura do projeto

```text
.
├── public/                 # Arquivos estáticos e regras de deploy
├── src/
│   ├── assets/             # Imagens usadas pela interface
│   ├── components/         # Navbar, quiz, timeline, seções e layout
│   ├── context/            # Contexto de autenticação
│   ├── data/               # Conteúdo biográfico e navegação
│   ├── pages/              # Home, autenticação, perfil, quiz e administração
│   ├── services/           # Cliente Supabase
│   ├── App.tsx             # Rotas e proteção de acesso
│   └── index.css           # Estilos globais
├── schema.sql              # Schema, policies, funções RPC e dados iniciais
├── index.html
└── package.json
```

## Pré-requisitos

- Node.js 18 ou superior
- npm
- Projeto no Supabase

## Configuração local

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Copie `.env.example` para `.env.local` e preencha as variáveis com os dados do seu projeto Supabase:

   ```env
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_publica_anon
   ```

   Nunca use a chave `service_role` no frontend. Ela ignora as políticas de segurança (RLS) e não deve chegar ao navegador.

3. No SQL Editor do Supabase, execute o conteúdo de [`schema.sql`](schema.sql). O script cria as tabelas, índices, trigger de perfil, policies de RLS e funções RPC usadas pelo quiz e pelas ligas.

4. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

   A aplicação ficará disponível no endereço exibido pelo Vite, normalmente `http://localhost:5173`.

## Scripts disponíveis

```bash
npm run dev      # Servidor de desenvolvimento com HMR
npm run build    # Verificação TypeScript e build de produção
npm run lint     # Verificação de lint
npm run check     # Lint, typecheck e testes
npm run test      # Apenas os testes (Vitest)
npm run test:coverage
npm run preview  # Pré-visualização do build de produção
```

## Operação e manutenção

### Arquitetura

SPA em React + Vite, hospedada como site estático (Vercel). A autenticação,
os dados e as regras de negócio (XP, ligas e conquistas) vivem no Supabase
(Postgres, Auth, RLS e RPCs `SECURITY DEFINER`). As regras importantes são
reforçadas no banco, não apenas no cliente.

### Fluxo de autenticação

1. Login e cadastro usam o Supabase Auth (`src/pages/Login.tsx` e `Register.tsx`).
2. A trigger `handle_new_user` cria o perfil em `profiles`.
3. `AuthContext` acompanha a sessão, carrega o perfil e registra o acesso do dia.
4. As rotas protegidas verificam o contexto, enquanto a proteção real está nas policies de RLS.

### Processo de migração

O schema vive em `schema.sql` e é idempotente. Para aplicar uma atualização:

1. Abra o SQL Editor do projeto Supabase.
2. Cole o conteúdo completo de `schema.sql` e execute.
3. Aplique as mudanças no banco antes de publicar um frontend que dependa delas.

### Criar um administrador

Depois que a pessoa criar uma conta pelo app:

```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'email-da-pessoa@exemplo.com';
```

### Deploy e rollback

Configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` na Vercel.
O frontend pode ser revertido para um deploy anterior pelo painel. Mudanças
destrutivas no banco devem ser testadas antes em homologação e acompanhadas de backup.

## Modelo de dados

O arquivo `schema.sql` define as entidades principais:

- `profiles`: nome, e-mail, XP, nível e liga do usuário.
- `ligas`: grupos paroquiais com código de acesso.
- `temporadas`: agrupamentos de perguntas do quiz.
- `perguntas`: questões e alternativas de cada temporada.
- `respostas_usuario`: histórico individual, evitando pontuação duplicada.

As funções RPC validam no banco as respostas do quiz e as operações de liga. O RLS restringe o acesso aos dados conforme o usuário autenticado.

## Propósito

O projeto tem finalidade educativa e devocional: apresentar a história de Carlo Acutis e incentivar o aprendizado sobre sua vida e espiritualidade por meio de uma experiência digital interativa.

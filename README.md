<<<<<<< HEAD
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
=======
# Carlo Acutis - Plataforma Web Gamificada 🌐✨

Plataforma web interativa e educativa dedicada à história, legado, devoção e canonização de **São Carlo Acutis**, o "Padroeiro da Internet". 
O projeto combina conteúdo biográfico rico com um sistema avançado de gamificação, incluindo quizzes integrados, sistema de XP, evolução de níveis e ligas entre usuários (Ligas Paroquiais).

---

## 🚀 Tecnologias Utilizadas

### **Front-end**
- **React 19** & **TypeScript**
- **Vite** (Build tool e servidor de desenvolvimento ultra-rápido)
- **Tailwind CSS** (Estilização responsiva e moderna)
- **Framer Motion** (Animações fluidas e navegação agradável)
- **React Router DOM v7** (Roteamento de SPA e proteção de rotas)
- **Lucide React** (Ícones SVG)

### **Back-end & Banco de Dados (BaaS)**
- **Supabase**
  - **Auth**: Autenticação, login e cadastro seguros.
  - **PostgreSQL**: Modelagem relacional robusta com tabelas para perfis, perguntas, temporadas, respostas do usuário e ligas.
  - **RLS (Row Level Security)**: Segurança avançada de leitura e escrita.
  - **RPC (Remote Procedure Calls)**: Funções no banco para calcular XP e manipular entrada/saída de ligas de forma segura.

---

## ✨ Funcionalidades Principais

### 1. 🔐 Autenticação e Perfil do Usuário
- Login e Cadastro nativo e seguro utilizando Supabase Auth.
- Criação e sincronização automática da tabela `profiles` através de *Triggers* no Postgres.
- Proteção e redirecionamento de rotas (Apenas usuários autenticados podem jogar o Quiz e participar de ligas).

### 2. 📖 Conteúdo Biográfico
- **Página Inicial**: Apresentação da vida de Carlo Acutis, linha do tempo interativa e visão geral.
- **Vida & Legado**: Infância, juventude e a profunda relação entre a santidade e a computação.
- **Fé & Devoção**: O amor profundo pela Eucaristia ("A minha autoestrada para o Céu") e os Milagres Eucarísticos.
- **Caminho à Santidade**: Processo de beatificação e canonização de Carlo.

### 3. 🎯 Quiz Gamificado e Sistema de Progressão
- **Temporadas de Perguntas**: O conteúdo é dividido em temporadas (ex: Infância, Milagres, Santidade) lidas dinamicamente do banco de dados.
- **Resposta e XP Seguro (RPC)**: O cálculo de acertos e atribuição de XP (Experiência) ocorre diretamente no banco de dados, impedindo trapaças no front-end.
- **Histórico de Respostas**: Controle rigoroso para garantir que o usuário só ganha XP ao responder a pergunta corretamente na primeira vez.
- **Níveis de Evolução**: Conforme acumula XP, o usuário ganha novos títulos:
  *Peregrino ➔ Discípulo ➔ Missionário ➔ Apóstolo Digital ➔ Ciberapóstolo da Eucaristia.*

### 4. 🏆 Ligas Paroquiais e Ranking Social
- **Criação Segura**: Usuários podem criar Ligas Paroquiais. O sistema gera um código de acesso único (alfanumérico) via banco de dados.
- **Participação por Código**: Outros usuários podem entrar na liga informando o código exclusivo.
- **Ranking em Tempo Real**: Visualização imediata dos membros da sua liga, ordenados pela quantidade de XP, incentivando uma competição saudável de aprendizado.

---

## 🛢️ Arquitetura do Banco de Dados

O banco (`schema.sql` incluído no projeto) foi desenhado pensando em integridade e performance, contendo:

1. **`ligas`**: Gerencia grupos/ligas criadas com códigos de acesso únicos.
2. **`profiles`**: Estende o `auth.users` armazenando XP, nível (título) e o vínculo com a liga (`liga_id`).
3. **`temporadas` e `perguntas`**: Estrutura escalável para os quizzes, separando blocos de conteúdo e as questões de múltipla escolha.
4. **`respostas_usuario`**: Tabela associativa (M:N) que registra se um usuário acertou ou não determinada pergunta, evitando ganhos de XP duplicados.
5. **Funções e Triggers**:
   - `handle_new_user`: Trigger para gerar o profile após cadastro.
   - `responder_pergunta`: Valida a alternativa correta no servidor e aplica XP.
   - `criar_liga` / `entrar_liga` / `sair_liga`: Manipulação segura de chaves estrangeiras via Security Definer.

---

## 📁 Estrutura de Diretórios

```text
frontend/
├── public/                 # Arquivos estáticos puros
├── src/
│   ├── assets/             # Imagens e mídias
│   ├── components/         # Componentes React (Navbar, Footer, Quiz, Timeline)
│   ├── context/            # Contextos Globais (AuthContext p/ Supabase)
│   ├── data/               # Dados estruturados de conteúdo de texto
│   ├── pages/              # Telas (Home, Login, Profile, QuizPage, Detalhes)
│   ├── services/           # Configuração do Cliente Supabase e APIs
│   ├── App.tsx             # Entrypoint das rotas
│   └── index.css           # Estilos globais e injeções Tailwind
├── schema.sql              # Script SQL COMPLETO de migração e permissões RLS
└── vite.config.ts          # Configurações do Vite
```

---

## 🛠️ Como Instalar e Rodar o Projeto Localmente

### Pré-requisitos
- **Node.js** v18+ 
- **npm**, **yarn** ou **pnpm**
- Um projeto limpo criado no **Supabase**.

### Passo a Passo

1. **Clonar o Repositório**
   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd frontend
   npm install
   ```

2. **Configuração do Banco de Dados**
   - Acesse o painel do seu projeto no Supabase.
   - Vá no menu **SQL Editor**.
   - Copie todo o conteúdo do arquivo `schema.sql` presente na raiz deste repositório, cole no editor e execute (`Run`). 
   - *Este script criará as tabelas, funções de segurança, habilitará o RLS (Policies) e fará o seed das perguntas (carga inicial de dados).*

3. **Configuração das Variáveis de Ambiente**
   - Na raiz do `frontend/`, crie o arquivo `.env` (ou utilize `.env.local`):
   ```env
   VITE_SUPABASE_URL=sua_url_do_projeto
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima_publica
   ```

4. **Rodar o Servidor de Desenvolvimento**
   ```bash
   npm run dev
   ```
   - O aplicativo estará rodando em `http://localhost:5173`.

5. **Gerar Versão de Produção (Build)**
   ```bash
   npm run build
   ```

---

## 📜 Propósito e Licença

Este projeto é desenvolvido para fins educativos, promovendo conhecimento sobre a Doutrina Católica e a inspiradora vida de Carlo Acutis, provando que é perfeitamente possível aliar as novas tecnologias com a busca pela santidade.

> *"A Eucaristia é a minha autoestrada para o Céu." - Carlo Acutis*
>>>>>>> 1c9dddf3020316eaaa9e1fdf62452ec18491ea3a

# São Carlo Acutis - Plataforma Web & Gamificada

Plataforma web interativa e educativa dedicada à história, legado, devoção e canonização do **São Carlo Acutis**, o "Padroeiro da Internet". O projeto combina conteúdo biográfico detalhado com um sistema de gamificação contendo quizzes, pontuação de XP, níveis e ligas entre usuários.

---

## 🚀 Tecnologias Utilizadas

### **Front-end**
- **React 19** & **TypeScript**
- **Vite** (Build tool e servidor de desenvolvimento ágil)
- **Tailwind CSS** (Estilização responsiva e moderna)
- **Framer Motion** (Animações fluidas e dinâmicas)
- **React Router DOM v7** (Roteamento SPA)

### **Back-end & Banco de Dados**
- **Supabase**
  - **Supabase Auth**: Gerenciamento de cadastro, autenticação e sessão de usuários.
  - **PostgreSQL Database**: Armazenamento de perfis de usuários, XP, níveis e ligas.

---

## ✨ Funcionalidades Principais

### 1. 🔐 Autenticação e Gestão de Usuários
- Login e Cadastro de novos usuários integrados ao Supabase.
- Criação automática do perfil do usuário (`profiles`) ao se cadastrar.
- Proteção de rotas privadas (`/perfil` e `/quiz`).

### 2. 📖 Conteúdo Biográfico & Páginas Temáticas
- **Página Inicial (`/`)**: Apresentação da vida de Carlo Acutis, linha do tempo interativa e visão geral dos pilares da sua fé.
- **Vida & Legado (`/vida-legado`)**: Infância, juventude, paixão por computação/tecnologia e testemunho de vida.
- **Fé & Devoção (`/fe-devocao`)**: Amor à Eucaristia ("Autoestrada para o Céu"), devoção à Virgem Maria e o site dos milagres eucarísticos.
- **Caminho à Santidade (`/santidade`)**: Processo de beatificação, milagres reconhecidos pela Igreja, canonização e orações.

### 3. 🎯 Quiz Interativo & Gamificação
- Teste de conhecimentos sobre São Carlo Acutis.
- Sistema de pontuação e ganho de **XP**.
- Progressão automática de níveis de devoção com base no acúmulo de XP.
- Atualização em tempo real do perfil no Supabase.

### 4. 🏆 Ligas & Ranking Social
- **Criar Liga**: Usuários podem criar ligas personalizadas com código de acesso único gerado automaticamente.
- **Entrar em Liga**: Possibilidade de ingressar em uma liga existente fornecendo o código de acesso.
- **Ranking**: Visualização do ranking de membros da mesma liga ordenados por XP.

---

## 📁 Estrutura do Projeto

```text
frontend/
├── public/                 # Arquivos estáticos (imagens, ícones)
├── src/
│   ├── assets/             # Mídias e imagens da aplicação
│   ├── components/         # Componentes reutilizáveis de UI
│   │   ├── layout/         # Componentes de estrutura (Footer, ScrollToTop, etc.)
│   │   ├── Navbar.tsx      # Barra de navegação responsiva
│   │   ├── Quiz.tsx        # Lógica e interface do Quiz
│   │   ├── Section.tsx     # Seções modulares da página
│   │   └── Timeline.tsx    # Linha do tempo interativa
│   ├── context/
│   │   └── AuthContext.tsx # Contexto global de autenticação e dados do usuário (Supabase)
│   ├── data/
│   │   ├── biographyContent.ts # Dados estruturados de biografia e histórias
│   │   └── navigation.ts       # Configurações de rotas e navegação
│   ├── pages/
│   │   ├── DetailPages.tsx # Páginas detalhadas (Vida & Legado, Fé, Santidade)
│   │   ├── Home.tsx        # Página inicial
│   │   ├── Login.tsx       # Tela de login
│   │   ├── Profile.tsx     # Painel do perfil, XP e Ligas
│   │   ├── QuizPage.tsx    # Página do Quiz
│   │   └── Register.tsx    # Tela de cadastro
│   ├── services/
│   │   ├── api.ts          # Cliente HTTP Axios (configuração base)
│   │   └── supabase.ts     # Inicialização do cliente Supabase
│   ├── App.tsx             # Definição de rotas e provedores
│   ├── index.css           # Estilos globais e diretivas Tailwind
│   └── main.tsx            # Ponto de entrada React
├── .env.example            # Exemplo de variáveis de ambiente
├── package.json            # Dependências e scripts do projeto
├── tailwind.config.js      # Configuração do Tailwind CSS
└── vite.config.ts          # Configuração do Vite
```

---

## 🛢️ Estrutura do Banco de Dados (Supabase)

### Tabela `profiles`
- `id` (uuid, chave primária ligada a `auth.users`)
- `nome` (text)
- `email` (text)
- `xp` (integer)
- `nivel` (text)
- `liga_id` (integer, chave estrangeira para `ligas.id`)

### Tabela `ligas`
- `id` (bigint, chave primária)
- `nome` (text)
- `codigo_acesso` (text, código único para entrada)
- `created_at` (timestamp)

---

## 🛠️ Como Executar o Projeto

### Pré-requisitos
- **Node.js** (versão 18 ou superior)
- **npm** (ou yarn/pnpm)
- Projeto configurado no **Supabase** (com as tabelas `profiles` e `ligas` criadas)

### 1. Clonar o repositório e instalar dependências
```bash
git clone <URL_DO_REPOSITORIO>
cd frontend
npm install
```

### 2. Configurar as Variáveis de Ambiente
Crie um arquivo `.env` na raiz da pasta `frontend/` com base no arquivo `.env.example`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

### 3. Rodar em Ambiente de Desenvolvimento
```bash
npm run dev
```
Acesse a aplicação em `http://localhost:5173`.

### 4. Construir para Produção
```bash
npm run build
```

---

## 📜 Licença

Este projeto é desenvolvido para fins educativos e de devoção a **São Carlo Acutis**.

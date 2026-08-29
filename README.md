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

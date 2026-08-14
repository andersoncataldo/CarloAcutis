# ✝️ Projeto São Carlo Acutis

Aplicação Web sobre a vida, legado e virtudes do **Beato Carlo Acutis**, com gamificação por meio de Quizzes e Ligas Paroquiais.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, React Router v7.
- **Backend / Database**: Supabase (Database Postgres, Authentication & Row Level Security).

---

## 🚀 Como Configurar e Rodar o Projeto

### 1. Configuração do Supabase (Backend)
1. Acesse o dashboard do [Supabase](https://supabase.com) e crie um novo projeto.
2. No menu lateral, acesse o **SQL Editor**.
3. Abra o arquivo [`schema.sql`](./schema.sql) deste repositório, cole o conteúdo no SQL Editor e execute.
   - Isso criará as tabelas (`ligas`, `profiles`, `temporadas`, `perguntas`), disparadores de criação de perfil, funções RPC seguras e políticas de segurança RLS.

### 2. Configuração do Frontend
1. Entre na pasta do frontend:
   ```bash
   cd frontend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie um arquivo `.env` na raiz da pasta `frontend/` com suas chaves do Supabase:
   ```env
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anonima-do-supabase
   ```
4. Execute o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
5. Abra o navegador em `http://localhost:5173`.

---

## 🏆 Funcionalidades Principais

- 🔐 **Autenticação Direta pelo Supabase**: Registro e login seguros.
- ⚡ **Quiz Interativo**: Respostas validadas diretamente no banco de dados via RPC sem expor gabaritos no cliente.
- 🎖️ **Sistema de Gamificação**: Ganho de XP e evolução progressiva de títulos (Peregrino ➔ Ciberapóstolo).
- ⛪ **Ligas Paroquiais**: Criação, entrada com código de acesso e ranking de membros em tempo real.
- 📚 **Conteúdo Devocional e Biográfico**: Abas organizadas por Vida & Legado, Fé & Devoção e Santidade.

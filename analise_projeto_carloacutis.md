# 📊 Análise Técnica — Projeto São Carlo Acutis

## Visão Geral

Projeto full-stack educativo/devocional sobre **Beato Carlo Acutis**, com:
- Interface web informativa (Home, páginas de categoria)
- Mini-game de Quiz com sistema de XP e níveis
- Sistema de Ligas (grupos de usuários)
- Autenticação JWT

Stack: **React 19 + TypeScript + Tailwind (frontend)** / **Java 17 + Spring Boot 4 + PostgreSQL (backend)**

---

## 1. ☕ Java + Spring Boot é eficiente para este projeto?

### Veredicto: **Funciona, mas é um canhão mirando em um pardal**

#### O que o projeto realmente precisa do backend:
| Função | Complexidade Real |
|---|---|
| Login/Registro com JWT | Baixa — 3 endpoints simples |
| Buscar perguntas por temporada | Baixíssima — 1 query SELECT |
| Processar resposta (XP++) | Baixa — lógica de ~10 linhas |
| Criar/Entrar em Liga | Baixa — 2 endpoints |
| Ranking da Liga | Baixa — 1 query ordenada |

#### Prós do Java + Spring Boot aqui:
- ✅ Spring Security + JWT já configurado e funcional
- ✅ JPA/Hibernate com PostgreSQL funciona muito bem para dados relacionais simples
- ✅ Flyway integrado (migrations versionadas)
- ✅ Lombok reduz boilerplate
- ✅ Boa opção se o objetivo é aprendizado de Java enterprise

#### Contras / Overhead real:
- ❌ **Spring Boot 4 + JVM** tem cold start de 5–15s na primeira execução. Para um projeto pequeno, isso pode ser problema em ambientes serverless
- ❌ A lógica de negócio cabe em ~200 linhas; Spring Boot exige muito mais configuração para isso
- ❌ Para hospedar gratuitamente, alternativas como **Node.js + Express + NeonDB** ou **Supabase** seriam muito mais práticas
- ❌ O CORS está hardcoded para `localhost:5173` — problema em produção

#### Alternativas que seriam mais leves:
- **Node.js + Express + Prisma** (mais simples, mesmo PostgreSQL Neon)
- **Supabase** (auth + DB + real-time prontos, zero backend custom)
- **Python + FastAPI** (curva menor, performance similar)

#### Conclusão:
> Spring Boot é uma escolha **válida como projeto de estudo** e funciona corretamente. Mas para o escopo real do projeto (5 endpoints simples), adiciona complexidade desnecessária de infra. **Se o foco é aprender Spring Boot, mantenha. Se o foco é o produto, considere Node.js ou Supabase.**

---

## 2. 🔴 Problemas encontrados no Frontend

### 2.1 — CRÍTICO: `api.ts` está apontando para `localhost` em produção

**Arquivo:** [`api.ts`](file:///c:/Users/ander/Projetos%20-%20Anderson/Projetos%20Pessoais/CarloAcutis/frontend/src/services/api.ts#L4)

```ts
// PROBLEMA: URL hardcoded — vai quebrar em produção (Vercel)
baseURL: 'http://localhost:8080/api',
```

**Correção:**
```ts
baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
```
E criar um arquivo `.env.production` com:
```
VITE_API_URL=https://seu-backend-em-producao.com/api
```

---

### 2.2 — CRÍTICO: `SecurityConfig.java` tem CORS hardcoded para localhost

**Arquivo:** [`SecurityConfig.java`](file:///c:/Users/ander/Projetos%20-%20Anderson/Projetos%20Pessoais/CarloAcutis/backend/src/main/java/com/carloacutis/backend/security/SecurityConfig.java#L68)

```java
// PROBLEMA: Só aceita requisições do Vite local
config.addAllowedOrigin("http://localhost:5173");
```

Deve incluir a URL do frontend em produção (Vercel, etc.).

---

### 2.3 — GRAVE: Senha exposta no campo `senhaHash` no frontend

**Arquivo:** [`Register.tsx`](file:///c:/Users/ander/Projetos%20-%20Anderson/Projetos%20Pessoais/CarloAcutis/frontend/src/pages/Register.tsx#L11)

O campo de senha no formulário se chama `senhaHash` no estado React e é enviado diretamente na requisição:
```ts
senhaHash: formData.senhaHash  // Nome do campo vaza detalhes da implementação do backend
```

O ideal seria o campo ser chamado `senha` ou `password` no frontend, e o backend mapear internamente. É um vazamento de detalhe de implementação (que usa hash) para o cliente.

---

### 2.4 — MODERADO: `QuizController` expõe a `respostaCorreta` no frontend

**Arquivo:** [`QuizController.java`](file:///c:/Users/ander/Projetos%20-%20Anderson/Projetos%20Pessoais/CarloAcutis/backend/src/main/java/com/carloacutis/backend/controllers/QuizController.java#L31)

O endpoint `GET /quiz/temporada/{id}/perguntas` retorna a entidade `Pergunta` completa, incluindo o campo `respostaCorreta`. Isso significa que qualquer usuário pode abrir o DevTools, inspecionar a resposta da API e ver as respostas corretas antes de responder.

```java
// PROBLEMA: Retorna Pergunta com respostaCorreta exposta
return temporada.getPerguntas(); // inclui respostaCorreta!
```

**Correção:** Criar um DTO `PerguntaPublicaDTO` sem o campo `respostaCorreta`.

---

### 2.5 — MODERADO: Lógica de verificação de acerto no Quiz é frágil

**Arquivo:** [`Quiz.tsx`](file:///c:/Users/ander/Projetos%20-%20Anderson/Projetos%20Pessoais/CarloAcutis/frontend/src/components/Quiz.tsx#L58)

```ts
// Determina acerto comparando XP antes/depois — GAMBIARRA
const isCorrect = updatedUser.xp > user.xp;
```

Se o usuário tiver XP atualizado por outro meio simultâneo, isso pode dar falso positivo/negativo. O backend deveria retornar um campo `acertou: boolean` explícito.

---

### 2.6 — MODERADO: `QuizPage.tsx` tem `temporadaId={1}` hardcoded

**Arquivo:** [`QuizPage.tsx`](file:///c:/Users/ander/Projetos%20-%20Anderson/Projetos%20Pessoais/CarloAcutis/frontend/src/pages/QuizPage.tsx#L14)

```tsx
<Quiz temporadaId={1} />  // Hardcoded — não há seleção de temporada
```

O backend tem endpoint `GET /quiz/temporadas` mas ele nunca é chamado. O usuário não pode escolher temporadas.

---

### 2.7 — LEVE: `LigaController` não valida autenticação para `entrarNaLiga`

**Arquivo:** [`LigaController.java`](file:///c:/Users/ander/Projetos%20-%20Anderson/Projetos%20Pessoais/CarloAcutis\backend\src\main\java\com\carloacutis\backend\controllers\LigaController.java)

O endpoint `POST /ligas/entrar` recebe `usuarioId` no body — qualquer usuário autenticado pode entrar em nome de outro usuário passando o ID alheio. Deveria usar o `Authentication` do Spring Security para pegar o usuário atual.

---

### 2.8 — LEVE: Diretório de migrations Flyway está vazio

**Pasta:** `backend/src/main/resources/db/migration/` está **vazia**.

Isso significa que o schema do banco está sendo criado pelo Hibernate com `ddl-auto` automático, sem versionamento de migrations. Isso é inseguro para produção — qualquer alteração de modelo pode causar perda de dados.

---

### 2.9 — LEVE: `vitepress` listado como dependência dev desnecessária

**Arquivo:** [`package.json`](file:///c:/Users/ander/Projetos%20-%20Anderson/Projetos%20Pessoais/CarloAcutis/frontend/package.json#L35)

```json
"vitepress": "^0.1.1"  // Não utilizado — peso desnecessário
```

---

### 2.10 — LEVE: `SecurityConfig` usa API deprecated do Spring Security

**Arquivo:** [`SecurityConfig.java`](file:///c:/Users/ander/Projetos%20-%20Anderson/Projetos%20Pessoais/CarloAcutis/backend/src/main/java/com/carloacutis/backend/security/SecurityConfig.java#L46)

```java
http
  .cors()           // deprecated no Spring Security 6+
  .and()            // deprecated — usar lambda config
  .csrf().disable() // deprecated
```

O Spring Boot 4 usa Spring Security 7 que requer a nova sintaxe lambda-style:
```java
http
  .cors(cors -> cors.configurationSource(...))
  .csrf(csrf -> csrf.disable())
  ...
```

---

## 3. ✅ O projeto cumpre seus objetivos?

### Objetivos identificados:
1. **Site informativo sobre Carlo Acutis** — ✅ Parcialmente. Há Home, páginas de categoria (Vida/Fé/Santidade), seções e timeline.
2. **Mini-game de Quiz** — ✅ Funcional, com XP e feedback visual bonito.
3. **Sistema de Ligas/Ranking** — ✅ Implementado, mas sem seleção visual de temporada.
4. **Autenticação de usuários** — ✅ JWT completo (login, registro, me, rotas protegidas).
5. **Gamificação (XP + Níveis)** — ✅ Funcional com títulos progressivos (Peregrino → Ciberapóstolo).

### O que está faltando para cumprir bem os objetivos:

| Item | Status | Observação |
|---|---|---|
| Seleção de Temporadas do Quiz | ❌ Ausente | Backend pronto, frontend ignora |
| Proteção das respostas corretas | ❌ Exposto | Qualquer um vê via DevTools |
| Deploy funcional (produção) | ❌ Quebrado | URL localhost hardcoded |
| Schema de banco versionado | ⚠️ Frágil | Pasta de migrations vazia |
| Identificação segura de usuário | ⚠️ Frágil | Liga usa `usuarioId` no body |
| Testes automatizados | ❌ Ausente | Diretório `test/` existe mas vazio |

---

## Resumo Executivo

| Categoria | Nota | Comentário |
|---|---|---|
| Arquitetura Geral | 7/10 | Bem estruturado, separação clara de responsabilidades |
| Java + Spring Boot | 6/10 | Funciona, mas superdimensionado para o escopo |
| Segurança | 4/10 | Respostas do quiz expostas, `usuarioId` no body, CORS hardcoded |
| Qualidade do Código Backend | 7/10 | Limpo, Lombok bem usado, injeção de dependência correta |
| Qualidade do Código Frontend | 7/10 | Componentes bem organizados, bom uso de contexto e hooks |
| Completude de Features | 6/10 | Temporada hardcoded, migrations ausentes, sem testes |
| Prontidão para Produção | 3/10 | URL hardcoded, CORS bloquearia tudo, schema sem controle |

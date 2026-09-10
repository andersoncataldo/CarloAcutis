# Avaliação Técnica do Projeto Carlo Acutis

**Data da avaliação:** 06/09/2026
**Escopo analisado:** frontend atual, configuração do Vite/TypeScript, integração Supabase, schema SQL e build de produção.

## 1. Resumo executivo

O projeto atual é uma SPA educativa e devocional construída com React, TypeScript e Vite. O Supabase concentra autenticação, persistência, políticas de acesso e funções RPC para o quiz e as ligas. A arquitetura é adequada ao tamanho do produto e está bem separada em páginas, componentes, contexto, dados estáticos e serviço de infraestrutura.

A base está funcional, mas ainda não está pronta para ser considerada madura em qualidade e performance. O principal problema funcional é o erro de Hooks no componente do quiz. O maior risco de performance é o carregamento inicial monolítico, agravado por imagens grandes. O maior risco de segurança e consistência é depender apenas de suposições do cliente e de policies para proteger consultas que deveriam ser explicitamente limitadas ao usuário atual.

### Notas indicativas

| Área | Nota | Avaliação |
|---|---:|---|
| Arquitetura e estrutura | 8/10 | Organização clara e adequada ao escopo atual. |
| Qualidade de código | 6/10 | TypeScript estrito, mas lint quebrado e alguns fluxos frágeis. |
| Segurança e integridade | 6/10 | RPC/RLS são boas decisões; configuração e consultas precisam endurecimento. |
| Performance | 5/10 | Build funcional, mas bundle e ativos iniciais estão pesados. |
| Testabilidade e manutenção | 4/10 | Não há testes automatizados nem uma camada clara de contratos/tipos do banco. |
| Prontidão para produção | 6/10 | Pode ser publicado, mas recomenda-se tratar os itens de alta prioridade antes. |

## 2. Arquitetura atual

### Frontend

- React 19 com TypeScript estrito.
- Vite como servidor e bundler.
- React Router para as rotas públicas, autenticadas e administrativas.
- Tailwind CSS para estilos.
- Framer Motion para animações.
- `AuthContext` centralizando sessão, perfil, nível, liga e sequência de acessos.

### Backend como serviço

O projeto não possui mais backend Java/Spring. O acesso à infraestrutura é feito pelo cliente Supabase em `src/services/supabase.ts`:

- Supabase Auth para cadastro, login e sessão.
- PostgreSQL para perfis, ligas, temporadas, perguntas e respostas.
- RLS para restringir dados por usuário.
- RPCs para validar respostas, conceder XP, registrar acesso e administrar ligas.

### Rotas principais

- `/`: página inicial.
- `/vida-legado`, `/fe-devocao` e `/santidade`: conteúdo biográfico.
- `/login` e `/cadastro`: autenticação.
- `/perfil`: área protegida do usuário.
- `/quiz`: quiz protegido.
- `/admin`: área protegida por perfil administrativo.
- Rota coringa redirecionando para a home.

## 3. Pontos positivos

- A separação entre `pages`, `components`, `context`, `data` e `services` é simples de entender e adequada ao produto.
- As rotas protegidas estão concentradas em `App.tsx`, evitando repetir a mesma regra em cada página.
- O gabarito não é buscado pelo frontend: a resposta é processada pela RPC `responder_pergunta` no banco.
- O schema possui entidades separadas para perfis, ligas, temporadas, perguntas e histórico de respostas.
- O histórico tem restrição única por usuário e pergunta, reduzindo risco de XP duplicado.
- O cálculo de XP e nível acontece no banco, o que reduz a confiança indevida no estado do cliente.
- O TypeScript está configurado com `strict`, `noUnusedLocals`, `noUnusedParameters` e outras verificações úteis.
- O build de produção foi concluído com sucesso.

## 4. Problemas e riscos encontrados

### 4.1 Alta prioridade: Hook condicional no quiz

**Arquivo:** `src/components/Quiz.tsx`

`useMemo` é chamado depois de retornos antecipados para `loading`, lista vazia e conclusão. Isso viola as Rules of Hooks e já é detectado pelo lint:

```text
React Hook "useMemo" is called conditionally.
```

Além de manter o pipeline vermelho, a ordem dos Hooks pode mudar entre renders. O cálculo das opções embaralhadas deve ser movido para antes dos retornos condicionais ou substituído por uma estratégia que preserve a ordem dos Hooks.

### 4.2 Alta prioridade: consulta de respostas sem filtro explícito de usuário

**Arquivo:** `src/components/Quiz.tsx`

A consulta do histórico filtra apenas pelos IDs das perguntas:

```ts
.from('respostas_usuario')
.select('pergunta_id, acertou')
.in('pergunta_id', lista.map(p => p.id));
```

Ela deveria incluir `.eq('user_id', user.id)`. O RLS pode impedir o retorno de dados de terceiros, mas a regra de negócio não deve depender apenas de uma suposição implícita. O filtro explícito melhora clareza, reduz dados processados e evita que uma alteração futura de policy afete o progresso e a pontuação.

### 4.3 Alta prioridade: efeito do quiz ignora dependências relevantes

O efeito que busca perguntas depende de `temporadaId`, mas usa `user` e suprime a verificação de dependências. Se a sessão for carregada depois da lista de perguntas, o progresso existente pode não ser recuperado nessa execução. O fluxo deve reagir à disponibilidade do usuário ou separar a busca das perguntas da busca do histórico.

### 4.4 Média prioridade: fallback de credenciais no código-fonte

**Arquivo:** `src/services/supabase.ts`

O cliente possui URL e chave pública como valores de fallback. A chave publishable/anon não é um segredo, mas manter configuração de ambiente real no código:

- dificulta identificar configurações diferentes entre desenvolvimento e produção;
- pode conectar instalações acidentalmente ao mesmo projeto;
- mascara a ausência de configuração correta no deploy.

O ideal é exigir as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` no build, deixando falha explícita quando estiverem ausentes. A proteção real dos dados continua dependendo de RLS e nunca de esconder a chave pública.

### 4.5 Média prioridade: bundle inicial acima do limite recomendado

O build gerou um bundle JavaScript de aproximadamente **646 kB**, acionando o aviso do Vite para chunks acima de 500 kB. Todas as páginas são importadas de forma eager em `App.tsx`, portanto o usuário baixa também o código do quiz, administração e autenticação ao abrir a home.

Recomendação: usar `React.lazy` e `Suspense` para rotas secundárias, especialmente `/admin`, `/quiz`, `/perfil`, login e cadastro. Isso reduz o JavaScript inicial e melhora o carregamento da página pública.

### 4.6 Média prioridade: imagens grandes no carregamento

Os ativos mais pesados encontrados incluem:

- `src/assets/Carlo.jpg`: aproximadamente 1,4 MB.
- `src/assets/icon.png`: aproximadamente 964 kB.
- `src/assets/carlo_retrato.png`: aproximadamente 584 kB.

A home carrega a imagem principal imediatamente e o build mantém os arquivos em seus formatos originais. Recomenda-se gerar versões WebP/AVIF responsivas, definir dimensões estáveis e usar `srcSet`/`sizes` quando houver variações. O ícone também deve ser reduzido ou substituído por um formato adequado ao uso.

### 4.7 Média prioridade: ausência de testes automatizados

O `package.json` possui scripts de desenvolvimento, build, lint e preview, mas não possui script de testes. Não há proteção automatizada para fluxos críticos como:

- autenticação e redirecionamento de rotas;
- retomada de progresso do quiz;
- primeira resposta e concessão única de XP;
- criação, entrada e saída de ligas;
- permissões da área administrativa.

Um conjunto pequeno de testes para o quiz, autenticação e funções de banco reduziria o risco de regressões.

### 4.8 Média prioridade: contratos do banco não estão tipados

As respostas do Supabase são convertidas com casts como `as UserProfile`, `as Pergunta` e `as StreakInfo`. Isso acelera o desenvolvimento, mas não valida em tempo de compilação se o schema e o frontend continuam sincronizados. Recomenda-se gerar os tipos do banco a partir do Supabase e usá-los no cliente.

### 4.9 Baixa prioridade: limpeza de ciclo de vida no quiz

O quiz agenda um `setTimeout` para avançar a pergunta após o feedback, mas não cancela esse timer quando o componente é desmontado ou quando a temporada muda. Em navegação rápida, isso pode produzir atualizações atrasadas de estado. Um efeito de limpeza ou uma referência ao timer resolveria o problema.

### 4.10 Baixa prioridade: metadados ainda são os do template

O `package.json` mantém descrição, autor, palavras-chave e licença genéricos do template inicial. Isso não afeta a execução, mas prejudica a identificação do pacote e a manutenção do projeto.

## 5. Banco de dados e integridade

O `schema.sql` é uma boa base para o escopo atual:

- `profiles` estende o usuário autenticado.
- `ligas` armazena grupos e códigos de acesso.
- `temporadas` e `perguntas` organizam o conteúdo do quiz.
- `respostas_usuario` impede duplicidade por usuário e pergunta.
- Índices existem para chaves estrangeiras e filtros frequentes.
- Funções RPC concentram alterações sensíveis de XP e liga no banco.

Pontos para evolução:

1. Confirmar, em ambiente publicado, que todas as tabelas sensíveis possuem RLS habilitado e policies mínimas.
2. Restringir permissões de execução das RPCs ao papel apropriado e validar o usuário dentro de cada função.
3. Manter alterações do schema em migrações versionadas, em vez de depender somente da execução manual do arquivo completo.
4. Adicionar índices conforme o volume real de respostas, ligas e ranking crescer.
5. Evitar `select('*')` em consultas de perfil quando apenas alguns campos são necessários.

## 6. Avaliação de performance

### Situação observada

- `npm run build`: passou.
- Bundle JavaScript principal: aproximadamente 646 kB.
- Vite emitiu aviso de chunk acima de 500 kB.
- Há imagens individuais acima de 500 kB.
- A aplicação utiliza imports eager para todas as páginas.
- Perguntas e histórico são buscados separadamente, o que é aceitável, mas pode ser refinado com uma camada de carregamento mais previsível.

### Ordem recomendada de otimização

1. Dividir as rotas com lazy loading.
2. Converter e redimensionar imagens grandes.
3. Medir Web Vitals em produção, principalmente LCP, CLS e INP.
4. Evitar consultas amplas e adicionar filtros explícitos de usuário.
5. Usar cache ou pré-carregamento apenas para dados realmente reutilizados.
6. Reavaliar o tamanho dos chunks depois das otimizações, sem aumentar o limite apenas para silenciar o aviso.

## 7. Plano de melhoria priorizado

### P0: corrigir antes do próximo deploy

- Corrigir o `useMemo` condicional em `Quiz.tsx`.
- Filtrar o histórico por `user_id`.
- Revisar as policies RLS e as permissões das RPCs no projeto Supabase publicado.
- Remover os fallbacks de configuração do cliente Supabase.

### P1: próxima iteração

- Implementar lazy loading das rotas.
- Otimizar `Carlo.jpg`, `icon.png` e demais ativos grandes.
- Corrigir o ciclo de vida do `setTimeout` do quiz.
- Separar o carregamento das perguntas do carregamento do progresso do usuário.
- Gerar tipos oficiais do banco Supabase.

### P2: evolução de qualidade

- Adicionar testes unitários e de integração para autenticação, quiz e ligas.
- Criar migrações versionadas para o schema.
- Atualizar metadados do `package.json`.
- Adicionar observabilidade básica de erros e Web Vitals.

## 8. Conclusão

O projeto tem uma direção técnica coerente para uma aplicação pequena: React/Vite no cliente e Supabase como backend gerenciado. A estrutura é legível e as decisões de manter XP e validações sensíveis no banco são corretas.

A prioridade não é trocar a stack, mas fortalecer a implementação atual. Corrigindo o Hook condicional, explicitando o isolamento por usuário, reduzindo o bundle inicial e otimizando os ativos, o projeto ganha qualidade de manutenção, segurança operacional e tempo de carregamento sem exigir uma reestruturação ampla.

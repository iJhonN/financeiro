# CHANGELOGS.md — Wolf Finance v3

> Registro histórico e cronológico de alterações, atualizações de arquitetura, banco de dados e funcionalidades do projeto.
> Este arquivo serve também como Ponto de Restauração de Contexto entre sessões de desenvolvimento.

---

## [Status Atual do Projeto & Próximos Passos]
- **Fase Atual:** Fase 4 em Conclusão (Dashboard Refinada e Relatórios).
- **Entregas Recentes:**
  - `src/components/layout/AppShell.tsx`: Largura responsiva expandida para `max-w-7xl` com paddings dinâmicos (`px-4 sm:px-6 lg:px-8`).
  - `src/app/(app)/page.tsx`: Dashboard principal reestruturada em 3 blocos superiores nivelados (Saldo Consolidado, Receitas do Mês e Despesas do Mês) e duas colunas inferiores (Timeline de Movimentações + Widgets Laterais de Contas, Faturas e Metas).
  - Alinhamento vertical estrito dos cabeçalhos de secção com a classe `h-7`.
- **Próximos Passos:**
  1. Implementação dos Relatórios e Gráficos de Despesas por Categoria (distribuição percentual).
  2. Ajuste de aportes dinâmicos em Metas.
  3. Transição para a Fase 5 (Módulo Wolf Driver Integrado).

---

## [2026-10-21 15:15] - Fase 4: Refinamento de Layout e Dashboard Principal
- Corrigida a largura restritiva no `AppShell` para suporte completo a ecrãs largos e desktop.
- Reorganizada a página inicial `/` com proporções harmónicas, cards nivelados e tipografia tabular (`tabular-nums`).
- Validação estrita via TypeScript (`npx tsc --noEmit`) sem erros.

---

## [2026-10-21 15:05] - Fase 4: Menu Mais, Gestão de Categorias e Logout
- Padronizadas as ações de encerramento de sessão em `src/server/actions/auth.actions.ts` com suporte a `signOutAction`.
- Criado o componente de logout interativo `SignOutButton.tsx` com feedback visual de carregamento via `useTransition`.
- Criada a página `src/app/(app)/mais/page.tsx` conectando os módulos auxiliares do sistema.
- Criada a página `src/app/(app)/categorias/page.tsx` com agrupamento por tipo (`receita` e `despesa`).
- Criados `NovaCategoriaModal.tsx` e `AdicionarCategoriaButton.tsx` com suporte a escolha de cores hexadecimais.
- Validação estrita via TypeScript (`npx tsc --noEmit`) sem erros.
  
---

## [2026-10-21 14:48] - Fase 4: Implementação de Categorias e Metas Financeiras
- Criados `categorias.repository.ts` e `categorias.actions.ts`.
- Atualizado `NovoLancamentoModal.tsx` para carregar e associar categorias às transações.
- Criados `metas.repository.ts` e `metas.actions.ts` alinhados com as colunas reais da base de dados (`nome`, `alvo_centavos`, `atual_centavos`).
- Construída a interface completa de metas em `src/app/(app)/metas/page.tsx` com barras de progresso percentual.
- Validação estrita via TypeScript (`npx tsc --noEmit`) sem erros.
  
---

## [2026-10-21 14:02] - Fase 3: Conclusão do Domínio Financeiro (Contas e Cartões de Crédito)
- Implementada exclusão de transações em `transacoes.repository.ts` e `transacoes.actions.ts`.
- Criada a tela de extrato `/lancamentos` com componente interativo `TransacaoItem.tsx`.
- Criado repositório `contas.repository.ts`, actions `contas.actions.ts` e interface `/contas` com `NovaContaModal.tsx`.
- Vinculado o seletor de contas ativas ao modal de criação de transações.
- Criado repositório `cartoes.repository.ts`, actions `cartoes.actions.ts` e interface `/cartoes` com `NovoCartaoModal.tsx`.
- Corrigida a ordenação de cartões por `apelido` em vez de `nome`, e alinhados os campos com o schema Supabase.
- Validação: criação e listagem dinâmica de transações, contas e cartões aprovadas em ambiente de desenvolvimento.

---

## [2026-10-21 13:30] - Fase 3: Conexão End-to-End de Transações e Dashboard
- Criado `src/server/repositories/transacoes.repository.ts` com métodos `listarTransacoesMes` e `criarTransacao`.
- Criado `src/server/actions/transacoes.actions.ts` garantindo conversão segura para centavos e revalidação de rotas.
- Criado componente `src/components/transacoes/NovoLancamentoModal.tsx` integrado ao botão flutuante central da `BottomNav`.
- Ajustada a função RPC `fn_tem_assinatura_ativa` no Supabase com permissões `GRANT EXECUTE` para `authenticated` e `service_role`.
- Implementada a leitura dinâmica na rota raiz `src/app/(app)/page.tsx` com tratamento para `cacheComponents` do Next.js 16.
- Validação: fluxo completo de criação de transação refletindo na dashboard aprovado com sucesso.

## [2026-10-21 12:05] - Conclusão da Fase 2: Layout Base, Shell e Proteção de Sessão
- Criado componente `src/components/layout/MonthPicker.tsx` com navegação de competências vinculada à URL (`date-fns/locale/pt-BR`).
- Criado componente `src/components/layout/BottomNav.tsx` com 5 pontos de contato essenciais e botão central destacado para novas transações.
- Criado componente `src/components/layout/Header.tsx` e `src/components/layout/AppShell.tsx` com Dark Mode nativo e suporte a privacidade de saldos.
- Criado componente de interface `src/components/ui/StatCard.tsx` e utilitário `src/lib/money.ts` com conversão estrita de centavos para Real (BRL).
- Configurado o layout protegido `src/app/(app)/layout.tsx` com validação de sessão em profundidade via `auth.getUser()` e checagem de assinatura via RPC `fn_tem_assinatura_ativa`.
- Removido conflito de rota raiz em `src/app/page.tsx`, mantendo `src/app/(app)/page.tsx` no dashboard protegido.
- Validação: `tsc --noEmit` aprovado com 0 erros.

## [2026-10-21 11:40] - Configuração de Env Local, Proxy Next.js 16 e Telas de Auth
- Criado arquivo local `.env.local` com as chaves oficiais do projeto Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` e `NEXT_PUBLIC_SITE_URL`).
- Migrado `src/middleware.ts` para a convenção oficial do Next.js 16 em `src/proxy.ts`, consumindo diretamente o objeto seguro `env` de `@/env` e mantendo a validação estrita de sessão via `auth.getUser()`.
- Criado `src/lib/validators/auth.schema.ts` com validação de senhas (12 a 128 caracteres) e normalização de e-mails.
- Criado `src/server/actions/auth.actions.ts` com respostas genéricas contra enumeração de contas e suporte à confirmação obrigatória de e-mail.
- Criadas as interfaces de `src/app/(auth)/login/page.tsx` e `src/app/(auth)/cadastro/page.tsx` com Dark Mode nativo, superfícies semânticas e tela de aviso pós-cadastro.
- Validação: `tsc --noEmit` aprovado com zero erros e servidor de desenvolvimento em execução limpa.

---

## [2026-10-21 11:25] - Conclusão da Fase 1: Datas, Schemas Zod e Tipagem Supabase
- `src/lib/dates.ts`: utilitário de datas imutáveis `YYYY-MM-DD` com proteção de fim de mês (`clampDay`).
- `src/lib/validators/transacao.schema.ts` e `driver.schema.ts`: schemas Zod para validação server-side.
- `src/types/database.types.ts`: tipos gerados a partir do schema Supabase.
- `src/lib/supabase/client.ts`, `server.ts`, `admin.ts`: clientes tipados estritamente com `Database`.
- Validação: `npx tsc --noEmit` sem erros. Sem novas variáveis de ambiente.

---

## [2026-10-21 11:18] - Versionamento Git e Sincronização com GitHub
- `.gitignore`: Atualizado com regras estritas para ignorar dependências, `.next/`, artefatos de testes (`playwright-report`, `coverage`), arquivos locais do Supabase (`.supabase/`), rastros de agentes IA (`.aider*`, `.cline*`, `.cursor*`) e todos os arquivos `.env*`, mantendo exceção unicamente para `!.env.example`.
- Repositório remoto configurado e sincronizado via branch `main` no GitHub (`iJhonN/financeiro`).
- Ficheiros de documentação técnica (`docs/`), regras (`.clinerules`) e histórico (`changelogs.md`) versionados com sucesso.

---

## [2026-10-21 11:10] - Provisionamento do Banco de Dados no Supabase (DDL, RLS e RPCs)
- **Extensões:** Ativadas `pgcrypto` e `uuid-ossp` para geração segura de identificadores e chaves criptográficas.
- **Tabelas e Modelagem:** Criada a estrutura completa de 16 tabelas (`profiles`, `user_roles`, `assinaturas`, `contas`, `cartoes`, `faturas`, `categorias`, `grupos_lancamento`, `transacoes`, `orcamentos`, `metas`, `veiculos`, `plataformas`, `driver_ganhos`, `driver_despesas`, `driver_manutencoes`, `audit_log`).
- **Segurança (RLS):** Habilitado e forçado (`FORCE ROW LEVEL SECURITY`) em 100% das tabelas do schema public. Políticas isoladas por `auth.uid()`.
- **Triggers e RPCs:**
  - Implementado `fn_handle_user_created` para onboarding automático (carteira, categorias e plano trial de 7 dias).
  - Implementado sincronismo atômico e bloqueio de edição direta para transações originadas no módulo Driver.
  - Implementadas as RPCs atômicas `rpc_liquidar_fatura`, `rpc_registrar_ganho_driver` e `rpc_registrar_despesa_driver` com `security definer` e `set search_path = ''`.
- **Blindagem de Permissões (Linter):** 
  - Adicionado `security invoker` e `set search_path = ''` nas funções de gatilho pendentes (`fn_set_updated_at` e `fn_block_direct_driver_transacao_edit`).
  - Revogadas permissões de execução pública (`anon` e `public`) em todas as funções internas e restrita a execução das RPCs operacionais exclusivamente para a role `authenticated`.
- **Seed Data:** Populada a tabela de plataformas com os serviços essenciais de transporte, delivery e encomendas.

---

## [2026-10-21 10:59] - Infraestrutura Base do Supabase e Validação de Env
- `package.json`: instalados `@t3-oss/env-nextjs` (validação de env exigida por `env.md`/`security.md`) e `server-only` (bloqueia import acidental de código servidor no bundle do cliente).
- Criado `src/env.js`: `createEnv` com Zod, mapeando todas as variáveis de `env.md`. Cliente: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `NEXT_PUBLIC_SENTRY_DSN`. Servidor: `SUPABASE_SERVICE_ROLE_KEY`, `UPSTASH_REDIS_REST_URL/TOKEN`, `TURNSTILE_SECRET_KEY`, `WEBHOOK_PAYMENT_SECRET`; opcionais (gateway "se ativo"/CI): `ASAAS_API_KEY`, `MERCADOPAGO_ACCESS_TOKEN`, `SENTRY_AUTH_TOKEN`. Suporta `SKIP_ENV_VALIDATION` e `emptyStringAsUndefined`.
- Criado `src/lib/supabase/client.ts`: `createClient()` com `createBrowserClient` (chave anônima, sessão por cookies).
- Criado `src/lib/supabase/server.ts`: `createClient()` assíncrono com `createServerClient` + `cookies()` do Next (Server Components/Actions), marcado `server-only`.
- Criado `src/lib/supabase/admin.ts`: `createAdminClient()` com `service_role`, sem persistência de sessão, `server-only` (uso restrito a rotas admin e webhooks).
- Validação: `tsc --noEmit` e `eslint src` sem erros. Sem novas variáveis de ambiente (apenas mapeadas as já documentadas).

---

## [2026-10-21 10:53] - Inicialização do Projeto Next.js e Dependências Base
- Gerado o projeto Next.js (App Router, TypeScript, Tailwind v4, ESLint, `src/`, alias `@/*`, npm) na raiz via `create-next-app`. `.clinerules` e `changelogs.md` foram preservados (movidos temporariamente por conflito do scaffolder).
- `package.json`: instaladas as libs de `base.md`/`security.md`: `@supabase/supabase-js`, `@supabase/ssr`, `zod`, `react-hook-form`, `@hookform/resolvers@^5` (v6 gerava ERESOLVE por peers opcionais), `@tanstack/react-query`, `date-fns`, `lucide-react`, primitivos Radix (dialog, slot, dropdown-menu, select, tabs, switch, checkbox, label, popover), `@upstash/redis`, `@upstash/ratelimit`, `@sentry/nextjs`, `clsx`, `tailwind-merge`.
- Dev: `vitest`, `@vitejs/plugin-react`, `vite-tsconfig-paths`, `@playwright/test`; `@types/node` fixado em `^22` (exigido pelo vitest).
- `tsconfig.json`: adicionado `noUncheckedIndexedAccess: true` conforme `base.md`.
- Validação: `tsc --noEmit` e `eslint` sem erros. Nenhum componente criado; sem novas variáveis de ambiente.

---

## [2026-10-21 10:17] - Utilitário de Dinheiro (cêntimos <-> BRL)
- Criado `src/lib/money.ts`: funções puras `formatCentsToBRL` (cêntimos -> 'R$ 1.250,50') e `parseBRLToCents` (string -> cêntimos inteiros), sem float, conforme regra de dinheiro em inteiros de `base.md` e `bancodedados.md`.

---

## [2026-10-21 10:18] - Documentação de Variáveis de Ambiente
### Criado
- Adicionado arquivo `env.md` detalhando todas as variáveis de ambiente (Supabase, Upstash Redis, Cloudflare Turnstile, Gateways e Sentry), regras de exposição e exemplo de `.env.example`.

---

## [2026-10-21 10:18] - Inicialização da Documentação
### Criado
- Inicialização do arquivo `changelogs.md` para rastreamento de alterações do projeto Wolf Finance v3.
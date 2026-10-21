# CHANGELOGS.md — Wolf Finance v3

> Registro histórico e cronológico de alterações, atualizações de arquitetura, banco de dados e funcionalidades do projeto.
> Este arquivo serve também como Ponto de Restauração de Contexto entre sessões de desenvolvimento.

---

## [Status Atual do Projeto & Próximos Passos]
- **Fase Atual:** Fase 1 do Roadmap (Infraestrutura e Libs Base em Andamento).
- **Banco de Dados (Supabase):** Provisionado com 16 tabelas, RLS forçado, RPCs atômicas e permissões blindadas contra avisos do linter.
- **Repositório (GitHub):** Versionado e sincronizado com `.gitignore` blindado para Next.js, testes, ferramentas de IA e variáveis de ambiente.
- **Próxima Etapa:** Criação do utilitário `src/lib/dates.ts` (funções imutáveis e proteção `clampDay`) e schemas Zod em `src/lib/validators/`.

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
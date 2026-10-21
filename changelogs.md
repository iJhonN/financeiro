# CHANGELOGS.md — Wolf Finance v3

> Registro histórico e cronológico de alterações, atualizações de arquitetura, banco de dados e funcionalidades do projeto.
> Este arquivo serve também como Ponto de Restauração de Contexto entre sessões de desenvolvimento.

---

## [Status Atual do Projeto & Próximos Passos]
- **Fase Atual:** Planejamento e Documentação Técnica Concluída.
- **Estado dos Arquivos da Base:**
  - `base.md`: Arquitetura Next.js 15+, convenções e roadmap de desenvolvimento.
  - `bancodedados.md`: DDL do Postgres, RLS, triggers e RPCs do Supabase.
  - `design.md`: Sistema de design (Dark mode por padrão, mobile-first, bottom sheets, tokens).
  - `security.md`: Protocolos de segurança, auth, rate limit e headers.
  - `env.md`: Tabela e regras de variáveis de ambiente.
  - `changelogs.md`: Histórico de alterações e estado do projeto.
- **Próxima Etapa:** Início da implementação técnica (Fase 1 do Roadmap — Configuração de Libs base, Zod Schemas e Clientes do Supabase).

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

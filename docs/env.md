# ENV.md — Wolf Finance v3 (Variáveis de Ambiente e Integrações)

> Especificação de variáveis de ambiente, segredos e chaves de APIs para os ambientes de Desenvolvimento, Staging e Produção.
> As regras de validação via `@t3-oss/env-nextjs` estão descritas em `base.md` e `security.md`.

---

## 1. Regras de Segurança para Variáveis de Ambiente

1. **Prefixos Públicos (`NEXT_PUBLIC_`):** Utilizados **exclusivamente** para chaves públicas que precisam ser expostas ao navegador (ex: URL do Supabase, chave anônima e site key do Turnstile).
2. **Segredos no Servidor:** Chaves de API, tokens de gateway de pagamento, secrets de webhooks e `SUPABASE_SERVICE_ROLE_KEY` **nunca** devem possuir o prefixo `NEXT_PUBLIC_`.
3. **Validação Runtime e Build:** Todas as variáveis são validadas na inicialização via schema Zod em `src/env.js`. Se faltar alguma variável obrigatória, o build/start falhará imediatamente.

---

## 2. Tabela de Variáveis de Ambiente

### 2.1 Supabase (Banco de Dados e Auth)
| Variável | Tipo | Exposição | Descrição |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | String (URL) | Pública | URL do projeto Supabase (`https://xxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | String | Pública | Chave pública anônima para cliente e RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | String | Privada (Servidor) | Chave administrativa (bypass de RLS, usada apenas em webhooks e rotas admin) |

### 2.2 Redis / Rate Limit (Upstash)
| Variável | Tipo | Exposição | Descrição |
| :--- | :--- | :--- | :--- |
| `UPSTASH_REDIS_REST_URL` | String (URL) | Privada (Servidor) | URL HTTP do cluster Redis no Upstash |
| `UPSTASH_REDIS_REST_TOKEN` | String | Privada (Servidor) | Token de autenticação REST do Upstash |

### 2.3 Cloudflare Turnstile (Anti-Bot)
| Variável | Tipo | Exposição | Descrição |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | String | Pública | Chave do site para renderizar o widget Turnstile |
| `TURNSTILE_SECRET_KEY` | String | Privada (Servidor) | Chave secreta para validação server-side do token Turnstile |

### 2.4 Gateways de Pagamento e Webhooks
| Variável | Tipo | Exposição | Descrição |
| :--- | :--- | :--- | :--- |
| `WEBHOOK_PAYMENT_SECRET` | String | Privada (Servidor) | Token HMAC de verificação de integridade dos webhooks de assinatura |
| `ASAAS_API_KEY` | String | Privada (Servidor) | Chave de API da integração Asaas (se ativo) |
| `MERCADOPAGO_ACCESS_TOKEN` | String | Privada (Servidor) | Access Token para chamadas REST ao Mercado Pago (se ativo) |

### 2.5 Monitoramento e Erros (Sentry)
| Variável | Tipo | Exposição | Descrição |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SENTRY_DSN` | String (URL) | Pública | DSN do Sentry para captura de exceções no frontend e backend |
| `SENTRY_AUTH_TOKEN` | String | Privada (CI/CD) | Token para upload de source maps no deploy |

---

## 3. Exemplo de Arquivo `.env.example`


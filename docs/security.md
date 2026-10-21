# SECURITY.md — Wolf Finance v3 (Segurança da Aplicação e Infraestrutura)

> Documento mestre de segurança, autenticação, controle de acesso, integridade de tráfego e conformidade.
> Escopo: Auth server-side, Rate Limit, CSP, Webhooks, Proteção contra Injeção/XSS, Cookies e LGPD.
> O modelo de permissões e RLS do banco de dados encontra-se documentado em bancodedados.md.

---

## 1. Princípios de Segurança

1. Menor Privilégio: Cada chave e sessão possui estritamente o acesso necessário para sua execução.
2. Defesa em Profundidade: Camadas simultâneas (Middleware HTTP -> Server Action Zod -> RLS Postgres -> Constraints de Integridade).
3. Confiança Zero no Cliente: Nenhuma verificação visual ou de estado React substitui validação no servidor.
4. Segredos Protegidos: Proibido o uso de chaves secretas ou credenciais em variáveis com prefixo NEXT_PUBLIC_.
5. Rastreabilidade Total: Ações sensíveis e administrativas são registradas em trilha de auditoria append-only.

---

## 2. Autenticação e Gestão de Sessões

### 2.1 Fluxo de Cadastro e Login
- O cadastro exige confirmação obrigatória de e-mail antes da liberação do primeiro acesso.
- E-mails são normalizados no servidor com trim().toLowerCase() antes de qualquer consulta.
- Mensagens de erro de autenticação são estritamente genéricas: "E-mail ou senha incorretos." (impede enumeração de contas ativas).
- O fluxo de recuperação de senha sempre responde de forma neutra: "Se o e-mail informado estiver cadastrado, as instruções foram enviadas."

### 2.2 Política de Senhas
- Tamanho mínimo de 12 caracteres e máximo de 128 caracteres.
- Validação no servidor via Zod e bloqueio de senhas comuns/vazadas (HaveIBeenPwned API via k-anonymity ou proteção nativa do Supabase Auth).
- A alteração de senha exige a validação prévia da senha atual do usuário.
- Ao atualizar a senha, todas as outras sessões ativas são invalidadas via chamada global de revogação.

### 2.3 Gestão de Cookies e Sessão
- Sessões geridas exclusivamente via cookies configurados com HttpOnly, Secure e SameSite=Lax (padrão de @supabase/ssr).
- Proibido armazenar access_token ou refresh_token em localStorage ou sessionStorage do navegador.
- No middleware e em Server Actions, a autenticação deve ser validada no servidor via supabase.auth.getUser() (que valida o token diretamente contra a autoridade do Supabase), nunca via getSession() isolado (que apenas lê o payload do cookie).
- Implementação de encerramento global de sessão no perfil através de supabase.auth.signOut com escopo global.

### 2.4 Autenticação em Dois Fatores (MFA / TOTP)
- MFA via TOTP nativo do Supabase Auth obrigatório para usuários com papel admin.
- Rotas administrativas (/admin e /api/admin) exigem verificação de Authenticator Assurance Level 2 (aal2).
- Usuários comuns podem ativar MFA opcionalmente na tela de segurança do perfil.

---

## 3. Autorização e Controle de Acesso (RBAC)

### 3.1 Níveis de Acesso
- anon: Acesso restrito a páginas públicas (landing page, termos, privacidade, telas de login e cadastro).
- user (assinatura ativa): CRUD completo restrito aos seus próprios dados (filtrados por auth.uid() em todas as operações).
- user (assinatura expirada): Permissão estrita de leitura (SELECT) e exportação de dados próprios; bloqueio de escrita (INSERT/UPDATE/DELETE).
- admin: Gestão de assinaturas, usuários e auditoria via rotas de API dedicadas no servidor. O painel admin não tem acesso aos dados financeiros do usuário (transações, faturas ou extratos).
- service_role: Chave com bypass de RLS executada exclusivamente dentro de Route Handlers isolados (server-only) para rotas administrativas auditadas e webhooks de pagamento.

### 3.2 Prevenção contra IDOR e Mass Assignment
- Toda Server Action valida se o recurso pertence ao usuário autenticado, aplicando o filtro de user_id explicitamente além da RLS.
- Proibido passar corpos de requisição brutos (req.json()) diretamente para o banco. Todos os inputs passam por schemas Zod estritos, descartando qualquer campo não autorizado (como role, is_admin ou user_id).

---

## 4. Proteção de Tráfego, Rate Limit e Bots

### 4.1 Rate Limiting (Upstash Redis)
- Login e Cadastro: Máximo de 5 tentativas por minuto por IP/e-mail.
- Recuperação de Senha: Máximo de 3 solicitações a cada 15 minutos por IP/e-mail.
- Lançamentos e Transações: Máximo de 60 requisições por minuto por usuário autenticado.
- Headers padrão de contenção retornados em caso de bloqueio: HTTP 429 Too Many Requests acompanhado de Retry-After.

### 4.2 Proteção contra Bots em Formulários Públicos
- Integração com Cloudflare Turnstile em telas públicas de cadastro e recuperação de senha.
- Validação server-side obrigatória do token retornado pelo Turnstile antes de acionar o Supabase Auth.
- Implementação de honeypot oculto em formulários de contato/landing page para descarte silencioso de bots automatizados.

### 4.3 CORS
- As rotas da API do Next.js (/api) são configuradas como same-origin por padrão.
- Proibido o uso de Access-Control-Allow-Origin com curinga (*) em qualquer rota que processe cookies ou autenticação.

---

## 5. Prevenção de Injeção e Sanitização de Dados

### 5.1 SQL Injection
- Uso estrito da biblioteca cliente do Supabase, que executa queries parametrizadas por padrão.
- Proibido o uso de template strings ou concatenação manual de SQL dentro de funções RPC ou queries raw.

### 5.2 XSS (Cross-Site Scripting)
- Proibido o uso de dangerouslySetInnerHTML com conteúdo submetido pelo usuário.
- Se houver necessidade futura de renderização de rich text/HTML externo, a sanitização é feita obrigatoriamente com isomorphic-dompurify.
- Campos de texto (descrições, nomes, observações) são tratados pelo React como texto simples escapado.

### 5.3 Vazamento de Dados e Logs
- Stack traces e detalhes internos de banco de dados nunca são devolvidos na resposta HTTP ao cliente.
- O tratamento de erros captura exceções, grava o log no Sentry/servidor e retorna mensagens amigáveis acompanhadas de correlationId.
- Sanitização rigorosa de logs: nunca registrar senhas, tokens de autenticação, dados completos de cartões ou payloads sensíveis de webhooks.

---

## 6. Headers de Segurança e Transporte (HTTP)

Configuração global via next.config.ts para alcançar nota A nos scanners de segurança (SecurityHeaders e Mozilla Observatory):

Diretivas obrigatórias no headers():
- X-DNS-Prefetch-Control: on
- Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(self)
- Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.supabase.co; font-src 'self'; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.sentry.io https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests

---

## 7. Webhooks e Integração de Pagamento

1. Validação Criptográfica: Todo webhook recebido do gateway (Asaas ou Mercado Pago) tem sua assinatura HMAC verificada no header com tempo constante (timingSafeEqual) antes do parsing do body.
2. Anti-Replay: Requisições com timestamp de criação divergente em mais de 5 minutos do relógio do servidor são rejeitadas.
3. Idempotência: Cada evento processado registra seu event_id exclusivo no banco de dados. Eventos com IDs repetidos retornam HTTP 200 imediatamente sem reprocessamento.
4. Menor Privilégio de Cartão: O sistema nunca armazena dados de cartão (número, validade ou CVV). O módulo de cartões armazena apenas metadados de controle pessoal (banco, apelido e vencimento).

---

## 8. Privacidade, LGPD e Gestão de Dados

- Retenção Mínima: Coleta restrita a nome, e-mail e os registros financeiros inseridos diretamente pelo usuário.
- Exclusão de Conta: O perfil disponibiliza a opção "Excluir minha conta". A confirmação dispara a remoção em cascata (ON DELETE CASCADE) de todos os registros do usuário e anonimiza os dados de auditoria associados.
- Exportação de Dados: O usuário pode solicitar a exportação completa de suas transações e dados cadastrais em formato JSON ou CSV padronizado.
- Arquivo de Contato: Inclusão do arquivo public/.well-known/security.txt com canal oficial para reporte responsável de vulnerabilidades.

---

## 9. Checklist de Release e Auditoria (Bloqueante para Deploy)

- Todas as variáveis de ambiente sensíveis validadas na inicialização via @t3-oss/env-nextjs (sem NEXT_PUBLIC_ em segredos).
- RLS ativado e forçado em 100% das tabelas do schema public.
- Assinaturas com renovação/cancelamento controladas estritamente por webhooks validados via HMAC.
- Admin validado no servidor com verificação de role e MFA (aal2).
- Nenhum console.log residual expondo credenciais, e-mails ou valores no bundle de produção.
- Testes de isolamento multi-tenant validados (usuário A não lê nem altera registros do usuário B).
- CSP e Headers HTTP validados em ambiente de staging com nota A em securityheaders.com.
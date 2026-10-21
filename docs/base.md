# BASE.md — Wolf Finance v3 (Arquitetura e Engenharia de Software)

> Documento mestre de arquitetura aplicacional, estrutura de pastas, contratos e roadmap.
> Para especificações de PostgreSQL, tabelas e RLS, consulte bancodedados.md.
> Para protocolos de autenticação, cabeçalhos HTTP e conformidade, consulte security.md.
> 
> 

---

## 1. Visão Geral e Princípios Técnicos

1. O Banco é a Fonte da Verdade: Regras de integridade relacional, cálculo atômico de saldos e políticas de autorização residem no Postgres.


2. Dinheiro em Centavos Inteiros: Proibido o tráfego ou manipulação de moedas em ponto flutuante (float/number decimal). Toda a aplicação manipula bigint ou inteiros representando centavos.


3. Tratamento Estrito de Datas: Datas de competência e de calendário utilizam o formato textual 'YYYY-MM-DD' tipado, sem manipulação de fuso horário UTC em datas puras.


4. Unicidade de Origem: Toda movimentação financeira gerada por submódulos (como Wolf Driver) mantém apontamento unívoco (origem_tipo e origem_id) com validação de idempotência.


5. Economia de Código e Componentização: Centralização de formulários de cadastro e edição na mesma base funcional, separação clara de responsabilidades em repositórios e zero duplicação de regras utilitárias.

---

## 2. Stack Tecnológica e Ferramental

* Framework: Next.js 15+ (App Router com Server Components e Server Actions).


* Linguagem: TypeScript configurado em modo estrito (strict: true, noUncheckedIndexedAccess: true).


* Validação e Schemas: Zod para contratos de dados compartilhados entre cliente e servidor.


* Formulários: react-hook-form com @hookform/resolvers/zod.


* Estado de Servidor e Cache: TanStack Query (React Query) para sincronização, invalidação de cache e operações otimistas.


* Manipulação de Datas: date-fns para cálculos imutáveis de adição de períodos e limites de calendário.


* Ícones: lucide-react centralizado.


* Estilização: Tailwind CSS integrado com variáveis de tema semânticas.


* Testes Automatizados: Vitest para utilitários e regras de domínio; Playwright para jornadas críticas ponta a ponta (E2E).



---

## 3. Estrutura de Pastas e Organização do Projeto

src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── cadastro/page.tsx
│   │   └── recuperar/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx (Layout protegido com validação de sessão e assinatura)
│   │   ├── page.tsx (Dashboard Financeiro)
│   │   ├── lancamentos/
│   │   │   ├── page.tsx (Listagem filtrada e agrupada)
│   │   │   └── novo/page.tsx (Formulário de inclusão)
│   │   ├── cartoes/
│   │   │   ├── page.tsx (Gestão de cartões e faturas)
│   │   │   └── [id]/page.tsx (Detalhe do cartão e histórico de faturas)
│   │   ├── recorrencias/page.tsx (Gestão de pagamentos fixos)
│   │   ├── relatorios/page.tsx (Métricas e gráficos consolidados)
│   │   ├── perfil/page.tsx (Configurações de conta e tema)
│   │   └── driver/
│   │       ├── page.tsx (Painel Operacional do Driver)
│   │       ├── ganhos/
│   │       │   ├── page.tsx (Histórico de entradas)
│   │       │   └── novo/page.tsx (Registro por plataforma e km)
│   │       ├── despesas/
│   │       │   ├── page.tsx (Listagem de despesas da frota)
│   │       │   └── novo/page.tsx (Registro de custos operacionais)
│   │       ├── veiculos/page.tsx (Garagem e veículo ativo)
│   │       └── relatorios/page.tsx (Métricas de R$/km e consumo)
│   ├── (admin)/
│   │   └── admin/page.tsx (Painel administrativo protegido com MFA)
│   └── api/
│       ├── webhooks/pagamento/route.ts
│       └── admin/usuarios/route.ts
├── components/
│   ├── ui/ (Botões, modais, diálogos e inputs atômicos)
│   ├── layout/ (AppShell, BottomNav, Header e MonthPicker)
│   ├── forms/ (Formulários compartilhados de entidades)
│   └── money/ (MoneyInput e MoneyText formatados em BRL)
├── lib/
│   ├── supabase/
│   │   ├── client.ts (Navegador via createBrowserClient)
│   │   ├── server.ts (Server Components e Actions via createServerClient)
│   │   └── admin.ts (Client service_role estritamente server-only)
│   ├── validators/ (Schemas Zod por entidade: auth, transacao, veiculo)
│   ├── money.ts (Conversores e formatadores centavos <-> BRL)
│   └── dates.ts (Tratamento imutável de competências e limites mensais)
├── server/
│   ├── repos/ (Camada de acesso a dados isolada por entidade)
│   │   ├── transacoes.repo.ts
│   │   ├── cartoes.repo.ts
│   │   ├── faturas.repo.ts
│   │   └── driver.repo.ts
│   └── actions/ (Server Actions que orquestram validação e repositórios)
└── types/
└── database.types.ts (Tipagens estritas geradas via Supabase CLI)

---

## 4. Padrões de Implementação e Convenções

### 4.1 Isolamento de Chamadas de Dados

* Componentes de interface (UI) nunca acionam supabase.from() diretamente.


* Leituras e escritas passam obrigatoriamente pelos repositórios em src/server/repos/*.


* Operações atômicas multi-tabela acionam as funções RPC definidas no banco de dados.



### 4.2 Manipulação Monetária (lib/money.ts)

* A interface exibe valores no formato monetário brasileiro ("R$ 1.250,50").


* O armazenamento e o tráfego interno ocorrem estritamente em inteiros (ex: 125050).


* As operações matemáticas (somas, divisões de parcelas) tratam restos de arredondamento explicitamente na última parcela.



### 4.3 Cálculo de Vencimentos e Meses (lib/dates.ts)

* Proibida a mutação direta via setMonth() sobre instâncias existentes de Date.


* Uso de funções puras com proteção para finais de mês: se um cartão vence no dia 31 e o mês de referência possui 30 ou 28 dias, a data é ajustada para o último dia válido do mês (clampDay).



---

## 5. Contratos de Dados e Schemas Zod Compartilhados

### 5.1 Transação Financeira

Validações essenciais do schema:

* descricao: string de 1 a 120 caracteres.


* valor_centavos: número inteiro positivo obrigatório.


* tipo: 'despesa' ou 'receita'.


* forma: 'pix', 'dinheiro', 'debito', 'credito', 'boleto' ou 'transferencia'.


* data_competencia: padrão 'YYYY-MM-DD'.


* parcelas: inteiro de 1 a 72 (padrão 1).
* recorrente: booleano (padrão false).


* Refinamento: se forma for 'credito', o campo cartao_id torna-se obrigatório.



### 5.2 Lançamento de Ganho no Driver

Validações essenciais do schema:

* veiculo_id: uuid válido obrigatório.


* plataforma_slug: string obrigatória.


* data_trabalho: padrão 'YYYY-MM-DD'.


* especie_centavos: inteiro não negativo (padrão 0).


* app_centavos: inteiro não negativo (padrão 0).


* km_inicial e km_final: inteiros opcionais.


* Refinamento 1: a soma de especie_centavos + app_centavos deve ser maior que zero.


* Refinamento 2: quando informados, km_final deve ser maior ou igual a km_inicial.



---

## 6. Roteiro de Construção Modular (Roadmap)

Fase 1 — Núcleo de Infraestrutura e Libs

* Configuração do repositório, dependências limpas e variáveis tipadas.


* Criação dos módulos utilitários: lib/money.ts, lib/dates.ts e schemas Zod com testes unitários em Vitest.


* Configuração dos clientes Supabase (Browser, Server e Service Role isolado).



Fase 2 — Layout Base e Autenticação

* Implementação de AppShell, navegação mobile persistente (BottomNav) e seletor de mês imutável.


* Fluxos de autenticação completos: cadastro, login, recuperação de senha e middleware de verificação de assinatura.



Fase 3 — Domínio Financeiro Pessoal

* CRUD de contas financeiras e categorias.


* Registro unificado de lançamentos (à vista, parcelado e recorrente) via Server Actions.


* Listagem agrupada por dia com filtros no servidor e liquidação em lote com barra de desfazer (Undo).



Fase 4 — Cartões de Crédito e Faturas

* Cadastro e parametrização de cartões (sem número real, bloqueio de dígitos no apelido).


* View e controle de faturas mensais abertas e fechadas.


* Liquidação atômica de faturas com débito na conta selecionada via RPC.



Fase 5 — Módulo Wolf Driver Integrado

* Garagem e parametrização de veículos (controle de quilometragem acumulada).


* Registro atômico de ganhos e custos operacionais com replicação condicional no extrato geral.


* Relatórios analíticos operacionais (R$/km, horas trabalhadas e custo por categoria).



Fase 6 — Painel Administrativo e Auditoria

* Gestão de usuários e assinaturas via Route Handlers protegidos.


* Consulta da trilha de auditoria e métricas consolidadas da plataforma.



Fase 7 — Otimizações PWA e Lançamento

* Configuração do manifesto PWA, suporte a ícones de alta resolução e cache de aplicação.


* Auditoria de acessibilidade e validação de checklist de lançamento.
# BANCODEDADOS.md — Wolf Finance v3 (PostgreSQL / Supabase)

> Documento mestre de especificação técnica e DDL do banco de dados relacional.
> Escopo: DDL de tabelas, índices, constraints, triggers, views, RPCs e policies de RLS.

---

## 1. Diretrizes Técnicas

1. Moeda em Centavos: Valores monetários são armazenados em bigint representando centavos (R$ 10,50 = 1050). Valores de despesa e receita são números estritamente positivos (check (valor_centavos > 0)); o sinal da operação é determinado pela coluna tipo.
2. Datas sem Fuso Horário: Datas de competência, vencimento, despesa e trabalho utilizam o tipo date (imune a distorções de fuso horário UTC-3). Instantes de sistema utilizam timestamptz.
3. Isolamento de Linha (RLS): RLS habilitado e forçado (FORCE ROW LEVEL SECURITY) em todas as tabelas do schema public.
4. Views Seguras: Todas as views utilizam WITH (security_invoker = true) para herdar o contexto e o RLS do usuário autenticado.
5. Transações Atômicas: Operações multi-tabela são encapsuladas em funções PL/pgSQL com privilégio controlado (security definer com set search_path = '').

---

## 2. Diagrama de Relacionamento (DER Lógico)

auth.users (Supabase Auth)
  ├── 1:1 ── profiles
  ├── 1:1 ── user_roles
  ├── 1:N ── assinaturas
  ├── 1:N ── contas
  ├── 1:N ── cartoes ── 1:N ── faturas
  ├── 1:N ── categorias
  ├── 1:N ── grupos_lancamento
  ├── 1:N ── transacoes (FK: conta_id, cartao_id, fatura_id, categoria_id, grupo_id)
  │            ▲
  │            └── Vínculo Unívoco (origem_tipo, origem_id)
  │                 ├── driver_ganhos
  │                 └── driver_despesas
  ├── 1:N ── orcamentos (FK: categoria_id)
  ├── 1:N ── metas
  ├── 1:N ── veiculos
  │            ├── 1:N ── driver_ganhos (FK: plataforma_slug)
  │            ├── 1:N ── driver_despesas (FK: categoria_id)
  │            └── 1:N ── driver_manutencoes
  └── 1:N ── audit_log

---

## 3. Schema DDL Completo

### 3.1 Infraestrutura e Funções Globais

create extension if not exists "pgcrypto";

create or replace function public.fn_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

---

### 3.2 Autenticação, Perfis e Assinaturas

-- PERFIS (1:1 com auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null check (char_length(trim(nome)) between 2 and 100),
  email text not null check (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  tema text not null default 'azul' check (tema in ('azul', 'esmeralda', 'roxo', 'por-do-sol')),
  driver_ativo boolean not null default false,
  driver_integrado boolean not null default true,
  onboarding_done boolean not null default false,
  moeda text not null default 'BRL',
  fuso text not null default 'America/Maceio',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- CONTROLE DE ACESSO ADMINISTRATIVO
create table public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

-- GESTÃO DE ACESSO E ASSINATURAS
create table public.assinaturas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plano text not null check (plano in ('trial', 'mensal', 'trimestral', 'anual', 'cortesia')),
  status text not null check (status in ('ativa', 'vencida', 'cancelada', 'trial', 'cortesia')),
  inicio date not null default current_date,
  expira_em date not null,
  gateway text check (gateway in ('asaas', 'mercadopago', 'stripe', 'manual')),
  gateway_ref text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_assinaturas_user_expira on public.assinaturas (user_id, expira_em desc);

---

### 3.3 Estrutura Financeira (Contas, Cartões e Transações)

-- CONTAS BANCÁRIAS E CARTEIRAS
create table public.contas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null check (char_length(trim(nome)) between 1 and 50),
  tipo text not null check (tipo in ('carteira', 'corrente', 'poupanca', 'investimento')),
  saldo_inicial_centavos bigint not null default 0,
  cor text default '#2563EB',
  arquivada boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create index idx_contas_user on public.contas (user_id) where not arquivada;

-- CARTÕES DE CRÉDITO
create table public.cartoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  banco_slug text not null,
  apelido text not null check (apelido !~ '[0-9]{4,}'),
  dia_fechamento smallint not null check (dia_fechamento between 1 and 31),
  dia_vencimento smallint not null check (dia_vencimento between 1 and 31),
  limite_centavos bigint default 0 check (limite_centavos >= 0),
  arquivado boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create index idx_cartoes_user on public.cartoes (user_id) where not arquivado;

-- FATURAS MENSAIS
create table public.faturas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cartao_id uuid not null,
  referencia date not null,
  data_fechamento date not null,
  data_vencimento date not null,
  status text not null default 'aberta' check (status in ('aberta', 'fechada', 'paga')),
  paga_em date,
  created_at timestamptz not null default now(),
  foreign key (cartao_id, user_id) references public.cartoes(id, user_id) on delete cascade,
  unique (cartao_id, referencia),
  unique (id, user_id)
);

-- CATEGORIAS
create table public.categorias (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  nome text not null check (char_length(trim(nome)) between 1 and 40),
  tipo text not null check (tipo in ('despesa', 'receita')),
  icone text not null default 'Tag',
  cor text not null default '#64748B',
  created_at timestamptz not null default now(),
  unique (user_id, nome, tipo)
);

-- GRUPOS (PARCELAS E RECORRÊNCIAS)
create table public.grupos_lancamento (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tipo text not null check (tipo in ('parcelamento', 'recorrencia')),
  descricao_base text not null,
  total_parcelas smallint check (total_parcelas between 1 and 72),
  valor_total_centavos bigint check (valor_total_centavos > 0),
  dia_recorrencia smallint check (dia_recorrencia between 1 and 31),
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

-- TRANSAÇÕES
create table public.transacoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tipo text not null check (tipo in ('despesa', 'receita')),
  descricao text not null check (char_length(trim(descricao)) between 1 and 120),
  valor_centavos bigint not null check (valor_centavos > 0),
  data_competencia date not null,
  data_pagamento date,
  status text not null default 'pendente' check (status in ('pendente', 'pago')),
  forma text not null check (forma in ('pix', 'dinheiro', 'debito', 'credito', 'boleto', 'transferencia')),
  conta_id uuid,
  cartao_id uuid,
  fatura_id uuid,
  categoria_id uuid references public.categorias(id) on delete set null,
  grupo_id uuid references public.grupos_lancamento(id) on delete set null,
  parcela_num smallint check (parcela_num > 0),
  parcela_total smallint check (parcela_total >= parcela_num),
  origem_tipo text check (origem_tipo in ('driver_ganho', 'driver_despesa')),
  origem_id uuid,
  observacao text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  foreign key (conta_id, user_id) references public.contas(id, user_id) on delete restrict,
  foreign key (cartao_id, user_id) references public.cartoes(id, user_id) on delete cascade,
  foreign key (fatura_id, user_id) references public.faturas(id, user_id) on delete set null,
  check ((forma = 'credito' and cartao_id is not null) or (forma != 'credito' and cartao_id is null)),
  check (status = 'pago' or data_pagamento is null),
  unique (origem_tipo, origem_id)
);

create index idx_transacoes_busca on public.transacoes (user_id, data_competencia desc) where deleted_at is null;
create index idx_transacoes_fatura on public.transacoes (fatura_id) where deleted_at is null;
create index idx_transacoes_grupo on public.transacoes (user_id, grupo_id) where grupo_id is not null;

---

### 3.4 Planejamento (Orçamentos e Metas)

create table public.orcamentos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  categoria_id uuid not null references public.categorias(id) on delete cascade,
  mes date not null,
  limite_centavos bigint not null check (limite_centavos > 0),
  created_at timestamptz not null default now(),
  unique (user_id, categoria_id, mes)
);

create table public.metas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null check (char_length(trim(nome)) between 1 and 60),
  alvo_centavos bigint not null check (alvo_centavos > 0),
  atual_centavos bigint not null default 0 check (atual_centavos >= 0),
  prazo date,
  concluida boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

---

### 3.5 Módulo Wolf Driver

create table public.veiculos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tipo text not null check (tipo in ('carro', 'moto', 'bicicleta', 'van')),
  marca text not null,
  modelo text not null,
  placa text check (placa ~* '^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$'),
  ano smallint check (ano between 1970 and 2100),
  combustivel text check (combustivel in ('gasolina', 'etanol', 'flex', 'gnv', 'diesel', 'eletrico')),
  km_atual integer not null default 0 check (km_atual >= 0),
  ativo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create unique index idx_veiculo_ativo_unico on public.veiculos (user_id) where ativo;

create table public.plataformas (
  slug text primary key,
  nome text not null,
  tipo text not null check (tipo in ('transporte', 'delivery', 'encomendas')),
  pasta text not null
);

create table public.driver_ganhos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  veiculo_id uuid not null,
  plataforma_slug text not null references public.plataformas(slug),
  data_trabalho date not null,
  especie_centavos bigint not null default 0 check (especie_centavos >= 0),
  app_centavos bigint not null default 0 check (app_centavos >= 0),
  km_inicial integer,
  km_final integer,
  horas_trabalhadas numeric(4,2) check (horas_trabalhadas between 0 and 24),
  corridas smallint check (corridas >= 0),
  created_at timestamptz not null default now(),
  foreign key (veiculo_id, user_id) references public.veiculos(id, user_id) on delete cascade,
  check (especie_centavos + app_centavos > 0),
  check (km_final is null or km_inicial is null or km_final >= km_inicial)
);

create index idx_driver_ganhos_data on public.driver_ganhos (user_id, data_trabalho desc);

create table public.driver_despesas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  veiculo_id uuid,
  categoria_id uuid not null references public.categorias(id) on delete restrict,
  descricao text not null,
  valor_centavos bigint not null check (valor_centavos > 0),
  litros numeric(6,2) check (litros is null or litros > 0),
  km_no_registro integer check (km_no_registro is null or km_no_registro >= 0),
  data_despesa date not null,
  created_at timestamptz not null default now(),
  foreign key (veiculo_id, user_id) references public.veiculos(id, user_id) on delete set null
);

create index idx_driver_despesas_data on public.driver_despesas (user_id, data_despesa desc);

create table public.driver_manutencoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  veiculo_id uuid not null,
  item text not null,
  intervalo_km integer check (intervalo_km > 0),
  intervalo_dias integer check (intervalo_dias > 0),
  ultimo_km integer default 0,
  ultima_data date,
  created_at timestamptz not null default now(),
  foreign key (veiculo_id, user_id) references public.veiculos(id, user_id) on delete cascade
);

---

### 3.6 Auditoria

create table public.audit_log (
  id bigint generated always as identity primary key,
  user_id uuid,
  ator_id uuid not null,
  acao text not null,
  tabela text not null,
  registro_id uuid,
  antes jsonb,
  depois jsonb,
  motivo text,
  ip inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create index idx_audit_log_alvo on public.audit_log (user_id, created_at desc);

---

## 4. Views de Alta Performance

create or replace view public.v_resumo_mensal
with (security_invoker = true) as
select
  user_id,
  date_trunc('month', data_competencia)::date as mes,
  coalesce(sum(valor_centavos) filter (where tipo = 'receita'), 0) as total_receitas,
  coalesce(sum(valor_centavos) filter (where tipo = 'despesa'), 0) as total_despesas,
  coalesce(sum(valor_centavos) filter (where tipo = 'despesa' and status = 'pendente'), 0) as despesas_pendentes,
  coalesce(sum(valor_centavos) filter (where tipo = 'despesa' and status = 'pago'), 0) as despesas_pagas
from public.transacoes
where deleted_at is null
group by user_id, date_trunc('month', data_competencia)::date;

create or replace view public.v_faturas_resumo
with (security_invoker = true) as
select
  f.id as fatura_id,
  f.user_id,
  f.cartao_id,
  f.referencia,
  f.status,
  f.data_vencimento,
  coalesce(sum(t.valor_centavos), 0) as total_fatura_centavos
from public.faturas f
left join public.transacoes t on t.fatura_id = f.id and t.deleted_at is null
group by f.id, f.user_id, f.cartao_id, f.referencia, f.status, f.data_vencimento;

---

## 5. Triggers e Funções RPC

### 5.1 Helper de Assinatura

create or replace function public.fn_tem_assinatura_ativa(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.assinaturas
    where user_id = p_user_id
      and status in ('ativa', 'trial', 'cortesia')
      and expira_em >= current_date
  );
$$;

### 5.2 Saldo Real Calculado

create or replace function public.fn_saldo_atual(p_user_id uuid)
returns bigint
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_saldo_inicial bigint := 0;
  v_receitas_pagas bigint := 0;
  v_despesas_pagas bigint := 0;
begin
  select coalesce(sum(saldo_inicial_centavos), 0)
  into v_saldo_inicial
  from public.contas
  where user_id = p_user_id and not arquivada;

  select coalesce(sum(valor_centavos), 0)
  into v_receitas_pagas
  from public.transacoes
  where user_id = p_user_id
    and tipo = 'receita'
    and status = 'pago'
    and deleted_at is null;

  select coalesce(sum(valor_centavos), 0)
  into v_despesas_pagas
  from public.transacoes
  where user_id = p_user_id
    and tipo = 'despesa'
    and status = 'pago'
    and forma != 'credito'
    and deleted_at is null;

  return (v_saldo_inicial + v_receitas_pagas - v_despesas_pagas);
end;
$$;

### 5.3 Onboarding no Cadastro

create or replace function public.fn_handle_user_created()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, nome, email, tema)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Membro da Alcateia'),
    new.email,
    'azul'
  );

  insert into public.user_roles (user_id, role)
  values (new.id, 'user');

  insert into public.assinaturas (user_id, plano, status, inicio, expira_em, gateway)
  values (new.id, 'trial', 'trial', current_date, current_date + 7, 'manual');

  insert into public.contas (user_id, nome, tipo, saldo_inicial_centavos)
  values (new.id, 'Carteira Principal', 'carteira', 0);

  insert into public.categorias (user_id, nome, tipo, icone, cor)
  values
    (new.id, 'Alimentação', 'despesa', 'Utensils', '#FB7185'),
    (new.id, 'Transporte', 'despesa', 'Car', '#60A5FA'),
    (new.id, 'Moradia', 'despesa', 'Home', '#FBBF24'),
    (new.id, 'Saúde', 'despesa', 'HeartPulse', '#34D399'),
    (new.id, 'Lazer', 'despesa', 'Smile', '#A78BFA'),
    (new.id, 'Salário', 'receita', 'Banknote', '#34D399'),
    (new.id, 'Rendimentos', 'receita', 'TrendingUp', '#60A5FA'),
    (new.id, 'Combustível', 'despesa', 'Fuel', '#F59E0B'),
    (new.id, 'Manutenção Veículo', 'despesa', 'Wrench', '#94A3B8');

  return new;
end;
$$;

create trigger tr_on_user_created
  after insert on auth.users
  for each row execute function public.fn_handle_user_created();

### 5.4 Sincronização e Cascata Driver ↔ Transações

create or replace function public.fn_cleanup_transacao_driver()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.transacoes
  where origem_id = old.id
    and user_id = old.user_id;
  return old;
end;
$$;

create trigger tr_driver_ganhos_delete
  after delete on public.driver_ganhos
  for each row execute function public.fn_cleanup_transacao_driver();

create trigger tr_driver_despesas_delete
  after delete on public.driver_despesas
  for each row execute function public.fn_cleanup_transacao_driver();

create or replace function public.fn_block_direct_driver_transacao_edit()
returns trigger
language plpgsql
as $$
begin
  if old.origem_tipo is not null and (new.valor_centavos != old.valor_centavos or new.tipo != old.tipo) then
    raise exception 'Lançamento gerado pelo Driver. Edite diretamente no módulo Driver.';
  end if;
  return new;
end;
$$;

create trigger tr_block_edit_origem_driver
  before update on public.transacoes
  for each row execute function public.fn_block_direct_driver_transacao_edit();

### 5.5 Registro Atômico de Ganhos

create or replace function public.rpc_registrar_ganho_driver(
  p_veiculo_id uuid,
  p_plataforma_slug text,
  p_data date,
  p_especie_centavos bigint,
  p_app_centavos bigint,
  p_km_inicial integer,
  p_km_final integer,
  p_horas numeric,
  p_corridas smallint
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_ganho_id uuid;
  v_total_centavos bigint;
  v_categoria_id uuid;
  v_driver_integrado boolean;
  v_forma text;
begin
  if v_user_id is null then
    raise exception 'Acesso não autorizado.';
  end if;

  if not public.fn_tem_assinatura_ativa(v_user_id) then
    raise exception 'Assinatura inativa ou expirada.';
  end if;

  v_total_centavos := p_especie_centavos + p_app_centavos;
  if v_total_centavos <= 0 then
    raise exception 'O ganho total deve ser maior que zero.';
  end if;

  insert into public.driver_ganhos (
    user_id, veiculo_id, plataforma_slug, data_trabalho,
    especie_centavos, app_centavos, km_inicial, km_final,
    horas_trabalhadas, corridas
  ) values (
    v_user_id, p_veiculo_id, p_plataforma_slug, p_data,
    p_especie_centavos, p_app_centavos, p_km_inicial, p_km_final,
    p_horas, p_corridas
  ) returning id into v_ganho_id;

  if p_km_final is not null then
    update public.veiculos
    set km_atual = greatest(km_atual, p_km_final),
        updated_at = now()
    where id = p_veiculo_id and user_id = v_user_id;
  end if;

  select driver_integrado into v_driver_integrado
  from public.profiles
  where id = v_user_id;

  if v_driver_integrado then
    select id into v_categoria_id
    from public.categorias
    where user_id = v_user_id and nome = 'Rendimentos' and tipo = 'receita'
    limit 1;

    v_forma := case when p_especie_centavos >= p_app_centavos then 'dinheiro' else 'pix' end;

    insert into public.transacoes (
      user_id, tipo, descricao, valor_centavos,
      data_competencia, data_pagamento, status, forma,
      categoria_id, origem_tipo, origem_id
    ) values (
      v_user_id, 'receita', 'CORRIDAS: ' || upper(p_plataforma_slug),
      v_total_centavos, p_data, p_data, 'pago', v_forma,
      v_categoria_id, 'driver_ganho', v_ganho_id
    );
  end if;

  return v_ganho_id;
end;
$$;

### 5.6 Registro Atômico de Despesas do Driver

create or replace function public.rpc_registrar_despesa_driver(
  p_veiculo_id uuid,
  p_categoria_id uuid,
  p_descricao text,
  p_valor_centavos bigint,
  p_litros numeric,
  p_km_no_registro integer,
  p_data date
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_despesa_id uuid;
  v_driver_integrado boolean;
begin
  if v_user_id is null then
    raise exception 'Acesso não autorizado.';
  end if;

  if not public.fn_tem_assinatura_ativa(v_user_id) then
    raise exception 'Assinatura inativa ou expirada.';
  end if;

  insert into public.driver_despesas (
    user_id, veiculo_id, categoria_id, descricao,
    valor_centavos, litros, km_no_registro, data_despesa
  ) values (
    v_user_id, p_veiculo_id, p_categoria_id, upper(trim(p_descricao)),
    p_valor_centavos, p_litros, p_km_no_registro, p_data
  ) returning id into v_despesa_id;

  if p_km_no_registro is not null and p_veiculo_id is not null then
    update public.veiculos
    set km_atual = greatest(km_atual, p_km_no_registro),
        updated_at = now()
    where id = p_veiculo_id and user_id = v_user_id;
  end if;

  select driver_integrado into v_driver_integrado
  from public.profiles
  where id = v_user_id;

  if v_driver_integrado then
    insert into public.transacoes (
      user_id, tipo, descricao, valor_centavos,
      data_competencia, data_pagamento, status, forma,
      categoria_id, origem_tipo, origem_id
    ) values (
      v_user_id, 'despesa', 'DRIVER: ' || upper(trim(p_descricao)),
      p_valor_centavos, p_data, p_data, 'pago', 'dinheiro',
      p_categoria_id, 'driver_despesa', v_despesa_id
    );
  end if;

  return v_despesa_id;
end;
$$;

### 5.7 Liquidação de Fatura

create or replace function public.rpc_liquidar_fatura(
  p_fatura_id uuid,
  p_conta_id uuid,
  p_data_pagamento date
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_total bigint;
  v_apelido_cartao text;
begin
  if v_user_id is null then
    raise exception 'Acesso negado.';
  end if;

  select coalesce(sum(t.valor_centavos), 0), c.apelido
  into v_total, v_apelido_cartao
  from public.faturas f
  join public.cartoes c on c.id = f.cartao_id
  join public.transacoes t on t.fatura_id = f.id
  where f.id = p_fatura_id and f.user_id = v_user_id and t.deleted_at is null
  group by c.apelido;

  if v_total <= 0 then
    raise exception 'Fatura vazia ou sem saldo pendente.';
  end if;

  update public.transacoes
  set status = 'pago',
      data_pagamento = p_data_pagamento,
      updated_at = now()
  where fatura_id = p_fatura_id and user_id = v_user_id and deleted_at is null;

  update public.faturas
  set status = 'paga',
      paga_em = p_data_pagamento
  where id = p_fatura_id and user_id = v_user_id;

  insert into public.transacoes (
    user_id, tipo, descricao, valor_centavos,
    data_competencia, data_pagamento, status, forma, conta_id
  ) values (
    v_user_id, 'despesa', 'PAGAMENTO FATURA: ' || upper(v_apelido_cartao),
    v_total, p_data_pagamento, p_data_pagamento, 'pago', 'debito', p_conta_id
  );
end;
$$;

---

## 6. Políticas de RLS (Row Level Security)

alter table public.profiles enable row level security;
alter table public.profiles force row level security;

alter table public.user_roles enable row level security;
alter table public.user_roles force row level security;

alter table public.assinaturas enable row level security;
alter table public.assinaturas force row level security;

alter table public.contas enable row level security;
alter table public.contas force row level security;

alter table public.cartoes enable row level security;
alter table public.cartoes force row level security;

alter table public.faturas enable row level security;
alter table public.faturas force row level security;

alter table public.categorias enable row level security;
alter table public.categorias force row level security;

alter table public.grupos_lancamento enable row level security;
alter table public.grupos_lancamento force row level security;

alter table public.transacoes enable row level security;
alter table public.transacoes force row level security;

alter table public.orcamentos enable row level security;
alter table public.orcamentos force row level security;

alter table public.metas enable row level security;
alter table public.metas force row level security;

alter table public.veiculos enable row level security;
alter table public.veiculos force row level security;

alter table public.plataformas enable row level security;
alter table public.plataformas force row level security;

alter table public.driver_ganhos enable row level security;
alter table public.driver_ganhos force row level security;

alter table public.driver_despesas enable row level security;
alter table public.driver_despesas force row level security;

alter table public.driver_manutencoes enable row level security;
alter table public.driver_manutencoes force row level security;

alter table public.audit_log enable row level security;
alter table public.audit_log force row level security;

-- PROFILES
create policy "profiles_select_own" on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "profiles_update_own" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- USER_ROLES (Leitura individual apenas; concessão via service_role)
create policy "user_roles_select_own" on public.user_roles for select to authenticated using (user_id = (select auth.uid()));

-- ASSINATURAS (Leitura do próprio status; alteração apenas via webhook/service_role)
create policy "assinaturas_select_own" on public.assinaturas for select to authenticated using (user_id = (select auth.uid()));

-- TRANSAÇÕES
create policy "transacoes_select_own" on public.transacoes for select to authenticated using (user_id = (select auth.uid()));
create policy "transacoes_insert_own" on public.transacoes for insert to authenticated with check (user_id = (select auth.uid()) and public.fn_tem_assinatura_ativa(user_id));
create policy "transacoes_update_own" on public.transacoes for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()) and public.fn_tem_assinatura_ativa(user_id));
create policy "transacoes_delete_own" on public.transacoes for delete to authenticated using (user_id = (select auth.uid()) and public.fn_tem_assinatura_ativa(user_id));

-- ENTIDADES BANCÁRIAS E METAS
create policy "contas_all_own" on public.contas for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "cartoes_all_own" on public.cartoes for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "faturas_all_own" on public.faturas for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "grupos_all_own" on public.grupos_lancamento for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "orcamentos_all_own" on public.orcamentos for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "metas_all_own" on public.metas for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- CATEGORIAS
create policy "categorias_select" on public.categorias for select to authenticated using (user_id = (select auth.uid()) or user_id is null);
create policy "categorias_insert_own" on public.categorias for insert to authenticated with check (user_id = (select auth.uid()));
create policy "categorias_update_own" on public.categorias for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "categorias_delete_own" on public.categorias for delete to authenticated using (user_id = (select auth.uid()));

-- PLATAFORMAS (Catálogo estático compartilhado)
create policy "plataformas_read_all" on public.plataformas for select to authenticated using (true);

-- DRIVER
create policy "veiculos_all_own" on public.veiculos for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "driver_ganhos_all_own" on public.driver_ganhos for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "driver_despesas_all_own" on public.driver_despesas for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "driver_manutencoes_all_own" on public.driver_manutencoes for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

---

## 7. Dados Iniciais de Seed (seed.sql)

insert into public.plataformas (slug, nome, tipo, pasta) values
  ('uber', 'Uber', 'transporte', 'transporte'),
  ('99', '99', 'transporte', 'transporte'),
  ('indrive', 'InDrive', 'transporte', 'transporte'),
  ('maxim', 'Maxim', 'transporte', 'transporte'),
  ('particular', 'Particular', 'transporte', 'transporte'),
  ('ifood', 'iFood', 'delivery', 'delivery'),
  ('99food', '99 Food', 'delivery', 'delivery'),
  ('rappi', 'Rappi', 'delivery', 'delivery'),
  ('ubereats', 'Uber Eats', 'delivery', 'delivery'),
  ('zedelivery', 'Zé Delivery', 'delivery', 'delivery'),
  ('querodelivery', 'Quero Delivery', 'delivery', 'delivery'),
  ('mercadolivre', 'Mercado Livre', 'encomendas', 'encomendas'),
  ('amazon', 'Amazon', 'encomendas', 'encomendas'),
  ('shopee', 'Shopee', 'encomendas', 'encomendas'),
  ('loggi', 'Loggi', 'encomendas', 'encomendas')
on conflict (slug) do nothing;
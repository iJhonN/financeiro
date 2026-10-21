import { connection } from 'next/server';
import Link from 'next/link';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { createClient } from '@/lib/supabase/server';
import { formatCentavosToBRL } from '@/lib/money';
import {
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Landmark,
  ChevronRight,
  Wallet,
  Target,
  Plus,
} from 'lucide-react';

export const instant = false;

interface DashboardProps {
  searchParams?: Promise<{ mes?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardProps) {
  await connection();

  const params = await searchParams;
  const mesAtual = params?.mes ?? format(new Date(), 'yyyy-MM');

  const [anoStr, mesStr] = mesAtual.split('-');
  const ano = parseInt(anoStr ?? String(new Date().getFullYear()), 10);
  const mesNumero = parseInt(mesStr ?? String(new Date().getMonth() + 1), 10);

  const dataReferencia = new Date(ano, mesNumero - 1, 1);
  const inicioMes = format(startOfMonth(dataReferencia), 'yyyy-MM-dd');
  const fimMes = format(endOfMonth(dataReferencia), 'yyyy-MM-dd');

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [
    resContas,
    resCartoes,
    resTransacoesMes,
    resUltimasTransacoes,
    resMetas,
    resTodasTransacoesConta,
  ] = await Promise.all([
    supabase
      .from('contas')
      .select('id, nome, tipo, saldo_inicial_centavos')
      .eq('user_id', user.id)
      .eq('arquivada', false),

    supabase
      .from('cartoes')
      .select('id, apelido, limite_centavos')
      .eq('user_id', user.id)
      .eq('arquivado', false),

    supabase
      .from('transacoes')
      .select('valor_centavos, tipo, status, forma, conta_id, cartao_id')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .gte('data_competencia', inicioMes)
      .lte('data_competencia', fimMes),

    supabase
      .from('transacoes')
      .select(`
        id,
        descricao,
        valor_centavos,
        tipo,
        forma,
        data_competencia,
        categorias (
          nome,
          cor
        )
      `)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('data_competencia', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(6),

    supabase
      .from('metas')
      .select('id, nome, alvo_centavos, atual_centavos')
      .eq('user_id', user.id)
      .eq('concluida', false)
      .limit(3),

    supabase
      .from('transacoes')
      .select('valor_centavos, tipo, status')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .not('conta_id', 'is', null),
  ]);

  const contas = resContas.data ?? [];
  const cartoes = resCartoes.data ?? [];
  const transacoesMes = resTransacoesMes.data ?? [];
  const ultimasTransacoes = resUltimasTransacoes.data ?? [];
  const metas = resMetas.data ?? [];
  const historicoConta = resTodasTransacoesConta.data ?? [];

  const saldoInicialTotal = contas.reduce(
    (acc, c) => acc + (c.saldo_inicial_centavos ?? 0),
    0
  );

  const totalReceitasHistorico = historicoConta
    .filter((t) => t.tipo === 'receita')
    .reduce((acc, t) => acc + t.valor_centavos, 0);

  const totalDespesasHistorico = historicoConta
    .filter((t) => t.tipo === 'despesa')
    .reduce((acc, t) => acc + t.valor_centavos, 0);

  const saldoRealConsolidado =
    saldoInicialTotal + totalReceitasHistorico - totalDespesasHistorico;

  const totalReceitasMes = transacoesMes
    .filter((t) => t.tipo === 'receita')
    .reduce((acc, t) => acc + t.valor_centavos, 0);

  const totalDespesasMes = transacoesMes
    .filter((t) => t.tipo === 'despesa')
    .reduce((acc, t) => acc + t.valor_centavos, 0);

  const faturaCartoesMes = transacoesMes
    .filter((t) => t.tipo === 'despesa' && t.forma === 'credito')
    .reduce((acc, t) => acc + t.valor_centavos, 0);

  return (
    <div className="space-y-6">
      {/* 1. Grade Superior Nivelada: 3 Cards Principais (Saldo, Receitas, Despesas) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card de Saldo Geral */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
              Saldo Consolidado
            </span>
            <span className="text-[11px] text-[var(--text-muted)] capitalize">
              {format(dataReferencia, 'MMMM yyyy', { locale: ptBR })}
            </span>
          </div>
          <div className="mt-3">
            <h2
              className={`text-2xl sm:text-3xl font-semibold tracking-tight tabular-nums ${
                saldoRealConsolidado < 0
                  ? 'text-[var(--expense)]'
                  : 'text-[var(--text)]'
              }`}
            >
              {formatCentavosToBRL(saldoRealConsolidado)}
            </h2>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              {contas.length} {contas.length === 1 ? 'conta cadastrada' : 'contas cadastradas'}
            </p>
          </div>
        </div>

        {/* Card de Receitas do Mês */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
              Receitas do Mês
            </span>
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--income)]/10 text-[var(--income)]">
              <ArrowDownLeft className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight tabular-nums text-[var(--income)]">
              + {formatCentavosToBRL(totalReceitasMes)}
            </h2>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Entradas registradas
            </p>
          </div>
        </div>

        {/* Card de Despesas do Mês */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
              Despesas do Mês
            </span>
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--expense)]/10 text-[var(--expense)]">
              <ArrowUpRight className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight tabular-nums text-[var(--expense)]">
              - {formatCentavosToBRL(totalDespesasMes)}
            </h2>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Saídas acumuladas
            </p>
          </div>
        </div>
      </section>

      {/* 2. Grade Inferior Equilibrada: Linhas e Cabeçalhos Perfeitamente Alinhados */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Coluna Principal: Últimas Movimentações (7 de 12) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between h-7 px-1">
            <h3 className="text-sm font-semibold text-[var(--text)]">
              Últimas Movimentações
            </h3>
            <Link
              href="/lancamentos"
              className="text-xs font-medium text-[var(--primary)] hover:underline flex items-center gap-1"
            >
              Ver extrato completo
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] divide-y divide-[var(--border)] overflow-hidden">
            {ultimasTransacoes.length === 0 ? (
              <div className="p-10 text-center text-xs text-[var(--text-muted)]">
                Nenhum lançamento registrado até ao momento.
              </div>
            ) : (
              ultimasTransacoes.map((t) => {
                const categoria = Array.isArray(t.categorias)
                  ? t.categorias[0]
                  : t.categorias;
                const isReceita = t.tipo === 'receita';

                return (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-4 hover:bg-[var(--surface-2)]/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
                        style={{
                          backgroundColor: categoria?.cor
                            ? `${categoria.cor}15`
                            : 'var(--surface-2)',
                          color: categoria?.cor ?? 'var(--text-muted)',
                        }}
                      >
                        <Wallet className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--text)]">
                          {t.descricao}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5 mt-0.5">
                          <span>{categoria?.nome ?? 'Sem categoria'}</span>
                          <span>•</span>
                          <span className="uppercase text-[10px] tracking-wider font-medium">
                            {t.forma}
                          </span>
                          <span>•</span>
                          <span>
                            {format(new Date(`${t.data_competencia}T12:00:00`), 'dd/MM')}
                          </span>
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-sm font-semibold tabular-nums shrink-0 ${
                        isReceita ? 'text-[var(--income)]' : 'text-[var(--text)]'
                      }`}
                    >
                      {isReceita ? '+ ' : '- '}
                      {formatCentavosToBRL(t.valor_centavos)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Coluna Lateral: Resumo de Instituições & Metas (5 de 12) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Seção Contas e Cartões */}
          <div className="space-y-3">
            <div className="flex items-center justify-between h-7 px-1">
              <h3 className="text-sm font-semibold text-[var(--text)]">
                Instituições e Faturas
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              <Link
                href="/contas"
                className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4 hover:border-[var(--border-strong)] transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--primary)]">
                    <Landmark className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
                      Contas Bancárias
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {contas.length} {contas.length === 1 ? 'instituição' : 'instituições'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold tabular-nums text-[var(--text)]">
                    {formatCentavosToBRL(saldoRealConsolidado)}
                  </span>
                  <ChevronRight className="h-4 w-4 text-[var(--text-muted)] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>

              <Link
                href="/cartoes"
                className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4 hover:border-[var(--border-strong)] transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--primary)]">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
                      Faturas de Cartões
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {cartoes.length} {cartoes.length === 1 ? 'cartão ativo' : 'cartões ativos'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold tabular-nums text-[var(--expense)]">
                    {formatCentavosToBRL(faturaCartoesMes)}
                  </span>
                  <ChevronRight className="h-4 w-4 text-[var(--text-muted)] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            </div>
          </div>

          {/* Seção Metas Ativas */}
          <div className="space-y-3">
            <div className="flex items-center justify-between h-7 px-1">
              <h3 className="text-sm font-semibold text-[var(--text)]">
                Metas Ativas
              </h3>
              <Link
                href="/metas"
                className="text-xs font-medium text-[var(--primary)] hover:underline flex items-center gap-1"
              >
                Ver todas
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-5 space-y-4">
              {metas.length === 0 ? (
                <div className="text-center py-4 text-xs text-[var(--text-muted)]">
                  Nenhuma meta ativa cadastrada.
                </div>
              ) : (
                metas.map((m) => {
                  const percentual =
                    m.alvo_centavos > 0
                      ? Math.min(
                          Math.round(
                            ((m.atual_centavos ?? 0) / m.alvo_centavos) * 100
                          ),
                          100
                        )
                      : 0;

                  return (
                    <div key={m.id} className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-[var(--text)]">
                          {m.nome}
                        </span>
                        <span className="tabular-nums font-semibold text-[var(--text-muted)]">
                          {percentual}%
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-[var(--surface-2)] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[var(--primary)] transition-all duration-300"
                          style={{ width: `${percentual}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
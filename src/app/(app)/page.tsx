import { connection } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { listarTransacoesMes } from '@/server/repositories/transacoes.repository';
import { StatCard } from '@/components/ui/StatCard';
import { formatCentavosToBRL } from '@/lib/money';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export const instant = false;

interface DashboardPageProps {
  searchParams: Promise<{ mes?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  await connection();

  const { mes } = await searchParams;
  const mesCompetencia = mes ?? format(new Date(), 'yyyy-MM');

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Carrega os lançamentos da competência selecionada
  const transacoes = await listarTransacoesMes(supabase, user.id, mesCompetencia);

  // Cálculos estritamente em centavos inteiros
  const totalReceitas = transacoes
    .filter((t) => t.tipo === 'receita')
    .reduce((acc, t) => acc + t.valor_centavos, 0);

  const totalDespesas = transacoes
    .filter((t) => t.tipo === 'despesa')
    .reduce((acc, t) => acc + t.valor_centavos, 0);

  const saldoDisponivel = totalReceitas - totalDespesas;

  return (
    <div className="space-y-6">
      {/* Cartão de Saldo Consolidado */}
      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-6">
        <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
          Saldo Disponível
        </span>
        <div className="mt-2 flex items-baseline gap-2">
          <h1
            className={`text-3xl sm:text-4xl font-semibold tracking-tight tabular-nums ${
              saldoDisponivel < 0 ? 'text-[var(--expense)]' : 'text-[var(--text)]'
            }`}
          >
            {formatCentavosToBRL(saldoDisponivel)}
          </h1>
        </div>
        <p className="mt-1 text-xs text-[var(--text-muted)] tabular-nums">
          Competência: {mesCompetencia}
        </p>
      </section>

      {/* Grelha de Indicadores Resumidos */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4">
        <StatCard
          label="Receitas"
          value={formatCentavosToBRL(totalReceitas)}
          variant="income"
          icon={<TrendingUp className="h-4 w-4 text-[var(--income)]" />}
        />
        <StatCard
          label="Despesas"
          value={formatCentavosToBRL(totalDespesas)}
          variant="expense"
          icon={<TrendingDown className="h-4 w-4 text-[var(--expense)]" />}
        />
      </section>

      {/* Extrato / Lista de Lançamentos do Mês */}
      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] overflow-hidden">
        <div className="p-4 border-b border-[var(--border)]">
          <h2 className="text-sm font-semibold text-[var(--text)]">
            Lançamentos do Mês
          </h2>
        </div>

        {transacoes.length === 0 ? (
          <div className="p-6 text-center text-sm text-[var(--text-muted)]">
            Nenhuma transação registada nesta competência.
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {transacoes.map((t) => {
              const isReceita = t.tipo === 'receita';
              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-4 hover:bg-[var(--surface-2)]/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                        isReceita
                          ? 'bg-[var(--income)]/10 text-[var(--income)]'
                          : 'bg-[var(--expense)]/10 text-[var(--expense)]'
                      }`}
                    >
                      {isReceita ? (
                        <ArrowUpRight className="h-5 w-5" />
                      ) : (
                        <ArrowDownLeft className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--text)]">
                        {t.descricao}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] uppercase">
                        {t.forma} • {t.data_competencia}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-sm font-semibold tabular-nums ${
                      isReceita ? 'text-[var(--income)]' : 'text-[var(--expense)]'
                    }`}
                  >
                    {isReceita ? '+ ' : '- '}
                    {formatCentavosToBRL(t.valor_centavos)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
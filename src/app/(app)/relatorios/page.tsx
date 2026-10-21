import { connection } from 'next/server';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { createClient } from '@/lib/supabase/server';
import { formatCentavosToBRL } from '@/lib/money';
import { PieChart, ArrowDownLeft, ArrowUpRight, Tags } from 'lucide-react';

export const instant = false;

interface RelatoriosProps {
  searchParams?: Promise<{ mes?: string }>;
}

export default async function RelatoriosPage({ searchParams }: RelatoriosProps) {
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

  // Busca transações com categorias do mês de competência
  const { data: transacoes } = await supabase
    .from('transacoes')
    .select(`
      id,
      tipo,
      valor_centavos,
      forma,
      categoria_id,
      categorias (
        id,
        nome,
        cor
      )
    `)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .gte('data_competencia', inicioMes)
    .lte('data_competencia', fimMes);

  const lista = transacoes ?? [];

  // Totais do Mês
  const totalReceitas = lista
    .filter((t) => t.tipo === 'receita')
    .reduce((acc, t) => acc + t.valor_centavos, 0);

  const totalDespesas = lista
    .filter((t) => t.tipo === 'despesa')
    .reduce((acc, t) => acc + t.valor_centavos, 0);

  const saldoCompetencia = totalReceitas - totalDespesas;

  // Agrupamento de despesas por categoria
  const despesasPorCategoriaMap = new Map<
    string,
    { nome: string; cor: string; totalCentavos: number; quantidade: number }
  >();

  lista
    .filter((t) => t.tipo === 'despesa')
    .forEach((t) => {
      const cat = Array.isArray(t.categorias) ? t.categorias[0] : t.categorias;
      const key = cat?.id ?? 'sem-categoria';
      const nome = cat?.nome ?? 'Sem Categoria';
      const cor = cat?.cor ?? '#64748B';

      const existente = despesasPorCategoriaMap.get(key);
      if (existente) {
        existente.totalCentavos += t.valor_centavos;
        existente.quantidade += 1;
      } else {
        despesasPorCategoriaMap.set(key, {
          nome,
          cor,
          totalCentavos: t.valor_centavos,
          quantidade: 1,
        });
      }
    });

  const despesasAgrupadas = Array.from(despesasPorCategoriaMap.values()).sort(
    (a, b) => b.totalCentavos - a.totalCentavos
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text)]">Relatórios</h1>
          <p className="text-xs text-[var(--text-muted)] capitalize">
            Demonstrativo analítico de {format(dataReferencia, 'MMMM yyyy', { locale: ptBR })}
          </p>
        </div>
      </div>

      {/* Cards de Resumo da Competência */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
          <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
            Receitas
          </span>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--income)]/10 text-[var(--income)]">
              <ArrowDownLeft className="h-4 w-4" />
            </div>
            <p className="text-xl font-semibold tabular-nums text-[var(--income)]">
              + {formatCentavosToBRL(totalReceitas)}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
          <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
            Despesas
          </span>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--expense)]/10 text-[var(--expense)]">
              <ArrowUpRight className="h-4 w-4" />
            </div>
            <p className="text-xl font-semibold tabular-nums text-[var(--expense)]">
              - {formatCentavosToBRL(totalDespesas)}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
          <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
            Resultado Líquido
          </span>
          <div className="mt-2">
            <p
              className={`text-xl font-semibold tabular-nums ${
                saldoCompetencia >= 0
                  ? 'text-[var(--income)]'
                  : 'text-[var(--expense)]'
              }`}
            >
              {saldoCompetencia >= 0 ? '+ ' : '- '}
              {formatCentavosToBRL(Math.abs(saldoCompetencia))}
            </p>
          </div>
        </div>
      </section>

      {/* Distribuição Visual de Despesas por Categoria */}
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-6 space-y-6">
        <div className="flex items-center gap-2">
          <PieChart className="h-5 w-5 text-[var(--primary)]" />
          <h2 className="text-base font-semibold text-[var(--text)]">
            Distribuição por Categoria
          </h2>
        </div>

        {despesasAgrupadas.length === 0 ? (
          <div className="py-8 text-center text-xs text-[var(--text-muted)]">
            Não há despesas registadas no mês de competência selecionado.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Barra Cumulativa Estilo Segmentada */}
            <div className="h-4 w-full rounded-full bg-[var(--surface-2)] flex overflow-hidden">
              {despesasAgrupadas.map((cat, idx) => {
                const percentual =
                  totalDespesas > 0
                    ? ((cat.totalCentavos / totalDespesas) * 100).toFixed(1)
                    : '0';

                return (
                  <div
                    key={idx}
                    title={`${cat.nome}: ${percentual}%`}
                    style={{
                      width: `${percentual}%`,
                      backgroundColor: cat.cor,
                    }}
                    className="h-full transition-all duration-300 first:rounded-l-full last:rounded-r-full"
                  />
                );
              })}
            </div>

            {/* Listagem Detalhada com Percentuais */}
            <div className="divide-y divide-[var(--border)]">
              {despesasAgrupadas.map((cat, idx) => {
                const percentual =
                  totalDespesas > 0
                    ? Math.round((cat.totalCentavos / totalDespesas) * 100)
                    : 0;

                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="h-3.5 w-3.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.cor }}
                      />
                      <div>
                        <p className="text-sm font-medium text-[var(--text)]">
                          {cat.nome}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {cat.quantidade} {cat.quantidade === 1 ? 'lançamento' : 'lançamentos'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-semibold tabular-nums text-[var(--text)]">
                        {formatCentavosToBRL(cat.totalCentavos)}
                      </p>
                      <p className="text-xs tabular-nums text-[var(--text-muted)]">
                        {percentual}% do total
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
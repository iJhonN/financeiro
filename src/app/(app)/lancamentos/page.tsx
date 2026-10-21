import { connection } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { listarTransacoesMes } from '@/server/repositories/transacoes.repository';
import { TransacaoItem } from '@/components/transacoes/TransacaoItem';
import { format } from 'date-fns';
import Link from 'next/link';

export const instant = false;

interface LancamentosPageProps {
  searchParams: Promise<{ mes?: string; tipo?: string }>;
}

export default async function LancamentosPage({ searchParams }: LancamentosPageProps) {
  await connection();

  const { mes, tipo } = await searchParams;
  const mesCompetencia = mes ?? format(new Date(), 'yyyy-MM');

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  let transacoes = await listarTransacoesMes(supabase, user.id, mesCompetencia);

  // Filtro por tipo (receita / despesa)
  if (tipo === 'receita' || tipo === 'despesa') {
    transacoes = transacoes.filter((t) => t.tipo === tipo);
  }

  const baseQuery = mes ? `mes=${mes}` : '';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text)]">
            Extrato de Lançamentos
          </h1>
          <p className="text-xs text-[var(--text-muted)]">
            Competência selecionada: {mesCompetencia}
          </p>
        </div>

        {/* Filtros por Tipo */}
        <div className="flex items-center gap-1 rounded-lg bg-[var(--surface-1)] border border-[var(--border)] p-1 text-xs font-medium">
          <Link
            href={`/lancamentos${baseQuery ? `?${baseQuery}` : ''}`}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              !tipo
                ? 'bg-[var(--surface-2)] text-[var(--text)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            Todos
          </Link>
          <Link
            href={`/lancamentos?${baseQuery ? `${baseQuery}&` : ''}tipo=receita`}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              tipo === 'receita'
                ? 'bg-[var(--surface-2)] text-[var(--income)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            Receitas
          </Link>
          <Link
            href={`/lancamentos?${baseQuery ? `${baseQuery}&` : ''}tipo=despesa`}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              tipo === 'despesa'
                ? 'bg-[var(--surface-2)] text-[var(--expense)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            Despesas
          </Link>
        </div>
      </div>

      {/* Lista do Extrato */}
      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] overflow-hidden">
        {transacoes.length === 0 ? (
          <div className="p-8 text-center text-sm text-[var(--text-muted)]">
            Nenhum lançamento encontrado para os filtros selecionados.
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {transacoes.map((t) => (
              <TransacaoItem
                key={t.id}
                transacao={{
                  id: t.id,
                  descricao: t.descricao,
                  valor_centavos: t.valor_centavos,
                  tipo: t.tipo as 'receita' | 'despesa',
                  forma: t.forma,
                  data_competencia: t.data_competencia,
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
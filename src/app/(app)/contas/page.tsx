import { connection } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { listarContas } from '@/server/repositories/contas.repository';
import { AdicionarContaButton } from '@/components/contas/AdicionarContaButton';
import { formatCentavosToBRL } from '@/lib/money';
import { Landmark, Wallet } from 'lucide-react';

export const instant = false;

export default async function ContasPage() {
  await connection();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const contas = await listarContas(supabase, user.id);

  // Procura todas as transações do utilizador que tenham conta associada
  const { data: transacoes } = await supabase
    .from('transacoes')
    .select('conta_id, valor_centavos, tipo')
    .eq('user_id', user.id);

  // Calcula o saldo atualizado de cada conta
  const contasComSaldo = contas.map((conta) => {
    const movimentacoes = (transacoes ?? []).filter((t) => t.conta_id === conta.id);
    const totalReceitas = movimentacoes
      .filter((t) => t.tipo === 'receita')
      .reduce((acc, t) => acc + t.valor_centavos, 0);
    const totalDespesas = movimentacoes
      .filter((t) => t.tipo === 'despesa')
      .reduce((acc, t) => acc + t.valor_centavos, 0);

    const saldoAtual = (conta.saldo_inicial_centavos ?? 0) + totalReceitas - totalDespesas;

    return {
      ...conta,
      saldo_atual_centavos: saldoAtual,
    };
  });

  const saldoTotalContas = contasComSaldo.reduce(
    (acc, c) => acc + c.saldo_atual_centavos,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text)]">
            Minhas Contas
          </h1>
          <p className="text-xs text-[var(--text-muted)]">
            Gestão de contas correntes, investimentos e carteiras
          </p>
        </div>
        <AdicionarContaButton />
      </div>

      {/* Saldo Consolidado em Contas */}
      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-6">
        <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
          Total em Contas
        </span>
        <div className="mt-2 flex items-baseline gap-2">
          <h2
            className={`text-3xl font-semibold tracking-tight tabular-nums ${
              saldoTotalContas < 0 ? 'text-[var(--expense)]' : 'text-[var(--text)]'
            }`}
          >
            {formatCentavosToBRL(saldoTotalContas)}
          </h2>
        </div>
      </section>

      {/* Grelha de Contas */}
      <section>
        {contasComSaldo.length === 0 ? (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-8 text-center text-sm text-[var(--text-muted)]">
            Ainda não cadastrou nenhuma conta bancária ou carteira.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {contasComSaldo.map((c) => (
              <div
                key={c.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4 flex flex-col justify-between hover:border-[var(--border-strong)] transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--primary)]">
                      {c.tipo === 'carteira' ? (
                        <Wallet className="h-5 w-5" />
                      ) : (
                        <Landmark className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--text)]">
                        {c.nome}
                      </h3>
                      <span className="text-xs text-[var(--text-muted)] capitalize">
                        {c.tipo}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-baseline justify-between">
                  <span className="text-xs text-[var(--text-muted)]">
                    Saldo
                  </span>
                  <span
                    className={`text-base font-semibold tabular-nums ${
                      c.saldo_atual_centavos < 0
                        ? 'text-[var(--expense)]'
                        : 'text-[var(--text)]'
                    }`}
                  >
                    {formatCentavosToBRL(c.saldo_atual_centavos)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
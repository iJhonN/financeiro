import { connection } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { listarCartoes } from '@/server/repositories/cartoes.repository';
import { AdicionarCartaoButton } from '@/components/cartoes/AdicionarCartaoButton';
import { formatCentavosToBRL } from '@/lib/money';
import { CreditCard, Calendar } from 'lucide-react';

export const instant = false;

export default async function CartoesPage() {
  await connection();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const cartoes = await listarCartoes(supabase, user.id);

  // Consulta despesas registadas no cartão de crédito
  const { data: despesasCartao } = await supabase
    .from('transacoes')
    .select('cartao_id, valor_centavos')
    .eq('user_id', user.id)
    .eq('tipo', 'despesa')
    .not('cartao_id', 'is', null);

  const cartoesComFatura = cartoes.map((cartao) => {
    const limiteTotal = cartao.limite_centavos ?? 0;
    const faturaAtual = (despesasCartao ?? [])
      .filter((t) => t.cartao_id === cartao.id)
      .reduce((acc, t) => acc + t.valor_centavos, 0);

    const limiteDisponivel = limiteTotal - faturaAtual;

    return {
      ...cartao,
      limite_total_centavos: limiteTotal,
      fatura_atual_centavos: faturaAtual,
      limite_disponivel_centavos: limiteDisponivel,
    };
  });

  const limiteTotalConsolidado = cartoesComFatura.reduce(
    (acc, c) => acc + c.limite_total_centavos,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text)]">
            Cartões de Crédito
          </h1>
          <p className="text-xs text-[var(--text-muted)]">
            Gestão de limites, faturas e datas de fecho
          </p>
        </div>
        <AdicionarCartaoButton />
      </div>

      {/* Visão Consolidada de Limites */}
      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-6">
        <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
          Limite Total Disponibilizado
        </span>
        <div className="mt-2 flex items-baseline gap-2">
          <h2 className="text-3xl font-semibold tracking-tight tabular-nums text-[var(--text)]">
            {formatCentavosToBRL(limiteTotalConsolidado)}
          </h2>
        </div>
      </section>

      {/* Grelha de Cartões */}
      <section>
        {cartoesComFatura.length === 0 ? (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-8 text-center text-sm text-[var(--text-muted)]">
            Ainda não cadastrou nenhum cartão de crédito.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cartoesComFatura.map((c) => (
              <div
                key={c.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5 flex flex-col justify-between hover:border-[var(--border-strong)] transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-[var(--text)]">
                          {c.apelido}
                        </h3>
                        <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                          <Calendar className="h-3 w-3" />
                          Fecho: dia {c.dia_fechamento} • Venc: dia {c.dia_vencimento}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-[var(--text-muted)]">Fatura Atual</span>
                      <span className="font-semibold tabular-nums text-[var(--expense)]">
                        {formatCentavosToBRL(c.fatura_atual_centavos)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[var(--text-muted)]">Disponível</span>
                      <span className="font-semibold tabular-nums text-[var(--text)]">
                        {formatCentavosToBRL(c.limite_disponivel_centavos)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-baseline justify-between text-xs">
                  <span className="text-[var(--text-muted)]">Limite Total</span>
                  <span className="font-medium tabular-nums text-[var(--text)]">
                    {formatCentavosToBRL(c.limite_total_centavos)}
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
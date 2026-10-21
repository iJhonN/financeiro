import { connection } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { listarMetas } from '@/server/repositories/metas.repository';
import { AdicionarMetaButton } from '@/components/metas/AdicionarMetaButton';
import { BotaoAporte } from '@/components/metas/BotaoAporte';
import { formatCentavosToBRL } from '@/lib/money';
import { Target, Calendar, CheckCircle2 } from 'lucide-react';

export const instant = false;

export default async function MetasPage() {
  await connection();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const metas = await listarMetas(supabase, user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text)]">
            Metas e Orçamentos
          </h1>
          <p className="text-xs text-[var(--text-muted)]">
            Defina objetivos de poupança e tetos de gastos
          </p>
        </div>
        <AdicionarMetaButton />
      </div>

      <section>
        {metas.length === 0 ? (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-8 text-center text-sm text-[var(--text-muted)]">
            Nenhuma meta definida até ao momento. Crie o seu primeiro objetivo financeiro!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {metas.map((m) => {
              const atual = m.atual_centavos ?? 0;
              const alvo = m.alvo_centavos;
              const percentual = alvo > 0 ? Math.min(Math.round((atual / alvo) * 100), 100) : 0;
              const isConcluida = m.concluida || percentual >= 100;

              return (
                <div
                  key={m.id}
                  className={`rounded-xl border p-5 flex flex-col justify-between transition-colors ${
                    isConcluida
                      ? 'border-[var(--income)]/20 bg-[var(--income)]/5'
                      : 'border-[var(--border)] bg-[var(--surface-1)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                            isConcluida
                              ? 'bg-[var(--income)]/20 text-[var(--income)]'
                              : 'bg-[var(--primary)]/10 text-[var(--primary)]'
                          }`}
                        >
                          {isConcluida ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <Target className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-[var(--text)]">
                            {m.nome}
                          </h3>
                          {m.prazo && !isConcluida && (
                            <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                              <Calendar className="h-3 w-3" />
                              Prazo: {m.prazo}
                            </p>
                          )}
                        </div>
                      </div>

                      <BotaoAporte metaId={m.id!} metaNome={m.nome} concluida={isConcluida} />
                    </div>

                    <div className="mt-5 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-[var(--text-muted)]">Progresso</span>
                        <span
                          className={`font-semibold tabular-nums ${
                            isConcluida ? 'text-[var(--income)]' : 'text-[var(--text)]'
                          }`}
                        >
                          {percentual}%
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-[var(--surface-2)] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isConcluida ? 'bg-[var(--income)]' : 'bg-[var(--primary)]'
                          }`}
                          style={{ width: `${percentual}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[var(--border)] flex items-baseline justify-between text-xs">
                    <span className="text-[var(--text-muted)]">
                      {formatCentavosToBRL(atual)}
                    </span>
                    <span className="font-medium tabular-nums text-[var(--text)]">
                      Alvo: {formatCentavosToBRL(alvo)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
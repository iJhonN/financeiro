import { connection } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { listarCategorias } from '@/server/repositories/categorias.repository';
import { AdicionarCategoriaButton } from '@/components/categorias/AdicionarCategoriaButton';
import { Tag, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export const instant = false;

export default async function CategoriasPage() {
  await connection();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const categorias = await listarCategorias(supabase, user.id);

  const despesas = categorias.filter((c) => c.tipo === 'despesa');
  const receitas = categorias.filter((c) => c.tipo === 'receita');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text)]">Categorias</h1>
          <p className="text-xs text-[var(--text-muted)]">
            Organização e taxonomia dos seus fluxos financeiros
          </p>
        </div>
        <AdicionarCategoriaButton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bloco de Despesas */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <ArrowDownLeft className="h-4 w-4 text-[var(--expense)]" />
            <h2 className="text-sm font-semibold text-[var(--text)]">
              Despesas ({despesas.length})
            </h2>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] divide-y divide-[var(--border)] overflow-hidden">
            {despesas.length === 0 ? (
              <div className="p-6 text-center text-xs text-[var(--text-muted)]">
                Nenhuma categoria de despesa registada.
              </div>
            ) : (
              despesas.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-3.5 hover:bg-[var(--surface-2)]/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: cat.cor ?? '#ef4444' }}
                    />
                    <span className="text-sm font-medium text-[var(--text)]">
                      {cat.nome}
                    </span>
                  </div>
                  <span className="text-xs text-[var(--text-muted)] uppercase">
                    {cat.user_id ? 'Personalizada' : 'Sistema'}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Bloco de Receitas */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <ArrowUpRight className="h-4 w-4 text-[var(--income)]" />
            <h2 className="text-sm font-semibold text-[var(--text)]">
              Receitas ({receitas.length})
            </h2>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] divide-y divide-[var(--border)] overflow-hidden">
            {receitas.length === 0 ? (
              <div className="p-6 text-center text-xs text-[var(--text-muted)]">
                Nenhuma categoria de receita registada.
              </div>
            ) : (
              receitas.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-3.5 hover:bg-[var(--surface-2)]/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: cat.cor ?? '#10b981' }}
                    />
                    <span className="text-sm font-medium text-[var(--text)]">
                      {cat.nome}
                    </span>
                  </div>
                  <span className="text-xs text-[var(--text-muted)] uppercase">
                    {cat.user_id ? 'Personalizada' : 'Sistema'}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
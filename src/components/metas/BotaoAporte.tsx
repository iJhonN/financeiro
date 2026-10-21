'use client';

import { useState, useTransition } from 'react';
import { Plus, X, Loader2, ArrowUpCircle } from 'lucide-react';
import { adicionarAporteAction } from '@/server/actions/metas.actions';
import { formatCentavosToBRL, parseBRLToCentavos } from '@/lib/money';

interface BotaoAporteProps {
  metaId: string;
  metaNome: string;
  concluida?: boolean;
}

export function BotaoAporte({ metaId, metaNome, concluida = false }: BotaoAporteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [valorDisplay, setValorDisplay] = useState('R$ 0,00');
  const [valorCentavos, setValorCentavos] = useState(0);

  if (concluida) {
    return (
      <span className="inline-flex items-center rounded-full bg-[var(--income)]/10 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-[var(--income)] uppercase">
        Concluída
      </span>
    );
  }

  function handleValorChange(e: React.ChangeEvent<HTMLInputElement>) {
    const centavos = parseBRLToCentavos(e.target.value);
    setValorCentavos(centavos);
    setValorDisplay(formatCentavosToBRL(centavos));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (valorCentavos <= 0) {
      setErrorMessage('O aporte deve ser superior a zero.');
      return;
    }

    startTransition(async () => {
      const res = await adicionarAporteAction({
        meta_id: metaId,
        valor_centavos: valorCentavos,
      });

      if (res?.error) {
        setErrorMessage(res.error);
        return;
      }

      setValorDisplay('R$ 0,00');
      setValorCentavos(0);
      setIsOpen(false);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-colors"
        title="Adicionar Aporte"
      >
        <Plus className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
          <div
            className="w-full max-w-sm rounded-t-2xl sm:rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-6 shadow-xl animate-in slide-in-from-bottom duration-300"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <ArrowUpCircle className="h-5 w-5 text-[var(--income)]" />
                <h2 className="text-base font-semibold text-[var(--text)] truncate max-w-[200px]">
                  Aporte: {metaNome}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-2)] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                  Valor do Aporte
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={valorDisplay}
                  onChange={handleValorChange}
                  required
                  autoFocus
                  className="w-full rounded-lg border border-transparent bg-[var(--surface-2)] px-3 py-3 text-2xl font-semibold text-[var(--text)] tabular-nums focus:border-[var(--primary)] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isPending || valorCentavos <= 0}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-50 mt-6"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span>Confirmar Aporte</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
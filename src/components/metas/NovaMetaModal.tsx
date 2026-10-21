'use client';

import { useState, useTransition } from 'react';
import { X, Loader2, Target } from 'lucide-react';
import { criarMetaAction } from '@/server/actions/metas.actions';
import { formatCentavosToBRL, parseBRLToCentavos } from '@/lib/money';

interface NovaMetaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NovaMetaModal({ isOpen, onClose }: NovaMetaModalProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [nome, setNome] = useState('');
  const [alvoDisplay, setAlvoDisplay] = useState('R$ 0,00');
  const [alvoCentavos, setAlvoCentavos] = useState(0);
  const [prazo, setPrazo] = useState('');

  if (!isOpen) return null;

  function handleValorChange(e: React.ChangeEvent<HTMLInputElement>) {
    const centavos = parseBRLToCentavos(e.target.value);
    setAlvoCentavos(centavos);
    setAlvoDisplay(formatCentavosToBRL(centavos));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (alvoCentavos <= 0) {
      setErrorMessage('O montante alvo deve ser superior a zero.');
      return;
    }

    startTransition(async () => {
      const res = await criarMetaAction({
        nome,
        alvo_centavos: alvoCentavos,
        prazo: prazo || null,
      });

      if (res?.error) {
        setErrorMessage(res.error);
        return;
      }

      setNome('');
      setAlvoDisplay('R$ 0,00');
      setAlvoCentavos(0);
      setPrazo('');
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-md rounded-t-2xl sm:rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-6 shadow-xl animate-in slide-in-from-bottom duration-300"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-[var(--primary)]" />
            <h2 className="text-base font-semibold text-[var(--text)]">
              Nova Meta Financeira
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] transition-colors"
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
              Nome da Meta
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Reserva de Emergência, Viagem de Férias..."
              required
              className="w-full rounded-lg border border-transparent bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--text-subtle)] focus:border-[var(--primary)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
              Montante Alvo
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={alvoDisplay}
              onChange={handleValorChange}
              required
              className="w-full rounded-lg border border-transparent bg-[var(--surface-2)] px-3 py-2 text-lg font-semibold text-[var(--text)] tabular-nums focus:border-[var(--primary)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
              Prazo Estimado (Opcional)
            </label>
            <input
              type="date"
              value={prazo}
              onChange={(e) => setPrazo(e.target.value)}
              className="w-full rounded-lg border border-transparent bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--primary)] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isPending || !nome.trim() || alvoCentavos <= 0}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-50 mt-6"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span>Criar Meta</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
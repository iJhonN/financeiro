'use client';

import { useState, useTransition } from 'react';
import { X, Loader2, Landmark } from 'lucide-react';
import { criarContaAction } from '@/server/actions/contas.actions';
import { formatCentavosToBRL, parseBRLToCentavos } from '@/lib/money';

interface NovaContaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NovaContaModal({ isOpen, onClose }: NovaContaModalProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<'corrente' | 'poupanca' | 'investimento' | 'carteira' | 'outro'>('corrente');
  const [saldoDisplay, setSaldoDisplay] = useState('R$ 0,00');
  const [saldoCentavos, setSaldoCentavos] = useState(0);

  if (!isOpen) return null;

  function handleSaldoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const centavos = parseBRLToCentavos(e.target.value);
    setSaldoCentavos(centavos);
    setSaldoDisplay(formatCentavosToBRL(centavos));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      const res = await criarContaAction({
        nome,
        tipo,
        saldo_inicial_centavos: saldoCentavos,
      });

      if (res?.error) {
        setErrorMessage(res.error);
        return;
      }

      setNome('');
      setSaldoDisplay('R$ 0,00');
      setSaldoCentavos(0);
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
            <Landmark className="h-5 w-5 text-[var(--primary)]" />
            <h2 className="text-base font-semibold text-[var(--text)]">
              Nova Conta
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
              Nome da Conta / Instituição
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Nubank, Itaú, Carteira..."
              required
              className="w-full rounded-lg border border-transparent bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--text-subtle)] focus:border-[var(--primary)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
              Tipo de Conta
            </label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as any)}
              className="w-full rounded-lg border border-transparent bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--primary)] focus:outline-none"
            >
              <option value="corrente">Conta Corrente</option>
              <option value="poupanca">Poupança</option>
              <option value="investimento">Investimentos</option>
              <option value="carteira">Carteira Física (Dinheiro)</option>
              <option value="outro">Outro</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
              Saldo Inicial
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={saldoDisplay}
              onChange={handleSaldoChange}
              className="w-full rounded-lg border border-transparent bg-[var(--surface-2)] px-3 py-2 text-lg font-semibold text-[var(--text)] tabular-nums focus:border-[var(--primary)] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isPending || !nome.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-50 mt-6"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span>Criar Conta</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
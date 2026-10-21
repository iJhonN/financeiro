'use client';

import { useState, useTransition } from 'react';
import { X, Loader2, CreditCard } from 'lucide-react';
import { criarCartaoAction } from '@/server/actions/cartoes.actions';
import { formatCentavosToBRL, parseBRLToCentavos } from '@/lib/money';

interface NovoCartaoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NovoCartaoModal({ isOpen, onClose }: NovoCartaoModalProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [apelido, setApelido] = useState('');
  const [bancoSlug, setBancoSlug] = useState('nubank');
  const [limiteDisplay, setLimiteDisplay] = useState('R$ 0,00');
  const [limiteCentavos, setLimiteCentavos] = useState(0);
  const [diaFechamento, setDiaFechamento] = useState('1');
  const [diaVencimento, setDiaVencimento] = useState('10');

  if (!isOpen) return null;

  function handleLimiteChange(e: React.ChangeEvent<HTMLInputElement>) {
    const centavos = parseBRLToCentavos(e.target.value);
    setLimiteCentavos(centavos);
    setLimiteDisplay(formatCentavosToBRL(centavos));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (limiteCentavos <= 0) {
      setErrorMessage('O limite deve ser superior a zero.');
      return;
    }

    startTransition(async () => {
      const res = await criarCartaoAction({
        apelido,
        banco_slug: bancoSlug,
        limite_centavos: limiteCentavos,
        dia_fechamento: diaFechamento,
        dia_vencimento: diaVencimento,
      });

      if (res?.error) {
        setErrorMessage(res.error);
        return;
      }

      setApelido('');
      setLimiteDisplay('R$ 0,00');
      setLimiteCentavos(0);
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
            <CreditCard className="h-5 w-5 text-[var(--primary)]" />
            <h2 className="text-base font-semibold text-[var(--text)]">
              Novo Cartão de Crédito
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
              Apelido do Cartão
            </label>
            <input
              type="text"
              value={apelido}
              onChange={(e) => setApelido(e.target.value)}
              placeholder="Ex: Nubank Ultravioleta, XP Visa..."
              required
              className="w-full rounded-lg border border-transparent bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--text-subtle)] focus:border-[var(--primary)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
              Instituição / Banco
            </label>
            <select
              value={bancoSlug}
              onChange={(e) => setBancoSlug(e.target.value)}
              className="w-full rounded-lg border border-transparent bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--primary)] focus:outline-none"
            >
              <option value="nubank">Nubank</option>
              <option value="inter">Inter</option>
              <option value="itau">Itaú</option>
              <option value="bradesco">Bradesco</option>
              <option value="santander">Santander</option>
              <option value="c6">C6 Bank</option>
              <option value="xp">XP</option>
              <option value="outro">Outro</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
              Limite Total
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={limiteDisplay}
              onChange={handleLimiteChange}
              required
              className="w-full rounded-lg border border-transparent bg-[var(--surface-2)] px-3 py-2 text-lg font-semibold text-[var(--text)] tabular-nums focus:border-[var(--primary)] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                Dia de Fecho
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={diaFechamento}
                onChange={(e) => setDiaFechamento(e.target.value)}
                required
                className="w-full rounded-lg border border-transparent bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--primary)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                Dia de Vencimento
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={diaVencimento}
                onChange={(e) => setDiaVencimento(e.target.value)}
                required
                className="w-full rounded-lg border border-transparent bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--primary)] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending || !apelido.trim() || limiteCentavos <= 0}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-50 mt-6"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span>Cadastrar Cartão</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
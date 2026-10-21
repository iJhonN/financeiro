'use client';

import { useState, useTransition } from 'react';
import { format } from 'date-fns';
import { X, Loader2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { criarTransacaoAction } from '@/server/actions/transacoes.actions';
import { formatCentavosToBRL, parseBRLToCentavos } from '@/lib/money';

interface NovoLancamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NovoLancamentoModal({ isOpen, onClose }: NovoLancamentoModalProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [tipo, setTipo] = useState<'despesa' | 'receita'>('despesa');
  const [valorDisplay, setValorDisplay] = useState('R$ 0,00');
  const [valorCentavos, setValorCentavos] = useState(0);
  const [descricao, setDescricao] = useState('');
  const [forma, setForma] = useState<'pix' | 'dinheiro' | 'debito' | 'credito' | 'ted' | 'boleto'>('pix');
  const [dataCompetencia, setDataCompetencia] = useState(format(new Date(), 'yyyy-MM-dd'));

  if (!isOpen) return null;

  function handleValorChange(e: React.ChangeEvent<HTMLInputElement>) {
    const centavos = parseBRLToCentavos(e.target.value);
    setValorCentavos(centavos);
    setValorDisplay(formatCentavosToBRL(centavos));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (valorCentavos <= 0) {
      setErrorMessage('O montante deve ser superior a zero.');
      return;
    }

    startTransition(async () => {
      const res = await criarTransacaoAction({
        descricao,
        valor_centavos: valorCentavos,
        tipo,
        forma,
        data_competencia: dataCompetencia,
        status: 'pago',
      });

      if (res?.error) {
        setErrorMessage(res.error);
        return;
      }

      // Reinicia estado e encerra modal
      setValorDisplay('R$ 0,00');
      setValorCentavos(0);
      setDescricao('');
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg rounded-t-2xl sm:rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-6 shadow-xl animate-in slide-in-from-bottom duration-300"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
          <h2 className="text-base font-semibold text-[var(--text)]">
            Novo Lançamento
          </h2>
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
          {/* Seletor Tipo: Despesa vs Receita */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[var(--surface-2)] rounded-lg">
            <button
              type="button"
              onClick={() => setTipo('despesa')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-md transition-all ${
                tipo === 'despesa'
                  ? 'bg-[var(--surface-1)] text-[var(--expense)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              <ArrowDownCircle className="h-4 w-4" />
              <span>Despesa</span>
            </button>
            <button
              type="button"
              onClick={() => setTipo('receita')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-md transition-all ${
                tipo === 'receita'
                  ? 'bg-[var(--surface-1)] text-[var(--income)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              <ArrowUpCircle className="h-4 w-4" />
              <span>Receita</span>
            </button>
          </div>

          {/* Input de Montante (Centavos) */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
              Montante
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={valorDisplay}
              onChange={handleValorChange}
              required
              className="w-full rounded-lg border border-transparent bg-[var(--surface-2)] px-3 py-2 text-xl font-semibold text-[var(--text)] tabular-nums focus:border-[var(--primary)] focus:outline-none"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
              Descrição
            </label>
            <input
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Almoço de trabalho, Mensalidade..."
              required
              className="w-full rounded-lg border border-transparent bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--text-subtle)] focus:border-[var(--primary)] focus:outline-none"
            />
          </div>

          {/* Grelha de Forma de Pagamento e Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                Forma de Pagamento
              </label>
              <select
                value={forma}
                onChange={(e) => setForma(e.target.value as any)}
                className="w-full rounded-lg border border-transparent bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--primary)] focus:outline-none"
              >
                <option value="pix">PIX</option>
                <option value="debito">Débito</option>
                <option value="credito">Crédito</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="ted">TED / Transferência</option>
                <option value="boleto">Boleto</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                Data de Competência
              </label>
              <input
                type="date"
                value={dataCompetencia}
                onChange={(e) => setDataCompetencia(e.target.value)}
                required
                className="w-full rounded-lg border border-transparent bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--primary)] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending || valorCentavos <= 0}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-50 mt-6"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span>Registar Lançamento</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
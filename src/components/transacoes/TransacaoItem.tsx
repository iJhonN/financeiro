'use client';

import { useTransition } from 'react';
import { ArrowDownLeft, ArrowUpRight, Trash2, Loader2 } from 'lucide-react';
import { formatCentavosToBRL } from '@/lib/money';
import { excluirTransacaoAction } from '@/server/actions/transacoes.actions';

interface TransacaoItemProps {
  transacao: {
    id: string;
    descricao: string;
    valor_centavos: number;
    tipo: 'receita' | 'despesa';
    forma: string;
    data_competencia: string;
  };
}

export function TransacaoItem({ transacao }: TransacaoItemProps) {
  const [isPending, startTransition] = useTransition();
  const isReceita = transacao.tipo === 'receita';

  function handleDelete() {
    if (confirm(`Tem a certeza que deseja eliminar "${transacao.descricao}"?`)) {
      startTransition(async () => {
        await excluirTransacaoAction(transacao.id);
      });
    }
  }

  return (
    <div className="group flex items-center justify-between p-4 hover:bg-[var(--surface-2)]/50 transition-colors">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
            isReceita
              ? 'bg-[var(--income)]/10 text-[var(--income)]'
              : 'bg-[var(--expense)]/10 text-[var(--expense)]'
          }`}
        >
          {isReceita ? (
            <ArrowUpRight className="h-5 w-5" />
          ) : (
            <ArrowDownLeft className="h-5 w-5" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--text)]">
            {transacao.descricao}
          </p>
          <p className="text-xs text-[var(--text-muted)] uppercase">
            {transacao.forma} • {transacao.data_competencia}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`text-sm font-semibold tabular-nums ${
            isReceita ? 'text-[var(--income)]' : 'text-[var(--expense)]'
          }`}
        >
          {isReceita ? '+ ' : '- '}
          {formatCentavosToBRL(transacao.valor_centavos)}
        </span>

        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="opacity-0 group-hover:opacity-100 focus:opacity-100 flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-400 transition-all disabled:opacity-50"
          title="Eliminar lançamento"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin text-red-400" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
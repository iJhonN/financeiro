'use client';

import { useState, useTransition } from 'react';
import { X, Loader2, Tags, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { criarCategoriaAction } from '@/server/actions/categorias.actions';

interface NovaCategoriaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CORES_PALETA = [
  '#3b82f6', // Azul
  '#10b981', // Verde
  '#ef4444', // Vermelho
  '#f59e0b', // Âmbar
  '#8b5cf6', // Roxo
  '#ec4899', // Rosa
  '#06b6d4', // Ciano
  '#64748b', // Slate
];

export function NovaCategoriaModal({ isOpen, onClose }: NovaCategoriaModalProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<'despesa' | 'receita'>('despesa');
  const [cor, setCor] = useState(CORES_PALETA[0]!);

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      const res = await criarCategoriaAction({
        nome,
        tipo,
        cor,
        icone: 'tag',
      });

      if (res?.error) {
        setErrorMessage(res.error);
        return;
      }

      setNome('');
      setCor(CORES_PALETA[0]!);
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
            <Tags className="h-5 w-5 text-[var(--primary)]" />
            <h2 className="text-base font-semibold text-[var(--text)]">
              Nova Categoria
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

          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
              Nome da Categoria
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Assinaturas, Alimentação, Freelance..."
              required
              className="w-full rounded-lg border border-transparent bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--text-subtle)] focus:border-[var(--primary)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-2">
              Cor de Destaque
            </label>
            <div className="flex items-center gap-2">
              {CORES_PALETA.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => setCor(hex)}
                  className={`h-7 w-7 rounded-full border-2 transition-transform ${
                    cor === hex
                      ? 'scale-110 border-white ring-2 ring-[var(--primary)]/50'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending || !nome.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-50 mt-6"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span>Criar Categoria</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { cadastroAction } from '@/server/actions/auth.actions';
import { UserPlus, Loader2, MailCheck } from 'lucide-react';

export default function CadastroPage() {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const data = {
      nome: formData.get('nome'),
      email: formData.get('email'),
      password: formData.get('password'),
    };

    startTransition(async () => {
      const res = await cadastroAction(data);
      if (res.error) {
        setErrorMessage(res.error);
      } else if (res.requiresEmailConfirmation) {
        setRegistered(true);
      }
    });
  }

  if (registered) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4 py-12">
        <div className="w-full max-w-sm rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-6 sm:p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--income-bg)] text-[var(--income)]">
            <MailCheck className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold text-[var(--text)]">Verifique seu e-mail</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Enviamos um link de confirmação para a sua caixa de entrada. Confirme seu e-mail para ativar sua conta.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
          >
            Voltar para o Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4 py-12">
      <div className="w-full max-w-sm rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-6 sm:p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">
            Criar Conta
          </h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Junte-se à Alcateia e assuma o controle financeiro.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
              Nome Completo
            </label>
            <input
              name="nome"
              type="text"
              required
              minLength={2}
              maxLength={100}
              placeholder="Seu Nome"
              className="w-full rounded-lg border border-transparent bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--text-subtle)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
              E-mail
            </label>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="seu@email.com"
              className="w-full rounded-lg border border-transparent bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--text-subtle)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
              Senha (mínimo 12 caracteres)
            </label>
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={12}
              maxLength={128}
              placeholder="••••••••••••"
              className="w-full rounded-lg border border-transparent bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--text-subtle)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-50 mt-6"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                <span>Cadastrar</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-[var(--text-muted)]">
          Já possui conta?{' '}
          <Link
            href="/login"
            className="font-medium text-[var(--primary)] hover:underline"
          >
            Entrar
          </Link>
        </div>
      </div>
    </div>
  );
}
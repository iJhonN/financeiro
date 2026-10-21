'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { loginAction } from '@/server/actions/auth.actions';
import { LogIn, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const data = {
      email: formData.get('email'),
      password: formData.get('password'),
    };

    startTransition(async () => {
      const res = await loginAction(data);
      if (res?.error) {
        setErrorMessage(res.error);
      }
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4 py-12">
      <div className="w-full max-w-sm rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-6 sm:p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">
            Wolf Finance
          </h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Introduza os seus dados para aceder à sua conta.
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
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-[var(--text-muted)]">
                Palavra-passe
              </label>
              <Link
                href="/recuperar"
                className="text-xs text-[var(--primary)] hover:underline"
              >
                Esqueceu-se?
              </Link>
            </div>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
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
                <LogIn className="h-4 w-4" />
                <span>Entrar</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-[var(--text-muted)]">
          Não tem uma conta?{' '}
          <Link
            href="/cadastro"
            className="font-medium text-[var(--primary)] hover:underline"
          >
            Registe-se
          </Link>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { recuperarSenhaAction } from '@/server/actions/auth.actions';
import { KeyRound, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function RecuperarPage() {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const data = {
      email: formData.get('email'),
    };

    startTransition(async () => {
      const res = await recuperarSenhaAction(data);
      if (res.error) {
        setErrorMessage(res.error);
      } else {
        setSubmitted(true);
      }
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4 py-12">
      <div className="w-full max-w-sm rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-6 sm:p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">
            Recuperar Acesso
          </h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Introduza o seu e-mail para receber as instruções de redefinição.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            {errorMessage}
          </div>
        )}

        {submitted ? (
          <div className="text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--income-bg)] text-[var(--income)]">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <p className="text-sm text-[var(--text)]">
              Se o e-mail informado estiver cadastrado, as instruções foram enviadas.
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              Verifique também a sua pasta de spam ou lixo eletrónico.
            </p>
            <Link
              href="/login"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--surface-2)] px-4 py-2 text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-3)] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar ao login</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                E-mail registado
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

            <button
              type="submit"
              disabled={isPending}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-50 mt-6"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  <span>Enviar instruções</span>
                </>
              )}
            </button>

            <div className="mt-6 text-center text-xs">
              <Link
                href="/login"
                className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
              >
                Lembrou-se da palavra-passe? Entrar
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
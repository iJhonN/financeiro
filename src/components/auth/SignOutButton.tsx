'use client';

import { useTransition } from 'react';
import { LogOut, Loader2 } from 'lucide-react';
import { signOutAction } from '@/server/actions/auth.actions';

export function SignOutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(async () => await signOutAction())}
      disabled={isPending}
      className="flex w-full items-center justify-between rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-left text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10">
          <LogOut className="h-4 w-4 text-red-400" />
        </div>
        <span>Terminar Sessão</span>
      </div>
      {isPending && <Loader2 className="h-4 w-4 animate-spin text-red-400" />}
    </button>
  );
}
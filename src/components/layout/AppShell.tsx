'use client';

import { ReactNode, useState } from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { NovoLancamentoModal } from '@/components/transacoes/NovoLancamentoModal';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [modalAberto, setModalAberto] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--text)] antialiased">
      <Header />
      <main className="flex-1 pb-24 pt-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
      <BottomNav onOpenNovoLancamento={() => setModalAberto(true)} />
      <NovoLancamentoModal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
      />
    </div>
  );
}
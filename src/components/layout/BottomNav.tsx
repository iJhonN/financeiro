'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  ArrowLeftRight, 
  Plus, 
  CreditCard, 
  Menu 
} from 'lucide-react';

interface BottomNavProps {
  onOpenNovoLancamento?: () => void;
}

export function BottomNav({ onOpenNovoLancamento }: BottomNavProps) {
  const pathname = usePathname();

  const isDriverRoute = pathname.startsWith('/driver');

  // Links padrão de Finanças Pessoais
  const navItems = [
    { label: 'Início', href: '/', icon: Home, exact: true },
    { label: 'Extrato', href: '/lancamentos', icon: ArrowLeftRight },
    { label: 'Novo', href: '#', icon: Plus, isAction: true },
    { label: 'Cartões', href: '/cartoes', icon: CreditCard },
    { label: 'Mais', href: '/mais', icon: Menu },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border)] bg-[var(--surface-1)]/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {navItems.map((item) => {
          if (item.isAction) {
            return (
              <button
                key={item.label}
                type="button"
                onClick={onOpenNovoLancamento}
                className="relative -top-2 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-lg transition-transform active:scale-[0.95] hover:opacity-95"
                aria-label="Adicionar lançamento"
              >
                <Plus className="h-6 w-6 stroke-[2.5]" />
              </button>
            );
          }

          const Icon = item.icon;
          const isActive = item.exact 
            ? pathname === item.href 
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 py-1 text-[11px] font-medium transition-colors ${
                isActive 
                  ? 'text-[var(--primary)]' 
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
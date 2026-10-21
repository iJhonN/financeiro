import { connection } from 'next/server';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { SignOutButton } from '@/components/auth/SignOutButton';
import {
  Landmark,
  Target,
  CreditCard,
  Tags,
  PieChart,
  ChevronRight,
  User,
  ShieldCheck,
} from 'lucide-react';

export const instant = false;

export default async function MaisPage() {
  await connection();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const menuItems = [
    {
      title: 'Relatórios e Análises',
      description: 'Distribuição analítica de despesas por categoria',
      href: '/relatorios',
      icon: <PieChart className="h-5 w-5 text-[var(--primary)]" />,
    },
    {
      title: 'Contas Bancárias e Carteiras',
      description: 'Gestão de saldos de contas correntes e dinheiro',
      href: '/contas',
      icon: <Landmark className="h-5 w-5 text-[var(--primary)]" />,
    },
    {
      title: 'Cartões de Crédito',
      description: 'Gestão de limites, datas de fecho e faturas',
      href: '/cartoes',
      icon: <CreditCard className="h-5 w-5 text-[var(--primary)]" />,
    },
    {
      title: 'Metas e Orçamentos',
      description: 'Objetivos de poupança e planeamento financeiro',
      href: '/metas',
      icon: <Target className="h-5 w-5 text-[var(--primary)]" />,
    },
    {
      title: 'Categorias',
      description: 'Classificação de despesas e receitas',
      href: '/categorias',
      icon: <Tags className="h-5 w-5 text-[var(--primary)]" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--text)]">Mais Opções</h1>
        <p className="text-xs text-[var(--text-muted)]">
          Configurações, entidades auxiliares e preferências da conta
        </p>
      </div>

      {/* Cartão de Identificação do Utilizador */}
      <section className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--text)] font-semibold border border-[var(--border)]">
          <User className="h-6 w-6 text-[var(--text-muted)]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[var(--text)] truncate">
            {user?.email}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-[var(--income)]">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Assinatura Ativa</span>
          </div>
        </div>
      </section>

      {/* Lista de Navegação Principal */}
      <section className="space-y-2">
        <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] px-1">
          Gestão Financeira
        </span>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] divide-y divide-[var(--border)] overflow-hidden">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between p-4 hover:bg-[var(--surface-2)]/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--surface-2)]">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    {item.description}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-[var(--text-muted)] group-hover:translate-x-0.5 transition-transform" />
            </Link>
          ))}
        </div>
      </section>

      {/* Ação de Logout */}
      <section className="pt-2">
        <SignOutButton />
      </section>
    </div>
  );
}
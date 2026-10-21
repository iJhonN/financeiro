import { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string;
  variant?: 'default' | 'income' | 'expense' | 'warning';
  icon?: ReactNode;
}

export function StatCard({
  label,
  value,
  variant = 'default',
  icon,
}: StatCardProps) {
  const variantStyles = {
    default: 'text-[var(--text)]',
    income: 'text-[var(--income)]',
    expense: 'text-[var(--expense)]',
    warning: 'text-[var(--warning)]',
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--text-muted)]">
          {label}
        </span>
        {icon && <span className="text-[var(--text-subtle)]">{icon}</span>}
      </div>
      <p
        className={`mt-2 text-lg sm:text-xl font-semibold tabular-nums tracking-tight ${variantStyles[variant]}`}
      >
        {value}
      </p>
    </div>
  );
}
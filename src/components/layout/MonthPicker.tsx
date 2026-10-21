'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, parse, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function MonthPicker() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Obtém o mês da URL ou assume o mês corrente (YYYY-MM)
  const mesParam = searchParams.get('mes') ?? format(new Date(), 'yyyy-MM');

  let currentDate: Date;
  try {
    currentDate = parse(mesParam, 'yyyy-MM', new Date());
    if (isNaN(currentDate.getTime())) {
      currentDate = new Date();
    }
  } catch {
    currentDate = new Date();
  }

  function handleNavigate(direction: 'prev' | 'next') {
    const newDate = direction === 'prev' 
      ? subMonths(currentDate, 1) 
      : addMonths(currentDate, 1);
    
    const formatted = format(newDate, 'yyyy-MM');
    const params = new URLSearchParams(searchParams.toString());
    params.set('mes', formatted);

    router.push(`${pathname}?${params.toString()}`);
  }

  const labelMes = format(currentDate, 'MMMM yyyy', { locale: ptBR });
  const labelCapitalizada = labelMes.charAt(0).toUpperCase() + labelMes.slice(1);

  return (
    <div className="flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-2 py-1">
      <button
        type="button"
        onClick={() => handleNavigate('prev')}
        className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] active:scale-[0.98] transition-all"
        aria-label="Mês anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <span className="min-w-[120px] text-center text-xs font-medium text-[var(--text)] tabular-nums select-none">
        {labelCapitalizada}
      </span>

      <button
        type="button"
        onClick={() => handleNavigate('next')}
        className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] active:scale-[0.98] transition-all"
        aria-label="Próximo mês"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
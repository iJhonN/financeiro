import {
  parseISO,
  format,
  isValid,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  getDaysInMonth,
  setDate,
} from 'date-fns';

/**
 * Valida se uma string segue estritamente o formato ISO de calendário 'YYYY-MM-DD'.
 */
export function isValidDateString(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }
  const parsed = parseISO(dateStr);
  return isValid(parsed) && format(parsed, 'yyyy-MM-dd') === dateStr;
}

/**
 * Retorna a data atual no fuso de referência em formato 'YYYY-MM-DD'.
 */
export function getTodayDateString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Retorna a competência mensal no formato 'YYYY-MM' ou 'YYYY-MM-01'.
 */
export function getMonthReference(date: Date | string = new Date()): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(startOfMonth(d), 'yyyy-MM-02').slice(0, 7) + '-01';
}

/**
 * Proteção clampDay: Ajusta o dia de vencimento desejado para o limite máximo real do mês.
 * Exemplo: Dia 31 em Fevereiro resulta no dia 28 (ou 29 em anos bissextos).
 */
export function clampDay(year: number, monthZeroIndexed: number, desiredDay: number): number {
  const baseDate = new Date(year, monthZeroIndexed, 1);
  const maxDays = getDaysInMonth(baseDate);
  return Math.min(Math.max(1, desiredDay), maxDays);
}

/**
 * Calcula a data exata de vencimento aplicando a regra imutável de clampDay.
 * Recebe a referência mensal ('YYYY-MM-DD') e o dia configurado do cartão.
 */
export function calculateDueDate(monthReference: string, dueDay: number): string {
  const parsed = parseISO(monthReference);
  const year = parsed.getFullYear();
  const month = parsed.getMonth();
  const safeDay = clampDay(year, month, dueDay);
  
  const finalDate = setDate(startOfMonth(parsed), safeDay);
  return format(finalDate, 'yyyy-MM-dd');
}

/**
 * Navega meses para a frente ou para trás sem mutação.
 */
export function shiftMonth(monthReference: string, offset: number): string {
  const parsed = parseISO(monthReference);
  const shifted = offset >= 0 ? addMonths(parsed, offset) : subMonths(parsed, Math.abs(offset));
  return format(startOfMonth(shifted), 'yyyy-MM-dd');
}

/**
 * Retorna o primeiro e o último dia do mês para filtros no banco de dados.
 */
export function getMonthBounds(monthReference: string): { start: string; end: string } {
  const parsed = parseISO(monthReference);
  return {
    start: format(startOfMonth(parsed), 'yyyy-MM-dd'),
    end: format(endOfMonth(parsed), 'yyyy-MM-dd'),
  };
}
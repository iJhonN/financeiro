/**
 * Converte um valor em centavos inteiros (bigint ou number) para string formatada em Real (BRL).
 * Ex: 1050 -> "R$ 10,50"
 */
export function formatCentavosToBRL(centavos: number | bigint): string {
  const valorNumerico = Number(centavos) / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valorNumerico);
}

/**
 * Converte string digitada no formato BRL para centavos inteiros (sem perda por ponto flutuante).
 * Ex: "10,50" -> 1050
 */
export function parseBRLToCentavos(valorBRL: string): number {
  const digitos = valorBRL.replace(/\D/g, '');
  if (!digitos) return 0;
  return parseInt(digitos, 10);
}
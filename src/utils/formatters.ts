// Formatadores no padrão brasileiro PT-BR exigidos pelas regras da engenharia (Item 25)

export function formatNumberBR(value: number | undefined | null, decimals: number = 2): string {
  if (value === undefined || value === null || isNaN(value)) return '0,00';
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

export function formatCurrencyBR(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

export function formatPercentBR(value: number | undefined | null, decimals: number = 2): string {
  if (value === undefined || value === null || isNaN(value)) return '0,00%';
  return `${formatNumberBR(value, decimals)}%`;
}

export function parseNumberBR(str: string): number {
  if (!str) return 0;
  // Substituir pontos de milhar e trocar vírgula decimal por ponto
  const clean = str.replace(/\./g, '').replace(',', '.');
  const val = parseFloat(clean);
  return isNaN(val) ? 0 : val;
}

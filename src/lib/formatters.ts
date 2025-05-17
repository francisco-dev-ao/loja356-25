
/**
 * Formats a number as currency in Angola format (with dot as thousand separator and comma for decimal places)
 */
export function formatCurrency(amount: number): string {
  // Use pt-AO locale for Angola formatting (dots for thousands and commas for decimals)
  return new Intl.NumberFormat('pt-AO', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

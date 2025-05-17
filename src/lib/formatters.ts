
/**
 * Formats a number as currency in Angola format (with dot as thousand separator and comma for decimal places)
 */
export function formatCurrency(amount: number): string {
  return amount.toLocaleString('pt-AO', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

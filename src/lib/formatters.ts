
/**
 * Formats a number as currency in Angola format (with dot as thousand separator and comma for decimal places)
 */
export function formatCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat('pt-AO', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
  
  // In Angola format, we need dots as thousand separators and commas for decimal places
  // This is already handled by 'pt-AO' locale, so we can return the formatted value directly
  return formatted;
}

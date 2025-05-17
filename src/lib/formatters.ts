
/**
 * Formats a number as currency in Angola format (with dot as thousand separator and comma for decimal places)
 */
export function formatCurrency(amount: number): string {
  // Use pt-AO locale which naturally uses dots for thousands and commas for decimals
  const formatted = new Intl.NumberFormat('pt-AO', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
  
  return formatted;
}


/**
 * Formats a number as currency based on the configured format settings
 */
export function formatCurrency(amount: number): string {
  // Get settings from localStorage if available
  const currencySettings = localStorage.getItem('currencySettings');
  let settings = {
    locale: 'pt-AO',
    currency: 'AOA',
    minDigits: 2,
    maxDigits: 2
  };

  if (currencySettings) {
    try {
      settings = JSON.parse(currencySettings);
    } catch (error) {
      console.error('Error parsing currency settings', error);
    }
  }

  // Use locale settings for formatting
  return new Intl.NumberFormat(settings.locale, {
    style: 'currency',
    currency: settings.currency,
    minimumFractionDigits: settings.minDigits,
    maximumFractionDigits: settings.maxDigits
  }).format(amount);
}

/**
 * Saves currency format settings to localStorage and Supabase
 */
export async function saveCurrencySettings(settings: {
  locale: string;
  currency: string;
  minDigits: number;
  maxDigits: number;
}) {
  // Save to localStorage for immediate use
  localStorage.setItem('currencySettings', JSON.stringify(settings));
}

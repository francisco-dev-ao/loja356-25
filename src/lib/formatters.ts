
// Type definition for currency settings
type CurrencySettings = {
  locale: string;
  currency: string;
  minDigits: number;
  maxDigits: number;
};

// Default currency settings
const defaultCurrencySettings: CurrencySettings = {
  locale: 'pt-AO',
  currency: 'AOA',
  minDigits: 2,
  maxDigits: 2
};

// Get currency settings from localStorage or use defaults
export const getCurrencySettings = (): CurrencySettings => {
  try {
    const savedSettings = localStorage.getItem('currencySettings');
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
  } catch (error) {
    console.error('Error reading currency settings from localStorage:', error);
  }
  return defaultCurrencySettings;
};

// Save currency settings to localStorage
export const saveCurrencySettings = (settings: CurrencySettings): void => {
  try {
    localStorage.setItem('currencySettings', JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving currency settings to localStorage:', error);
  }
};

// Parse a string to number, supporting both dot and comma as decimal separators
export const parseFormattedNumber = (value: string): number => {
  if (!value) return 0;
  
  // Remove pontos de separação de milhares e substitui vírgulas por pontos para a conversão
  const normalizedValue = value.replace(/\./g, '').replace(',', '.');
  const parsedValue = parseFloat(normalizedValue);
  
  return isNaN(parsedValue) ? 0 : parsedValue;
};

/**
 * Formata um número como preço no formato angolano: 5.000,00 kz
 * @param value - O valor a ser formatado
 * @returns Uma string formatada no padrão angolano com kz no final
 */
export const formatPrice = (value: number): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return "0,00 kz";
  }
  
  try {
    // Format using Intl with proper Angolan format
    const formatted = new Intl.NumberFormat('pt-AO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true,
    }).format(value);
    
    // Return with kz suffix (without duplicating the currency code)
    return formatted + " kz";
  } catch (error) {
    // Fallback manual formatting
    const formatted = value.toFixed(2).replace('.', ',');
    const parts = formatted.split(',');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return parts.join(',') + " kz";
  }
};

// Formatação de moeda com configurações - use formatPrice para padrão angolano
export const formatCurrency = (value: number): string => {
  return formatPrice(value);
};

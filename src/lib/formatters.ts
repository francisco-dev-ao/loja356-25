
// Format currency according to the settings

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

// Format a number as currency according to the settings but remove the symbol and add kz at the end
export const formatCurrency = (value: number): string => {
  const settings = getCurrencySettings();
  
  try {
    const formatted = new Intl.NumberFormat(settings.locale, {
      style: 'decimal', // Changed from 'currency' to 'decimal' to remove the currency symbol
      minimumFractionDigits: settings.minDigits,
      maximumFractionDigits: settings.maxDigits
    }).format(value);
    
    return `${formatted} kz`; // Add kz at the end
  } catch (error) {
    console.error('Error formatting currency:', error);
    
    // Fallback to a simple format if the Intl formatter fails
    return `${value.toFixed(settings.minDigits)} kz`;
  }
};

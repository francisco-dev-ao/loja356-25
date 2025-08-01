
import { formatPrice as formatPriceUtil } from './utils';

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
  return formatPriceUtil(value);
};

// Formatação de moeda com configurações - use formatPrice para padrão angolano
export const formatCurrency = (value: number): string => {
  return formatPrice(value);
};

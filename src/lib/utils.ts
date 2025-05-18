import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility to combine Tailwind CSS classes conditionally
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Calculate the discounted price based on base price, discount type, and discount value
 */
export const calculateDiscountedPrice = (
  basePrice: number,
  discountType: 'percentage' | 'fixed' | null,
  discountValue: number | null
): number => {
  if (!discountType || !discountValue || discountValue <= 0 || !basePrice) {
    return basePrice || 0;
  }

  if (discountType === 'percentage') {
    // Ensure percentage is between 0 and 100
    const percentage = Math.min(Math.max(discountValue, 0), 100);
    return basePrice * (1 - percentage / 100);
  }

  if (discountType === 'fixed') {
    // Ensure discount doesn't make price negative
    return Math.max(basePrice - discountValue, 0);
  }

  return basePrice;
};

/**
 * Format a number as price in Angolan format: 5.000,00 kz
 * @param value - The value to be formatted
 * @returns A string formatted in Angolan standard with kz at the end
 */
export const formatCurrency = (value: number): string => {
  return formatPrice(value);
};

/**
 * Format a number as price in Angolan format: 5.000,00 kz
 * @param value - The value to be formatted
 * @returns A string formatted in Angolan standard with kz at the end
 */
export const formatPrice = (value: number): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return "0 kz";
  }
    try {
    // Format using custom formatting for Angolan currency without decimals
    const integerValue = Math.round(value); // Arredonda para o número inteiro mais próximo
    const formattedInteger = integerValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    // Return with proper formatting: 1.234 kz
    return `${formattedInteger} kz`;
  } catch {
    // Fallback formatting
    const formatted = value.toFixed(2).replace('.', ',');
    const parts = formatted.split(',');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return parts.join(',') + " kz";
  }
};

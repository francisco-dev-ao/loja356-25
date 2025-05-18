import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatPrice } from "./formatters"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Utilitário para aplicar classes condicionalmente baseadas no tamanho da tela
 * @param baseClasses - Classes que são aplicadas a todos os tamanhos de tela
 * @param responsiveClasses - Objeto com classes específicas para diferentes tamanhos de tela
 */
export function responsive(
  baseClasses: string, 
  responsiveClasses?: {
    xs?: string, // para telas extra pequenas
    sm?: string, // para telas pequenas
    md?: string, // para telas médias
    lg?: string, // para telas grandes
    xl?: string, // para telas extra grandes
    '2xl'?: string // para telas muito grandes
  }
) {
  if (!responsiveClasses) {
    return baseClasses;
  }
  
  let classString = baseClasses;
  
  if (responsiveClasses.xs) {
    classString += ` xs:${responsiveClasses.xs}`;
  }
  
  if (responsiveClasses.sm) {
    classString += ` sm:${responsiveClasses.sm}`;
  }
  
  if (responsiveClasses.md) {
    classString += ` md:${responsiveClasses.md}`;
  }
  
  if (responsiveClasses.lg) {
    classString += ` lg:${responsiveClasses.lg}`;
  }
  
  if (responsiveClasses.xl) {
    classString += ` xl:${responsiveClasses.xl}`;
  }
  
  if (responsiveClasses['2xl']) {
    classString += ` 2xl:${responsiveClasses['2xl']}`;
  }
  
  return classString;
}

/**
 * Formata valores numéricos para exibição
 */
export const formatCurrency = (value: number, locale = 'pt-AO', currency = 'AOA') => {
  return formatPrice(value);
};

/**
 * Trunca texto para exibição em dispositivos móveis
 */
export const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

/**
 * Calcula o preço final com desconto
 * @param basePrice - Preço base do produto
 * @param discountType - Tipo de desconto ('percentage' ou 'fixed')
 * @param discountValue - Valor do desconto
 */
export const calculateDiscountedPrice = (
  basePrice: number,
  discountType?: string | null,
  discountValue?: number | null
): number => {
  if (!basePrice || !discountType || !discountValue) {
    return basePrice;
  }

  if (discountType === 'percentage' && discountValue > 0) {
    // Ensure percentage is between 0 and 100
    const percentage = Math.min(Math.max(discountValue, 0), 100);
    return basePrice * (1 - percentage / 100);
  } 
  
  if (discountType === 'fixed' && discountValue > 0) {
    // Ensure discount doesn't make price negative
    return Math.max(basePrice - discountValue, 0);
  }

  return basePrice;
};

/**
 * Aplica um cupom de desconto ao total
 * @param total - Valor total
 * @param discountType - Tipo de desconto ('percentage' ou 'fixed')
 * @param discountValue - Valor do desconto
 */
export const applyCouponDiscount = (
  total: number,
  discountType: string,
  discountValue: number
): number => {
  if (discountType === 'percentage') {
    // Ensure percentage is between 0 and 100
    const percentage = Math.min(Math.max(discountValue, 0), 100);
    return total * (1 - percentage / 100);
  } 
  
  if (discountType === 'fixed') {
    // Ensure discount doesn't make total negative
    return Math.max(total - discountValue, 0);
  }

  return total;
};

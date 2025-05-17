
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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
export const formatCurrency = (value: number, locale = 'pt-BR', currency = 'BRL') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
};

/**
 * Trunca texto para exibição em dispositivos móveis
 */
export const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};



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

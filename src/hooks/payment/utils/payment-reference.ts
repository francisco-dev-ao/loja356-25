
/**
 * Utility functions for payment reference generation and storage
 */

/**
 * Generate a unique reference ID based on order ID
 */
export const generateReference = (orderId: string): string => {
  return `${orderId}-AH-${Math.random().toString(36).substring(2, 15).toUpperCase()}`;
};

/**
 * Store payment reference in local storage
 */
export const storePaymentReference = (orderId: string, reference: string): void => {
  localStorage.setItem(`refer_rce_${orderId}`, reference);
};

/**
 * Get payment reference from local storage
 */
export const getStoredReference = (orderId: string): string | null => {
  return localStorage.getItem(`refer_rce_${orderId}`);
};

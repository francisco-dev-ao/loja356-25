/**
 * Utility functions for payment reference generation and storage
 */

/**
 * Generate a unique reference ID based on order ID or timestamp
 */
export const generateReference = (orderId?: string): string => {
  // If no orderId is provided (like before the order is created), use a timestamp
  const baseId = orderId || `TMP-${Date.now()}`;
  // Generate random alphanumeric string
  const randomPart = Math.random().toString(36).substring(2, 15).toUpperCase();
  return `${baseId}-AH-${randomPart}`;
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

/**
 * Generate a new reference or get existing one for an order
 */
export const getOrCreateReference = (orderId: string): string => {
  // Try to get existing reference
  const existingRef = getStoredReference(orderId);
  
  // If reference exists, return it
  if (existingRef) return existingRef;
  
  // Otherwise generate a new reference, store it and return it
  const newRef = generateReference(orderId);
  storePaymentReference(orderId, newRef);
  return newRef;
};

/**
 * Generate temporary reference before order creation
 */
export const generateTemporaryReference = (): string => {
  return generateReference();
};

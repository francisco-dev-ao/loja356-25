
import { CartState, CartAction, CartItem } from './cart-types';

export const initialState: CartState = {
  items: [],
  total: 0,
  appliedCoupon: null
};

function recalculateCoupon(state: CartState, items: CartItem[]): CartState {
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  if (state.appliedCoupon) {
    const { code, discountType, discountValue } = state.appliedCoupon;
    let discountedTotal = total;
    if (discountType === 'percentage') {
      const percentage = Math.min(Math.max(discountValue, 0), 100);
      discountedTotal = total * (1 - percentage / 100);
    } else if (discountType === 'fixed') {
      discountedTotal = Math.max(total - discountValue, 0);
    }
    return {
      ...state,
      items,
      total,
      appliedCoupon: {
        code,
        discountType,
        discountValue,
        discountedTotal
      }
    };
  }
  return { ...state, items, total };
}

export const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        (item) => item.id === action.payload.id
      );

      if (existingItemIndex >= 0) {
        // Item already exists, update quantity
        const updatedItems = [...state.items];
        // Explicitly add the incoming quantity to existing quantity
        const newQuantity = updatedItems[existingItemIndex].quantity + action.payload.quantity;
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: newQuantity,
        };

        return recalculateCoupon(state, updatedItems);
      } else {
        // Add new item with the specified quantity (or default to 1)
        const quantity = action.payload.quantity || 1;
        const newItem = { ...action.payload, quantity };
        return recalculateCoupon(state, [...state.items, newItem]);
      }
    }

    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return state;
      }

      const updatedItems = state.items.map((item) =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );

      return recalculateCoupon(state, updatedItems);
    }

    case 'REMOVE_ITEM': {
      const filteredItems = state.items.filter((item) => item.id !== action.payload.id);
      return recalculateCoupon(state, filteredItems);
    }

    case 'CLEAR_CART':
      return initialState;
    
    case 'LOAD_CART':
      return {
        ...action.payload,
        items: action.payload.items || []
      };

    case 'APPLY_COUPON': {
      const { code, discountType, discountValue } = action.payload;
      let discountedTotal = state.total;
      
      if (discountType === 'percentage') {
        const percentage = Math.min(Math.max(discountValue, 0), 100);
        discountedTotal = state.total * (1 - percentage / 100);
      } else if (discountType === 'fixed') {
        discountedTotal = Math.max(state.total - discountValue, 0);
      }
      
      return {
        ...state,
        appliedCoupon: {
          code,
          discountType,
          discountValue,
          discountedTotal
        }
      };
    }

    case 'REMOVE_COUPON':
      return {
        ...state,
        appliedCoupon: null
      };

    default:
      return state;
  }
};

import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import type { StorefrontCart } from "@/lib/medusa/types";

/**
 * Cart slice — Medusa-aware.
 *
 * The slice keeps the same public action names that existing UI components
 * already dispatch (addItemToCart, removeItemFromCart, updateCartItemQuantity,
 * removeAllItemsFromCart) and the same selectors (selectCartItems,
 * selectTotalPrice). The synchronous reducers update local state
 * optimistically; thunks in cart-thunks.ts mirror the operations against the
 * Medusa cart API and reconcile via `replaceCartFromServer`.
 *
 * `id` is widened to `string | number` because Medusa identifiers are strings.
 * For server-backed items, `id` carries the Medusa line item id; for purely
 * local items it carries whatever the dispatch site passed (variantId or the
 * legacy numeric id from the static template).
 */
type CartItem = {
  id: string | number;
  title: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
  variantId?: string;
  productId?: string;
  thumbnail?: string | null;
};

type Totals = {
  subtotal: number;
  total: number;
  taxTotal: number;
  shippingTotal: number;
};

type InitialState = {
  cartId: string | null;
  currencyCode: string;
  items: CartItem[];
  totals: Totals;
  hydrated: boolean;
};

const emptyTotals: Totals = {
  subtotal: 0,
  total: 0,
  taxTotal: 0,
  shippingTotal: 0,
};

const initialState: InitialState = {
  cartId: null,
  currencyCode: "bdt",
  items: [],
  totals: emptyTotals,
  hydrated: false,
};

export const cart = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItemToCart: (state, action: PayloadAction<CartItem>) => {
      const incoming = action.payload;
      // Identity match: prefer variantId (server semantics), fall back to id.
      const existing = state.items.find((item) => {
        if (incoming.variantId && item.variantId)
          return item.variantId === incoming.variantId;
        return item.id === incoming.id;
      });
      if (existing) {
        existing.quantity += incoming.quantity;
      } else {
        state.items.push({ ...incoming });
      }
    },
    removeItemFromCart: (
      state,
      action: PayloadAction<string | number>
    ) => {
      const itemId = action.payload;
      state.items = state.items.filter((item) => item.id !== itemId);
    },
    updateCartItemQuantity: (
      state,
      action: PayloadAction<{ id: string | number; quantity: number }>
    ) => {
      const { id, quantity } = action.payload;
      const existingItem = state.items.find((item) => item.id === id);
      if (existingItem) {
        existingItem.quantity = quantity;
      }
    },
    removeAllItemsFromCart: (state) => {
      state.items = [];
      state.totals = emptyTotals;
    },
    /**
     * Reconcile local state with a server cart. Called from thunks after a
     * successful Medusa mutation, and on hydration.
     */
    replaceCartFromServer: (
      state,
      action: PayloadAction<StorefrontCart | null>
    ) => {
      state.hydrated = true;
      const cart = action.payload;
      if (!cart) {
        // Server unreachable — keep local state untouched.
        return;
      }
      state.cartId = cart.id;
      state.currencyCode = cart.currencyCode;
      state.items = cart.lines.map((line) => ({
        id: line.id,
        title: line.title,
        price: line.originalPrice,
        discountedPrice: line.unitPrice,
        quantity: line.quantity,
        variantId: line.variantId,
        productId: line.productId,
        thumbnail: line.thumbnail,
        imgs: line.thumbnail
          ? { thumbnails: [line.thumbnail], previews: [line.thumbnail] }
          : undefined,
      }));
      state.totals = {
        subtotal: cart.subtotal,
        total: cart.total,
        taxTotal: cart.taxTotal,
        shippingTotal: cart.shippingTotal,
      };
    },
    markHydrated: (state) => {
      state.hydrated = true;
    },
  },
});

export const selectCartItems = (state: RootState) => state.cartReducer.items;
export const selectCartId = (state: RootState) => state.cartReducer.cartId;
export const selectCartTotals = (state: RootState) => state.cartReducer.totals;
export const selectCurrencyCode = (state: RootState) =>
  state.cartReducer.currencyCode;
export const selectIsHydrated = (state: RootState) =>
  state.cartReducer.hydrated;

export const selectTotalPrice = createSelector(
  [selectCartItems, selectCartTotals],
  (items, totals) => {
    // Prefer server-calculated total when available (post-hydration), fall
    // back to local sum so the UI renders immediately on first paint.
    if (totals.total > 0) return totals.total;
    return items.reduce(
      (total, item) => total + item.discountedPrice * item.quantity,
      0
    );
  }
);

export const {
  addItemToCart,
  removeItemFromCart,
  updateCartItemQuantity,
  removeAllItemsFromCart,
  replaceCartFromServer,
  markHydrated,
} = cart.actions;

export type { CartItem };
export default cart.reducer;

/**
 * Cart thunks. Wrap the Medusa cart helpers in createAsyncThunk and dispatch
 * `replaceCartFromServer` so the slice reflects the canonical server state
 * after each mutation. These thunks are the cart's source of truth — the
 * synchronous reducers in cart-slice.ts are kept for optimistic updates and
 * the rare offline case.
 */
import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  addLineItem,
  completeCart,
  getCart,
  getOrCreateCart,
  removeLineItem,
  setShippingMethod,
  updateLineItem,
} from "@/lib/medusa/cart";
import {
  addItemToCart,
  markHydrated,
  removeItemFromCart,
  replaceCartFromServer,
  updateCartItemQuantity,
} from "./cart-slice";
import type { CartItem } from "./cart-slice";

export const hydrateCart = createAsyncThunk(
  "cart/hydrate",
  async (_arg, { dispatch }) => {
    const cart = await getCart();
    if (cart) {
      dispatch(replaceCartFromServer(cart));
    } else {
      dispatch(markHydrated());
    }
    return cart;
  }
);

export const ensureCart = createAsyncThunk(
  "cart/ensure",
  async (_arg, { dispatch }) => {
    const cart = await getOrCreateCart();
    if (cart) dispatch(replaceCartFromServer(cart));
    return cart;
  }
);

/**
 * Add an item to the cart.
 *
 * - When called with a Medusa-aware payload (item.variantId set), the line
 *   item is created server-side and the entire cart is replaced from the
 *   server response (which includes the real Medusa line item id).
 * - When called with the legacy static-data payload (no variantId), the
 *   item is appended to local state only. This keeps the existing template
 *   demo working before any seed data lands.
 */
export const addItemToCartAsync = createAsyncThunk(
  "cart/addItemAsync",
  async (item: CartItem, { dispatch }) => {
    // Optimistic local update so the cart sidebar opens with content.
    dispatch(addItemToCart(item));
    if (!item.variantId) return null;
    const cart = await addLineItem(item.variantId, item.quantity || 1);
    if (cart) dispatch(replaceCartFromServer(cart));
    return cart;
  }
);

export const updateCartItemQuantityAsync = createAsyncThunk(
  "cart/updateQuantityAsync",
  async (
    payload: { id: string | number; quantity: number },
    { dispatch }
  ) => {
    dispatch(updateCartItemQuantity(payload));
    if (typeof payload.id !== "string") return null;
    const cart = await updateLineItem(payload.id, payload.quantity);
    if (cart) dispatch(replaceCartFromServer(cart));
    return cart;
  }
);

export const removeItemFromCartAsync = createAsyncThunk(
  "cart/removeItemAsync",
  async (id: string | number, { dispatch }) => {
    dispatch(removeItemFromCart(id));
    if (typeof id !== "string") return null;
    const cart = await removeLineItem(id);
    if (cart) dispatch(replaceCartFromServer(cart));
    return cart;
  }
);

export const setShippingMethodAsync = createAsyncThunk(
  "cart/setShippingAsync",
  async (optionId: string, { dispatch }) => {
    const cart = await setShippingMethod(optionId);
    if (cart) dispatch(replaceCartFromServer(cart));
    return cart;
  }
);

export const completeCartAsync = createAsyncThunk(
  "cart/completeAsync",
  async () => {
    const result = await completeCart();
    return result;
  }
);

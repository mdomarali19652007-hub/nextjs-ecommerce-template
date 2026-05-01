"use client";

import { store } from "./store";
import { Provider } from "react-redux";
import React, { useEffect } from "react";
import { hydrateCart } from "./features/cart-thunks";

function CartHydrator() {
  useEffect(() => {
    // Fire-and-forget hydration. The thunk degrades to a no-op if the Medusa
    // backend is unreachable so the storefront still renders without a server.
    store.dispatch(hydrateCart());
  }, []);
  return null;
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <CartHydrator />
      {children}
    </Provider>
  );
}

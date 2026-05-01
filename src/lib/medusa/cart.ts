/**
 * Cart helpers backing the Redux cart slice.
 *
 * Persists the Medusa cart id in localStorage under `medusa_cart_id` so the
 * cart survives reloads. All operations are guarded behind a try/catch so
 * Medusa being offline degrades to an empty/local cart instead of a runtime
 * crash. The Redux slice still updates optimistically, then reconciles when
 * the server response comes back.
 */
import { medusa } from "./client";
import { getRegionId } from "./region";
import type { StoreCart, StorefrontCart, StorefrontCartLine } from "./types";

const STORAGE_KEY = "medusa_cart_id";

const readId = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

const writeId = (id: string | null) => {
  if (typeof window === "undefined") return;
  try {
    if (id) window.localStorage.setItem(STORAGE_KEY, id);
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore storage errors (private mode, etc.) */
  }
};

const CART_FIELDS =
  "*items,*items.variant,*items.product,*items.thumbnail,*shipping_options,*shipping_methods,*payment_collection,*region";

export function mapCart(cart: StoreCart): StorefrontCart {
  const lines: StorefrontCartLine[] = (cart.items ?? []).map((item) => ({
    id: item.id,
    variantId: item.variant_id ?? "",
    productId: item.product_id ?? "",
    title: item.title ?? item.product_title ?? "",
    thumbnail: item.thumbnail ?? null,
    unitPrice: typeof item.unit_price === "number" ? item.unit_price : 0,
    originalPrice:
      typeof (item as unknown as { compare_at_unit_price?: number })
        .compare_at_unit_price === "number"
        ? (item as unknown as { compare_at_unit_price?: number })
            .compare_at_unit_price!
        : typeof item.unit_price === "number"
        ? item.unit_price
        : 0,
    quantity: item.quantity ?? 1,
  }));

  return {
    id: cart.id,
    regionId: cart.region_id ?? null,
    currencyCode: cart.currency_code ?? "bdt",
    lines,
    subtotal: typeof cart.subtotal === "number" ? cart.subtotal : 0,
    total: typeof cart.total === "number" ? cart.total : 0,
    taxTotal: typeof cart.tax_total === "number" ? cart.tax_total : 0,
    shippingTotal:
      typeof cart.shipping_total === "number" ? cart.shipping_total : 0,
  };
}

async function retrieve(id: string): Promise<StoreCart | null> {
  try {
    const { cart } = await medusa.store.cart.retrieve(id, {
      fields: CART_FIELDS,
    });
    return cart ?? null;
  } catch {
    return null;
  }
}

export async function getOrCreateCart(): Promise<StorefrontCart | null> {
  const existing = readId();
  if (existing) {
    const cart = await retrieve(existing);
    if (cart) return mapCart(cart);
    writeId(null); // stale id
  }
  try {
    const regionId = await getRegionId();
    const { cart } = await medusa.store.cart.create({
      ...(regionId ? { region_id: regionId } : {}),
    });
    writeId(cart.id);
    return mapCart(cart);
  } catch {
    return null;
  }
}

export async function getCart(): Promise<StorefrontCart | null> {
  const id = readId();
  if (!id) return null;
  const cart = await retrieve(id);
  return cart ? mapCart(cart) : null;
}

async function ensureCartId(): Promise<string | null> {
  const existing = readId();
  if (existing) return existing;
  const created = await getOrCreateCart();
  return created?.id ?? null;
}

export async function addLineItem(
  variantId: string,
  quantity: number
): Promise<StorefrontCart | null> {
  const cartId = await ensureCartId();
  if (!cartId) return null;
  try {
    const { cart } = await medusa.store.cart.createLineItem(cartId, {
      variant_id: variantId,
      quantity,
    });
    return mapCart(cart);
  } catch {
    return null;
  }
}

export async function updateLineItem(
  lineItemId: string,
  quantity: number
): Promise<StorefrontCart | null> {
  const cartId = readId();
  if (!cartId) return null;
  try {
    const { cart } = await medusa.store.cart.updateLineItem(
      cartId,
      lineItemId,
      { quantity }
    );
    return mapCart(cart);
  } catch {
    return null;
  }
}

export async function removeLineItem(
  lineItemId: string
): Promise<StorefrontCart | null> {
  const cartId = readId();
  if (!cartId) return null;
  try {
    const result = await medusa.store.cart.deleteLineItem(cartId, lineItemId);
    // Some SDK versions return the deleted item only; refetch to be safe.
    if ((result as unknown as { parent?: StoreCart }).parent) {
      return mapCart((result as unknown as { parent: StoreCart }).parent);
    }
    const refreshed = await retrieve(cartId);
    return refreshed ? mapCart(refreshed) : null;
  } catch {
    return null;
  }
}

export async function setShippingMethod(
  optionId: string
): Promise<StorefrontCart | null> {
  const cartId = readId();
  if (!cartId) return null;
  try {
    const { cart } = await medusa.store.cart.addShippingMethod(cartId, {
      option_id: optionId,
    });
    return mapCart(cart);
  } catch {
    return null;
  }
}

export async function listShippingOptions() {
  const cartId = readId();
  if (!cartId) return [];
  try {
    const { shipping_options } = await medusa.store.fulfillment.listCartOptions(
      { cart_id: cartId }
    );
    return shipping_options ?? [];
  } catch {
    return [];
  }
}

export async function initiatePayment() {
  const cartId = readId();
  if (!cartId) return null;
  try {
    const { payment_collection } =
      await medusa.store.payment.initiatePaymentSession(
        { id: cartId } as unknown as StoreCart,
        { provider_id: "pp_system_default" }
      );
    return payment_collection ?? null;
  } catch {
    return null;
  }
}

export async function completeCart(): Promise<{
  ok: boolean;
  orderId?: string;
}> {
  const cartId = readId();
  if (!cartId) return { ok: false };
  try {
    const result = await medusa.store.cart.complete(cartId);
    if ((result as unknown as { type?: string }).type === "order") {
      writeId(null);
      return {
        ok: true,
        orderId: (result as unknown as { order: { id: string } }).order.id,
      };
    }
    return { ok: false };
  } catch {
    return { ok: false };
  }
}

export const __cartStorageKey = STORAGE_KEY;

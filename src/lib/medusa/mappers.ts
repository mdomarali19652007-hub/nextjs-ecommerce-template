/**
 * Field mapping reference: Medusa StoreProduct → StorefrontProduct.
 *
 * | Storefront field           | Medusa source                                       |
 * |----------------------------|------------------------------------------------------|
 * | id                         | product.id (string)                                  |
 * | handle                     | product.handle                                       |
 * | title                      | product.title                                        |
 * | imgs.thumbnails            | product.images[*].url, fallback to [product.thumbnail] |
 * | imgs.previews              | same as thumbnails                                   |
 * | price                      | variant.calculated_price.calculated_amount           |
 * | discountedPrice            | variant.calculated_price.original_amount (or price)  |
 * | variantId                  | product.variants[0].id (default variant)             |
 * | inStock                    | variant.inventory_quantity > 0 OR manage_inventory == false |
 * | reviews                    | product.metadata.reviews (template-only, seeded)     |
 * | metadata                   | product.metadata                                     |
 *
 * Anything in the static template with no Medusa equivalent (review counts,
 * the storage/sim/type option arrays in ShopDetails) is stored under
 * product.metadata at seed time and read back here with safe defaults.
 *
 * NOTE: Medusa's calculated prices are floats already (with a precision
 * rule per currency). We do not multiply or divide — the seed inserts the
 * BDT face value and that is what we render.
 */
import type { StoreProduct, StoreProductVariant, StorefrontProduct } from "./types";

const safeNumber = (n: unknown, fallback: number): number => {
  return typeof n === "number" && Number.isFinite(n) ? n : fallback;
};

const pickDefaultVariant = (
  product: StoreProduct
): StoreProductVariant | undefined => {
  if (!product.variants || product.variants.length === 0) return undefined;
  // Prefer in-stock variants, fall back to first.
  const inStock = product.variants.find((v) => {
    const qty = (v as unknown as { inventory_quantity?: number }).inventory_quantity;
    return typeof qty === "number" ? qty > 0 : true;
  });
  return inStock ?? product.variants[0];
};

const variantPrice = (variant: StoreProductVariant | undefined) => {
  // calculated_price is populated when the request includes a region/currency.
  const calc = (variant as unknown as {
    calculated_price?: {
      calculated_amount?: number | null;
      original_amount?: number | null;
    };
  })?.calculated_price;
  return {
    price: safeNumber(calc?.calculated_amount, 0),
    original: safeNumber(
      calc?.original_amount ?? calc?.calculated_amount,
      safeNumber(calc?.calculated_amount, 0)
    ),
  };
};

const collectImages = (product: StoreProduct): string[] => {
  const fromImages = (product.images ?? [])
    .map((img) => img?.url)
    .filter((url): url is string => Boolean(url));
  if (fromImages.length > 0) return fromImages;
  if (product.thumbnail) return [product.thumbnail];
  return [];
};

const variantInStock = (variant: StoreProductVariant | undefined): boolean => {
  if (!variant) return false;
  const v = variant as unknown as {
    inventory_quantity?: number;
    manage_inventory?: boolean;
    allow_backorder?: boolean;
  };
  if (v.allow_backorder) return true;
  if (v.manage_inventory === false) return true;
  return typeof v.inventory_quantity === "number" ? v.inventory_quantity > 0 : true;
};

export function mapMedusaProduct(product: StoreProduct): StorefrontProduct {
  const variant = pickDefaultVariant(product);
  const { price, original } = variantPrice(variant);
  const images = collectImages(product);
  const reviews = safeNumber(
    (product.metadata as Record<string, unknown> | null)?.reviews,
    0
  );

  return {
    id: product.id,
    title: product.title ?? "",
    reviews,
    // The template renders `discountedPrice` as the live price and `price`
    // as the strike-through original. Mirror that here so the existing UI
    // shows the correct numbers without changing markup.
    price: original,
    discountedPrice: price || original,
    imgs:
      images.length > 0
        ? {
            thumbnails: images,
            previews: images,
          }
        : undefined,
    handle: product.handle ?? undefined,
    variantId: variant?.id,
    inStock: variantInStock(variant),
    metadata: (product.metadata as Record<string, unknown> | null) ?? undefined,
  };
}

export function mapMedusaProducts(products: StoreProduct[]): StorefrontProduct[] {
  return products.map(mapMedusaProduct);
}

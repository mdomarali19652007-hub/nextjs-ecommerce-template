/**
 * Storefront product type. Widened from the original static-template shape
 * to carry Medusa-aware fields (handle, variantId, inStock, metadata).
 *
 * Existing UI components only read `id`, `title`, `price`, `discountedPrice`,
 * `reviews`, and `imgs` — those stay required so the swap is invisible at
 * the markup layer. Medusa-specific fields are optional so consumers that
 * still rely on the legacy shape (e.g. tests, story files) keep compiling.
 */
export type Product = {
  id: string | number;
  title: string;
  reviews: number;
  price: number;
  discountedPrice: number;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
  handle?: string;
  variantId?: string;
  inStock?: boolean;
  metadata?: Record<string, unknown>;
};

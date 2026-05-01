/**
 * Storefront-facing types. Wrap the raw Medusa types with the shape the
 * existing UI components expect, so the migration from static shopData to
 * Medusa is a drop-in replacement.
 */
import type { HttpTypes } from "@medusajs/types";

export type StoreProduct = HttpTypes.StoreProduct;
export type StoreProductVariant = HttpTypes.StoreProductVariant;
export type StoreCart = HttpTypes.StoreCart;
export type StoreRegion = HttpTypes.StoreRegion;
export type StoreCategory = HttpTypes.StoreProductCategory;
export type StoreCollection = HttpTypes.StoreCollection;

/**
 * Shape consumed by every existing UI component. Mirrors the original
 * Product type from src/types/product.ts but widened with optional Medusa
 * fields (handle, variantId, inStock, metadata) so we never silently drop
 * data that has no template-side equivalent.
 */
export interface StorefrontProduct {
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
}

export interface StorefrontCategory {
  id: string;
  title: string;
  handle: string;
  img: string;
}

export interface StorefrontCartLine {
  id: string;
  variantId: string;
  productId: string;
  title: string;
  thumbnail?: string | null;
  unitPrice: number;
  originalPrice: number;
  quantity: number;
}

export interface StorefrontCart {
  id: string;
  regionId: string | null;
  currencyCode: string;
  lines: StorefrontCartLine[];
  subtotal: number;
  total: number;
  taxTotal: number;
  shippingTotal: number;
}

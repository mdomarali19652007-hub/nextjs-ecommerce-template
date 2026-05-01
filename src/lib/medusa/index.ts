/**
 * Public surface of the Medusa data layer. Components that need anything
 * from this module should import from "@/lib/medusa", not the individual
 * submodule files, so the surface stays small and discoverable.
 */
export { medusa } from "./client";
export {
  getProducts,
  getProductByHandle,
  getProductById,
  getAllProductHandles,
  getCategories,
  getCollections,
} from "./products";
export { getRegion, getRegionId, getCurrencyCode } from "./region";
export {
  getOrCreateCart,
  getCart,
  addLineItem,
  updateLineItem,
  removeLineItem,
  setShippingMethod,
  listShippingOptions,
  initiatePayment,
  completeCart,
  mapCart,
} from "./cart";
export type {
  StorefrontProduct,
  StorefrontCategory,
  StorefrontCart,
  StorefrontCartLine,
  StoreProduct,
  StoreProductVariant,
  StoreCart,
  StoreRegion,
  StoreCategory,
  StoreCollection,
} from "./types";

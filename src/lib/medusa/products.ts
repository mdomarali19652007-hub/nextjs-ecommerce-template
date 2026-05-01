/**
 * Product / category data-access layer.
 *
 * All product reads go through these helpers. Server Components call them
 * directly; Client Components receive results as props from a parent
 * Server Component. This is the single point where Medusa is queried for
 * the storefront's catalog.
 */
import { cache } from "react";
import { medusa } from "./client";
import { getRegionId } from "./region";
import { mapMedusaProduct, mapMedusaProducts } from "./mappers";
import type {
  StorefrontCategory,
  StorefrontProduct,
  StoreCategory,
  StoreCollection,
} from "./types";

const PRODUCT_FIELDS =
  "*variants,*variants.calculated_price,*images,*options,*tags,*categories,*collection";

const swallow = async <T>(fn: () => Promise<T>, fallback: T): Promise<T> => {
  try {
    return await fn();
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn("[medusa]", (err as Error).message);
    }
    return fallback;
  }
};

export const getProducts = cache(
  async (
    params: {
      limit?: number;
      offset?: number;
      handle?: string;
      categoryId?: string;
      collectionId?: string;
      tag?: string;
      q?: string;
    } = {}
  ): Promise<StorefrontProduct[]> => {
    const regionId = await getRegionId();
    return swallow(async () => {
      const { products } = await medusa.store.product.list({
        limit: params.limit ?? 24,
        offset: params.offset ?? 0,
        ...(regionId ? { region_id: regionId } : {}),
        ...(params.handle ? { handle: params.handle } : {}),
        ...(params.categoryId ? { category_id: [params.categoryId] } : {}),
        ...(params.collectionId ? { collection_id: [params.collectionId] } : {}),
        ...(params.tag ? { tag_id: [params.tag] } : {}),
        ...(params.q ? { q: params.q } : {}),
        fields: PRODUCT_FIELDS,
      });
      return mapMedusaProducts(products ?? []);
    }, [] as StorefrontProduct[]);
  }
);

export const getProductByHandle = cache(
  async (handle: string): Promise<StorefrontProduct | null> => {
    const regionId = await getRegionId();
    return swallow(async () => {
      const { products } = await medusa.store.product.list({
        handle,
        limit: 1,
        ...(regionId ? { region_id: regionId } : {}),
        fields: PRODUCT_FIELDS,
      });
      const product = products?.[0];
      return product ? mapMedusaProduct(product) : null;
    }, null);
  }
);

export const getProductById = cache(
  async (id: string): Promise<StorefrontProduct | null> => {
    const regionId = await getRegionId();
    return swallow(async () => {
      const { product } = await medusa.store.product.retrieve(id, {
        ...(regionId ? { region_id: regionId } : {}),
        fields: PRODUCT_FIELDS,
      });
      return product ? mapMedusaProduct(product) : null;
    }, null);
  }
);

export const getAllProductHandles = cache(async (): Promise<string[]> => {
  return swallow(async () => {
    const { products } = await medusa.store.product.list({
      limit: 200,
      fields: "handle",
    });
    return (products ?? [])
      .map((p) => p.handle)
      .filter((h): h is string => Boolean(h));
  }, [] as string[]);
});

const CATEGORY_IMAGE_FALLBACK = "/images/categories/categories-01.png";

export const getCategories = cache(async (): Promise<StorefrontCategory[]> => {
  return swallow(async () => {
    const { product_categories } = await medusa.store.category.list({
      limit: 50,
      fields: "id,name,handle,metadata",
    });
    return (product_categories ?? []).map((cat: StoreCategory) => {
      const meta = (cat.metadata ?? {}) as Record<string, unknown>;
      const image = typeof meta.image === "string" ? meta.image : undefined;
      return {
        id: cat.id,
        title: cat.name ?? "",
        handle: cat.handle ?? "",
        img: image ?? CATEGORY_IMAGE_FALLBACK,
      };
    });
  }, [] as StorefrontCategory[]);
});

export const getCollections = cache(async (): Promise<StoreCollection[]> => {
  return swallow(async () => {
    const { collections } = await medusa.store.collection.list({ limit: 50 });
    return collections ?? [];
  }, [] as StoreCollection[]);
});

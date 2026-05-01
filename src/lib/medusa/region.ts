/**
 * Region lookup helper.
 *
 * Medusa requires a region (and therefore a currency) on most store calls
 * that should return calculated prices. The seed script creates a Bangladesh
 * region in BDT; we resolve it once per request and cache it via React's
 * cache() so multiple Server Components in the same render share one fetch.
 */
import { cache } from "react";
import { medusa, DEFAULT_REGION } from "./client";
import type { StoreRegion } from "./types";

async function fetchRegion(): Promise<StoreRegion | null> {
  try {
    const { regions } = await medusa.store.region.list({});
    if (!regions || regions.length === 0) return null;

    // Try to match the configured handle/code, fall back to the first region.
    const target = DEFAULT_REGION.toLowerCase();
    const match = regions.find((r) => {
      const code = r.currency_code?.toLowerCase();
      const name = r.name?.toLowerCase();
      return code === target || name?.includes(target);
    });
    return match ?? regions[0];
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn("[medusa] region lookup failed:", (err as Error).message);
    }
    return null;
  }
}

export const getRegion = cache(fetchRegion);

export async function getRegionId(): Promise<string | undefined> {
  const region = await getRegion();
  return region?.id;
}

export async function getCurrencyCode(): Promise<string> {
  const region = await getRegion();
  return region?.currency_code ?? "bdt";
}

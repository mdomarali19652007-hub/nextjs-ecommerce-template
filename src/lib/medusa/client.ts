/**
 * Single Medusa SDK client instance for the storefront.
 *
 * Used from both Server Components (data fetching) and Client Components
 * (cart mutations). Reads the backend URL and publishable key from public
 * env vars so it works in either runtime.
 */
import Medusa from "@medusajs/js-sdk";

const backendUrl =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";

if (!publishableKey && process.env.NODE_ENV !== "production") {
  // Surface a clear hint during local dev. Don't crash — the app should still
  // render the static template if Medusa is not yet running.
  // eslint-disable-next-line no-console
  console.warn(
    "[medusa] NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY is empty. Storefront calls to /store/* will fail until you generate a key in the Medusa admin and set it in .env.local."
  );
}

export const medusa = new Medusa({
  baseUrl: backendUrl,
  publishableKey,
  debug: process.env.NODE_ENV !== "production",
});

export const MEDUSA_BACKEND_URL = backendUrl;
export const MEDUSA_PUBLISHABLE_KEY = publishableKey;
export const DEFAULT_REGION =
  process.env.NEXT_PUBLIC_MEDUSA_DEFAULT_REGION || "bd";

import { Product } from "@/types/product";
import { getProducts } from "@/lib/medusa/products";

/**
 * Fallback catalog used when the Medusa backend is unreachable (e.g. local
 * development before running `npm run db:setup` in /medusa). The numbers
 * here mirror the original static template so the storefront still renders
 * something demo-able. After the seed script populates Medusa, the live
 * data takes precedence.
 */
const fallbackShopData: Product[] = [
  {
    title: "Havit HV-G69 USB Gamepad",
    reviews: 15,
    price: 59.0,
    discountedPrice: 29.0,
    id: 1,
    imgs: {
      thumbnails: [
        "/images/products/product-1-sm-1.png",
        "/images/products/product-1-sm-2.png",
      ],
      previews: [
        "/images/products/product-1-bg-1.png",
        "/images/products/product-1-bg-2.png",
      ],
    },
  },
  {
    title: "iPhone 14 Plus , 6/128GB",
    reviews: 5,
    price: 899.0,
    discountedPrice: 99.0,
    id: 2,
    imgs: {
      thumbnails: [
        "/images/products/product-2-sm-1.png",
        "/images/products/product-2-sm-2.png",
      ],
      previews: [
        "/images/products/product-2-bg-1.png",
        "/images/products/product-2-bg-2.png",
      ],
    },
  },
  {
    title: "Apple iMac M1 24-inch 2021",
    reviews: 5,
    price: 59.0,
    discountedPrice: 29.0,
    id: 3,
    imgs: {
      thumbnails: [
        "/images/products/product-3-sm-1.png",
        "/images/products/product-3-sm-2.png",
      ],
      previews: [
        "/images/products/product-3-bg-1.png",
        "/images/products/product-3-bg-2.png",
      ],
    },
  },
  {
    title: "MacBook Air M1 chip, 8/256GB",
    reviews: 6,
    price: 59.0,
    discountedPrice: 29.0,
    id: 4,
    imgs: {
      thumbnails: [
        "/images/products/product-4-sm-1.png",
        "/images/products/product-4-sm-2.png",
      ],
      previews: [
        "/images/products/product-4-bg-1.png",
        "/images/products/product-4-bg-2.png",
      ],
    },
  },
  {
    title: "Apple Watch Ultra",
    reviews: 3,
    price: 99.0,
    discountedPrice: 29.0,
    id: 5,
    imgs: {
      thumbnails: [
        "/images/products/product-5-sm-1.png",
        "/images/products/product-5-sm-2.png",
      ],
      previews: [
        "/images/products/product-5-bg-1.png",
        "/images/products/product-5-bg-2.png",
      ],
    },
  },
  {
    title: "Logitech MX Master 3S",
    reviews: 15,
    price: 59.0,
    discountedPrice: 29.0,
    id: 6,
    imgs: {
      thumbnails: [
        "/images/products/product-6-sm-1.png",
        "/images/products/product-6-sm-2.png",
      ],
      previews: [
        "/images/products/product-6-bg-1.png",
        "/images/products/product-6-bg-2.png",
      ],
    },
  },
  {
    title: "Apple iPad Air 5th Gen",
    reviews: 15,
    price: 59.0,
    discountedPrice: 29.0,
    id: 7,
    imgs: {
      thumbnails: [
        "/images/products/product-7-sm-1.png",
        "/images/products/product-7-sm-2.png",
      ],
      previews: [
        "/images/products/product-7-bg-1.png",
        "/images/products/product-7-bg-2.png",
      ],
    },
  },
  {
    title: "Asus RT Dual Band Router",
    reviews: 15,
    price: 59.0,
    discountedPrice: 29.0,
    id: 8,
    imgs: {
      thumbnails: [
        "/images/products/product-8-sm-1.png",
        "/images/products/product-8-sm-2.png",
      ],
      previews: [
        "/images/products/product-8-bg-1.png",
        "/images/products/product-8-bg-2.png",
      ],
    },
  },
];

/**
 * Async helper used by Server Components. Pulls the live catalog from
 * Medusa via the data-access layer; falls back to the static array above
 * if Medusa is unreachable so the template still renders.
 */
export async function getShopData(
  params: Parameters<typeof getProducts>[0] = {}
): Promise<Product[]> {
  const products = await getProducts({ limit: 24, ...params });
  if (products.length === 0) return fallbackShopData;
  return products;
}

/**
 * Synchronous default export. Kept for any legacy import pattern
 * (`import shopData from "..."`) that hasn't been migrated yet. Returns the
 * fallback catalog only — no network — so rendering is never blocked.
 */
const shopData = fallbackShopData;
export default shopData;

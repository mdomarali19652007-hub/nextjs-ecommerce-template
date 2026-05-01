import type { StorefrontCategory } from "@/lib/medusa/types";
import { getCategories } from "@/lib/medusa/products";

/**
 * Fallback category list used if Medusa is unreachable.
 */
const fallbackCategories: StorefrontCategory[] = [
  { id: "1", title: "Televisions", handle: "televisions", img: "/images/categories/categories-01.png" },
  { id: "2", title: "Laptop & PC", handle: "laptop-pc", img: "/images/categories/categories-02.png" },
  { id: "3", title: "Mobile & Tablets", handle: "mobile-tablets", img: "/images/categories/categories-03.png" },
  { id: "4", title: "Games & Videos", handle: "games-videos", img: "/images/categories/categories-04.png" },
  { id: "5", title: "Home Appliances", handle: "home-appliances", img: "/images/categories/categories-05.png" },
  { id: "6", title: "Health & Sports", handle: "health-sports", img: "/images/categories/categories-06.png" },
  { id: "7", title: "Watches", handle: "watches", img: "/images/categories/categories-07.png" },
  { id: "8", title: "Televisions", handle: "televisions-2", img: "/images/categories/categories-04.png" },
];

/**
 * Async helper used by Server Components. Pulls categories from Medusa
 * with a static fallback.
 */
export async function getCategoriesData(): Promise<StorefrontCategory[]> {
  const categories = await getCategories();
  if (categories.length === 0) return fallbackCategories;
  return categories;
}

const data = fallbackCategories;
export default data;

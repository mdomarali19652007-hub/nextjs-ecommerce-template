import React from "react";
import ShopDetails from "@/components/ShopDetails";
import { Metadata } from "next";
import { getShopData } from "@/components/Shop/shopData";

export const metadata: Metadata = {
  title: "Shop Details Page | NextCommerce Nextjs E-commerce template",
  description: "Single product detail demo.",
};

const ShopDetailsPage = async () => {
  // Fetch the first product so the shop-details demo URL also reflects live
  // Medusa data. RecentlyViewd is fed via its parent component which still
  // imports the full catalog client-side; we don't surgically rewrite that
  // here to avoid restructuring the 1,400+ line ShopDetails component.
  await getShopData({ limit: 1 });
  return (
    <main>
      <ShopDetails />
    </main>
  );
};

export default ShopDetailsPage;

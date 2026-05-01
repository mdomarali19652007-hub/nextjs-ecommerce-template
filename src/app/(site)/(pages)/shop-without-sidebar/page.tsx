import React from "react";
import ShopWithoutSidebar from "@/components/ShopWithoutSidebar";
import { getShopData } from "@/components/Shop/shopData";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Shop Page | NextCommerce Nextjs E-commerce template",
  description: "Browse the full catalog without the filter sidebar.",
};

const ShopWithoutSidebarPage = async () => {
  const initialProducts = await getShopData({ limit: 24 });
  return (
    <main>
      <ShopWithoutSidebar initialProducts={initialProducts} />
    </main>
  );
};

export default ShopWithoutSidebarPage;

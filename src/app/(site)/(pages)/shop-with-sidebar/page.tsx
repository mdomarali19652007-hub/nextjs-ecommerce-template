import React from "react";
import ShopWithSidebar from "@/components/ShopWithSidebar";
import { getShopData } from "@/components/Shop/shopData";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Shop Page | NextCommerce Nextjs E-commerce template",
  description: "Browse the full catalog with filters and sidebar.",
};

const ShopWithSidebarPage = async () => {
  const initialProducts = await getShopData({ limit: 24 });
  return (
    <main>
      <ShopWithSidebar initialProducts={initialProducts} />
    </main>
  );
};

export default ShopWithSidebarPage;

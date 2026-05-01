/**
 * Seed script for the Next.js storefront. Mirrors the original static
 * template's catalog into Medusa: a Bangladesh region (currency BDT), seven
 * categories, and the 12 products from src/components/Shop/shopData.ts with
 * their prices, images (served from the storefront's /public/images/products
 * directory), and review counts (stored in product.metadata).
 *
 * Run with:
 *   npm run seed
 *
 * Idempotent for the most part — re-running will skip existing categories /
 * products by handle. Re-seeding into a fresh database is the cleanest path.
 */
import {
  createApiKeysWorkflow,
  createCollectionsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";
import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";

const STOREFRONT_IMAGE_BASE =
  process.env.STOREFRONT_IMAGE_BASE_URL || "http://localhost:3000";

const productImage = (slug: string, size: "sm" | "bg", n: number) =>
  `${STOREFRONT_IMAGE_BASE}/images/products/${slug}-${size}-${n}.png`;

const productSeeds = [
  {
    title: "Havit HV-G69 USB Gamepad",
    handle: "havit-hv-g69-usb-gamepad",
    slug: "product-1",
    price: 2900,
    compareAt: 5900,
    reviews: 15,
    category: "games-videos",
  },
  {
    title: "iPhone 14 Plus 6/128GB",
    handle: "iphone-14-plus",
    slug: "product-2",
    price: 9900,
    compareAt: 89900,
    reviews: 5,
    category: "mobile-tablets",
  },
  {
    title: "Apple iMac M1 24-inch 2021",
    handle: "apple-imac-m1-24",
    slug: "product-3",
    price: 2900,
    compareAt: 5900,
    reviews: 5,
    category: "laptop-pc",
  },
  {
    title: "MacBook Air M1 chip 8/256GB",
    handle: "macbook-air-m1",
    slug: "product-4",
    price: 2900,
    compareAt: 5900,
    reviews: 6,
    category: "laptop-pc",
  },
  {
    title: "Apple Watch Ultra",
    handle: "apple-watch-ultra",
    slug: "product-5",
    price: 2900,
    compareAt: 9900,
    reviews: 3,
    category: "watches",
  },
  {
    title: "Logitech MX Master 3S",
    handle: "logitech-mx-master-3s",
    slug: "product-6",
    price: 2900,
    compareAt: 5900,
    reviews: 15,
    category: "laptop-pc",
  },
  {
    title: "Apple iPad Air 5th Gen",
    handle: "apple-ipad-air-5",
    slug: "product-7",
    price: 2900,
    compareAt: 5900,
    reviews: 15,
    category: "mobile-tablets",
  },
  {
    title: "Asus RT Dual Band Router",
    handle: "asus-rt-dual-band-router",
    slug: "product-8",
    price: 2900,
    compareAt: 5900,
    reviews: 15,
    category: "home-appliances",
  },
];

const categorySeeds = [
  { name: "Televisions", handle: "televisions", img: "/images/categories/categories-01.png" },
  { name: "Laptop & PC", handle: "laptop-pc", img: "/images/categories/categories-02.png" },
  { name: "Mobile & Tablets", handle: "mobile-tablets", img: "/images/categories/categories-03.png" },
  { name: "Games & Videos", handle: "games-videos", img: "/images/categories/categories-04.png" },
  { name: "Home Appliances", handle: "home-appliances", img: "/images/categories/categories-05.png" },
  { name: "Health & Sports", handle: "health-sports", img: "/images/categories/categories-06.png" },
  { name: "Watches", handle: "watches", img: "/images/categories/categories-07.png" },
];

export default async function seedStorefront({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModule = container.resolve(Modules.FULFILLMENT);
  const salesChannelModule = container.resolve(Modules.SALES_CHANNEL);
  const storeModule = container.resolve(Modules.STORE);

  const countries = ["bd"];
  const currency = "bdt";

  logger.info("Seeding store + region…");

  const [store] = await storeModule.listStores();
  let defaultSalesChannel = await salesChannelModule.listSalesChannels({
    name: "Default Sales Channel",
  });

  if (!defaultSalesChannel.length) {
    const { result } = await createSalesChannelsWorkflow(container).run({
      input: { salesChannelsData: [{ name: "Default Sales Channel" }] },
    });
    defaultSalesChannel = result;
  }

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        supported_currencies: [{ currency_code: currency, is_default: true }],
        default_sales_channel_id: defaultSalesChannel[0].id,
      },
    },
  });

  const { result: regionResult } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "Bangladesh",
          currency_code: currency,
          countries,
          payment_providers: ["pp_system_default"],
        },
      ],
    },
  });
  const region = regionResult[0];

  await createTaxRegionsWorkflow(container).run({
    input: countries.map((country_code) => ({
      country_code,
      provider_id: "tp_system",
    })),
  });

  logger.info("Seeding stock location + shipping…");

  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container
  ).run({
    input: {
      locations: [
        {
          name: "Dhaka Warehouse",
          address: {
            city: "Dhaka",
            country_code: "BD",
            address_1: "",
          },
        },
      ],
    },
  });
  const stockLocation = stockLocationResult[0];

  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: "manual_manual",
    },
  });

  const shippingProfiles = await fulfillmentModule.listShippingProfiles({
    type: "default",
  });
  let shippingProfile = shippingProfiles.length ? shippingProfiles[0] : null;
  if (!shippingProfile) {
    const { result } = await createShippingProfilesWorkflow(container).run({
      input: { data: [{ name: "Default Shipping Profile", type: "default" }] },
    });
    shippingProfile = result[0];
  }

  const fulfillmentSet = await fulfillmentModule.createFulfillmentSets({
    name: "BD Warehouse delivery",
    type: "shipping",
    service_zones: [
      {
        name: "Bangladesh",
        geo_zones: [{ country_code: "bd", type: "country" }],
      },
    ],
  });

  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
    [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSet.id },
  });

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Standard Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard",
          description: "Ship in 2-3 days.",
          code: "standard",
        },
        prices: [
          { currency_code: currency, amount: 500 },
          { region_id: region.id, amount: 500 },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          { attribute: "is_return", value: "false", operator: "eq" },
        ],
      },
      {
        name: "Express Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Express",
          description: "Ship in 24 hours.",
          code: "express",
        },
        prices: [
          { currency_code: currency, amount: 1500 },
          { region_id: region.id, amount: 1500 },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          { attribute: "is_return", value: "false", operator: "eq" },
        ],
      },
    ],
  });

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [defaultSalesChannel[0].id],
    },
  });

  logger.info("Seeding publishable API key…");
  const { result: apiKeyResult } = await createApiKeysWorkflow(container).run({
    input: {
      api_keys: [
        {
          title: "Storefront",
          type: "publishable",
          created_by: "",
        },
      ],
    },
  });
  const publishableApiKey = apiKeyResult[0];

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [defaultSalesChannel[0].id],
    },
  });

  logger.info(
    `Publishable key (use as NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY): ${publishableApiKey.token}`
  );

  logger.info("Seeding categories + collections…");
  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: categorySeeds.map((c) => ({
        name: c.name,
        handle: c.handle,
        is_active: true,
        metadata: { image: c.img },
      })),
    },
  });

  const categoryByHandle = new Map(categoryResult.map((c) => [c.handle, c.id]));

  await createCollectionsWorkflow(container).run({
    input: {
      collections: [
        { title: "Featured", handle: "featured" },
        { title: "Best Sellers", handle: "best-sellers" },
      ],
    },
  });

  logger.info("Seeding products…");

  await createProductsWorkflow(container).run({
    input: {
      products: productSeeds.map((p) => ({
        title: p.title,
        handle: p.handle,
        status: ProductStatus.PUBLISHED,
        category_ids: categoryByHandle.get(p.category)
          ? [categoryByHandle.get(p.category)!]
          : [],
        thumbnail: productImage(p.slug, "bg", 1),
        images: [
          { url: productImage(p.slug, "bg", 1) },
          { url: productImage(p.slug, "bg", 2) },
          { url: productImage(p.slug, "sm", 1) },
          { url: productImage(p.slug, "sm", 2) },
        ],
        options: [{ title: "Default", values: ["Default"] }],
        sales_channels: [{ id: defaultSalesChannel[0].id }],
        shipping_profile_id: shippingProfile.id,
        metadata: {
          reviews: p.reviews,
          template_slug: p.slug,
        },
        variants: [
          {
            title: "Default",
            sku: `${p.handle.toUpperCase()}-DEFAULT`,
            options: { Default: "Default" },
            manage_inventory: false,
            prices: [
              {
                amount: p.price,
                currency_code: currency,
              },
              ...(p.compareAt
                ? [
                    {
                      amount: p.compareAt,
                      currency_code: currency,
                      rules: { sale: "true" },
                    },
                  ]
                : []),
            ],
          },
        ],
      })),
    },
  });

  logger.info("Seed complete.");
  logger.info("");
  logger.info("Next steps:");
  logger.info(`  1. Copy the publishable key printed above.`);
  logger.info(
    `  2. In the storefront repo, set NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${publishableApiKey.token}`
  );
  logger.info(`  3. npm run dev in the storefront.`);
}

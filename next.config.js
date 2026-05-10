/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Local Medusa file service (default port).
      { protocol: "http", hostname: "localhost", port: "9000", pathname: "/**" },
      // Local storefront (default port). The seed script stores product image
      // URLs as `${STOREFRONT_IMAGE_BASE_URL}/images/products/...` (default
      // `http://localhost:3000`), so the same Next.js process serves the
      // images its own components render. Override the base URL in the seed
      // for staging or production hosts.
      { protocol: "http", hostname: "localhost", port: "3000", pathname: "/**" },
      // S3 / R2 / managed object storage. Adjust hostname for your bucket.
      { protocol: "https", hostname: "**.amazonaws.com", pathname: "/**" },
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com", pathname: "/**" },
      { protocol: "https", hostname: "**.digitaloceanspaces.com", pathname: "/**" },
    ],
  },
};

module.exports = nextConfig;

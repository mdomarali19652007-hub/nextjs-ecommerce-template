/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Local Medusa file service (default port).
      { protocol: "http", hostname: "localhost", port: "9000", pathname: "/**" },
      // S3 / R2 / managed object storage. Adjust hostname for your bucket.
      { protocol: "https", hostname: "**.amazonaws.com", pathname: "/**" },
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com", pathname: "/**" },
      { protocol: "https", hostname: "**.digitaloceanspaces.com", pathname: "/**" },
    ],
  },
};

module.exports = nextConfig;

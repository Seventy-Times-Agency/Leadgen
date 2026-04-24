/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Vercel serves the app from /, so no basePath. The API lives at a
  // separate origin (Railway) — components hit it via NEXT_PUBLIC_API_URL.

  async redirects() {
    return [
      // The interactive prototype lives as static HTML in /public/prototype/.
      // Next.js doesn't auto-serve index.html for directory URLs, so map
      // /prototype and /prototype/ onto the actual file.
      { source: "/prototype", destination: "/prototype/index.html", permanent: false },
    ];
  },
};

module.exports = nextConfig;

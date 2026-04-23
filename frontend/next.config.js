/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Vercel serves the app from /, so no basePath. The API lives at a
  // separate origin (Railway) — components hit it via NEXT_PUBLIC_API_URL.
};

module.exports = nextConfig;

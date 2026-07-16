/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // "standalone" output is only for the Docker deployment path (see
  // Dockerfile). On Vercel it can interfere with how the Prisma query
  // engine gets traced into the serverless function bundle, causing
  // PrismaClientInitializationError at runtime. Vercel always sets its own
  // VERCEL=1 env var during builds, so this disables standalone there
  // automatically while keeping it for `docker build`.
  output: process.env.VERCEL ? undefined : "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "randomuser.me" },
    ],
  },
};

module.exports = nextConfig;
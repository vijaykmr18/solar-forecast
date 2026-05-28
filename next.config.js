/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    MONGO_URI: process.env.MONGO_URI,
    MONGO_DB_NAME: process.env.MONGO_DB_NAME,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    JWT_SECRET: process.env.JWT_SECRET,
  },
};

module.exports = nextConfig;

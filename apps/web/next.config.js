/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@repo/types', '@repo/database']
};

export default nextConfig;

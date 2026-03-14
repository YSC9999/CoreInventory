/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Skip type checking during development for faster builds
    tsconfigPath: './tsconfig.json'
  },
  // Optimize for dev speed
  experimental: {
    optimizePackageImports: ['@radix-ui/react-*', 'lucide-react'],
  },
};

module.exports = nextConfig;

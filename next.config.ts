import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ddragon.leagueoflegends.com',
        pathname: '/cdn/**',
      },
      {
        protocol: 'https',
        hostname: 'raw.communitydragon.org',
        pathname: '/latest/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/meraki/:champion',
        destination: 'https://cdn.merakianalytics.com/riot/lol/resources/latest/en-US/champions/:champion',
      },
    ];
  },
};

export default nextConfig;

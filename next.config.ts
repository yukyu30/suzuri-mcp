import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/.well-known/oauth-protected-resource',
        destination: '/api/well-known/oauth-protected-resource',
      },
    ]
  },
};

export default nextConfig;

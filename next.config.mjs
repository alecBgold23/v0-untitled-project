/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'fs', 'stream', etc. on the client to prevent errors
      config.resolve.fallback = {
        fs: false,
        stream: false,
        crypto: false,
        path: false,
        process: false,
        util: false,
        buffer: false,
        os: false,
      };
    }
    return config;
  },
};

export default nextConfig;

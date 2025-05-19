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
      // Ensure these Node.js modules are not included in the client bundle
      config.resolve.fallback = {
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        util: false,
        buffer: false,
        os: false,
        zlib: false,
        http: false,
        https: false,
        net: false,
        tls: false,
        child_process: false,
        dns: false,
        tty: false,
        constants: false,
        vm: false,
        dgram: false,
        readline: false,
        events: require.resolve('events/'),
        assert: false,
        url: false,
        querystring: false,
        string_decoder: false,
        punycode: false,
        process: false,
      };
    }
    return config;
  },
  // Disable server components to avoid Node.js module issues
  experimental: {
    serverComponents: false,
  },
};

export default nextConfig;

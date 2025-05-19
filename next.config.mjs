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
      // Properly handle Node.js core modules in the browser
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
        events: false,
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
  // Transpile specific modules that might be causing issues
  transpilePackages: [
    'crypto-browserify',
    'stream-browserify',
    'path-browserify',
    'util',
    'buffer',
    'process',
  ],
};

export default nextConfig;

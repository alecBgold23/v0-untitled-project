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
        ...config.resolve.fallback,
        fs: false,
        stream: false,
        crypto: false,
        path: false,
        process: false,
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
      };
    }
    return config;
  },
};

export default nextConfig;

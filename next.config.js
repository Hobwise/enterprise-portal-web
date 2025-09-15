/** @type {import('next').NextConfig} */
const nextConfig = {
  publicRuntimeConfig: {
    apiBaseUrl:
      process.env.NODE_ENV === 'production'
        ? 'https://api.hobwise.com/'
        : 'https://sandbox-api.hobwise.com/',
  },
  reactStrictMode: true,

  // Experimental features for performance
  experimental: {
    // Optimize package imports for faster builds
    optimizePackageImports: [
      '@nextui-org/react',
      'lucide-react',
      'react-icons',
      '@iconify/react',
      'framer-motion',
      '@tanstack/react-query',
      'react-chartjs-2',
      'chart.js',
    ],
    // Enable Turbopack for faster builds (experimental)
    // turbo: true, // Uncomment to enable Turbopack
  },

  // Modularize imports for better tree-shaking
  modularizeImports: {
    'react-icons': {
      transform: 'react-icons/{{member}}',
    },
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{member}}',
    },
  },

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Development optimizations
    if (dev) {
      config.watchOptions = {
        poll: 1000, // Check for changes every second
        aggregateTimeout: 300, // Delay rebuild after change
        ignored: ['**/node_modules', '**/.git', '**/.next'],
      };

      // Use filesystem cache for faster rebuilds
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      };
    }

    // Production optimizations
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            framework: {
              name: 'framework',
              chunks: 'all',
              test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
              priority: 40,
              enforce: true,
            },
            lib: {
              test(module) {
                return module.size() > 160000 &&
                  /node_modules[/\\]/.test(module.identifier());
              },
              name(module) {
                const hash = require('crypto').createHash('sha1');
                hash.update(module.identifier());
                return hash.digest('hex').substring(0, 8);
              },
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true,
            },
            commons: {
              name: 'commons',
              chunks: 'all',
              minChunks: 2,
              priority: 20,
            },
            shared: {
              name: 'app',
              priority: 10,
              minChunks: 2,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    return config;
  },
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; " +
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.paystack.co https://checkout.paystack.com https://*.paystack.com https://va.vercel-scripts.com; " +
              "worker-src 'self' blob:; " +
              "style-src 'self' 'unsafe-inline' 'unsafe-hashes' https://checkout.paystack.com https://*.paystack.com; " +
              "img-src 'self' data: blob: https://walrus-app-lehim.ondigitalocean.app https://hobwise.com https://checkout.paystack.com https://hobwise-corporate-web.vercel.app https://api.hobwise.com https://prod-p2f7c.ondigitalocean.app https://sandbox-api.hobwise.com https://sandbox.hobwise.com https://res.cloudinary.com https://*.paystack.com; " +
              "connect-src 'self' https://walrus-app-lehim.ondigitalocean.app https://hobwise.com https://api.paystack.co https://hobwise-corporate-web.vercel.app https://api.hobwise.com https://sandbox-api.hobwise.com https://prod-p2f7c.ondigitalocean.app https://sandbox.hobwise.com https://res.cloudinary.com https://*.paystack.com wss://sandbox-api.hobwise.com; " +
              "font-src 'self' https://checkout.paystack.com https://hobwise.com https://hobwise-corporate-web.vercel.app https://js.paystack.co https://api.hobwise.com https://prod-p2f7c.ondigitalocean.app https://sandbox-api.hobwise.com https://sandbox.hobwise.com https://res.cloudinary.com https://*.paystack.com; " +
              "frame-src 'self' https://*.paystack.co https://*.paystack.com https://paystack.com https://js.paystack.co https://checkout.paystack.com https://hobwise.com https://hobwise-corporate-web.vercel.app https://api.hobwise.com https://prod-p2f7c.ondigitalocean.app https://sandbox-api.hobwise.com https://sandbox.hobwise.com https://res.cloudinary.com; " +
              "media-src 'self' https://hobwise.com https://hobwise-corporate-web.vercel.app https://api.hobwise.com https://prod-p2f7c.ondigitalocean.app https://sandbox-api.hobwise.com https://sandbox.hobwise.com https://res.cloudinary.com;"
          },
          {
            key: 'X-Frame-Options',
            value: 'ALLOW-FROM https://paystack.com',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value:
              'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;

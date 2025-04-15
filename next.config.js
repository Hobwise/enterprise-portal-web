/** @type {import('next').NextConfig} */
const nextConfig = {
  publicRuntimeConfig: {
    apiBaseUrl:
      process.env.NODE_ENV === "production"
        ? "https://api.hobwise.com/"
        : "https://sandbox-api.hobwise.com/",
  },
  reactStrictMode: true,
  headers: async () => {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; " +
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.paystack.co https://checkout.paystack.com; " +
              "worker-src 'self' blob:; " +
              "style-src 'self' 'unsafe-inline' https://checkout.paystack.com; " +
              "img-src 'self' data: blob: https://walrus-app-lehim.ondigitalocean.app https://hobwise.com https://checkout.paystack.com https://hobwise-corporate-web.vercel.app https://api.hobwise.com https://sandbox-api.hobwise.com https://sandbox.hobwise.com https://res.cloudinary.com https://*.paystack.com; " +
              "connect-src 'self' https://walrus-app-lehim.ondigitalocean.app https://hobwise.com https://api.paystack.co https://hobwise-corporate-web.vercel.app https://api.hobwise.com https://sandbox-api.hobwise.com https://sandbox.hobwise.com https://res.cloudinary.com https://*.paystack.com; " +
              "font-src 'self' https://checkout.paystack.com https://hobwise.com https://hobwise-corporate-web.vercel.app https://js.paystack.co https://api.hobwise.com https://sandbox-api.hobwise.com https://sandbox.hobwise.com https://res.cloudinary.com https://*.paystack.com; " +
              "frame-src 'self' https://js.paystack.co https://checkout.paystack.com https://hobwise.com https://hobwise-corporate-web.vercel.app https://api.hobwise.com https://sandbox-api.hobwise.com https://sandbox.hobwise.com https://js.paystack.co https://res.cloudinary.com; " +
              "media-src 'self' https://hobwise.com https://hobwise-corporate-web.vercel.app https://api.hobwise.com https://sandbox-api.hobwise.com https://sandbox.hobwise.com https://res.cloudinary.com;",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=()",
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
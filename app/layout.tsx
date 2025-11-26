import { AppProvider } from "@/hooks/globalProvider";
import ClientProviders from "@/components/ClientProviders";
import QueryProvider from "@/hooks/queryProvider";
import "@/public/fonts/satoshi/stylesheet.css";
import { Providers } from "@/utilities/providers";
import { bricolage_grotesque } from "@/utilities/ui-config/fonts";
import "@fontsource/bricolage-grotesque"; // Defaults to weight 400
import "@fontsource/bricolage-grotesque/400.css";
import "@fontsource/bricolage-grotesque/500.css";
import "@fontsource/bricolage-grotesque/700.css";
import { Toaster } from "react-hot-toast";
import { Toaster as SonnerToaster } from "sonner";
import { companyInfo } from "../lib/companyInfo";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { Metadata, Viewport } from "next";
import {
  OrganizationSchema,
  WebsiteSchema,
  SoftwareApplicationSchema,
} from "@/components/StructuredData";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://hobwise.com"),
  title: {
    default: "Hobwise - Restaurant & Hospitality Management Platform",
    template: "%s | Hobwise",
  },
  description:
    "All-in-one restaurant and hospitality management platform. Manage menus, reservations, orders, payments, QR codes, and campaigns efficiently for your business.",
  keywords: [
    "restaurant management",
    "hospitality software",
    "reservation system",
    "menu management",
    "QR ordering",
    "restaurant POS",
    "Nigeria restaurant software",
    "business management platform",
    "restaurant reservation software",
    "digital menu",
    "online ordering system",
    "hospitality management",
  ],
  authors: [{ name: "Hobwise", url: "https://hobwise.com" }],
  creator: "Hobwise",
  publisher: "Hobwise",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://hobwise.com",
    siteName: "Hobwise",
    title: "Hobwise - Restaurant & Hospitality Management Platform",
    description:
      "All-in-one restaurant and hospitality management platform. Manage menus, reservations, orders, payments, and more with ease.",
    images: [
      {
        url: "/assets/images/hobwise-seo-favicon.png",
        width: 1200,
        height: 630,
        alt: "Hobwise Platform Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hobwise - Restaurant & Hospitality Management Platform",
    description:
      "All-in-one restaurant and hospitality management platform for modern businesses",
    images: ["/assets/images/hobwise-seo-favicon.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={` ${bricolage_grotesque.className}`}
      suppressHydrationWarning
    >
      <head>
        <OrganizationSchema />
        <WebsiteSchema />
        <SoftwareApplicationSchema />
      </head>
      <body>
        <ClientProviders>
          <QueryProvider>
            <AppProvider>
              <Providers>
                {children}
                <Analytics />
              <Toaster
                toastOptions={{
                  duration: 2000,
                  success: {
                    style: {
                      border: "2px solid #3a9ea5",
                      boxShadow: "none",
                    },
                  },
                  error: {
                    style: {
                      border: "2px solid #eb5757",
                      boxShadow: "none",
                    },
                  },
                }}
              />
              <SonnerToaster position="top-right" richColors />
            </Providers>
          </AppProvider>
        </QueryProvider>
        </ClientProviders>
      </body>
    </html>
  );
}

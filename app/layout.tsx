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
import { companyInfo } from "../lib/companyInfo";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

export const metadata = {
  title: companyInfo.name,
  description: "Streamline your business processes",
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
      <body>
        <ClientProviders>
          <QueryProvider>
            <AppProvider>
              <Providers>
                {children}
                <Analytics />
              <Toaster
                toastOptions={{
                  duration: 5000,
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
            </Providers>
          </AppProvider>
        </QueryProvider>
        </ClientProviders>
      </body>
    </html>
  );
}

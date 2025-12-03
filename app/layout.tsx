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
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Toaster as SonnerToaster } from "sonner";
import { companyInfo } from "../lib/companyInfo";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

export const metadata = {
  title: companyInfo.name,
  description: "Streamline your business processes",
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
      <body>
        <ClientProviders>
          <QueryProvider>
            <AppProvider>
              <Providers>
                {children}
                <Analytics />
                <ToastContainer />
                <SonnerToaster position="top-right" richColors />
              </Providers>
            </AppProvider>
          </QueryProvider>
        </ClientProviders>
      </body>
    </html>
  );
}

import POSPrivateRoute from "@/components/auth/POSPrivateRoute";
import { AppProvider } from "@/hooks/globalProvider";
import ClientProviders from "@/components/ClientProviders";
import QueryProvider from "@/hooks/queryProvider";
import { Providers } from "@/utilities/providers";
import { bricolage_grotesque } from "@/utilities/ui-config/fonts";
import { Toaster } from "react-hot-toast";
import { companyInfo } from "../../lib/companyInfo";

export const metadata = {
  title: `${companyInfo.name} - POS`,
  description: "Point of Sale System",
};

export default function POSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <POSPrivateRoute>
      <div className={`${bricolage_grotesque.className} min-h-screen`}>
        <ClientProviders>
          <QueryProvider>
            <AppProvider>
              <Providers>
                {children}
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
      </div>
    </POSPrivateRoute>
  );
}
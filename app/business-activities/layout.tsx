import CategoryPrivateRoute from "@/components/auth/CategoryPrivateRoute";
import ClientProviders from "@/components/ClientProviders";
import QueryProvider from "@/hooks/queryProvider";
import { AppProvider } from "@/hooks/globalProvider";
import { Providers } from "@/utilities/providers";
import { bricolage_grotesque } from "@/utilities/ui-config/fonts";
import { Toaster } from "react-hot-toast";
import { companyInfo } from "../../lib/companyInfo";

export const metadata = {
  title: `${companyInfo.name} - Business Activities`,
  description: "Manage your business activities and orders",
};

export default function BusinessActivitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CategoryPrivateRoute>
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
    </CategoryPrivateRoute>
  );
}

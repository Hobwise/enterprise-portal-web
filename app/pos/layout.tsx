import POSPrivateRoute from "@/components/auth/POSPrivateRoute";
import { AppProvider } from "@/hooks/globalProvider";
import { SubscriptionProvider } from "@/hooks/providers/SubscriptionProvider";
import ClientProviders from "@/components/ClientProviders";
import QueryProvider from "@/hooks/queryProvider";
import { Providers } from "@/utilities/providers";
import { bricolage_grotesque } from "@/utilities/ui-config/fonts";
import { Toaster } from "react-hot-toast";
import { companyInfo } from "../../lib/companyInfo";
import AiChatWidget from "@/components/ui/dashboard/ai-chat/AiChatWidget";

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
                <SubscriptionProvider>{children}</SubscriptionProvider>
                <AiChatWidget />
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
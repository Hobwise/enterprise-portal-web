import { logout } from "@/app/api/controllers/auth";
import { removeCookie, resetLoginInfo } from "@/lib/utils";
import toast from "react-hot-toast";

export const initializeUserActivityTracking = (): void => {
  // Check if running in browser environment
  if (typeof window !== "undefined") {
    document.addEventListener("mousemove", () => {
      sessionStorage.setItem("lastActivity", new Date().toISOString());
    });

    document.addEventListener("click", () => {
      sessionStorage.setItem("lastActivity", new Date().toISOString());
    });
  }
};

export const startUserActivityTracking = (): void => {
  const INACTIVE_THRESHOLD_MINUTES = 10; // 10 minutes
  const CHECK_INTERVAL_MS = 1000; // 1 second

  const timeInterval = setInterval(() => {
    const lastActivity = sessionStorage.getItem("lastActivity");

    if (lastActivity) {
      const lastActivityDate = new Date(lastActivity);
      const currentDate = new Date();
      const diffMs = Math.abs(
        currentDate.getTime() - lastActivityDate.getTime()
      );

      const minutes = Math.floor(diffMs / (1000 * 60));

      if (minutes >= INACTIVE_THRESHOLD_MINUTES) {
        clearInterval(timeInterval);
        logout().then(() => {
          resetLoginInfo();
        });
      }
    }
  }, CHECK_INTERVAL_MS);
};

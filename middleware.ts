import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { routePermissions } from "./lib/routePermissions";

// Helper function to decode JWT payload (without verification)
function decodeJWTPayload(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = Buffer.from(payload, 'base64url').toString('utf8');
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const planCapabilities = request.cookies.get("planCapabilities")
    ?.value as any;
  const pathname = request.nextUrl.pathname;

  // Skip middleware redirect for auth routes already handling their own navigation
  const isAuthRoute = pathname.startsWith('/auth/');
  const isPOSRoute = pathname.startsWith('/pos');

  // Handle POS user access restrictions
  if (token && (isPOSRoute || pathname.startsWith('/dashboard'))) {
    // Try to get user info from token or localStorage simulation
    const jwtPayload = decodeJWTPayload(token);
    const isPOSUser = jwtPayload?.primaryAssignment === "Point of Sales";

    if (isPOSUser) {
      // POS users can only access /pos and /dashboard/orders
      const allowedPOSRoutes = ['/pos', '/dashboard/orders'];
      const isAllowedRoute = allowedPOSRoutes.some(route => pathname.startsWith(route));

      if (!isAllowedRoute) {
        // Redirect POS users to /pos if they try to access other routes
        return NextResponse.redirect(new URL("/pos", request.url));
      }

      // Allow POS users to access their allowed routes without further checks
      if (isPOSRoute || pathname.startsWith('/dashboard/orders')) {
        return NextResponse.next();
      }
    }
  }

  const matchedBaseRoute = Object.keys(routePermissions).find((route) =>
    pathname.startsWith(route)
  );
  if (matchedBaseRoute && token && planCapabilities !== "undefined") {
    try {
      // Validate planCapabilities before parsing
      if (!planCapabilities || planCapabilities.trim() === "") {
        return NextResponse.rewrite(
          new URL("/dashboard/subscription-error", request.url)
        );
      }

      const requiredPermission = routePermissions[matchedBaseRoute];
      const capabilities = JSON.parse(planCapabilities);

      if (!capabilities[requiredPermission]) {
        return NextResponse.rewrite(
          new URL("/dashboard/unauthorized", request.url)
        );
      }
    } catch (error) {
      // If JSON parsing fails, treat as subscription error
      console.error("Failed to parse planCapabilities:", error);
      return NextResponse.rewrite(
        new URL("/dashboard/subscription-error", request.url)
      );
    }
  }
  if (matchedBaseRoute && planCapabilities === "undefined" && token) {
    return NextResponse.rewrite(
      new URL("/dashboard/subscription-error", request.url)
    );
  }

  // Only redirect to login if not already on an auth route or POS route
  if (!token && !isAuthRoute && !isPOSRoute) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/pos/:path*",
    "/auth/business-information",
    "/auth/select-business",
  ],
};

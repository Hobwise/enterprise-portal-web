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

  // Handle POS and Category user access restrictions
  if (token && (isPOSRoute || pathname.startsWith('/dashboard'))) {
    // Try to get user info from token or localStorage simulation
    const jwtPayload = decodeJWTPayload(token);
    const isPOSUser = jwtPayload?.primaryAssignment === "Point of Sales" ||
                      jwtPayload?.primaryAssignment === "POS Operator" ||
                      (jwtPayload?.assignedCategoryId && jwtPayload?.assignedCategoryId === "POS");

    const isCategoryUser = jwtPayload?.role === 1 &&
                          jwtPayload?.staffType === 2 &&
                          jwtPayload?.assignedCategoryId &&
                          jwtPayload?.assignedCategoryId !== "" &&
                          jwtPayload?.assignedCategoryId !== "POS";

    if (isPOSUser) {
      // POS users can only access /pos and /dashboard/orders (and /dashboard/settings for personal settings)
      const allowedPOSRoutes = ['/pos', '/dashboard/orders', '/dashboard/settings/personal-information', '/dashboard/settings/password-management'];
      const isAllowedRoute = allowedPOSRoutes.some(route => pathname.startsWith(route));

      // POS users trying to access non-allowed /dashboard routes → 404
      if (pathname.startsWith('/dashboard') && !isAllowedRoute) {
        return NextResponse.rewrite(new URL("/not-found", request.url));
      }

      if (!isAllowedRoute) {
        // Redirect POS users to /pos if they try to access other routes
        return NextResponse.redirect(new URL("/pos", request.url));
      }

      // Allow POS users to access their allowed routes without further checks
      if (isPOSRoute || pathname.startsWith('/dashboard/orders') || pathname.startsWith('/dashboard/settings')) {
        return NextResponse.next();
      }
    }

    if (isCategoryUser) {
      // Category users trying to access /dashboard → 404
      if (pathname.startsWith('/dashboard')) {
        return NextResponse.rewrite(new URL("/not-found", request.url));
      }

      // Category users should only access /business-activities
      if (!pathname.startsWith('/business-activities')) {
        return NextResponse.redirect(new URL("/business-activities", request.url));
      }

      // Allow category users to access business-activities
      return NextResponse.next();
    }
  }

  const matchedBaseRoute = Object.keys(routePermissions).find((route) =>
    pathname.startsWith(route)
  );
  if (matchedBaseRoute && token) {
    // Allow navigation if planCapabilities is not yet set (initial load/race condition)
    // The client-side components will handle fetching and redirecting if needed
    if (!planCapabilities || planCapabilities === "undefined") {
      // Let the request through - client-side will handle subscription check
      return NextResponse.next();
    }

    try {
      // Validate planCapabilities before parsing
      if (planCapabilities.trim() === "") {
        // Allow through - client will handle the error
        return NextResponse.next();
      }

      const requiredPermission = routePermissions[matchedBaseRoute];
      const capabilities = JSON.parse(planCapabilities);

      if (!capabilities[requiredPermission]) {
        return NextResponse.rewrite(
          new URL("/dashboard/unauthorized", request.url)
        );
      }
    } catch (error) {
      // If JSON parsing fails, allow through and let client handle it
      console.error("Failed to parse planCapabilities:", error);
      return NextResponse.next();
    }
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
    "/business-activities",
  ],
};

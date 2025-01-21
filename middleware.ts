import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { routePermissions } from "./lib/routePermissions";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const planCapabilities = request.cookies.get("planCapabilities")
    ?.value as any;
  const pathname = request.nextUrl.pathname;
  const matchedBaseRoute = Object.keys(routePermissions).find((route) =>
    pathname.startsWith(route)
  );
  if (matchedBaseRoute && token && planCapabilities !== "undefined") {
    const requiredPermission = routePermissions[matchedBaseRoute];
    if (!JSON.parse(planCapabilities)[requiredPermission]) {
      return NextResponse.rewrite(
        new URL("/dashboard/unauthorized", request.url)
      );
    }
  }
  if (matchedBaseRoute && planCapabilities === "undefined" && token) {
    return NextResponse.rewrite(
      new URL("/dashboard/subscription-error", request.url)
    );
  }

  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/auth/business-information",
    "/auth/select-business",
  ],
};

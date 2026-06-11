import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions } from "./lib/auth";

// Function name changed from 'middleware' to 'proxy'
export async function proxy(request) {
  console.log("Proxy running for:", request.nextUrl.pathname);
  
  try {
    const cookieHeader = request.cookies.get(sessionOptions.cookieName);
    const { pathname } = request.nextUrl;
    
    // Public paths
    const publicPaths = ["/", "/api/auth"];
    const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
    
    // Protected paths
    const protectedPaths = ["/dashboard", "/profile"];
    const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
    
    // Allow API routes
    if (pathname.startsWith("/api")) {
      return NextResponse.next();
    }
    
    return NextResponse.next();
  } catch (error) {
    console.error("Proxy error:", error.message);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
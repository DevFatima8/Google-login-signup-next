import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions } from "./lib/auth";

// Middleware mein directly session handle karein without async cookies issue
export async function middleware(request) {
  console.log("Middleware running for:", request.nextUrl.pathname);
  
  try {
    // Get session directly in middleware
    const cookieHeader = request.cookies.get(sessionOptions.cookieName);
    let session = null;
    
    if (cookieHeader) {
      // Parse session manually if needed
      console.log("Session cookie found");
    }
    
    const { pathname } = request.nextUrl;
    
    // Public paths
    const publicPaths = ["/", "/api/auth"];
    const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
    
    // Protected paths
    const protectedPaths = ["/dashboard", "/profile"];
    const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
    
    // Allow API routes
    if (pathname.startsWith("/api")) {
      console.log("API route, allowing access");
      return NextResponse.next();
    }
    
    // For protected routes, we'll rely on the API to check auth
    // This is a simplified middleware that doesn't check session
    // Session checking will happen in the individual routes
    
    // Redirect logged-in users from home to dashboard
    // We'll skip this in middleware since we can't reliably check session here
    // Let the client-side handle this redirect
    
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error.message);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
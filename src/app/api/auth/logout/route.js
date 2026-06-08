import { NextResponse } from "next/server";
import { destroySession } from "../../../../lib/auth";

export async function GET() {
  try {
    console.log("Logout API called");
    
    // Destroy the session
    await destroySession();
    
    console.log("Session destroyed successfully");
    
    // Create response with redirect
    const response = NextResponse.redirect(new URL("/", process.env.NEXTAUTH_URL || "http://localhost:3000"));
    
    // Clear any cookies manually (backup)
    response.cookies.delete("oauth-session");
    
    return response;
  } catch (error) {
    console.error("Logout error:", error);
    
    // Even if error, redirect to home
    const response = NextResponse.redirect(new URL("/", process.env.NEXTAUTH_URL || "http://localhost:3000"));
    response.cookies.delete("oauth-session");
    return response;
  }
}
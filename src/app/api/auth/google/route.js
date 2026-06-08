import { NextResponse } from "next/server";

export async function GET() {
  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  
  googleAuthUrl.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID);
  googleAuthUrl.searchParams.set("redirect_uri", `${process.env.NEXTAUTH_URL}/api/auth/google/callback`);
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("scope", "profile email");
  googleAuthUrl.searchParams.set("access_type", "offline");
  
  return NextResponse.redirect(googleAuthUrl.toString());
}
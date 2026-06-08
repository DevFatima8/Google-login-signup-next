import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/mongoose";
import User from "../../../../../models/User";
import { setSession } from "../../../../../lib/auth";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  
  console.log("=== GOOGLE CALLBACK STARTED ===");
  console.log("Code received:", code ? "Yes (length: " + code.length + ")" : "No");
  console.log("Error param:", error);
  
  // Check for Google errors
  if (error) {
    console.error("Google OAuth Error:", error);
    return NextResponse.redirect(new URL(`/?error=${error}`, request.url));
  }
  
  if (!code) {
    console.error("No authorization code received");
    return NextResponse.redirect(new URL("/?error=No authorization code", request.url));
  }
  
  try {
    // Verify environment variables
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/google/callback`;
    
    console.log("Environment Check:");
    console.log("- GOOGLE_CLIENT_ID exists:", !!clientId);
    console.log("- GOOGLE_CLIENT_SECRET exists:", !!clientSecret);
    console.log("- NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
    console.log("- Redirect URI:", redirectUri);
    
    if (!clientId || !clientSecret) {
      console.error("Missing Google credentials");
      return NextResponse.redirect(new URL("/?error=Missing Google credentials", request.url));
    }
    
    // Exchange code for access token
    console.log("Exchanging code for access token...");
    
    const tokenRequestBody = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    });
    
    console.log("Token request body (hidden secret)");
    
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: tokenRequestBody,
    });
    
    const tokenData = await tokenResponse.json();
    
    console.log("Token Response Status:", tokenResponse.status);
    console.log("Token Response OK:", tokenResponse.ok);
    
    if (!tokenResponse.ok) {
      console.error("Token Error Response:", JSON.stringify(tokenData, null, 2));
      const errorMessage = tokenData.error_description || tokenData.error || "Token exchange failed";
      return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(errorMessage)}`, request.url));
    }
    
    if (!tokenData.access_token) {
      console.error("No access_token in response:", tokenData);
      return NextResponse.redirect(new URL("/?error=No access token received", request.url));
    }
    
    console.log("Access token received successfully");
    
    // Get user info from Google
    console.log("Fetching user profile...");
    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });
    
    if (!userInfoResponse.ok) {
      console.error("User info error:", userInfoResponse.status);
      return NextResponse.redirect(new URL("/?error=Failed to fetch user profile", request.url));
    }
    
    const profile = await userInfoResponse.json();
    console.log("User profile fetched:", profile.email);
    
    if (!profile.id) {
      console.error("No user ID in profile");
      return NextResponse.redirect(new URL("/?error=Invalid user profile", request.url));
    }
    
    // Database operations
    console.log("Connecting to database...");
    await connectDB();
    
    let user = await User.findOne({ userId: profile.id });
    
    if (!user) {
      console.log("Creating new user...");
      user = await User.create({
        userId: profile.id,
        username: profile.name,
        email: profile.email,
        picture: profile.picture,
        provider: "google",
      });
    } else {
      console.log("Updating existing user...");
      user.username = profile.name;
      user.email = profile.email;
      user.picture = profile.picture;
      await user.save();
    }
    
    console.log("User saved, ID:", user._id);
    
    // Create session
    console.log("Creating session...");
    await setSession(user);
    console.log("Session created");
    
    // Redirect to dashboard
    console.log("Redirecting to dashboard...");
    return NextResponse.redirect(new URL("/dashboard", process.env.NEXTAUTH_URL));
    
  } catch (error) {
    console.error("Google Auth Error:", error);
    return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(error.message)}`, request.url));
  }
}
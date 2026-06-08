import { NextResponse } from "next/server";
import { getSession } from "../../../../lib/auth";
import { connectDB } from "../../../../lib/mongoose";
import User from "../../../../models/User";

export async function GET() {
  console.log("Current user API called");
  
  try {
    const session = await getSession();
    console.log("Session:", session?.user ? "User found" : "No user");
    
    if (!session?.user) {
      return NextResponse.json({ user: null });
    }
    
    await connectDB();
    const user = await User.findById(session.user.id).select("-__v");
    
    console.log("User found in DB:", user?.username);
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
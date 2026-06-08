import { NextResponse } from "next/server";
import { getSession } from "../../../../lib/auth";
import { connectDB } from "../../../../lib/mongoose";
import User from "../../../../models/User";

export async function POST(request) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { lat, lng, address, city, country } = await request.json();
    
    await connectDB();
    
    // Update user location
    const user = await User.findByIdAndUpdate(
      session.user.id,
      {
        $set: {
          location: {
            lat,
            lng,
            address: address || null,
            city: city || null,
            country: country || null,
            lastUpdated: new Date(),
          },
        },
        $push: {
          locationHistory: {
            lat,
            lng,
            address: address || null,
            timestamp: new Date(),
          },
        },
      },
      { new: true }
    );
    
    return NextResponse.json({ 
      success: true, 
      location: user.location,
      message: "Location saved successfully" 
    });
  } catch (error) {
    console.error("Error saving location:", error);
    return NextResponse.json({ error: "Failed to save location" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    await connectDB();
    const user = await User.findById(session.user.id).select("location locationHistory");
    
    return NextResponse.json({ 
      location: user.location,
      history: user.locationHistory 
    });
  } catch (error) {
    console.error("Error fetching location:", error);
    return NextResponse.json({ error: "Failed to fetch location" }, { status: 500 });
  }
}
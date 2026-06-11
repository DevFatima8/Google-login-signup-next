import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ODS";

console.log("MongoDB URI:", MONGODB_URI);

// Global variable to track connection
let isConnected = false;

export async function connectDB() {
  if (isConnected) {
    console.log("Using existing MongoDB connection");
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log("✅ MongoDB connected successfully");
    
    // Handle connection events
    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
      isConnected = false;
    });
    
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    throw error;
  }
}
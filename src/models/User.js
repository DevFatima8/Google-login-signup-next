import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  picture: {
    type: String,
  },
  provider: {
    type: String,
    enum: ["google", "facebook"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Check if model already exists to prevent overwrite
export default mongoose.models.User || mongoose.model("User", UserSchema);
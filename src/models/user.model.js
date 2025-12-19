// src/models/user.model.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    username: {
      type: String,
      unique: true,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: false, // not required for social login
    },
    role: {
      type: String,
      enum: ["Admin", "ProjectManager", "TeamLeader", "Developer", "QA"],
      default: "Developer",
    },
    avatar: {
      type: String,
      default: "",
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    phoneNumber: String,
    bio: String,
    location: String,
    department: String,
    profileComplete: { type: Boolean, default: false },
    lastLoginAt: Date,
    passwordChangedAt: Date,
    isActive: { type: Boolean, default: true },
    deletedAt: Date,
    permissions: [String],

    // -------------------- OTP Fields --------------------
    otp: String,
    otpExpires: Number,

    // -------------------- Social Login --------------------
    googleId: { type: String, default: null },
    facebookId: { type: String, default: null },
    // Add more providers like githubId, etc.
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;

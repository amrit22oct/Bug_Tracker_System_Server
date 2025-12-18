import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../../models/user.model.js";
import {
  generateUsername,
  generateToken,
} from "../../helpers/auth/auth.helper.js";
import { sendOTPEmail } from "../../utils/sendOTPEmail.js";

// ---------------- Register ----------------
export const registerService = async (data) => {
  let { name, username, email, password, role, avatar } = data;

  // Validation
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  // Check existing user
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }

  // Generate unique username if missing
  if (!username) {
    let isUnique = false;
    while (!isUnique) {
      username = generateUsername(email);
      const exists = await User.findOne({ username });
      if (!exists) isUnique = true;
    }
  }

  if (!name) name = username;

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await User.create({
    name,
    username,
    email,
    password: hashedPassword,
    role,
    avatar,
  });

  // 🚀 RETURN CLEAN DATA (schema handles formatting)
  return {
    user, // auto-transformed by toJSON
    token: generateToken(user._id, user.role),
  };
};

// ---------------- Login ----------------
export const loginService = async ({ loginId, password }) => {
  const user = await User.findOne({
    $or: [{ username: loginId }, { email: loginId }],
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Social login protection
  if (!user.password) {
    throw new Error("Login not allowed for social login");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  // ✅ Update last login time
  user.lastLoginAt = new Date();
  await user.save();

  // 🚀 RETURN RAW USER (schema transforms it)
  return {
    user,
    token: generateToken(user._id, user.role),
  };
};

// ---------------- Send OTP ----------------
export const sendOTPService = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  const otp = crypto.randomInt(100000, 999999).toString();
  user.otp = otp;
  user.otpExpires = Date.now() + 10 * 60 * 1000;

  await sendOTPEmail(email, otp);
  await user.save();
};

// ---------------- Verify OTP ----------------
export const verifyOTPService = async ({ email, otp }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  if (!user.otp || user.otp !== otp || user.otpExpires < Date.now()) {
    throw new Error("Invalid or expired OTP");
  }

  user.otp = null;
  user.otpExpires = null;
  await user.save();

  return { user, token: generateToken(user._id) };
};

// ---------------- Change Password ----------------
export const changePasswordService = async ({
  userId,
  oldPassword,
  newPassword,
}) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) throw new Error("Old password is incorrect");

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
};

// ---------------- Forgot Password ----------------
export const forgotPasswordService = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  const otp = crypto.randomInt(100000, 999999).toString();
  user.otp = await bcrypt.hash(otp, 10);
  user.otpExpires = Date.now() + 10 * 60 * 1000;

  await sendOTPEmail(email, otp);
  await user.save();
};

// ---------------- Reset Password ----------------
export const resetPasswordService = async ({ email, otp, newPassword }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  const isValid = await bcrypt.compare(otp, user.otp);
  if (!isValid || Date.now() > user.otpExpires)
    throw new Error("Invalid or expired OTP");

  user.password = await bcrypt.hash(newPassword, 10);
  user.otp = null;
  user.otpExpires = null;
  await user.save();
};

// ---------------- Get All Users ----------------
export const getAllUsersService = async () => {
  return await User.find();
};

// ---------------- Social Login ----------------
export const socialLoginService = async ({
  email,
  name,
  avatar,
  providerId,
  provider,
}) => {
  if (!email || !providerId || !provider) {
    throw new Error("Missing social login data");
  }

  let user = await User.findOne({ email });

  if (!user) {
    const username = generateUsername(email);

    const newUserData = {
      name: name || username,
      username,
      email,
      avatar,
    };

    // dynamic provider id (googleId, facebookId, etc.)
    newUserData[`${provider}Id`] = providerId;

    user = await User.create(newUserData);
  } else {
    if (!user[`${provider}Id`]) {
      user[`${provider}Id`] = providerId;
      await user.save();
    }
  }

  return {
    user,
    token: generateToken(user._id),
  };
};

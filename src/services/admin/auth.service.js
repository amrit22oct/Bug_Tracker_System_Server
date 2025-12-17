import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../../models/userModel.js";
import { generateUsername, generateToken } from "../../helpers/auth.helper.js";
import { sendOTPEmail } from "../../utils/sendOTPEmail.js";

// ---------------- Register ----------------
export const registerService = async (data) => {
  let { name, username, email, password, role, avatar } = data;

  if (!username) username = generateUsername(email);
  if (!name) name = username;

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error("User already exists");

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    username,
    email,
    password: hashedPassword,
    role,
    avatar,
  });

  return { user, token: generateToken(user._id) };
};

// ---------------- Login ----------------
export const loginService = async ({ loginId, password }) => {
  const user = await User.findOne({
    $or: [{ username: loginId }, { email: loginId }],
  });

  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  return { user, token: generateToken(user._id) };
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
export const changePasswordService = async ({ userId, oldPassword, newPassword }) => {
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
 
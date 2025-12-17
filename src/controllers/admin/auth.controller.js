import {
  registerService,
  loginService,
  sendOTPService,
  verifyOTPService,
  socialLoginService,   // ✅ ADD THIS
  getAllUsersService,
  changePasswordService,
  forgotPasswordService,
  resetPasswordService,
} from "../../services/admin/auth.service.js";


// ---------------- Register ----------------
export const register = async (req, res) => {
  try {
    const { user, token } = await registerService(req.body);
    res.status(201).json({ message: "User registered successfully", user, token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ---------------- Login ----------------
export const login = async (req, res) => {
  try {
    const { user, token } = await loginService(req.body);
    res.status(200).json({ message: "Login successful", user, token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ---------------- Login With OTP ----------------
export const loginWithOTP = async (req, res) => {
  try {
    await sendOTPService(req.body.email);
    res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ---------------- Verify OTP ----------------
export const verifyOTP = async (req, res) => {
  try {
    const { user, token } = await verifyOTPService(req.body);
    res.status(200).json({ message: "Login successful", user, token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ---------------- Change Password ----------------
export const changePassword = async (req, res) => {
  try {
    await changePasswordService(req.body);
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ---------------- Forgot Password ----------------
export const forgotPassword = async (req, res) => {
  try {
    await forgotPasswordService(req.body.email);
    res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ---------------- Reset Password ----------------
export const resetPassword = async (req, res) => {
  try {
    await resetPasswordService(req.body);
    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ---------------- Get All Users ----------------
export const getAllUsers = async (req, res) => {
  try {
    const users = await getAllUsersService();
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
};


// ---------------- Social Login ----------------
export const socialLogin = async (req, res) => {
  try {
    const { user, token } = await socialLoginService(req.body);

    res.status(200).json({
      message: "Login successful",
      user,
      token,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

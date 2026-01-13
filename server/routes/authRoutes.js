import express from "express";
import {
  register,
  login,
  logout,
  sendVerificationOtp,
  verifyEmail,
  isAuthenticated,
  sendResetPasswordOtp,
  resetPassword,
  googleLogin,
} from "../controllers/authController.js";
import userAuth from "../middleware/userAuth.js";
import {
  authLimiter,
  otpLimiter,
  passwordResetLimiter,
} from "../middleware/rateLimiter.js";

const authRoutes = express.Router();

authRoutes.post("/register", authLimiter, register);
authRoutes.post("/login", authLimiter, login);
authRoutes.post("/logout", userAuth, logout); // Require authentication for logout
authRoutes.post("/google", authLimiter, googleLogin);
authRoutes.post("/send-verify-otp", userAuth, otpLimiter, sendVerificationOtp);
authRoutes.post("/verify-account", userAuth, verifyEmail);
authRoutes.post("/is-auth", userAuth, isAuthenticated);
authRoutes.post(
  "/send-reset-password",
  passwordResetLimiter,
  sendResetPasswordOtp
);
authRoutes.post("/reset-password", passwordResetLimiter, resetPassword);

export default authRoutes;
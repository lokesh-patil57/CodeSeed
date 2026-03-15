import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/userModel.js";
import { OAuth2Client } from "google-auth-library";
import {
  sendEmailSafe,
  emailTemplates,
} from "../services/emailService.js";
import {
  generateSecureOtp,
  isValidEmail,
  validatePasswordStrength,
  getSafeErrorMessage,
} from "../utils/securityUtils.js";
import tokenBlacklist from "../utils/tokenBlacklist.js";
import auditLogger from "../utils/auditLogger.js";

// Helper to get client IP and user agent (never throws)
const getClientInfo = (req) => {
  try {
    const xff = req?.headers?.["x-forwarded-for"];
    const ip = (typeof xff === "string" ? xff.split(",")[0]?.trim() : null) || req?.ip || req?.connection?.remoteAddress || "unknown";
    const ua = (typeof req?.headers?.["user-agent"] === "string" ? req.headers["user-agent"] : null) || "unknown";
    return { ip: ip || "unknown", userAgent: ua || "unknown" };
  } catch (_) {
    return { ip: "unknown", userAgent: "unknown" };
  }
};

const jwtSign = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

// Detect production-like environment (Render sets RENDER=true)
const isProdLike = process.env.NODE_ENV === "production" || process.env.RENDER === "true";

// Centralized cookie options for auth token
const getAuthCookieOptions = () => ({
  httpOnly: true,
  secure: isProdLike,
  sameSite: isProdLike ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

export const register = async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;
  if (!username || !email || !password || !confirmPassword) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  // Validate email format
  if (!isValidEmail(email)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid email format" });
  }

  // Validate password match
  if (password !== confirmPassword) {
    return res
      .status(400)
      .json({ success: false, message: "Passwords do not match" });
  }

  // Validate password strength
  const passwordError = validatePasswordStrength(password);
  if (passwordError) {
    return res.status(400).json({ success: false, message: passwordError });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: getSafeErrorMessage("userExists", "register"),
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });
    await newUser.save();

    const token = jwtSign({ id: newUser._id });

    // Set auth cookie; in Render (prod-like) this will be SameSite=None; Secure
    res.cookie("token", token, getAuthCookieOptions());

    // Log registration
    auditLogger.logRegister(newUser._id.toString(), newUser.email, getClientInfo(req));

    const { subject, html } = emailTemplates.welcomeEmail({
      username: newUser.username,
    });

    await sendEmailSafe({
      to: newUser.email,
      subject,
      html,
      auditContext: {
        userId: newUser._id.toString(),
        email: newUser.email,
        action: "register",
        ...getClientInfo(req),
      },
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: { id: newUser._id, email: newUser.email, username: newUser.username },
    });
  } catch (error) {
    console.error("Error during registration:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: getSafeErrorMessage("serverError", "register"),
      });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      // Log failed login attempt
      auditLogger.logFailedAuth(email, "User not found", getClientInfo(req));
      return res.status(401).json({
        success: false,
        message: getSafeErrorMessage("invalidCredentials", "login"),
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Log failed login attempt
      auditLogger.logFailedAuth(email, "Invalid password", getClientInfo(req));
      return res.status(401).json({
        success: false,
        message: getSafeErrorMessage("invalidCredentials", "login"),
      });
    }

    const token = jwtSign({ id: user._id });

    res.cookie("token", token, getAuthCookieOptions());

    // Log successful login
    auditLogger.logLogin(user._id.toString(), user.email, true, getClientInfo(req));

    return res.json({
      success: true,
      message: "User logged in successfully",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        isAccountVerified: user.isAccountVerified,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({
      success: false,
      message: getSafeErrorMessage("serverError", "login"),
    });
  }
};

export const logout = async (req, res) => {
  try {
    const { token } = req.cookies;
    const userId = req.userId || req.user?.id;
    
    // If token exists, add it to blacklist
    if (token) {
      try {
        // Decode token to get expiration
        const decoded = jwt.decode(token);
        if (decoded && decoded.exp) {
          // Convert expiration to milliseconds
          const expiresAt = decoded.exp * 1000;
          tokenBlacklist.add(token, expiresAt);
        } else {
          // If we can't decode, blacklist for 7 days (default token expiry)
          tokenBlacklist.add(token, Date.now() + 7 * 24 * 60 * 60 * 1000);
        }
      } catch (err) {
        // If token is invalid, still try to blacklist it
        tokenBlacklist.add(token, Date.now() + 7 * 24 * 60 * 60 * 1000);
      }
    }

    // Get user info for audit logging
    let userEmail = 'unknown';
    if (userId) {
      try {
        const user = await User.findById(userId).select('email');
        if (user) {
          userEmail = user.email;
        }
      } catch (err) {
        // Continue even if we can't get user info
      }
    }

    // Log logout
    if (userId) {
      auditLogger.logLogout(userId.toString(), userEmail, getClientInfo(req));
    }

    res.clearCookie("token", {
      httpOnly: true,
      secure: isProdLike,
      sameSite: isProdLike ? "none" : "lax",
    });
    
    return res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    // Still clear cookie even if logging fails
    res.clearCookie("token", {
      httpOnly: true,
      secure: isProdLike,
      sameSite: isProdLike ? "none" : "lax",
    });
    return res.json({ success: true, message: "Logged out successfully" });
  }
};

export const sendVerificationOtp = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.isAccountVerified) {
      return res.status(400).json({ success: false, message: "Account already verified" });
    }

    const otp = generateSecureOtp();
    user.verifyOtp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

    try {
      auditLogger.logOtpRequest(user._id.toString(), user.email, "verification", getClientInfo(req));
    } catch (auditErr) {
      console.warn("[sendVerificationOtp] audit log failed:", auditErr?.message);
    }

    const verifyTemplate = emailTemplates.verifyOtpEmail({
      username: user.username,
      otp,
    });

    const sent = await sendEmailSafe({
      to: user.email,
      subject: verifyTemplate.subject,
      html: verifyTemplate.html,
      auditContext: {
        userId: user._id.toString(),
        email: user.email,
        action: "send_verify_otp",
        ...getClientInfo(req),
      },
    });
    if (sent) {
      console.log("[sendVerificationOtp] email sent");
      return res.json({ success: true, message: "OTP sent successfully" });
    }

    return res.status(502).json({
      success: false,
      message: "Unable to send verification email right now. Please try again later.",
    });
  } catch (error) {
    console.error("[sendVerificationOtp] error:", error?.message || error, error?.stack);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const verifyEmail = async (req, res) => {
  const { otp } = req.body;
  const userId = req.user.id;

  if (!userId || !otp) {
    return res
      .status(400)
      .json({ success: false, message: "UserId and OTP are required" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.verifyOtp === "" || user.verifyOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (Date.now() > user.otpExpiry) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.otpExpiry = 0;
    await user.save();

    // Log email verification
    auditLogger.logEmailVerification(user._id.toString(), user.email, getClientInfo(req));

    // Send verification success email
    const emailVerifiedTemplate = emailTemplates.emailVerifiedSuccessEmail({
      username: user.username,
    });

    await sendEmailSafe({
      to: user.email,
      subject: emailVerifiedTemplate.subject,
      html: emailVerifiedTemplate.html,
      auditContext: {
        userId: user._id.toString(),
        email: user.email,
        action: "verify_account_success_email",
        ...getClientInfo(req),
      },
    });

    return res.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Error during email verification:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const isAuthenticated = async (req, res) => {
  try {
    const userId = req.userId || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found",
      });
    }

    // Fetch full user data from database
    const user = await User.findById(userId).select('-password -verifyOtp -resetOtp -resetOtpExpiry -otpExpiry');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      message: "User is authenticated",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        isAccountVerified: user.isAccountVerified,
      },
    });
  } catch (error) {
    console.error("Error checking authentication:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const sendResetPasswordOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required" });
  }

  // Validate email format
  if (!isValidEmail(email)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid email format" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal whether email exists (security best practice)
      return res.json({
        success: true,
        message: getSafeErrorMessage("userNotFound", "passwordReset"),
      });
    }

    const otp = generateSecureOtp();

    user.resetOtp = otp;
    user.resetOtpExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

    // Log password reset request
    auditLogger.logPasswordResetRequest(user._id.toString(), user.email, getClientInfo(req));

    const resetOtpTemplate = emailTemplates.resetPasswordOtpEmail({
      username: user.username,
      otp,
    });

    const sent = await sendEmailSafe({
      to: user.email,
      subject: resetOtpTemplate.subject,
      html: resetOtpTemplate.html,
      auditContext: {
        userId: user._id.toString(),
        email: user.email,
        action: "send_reset_password_otp",
        ...getClientInfo(req),
      },
    });

    if (!sent) {
      return res.status(502).json({
        success: false,
        message: "Unable to send password reset email right now. Please try again later.",
      });
    }

    return res.json({ success: true, message: "Password reset OTP sent" });
  } catch (error) {
    console.error("Error sending reset password OTP:", error);
    return res.status(500).json({
      success: false,
      message: getSafeErrorMessage("serverError", "passwordReset"),
    });
  }
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Email, OTP, and password are required",
    });
  }

  // Validate email format
  if (!isValidEmail(email)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid email format" });
  }

  // Validate password strength
  const passwordError = validatePasswordStrength(newPassword);
  if (passwordError) {
    return res.status(400).json({ success: false, message: passwordError });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        success: true,
        message: getSafeErrorMessage("userNotFound", "passwordReset"),
      });
    }
    if (user.resetOtp === "" || user.resetOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
    if (Date.now() > user.resetOtpExpiry) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpiry = 0;
    await user.save();

    // Log password reset completion
    auditLogger.logPasswordReset(user._id.toString(), user.email, getClientInfo(req));

    // Send password reset success email
    const passwordResetSuccessTemplate = emailTemplates.passwordResetSuccessEmail({
      username: user.username,
    });

    await sendEmailSafe({
      to: user.email,
      subject: passwordResetSuccessTemplate.subject,
      html: passwordResetSuccessTemplate.html,
      auditContext: {
        userId: user._id.toString(),
        email: user.email,
        action: "password_reset_success_email",
        ...getClientInfo(req),
      },
    });

    return res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({
      success: false,
      message: getSafeErrorMessage("serverError", "passwordReset"),
    });
  }
};

export const googleLogin = async (req, res) => {
  const { credential } = req.body;
  if (!credential) {
    return res
      .status(400)
      .json({ success: false, message: "Credential required" });
  }

  try {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user with Google credentials
      const randomPassword = crypto.randomBytes(16).toString("hex");
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await User.create({
        username: name || email.split("@")[0],
        email,
        password: hashedPassword,
        googleId: sub,
        isAccountVerified: true, // Auto-verify Google users
      });

      // Log Google registration
      auditLogger.logRegister(user._id.toString(), user.email, {
        ...getClientInfo(req),
        method: "google_oauth",
      });

      // Send welcome email
      const googleWelcomeTemplate = emailTemplates.welcomeEmail({
        username: user.username,
      });

      await sendEmailSafe({
        to: user.email,
        subject: googleWelcomeTemplate.subject,
        html: googleWelcomeTemplate.html,
        auditContext: {
          userId: user._id.toString(),
          email: user.email,
          action: "google_register",
          ...getClientInfo(req),
        },
      });
    } else if (!user.googleId) {
      // Link Google ID to existing account
      user.googleId = sub;
      await user.save();
    }

    // Log Google login
    auditLogger.logLogin(user._id.toString(), user.email, true, {
      ...getClientInfo(req),
      method: "google_oauth",
    });

    const token = jwtSign({ id: user._id });

    res.cookie("token", token, getAuthCookieOptions());

    return res.json({
      success: true,
      message: "Google login successful",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Google login error:", error);
    return res.status(500).json({
      success: false,
      message: "Google authentication failed",
    });
  }
};

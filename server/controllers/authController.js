import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/userModel.js";
import transporter from "../config/nodemailer.js";
import { OAuth2Client } from "google-auth-library";
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

// Safe email sender: never throws; logs and skips if SMTP not configured or send fails.
// Ensures registration/login/OTP succeed even when email (Brevo) is misconfigured.
const sendEmailSafe = async (opts) => {
  // Step 1 – Force-test: check env in Render Logs after clicking Send OTP
  console.log("EMAIL ENV CHECK:", {
    SENDER_EMAIL: process.env.SENDER_EMAIL,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS ? "SET" : "MISSING",
  });

  if (!process.env.SENDER_EMAIL || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("[Email] skipping send. Set SENDER_EMAIL, SMTP_USER, SMTP_PASS in Render (or .env).");
    return false;
  }
  try {
    await transporter.sendMail(opts);
    console.log("[Email] sent successfully to", opts.to);
    return true;
  } catch (err) {
    console.error("[Email] sendMail failed:", err?.message || err);
    return false;
  }
};

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

    const welcomeEmail = {
      from: process.env.SENDER_EMAIL,
      to: newUser.email,
      subject: "Welcome to CodeSeed - Your AI Partner for Problem Solving",
      text: `Dear ${newUser.username},

Welcome to CodeSeed! We're thrilled to have you join our community of problem solvers and innovators.

YOUR ACCOUNT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Username: ${newUser.username}
Email: ${newUser.email}
Account Status: Pending Verification

NEXT STEPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
To get started and unlock the full potential of CodeSeed, please verify your email address. This helps us ensure the security of your account and enables all features.

1. Log in to your CodeSeed account
2. Navigate to the email verification page
3. Enter the OTP code that will be sent to this email address
4. Start creating amazing solutions with AI assistance!

WHAT IS CODESEED?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CodeSeed is your AI partner for:
• Understanding complex codebases
• Shipping features faster and safely
• Exploring new ideas with confidence
• Getting intelligent code suggestions
• Debugging and problem-solving

SECURITY REMINDER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Never share your password with anyone
• Use a strong, unique password
• Enable two-factor authentication when available
• Report any suspicious activity immediately

NEED HELP?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
If you have any questions or need assistance, please don't hesitate to reach out to our support team. We're here to help you succeed.

Thank you for choosing CodeSeed. We're excited to see what you'll build!

Best regards,
The CodeSeed Team

---
This is an automated message. Please do not reply to this email.
For support, visit our help center or contact support@codeseed.com`,
    };

    await sendEmailSafe(welcomeEmail);

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

    const sent = await sendEmailSafe({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "CodeSeed: Email Verification Code",
      text: `Dear ${user.username},

You've requested to verify your email address for your CodeSeed account. Please use the verification code below to complete the process.

VERIFICATION CODE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${otp}

IMPORTANT INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• This code is valid for 10 minutes only
• Enter this code on the email verification page
• Do not share this code with anyone
• If you didn't request this code, please ignore this email

SECURITY TIPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CodeSeed will never ask you for your password or verification code via email, phone, or any other method. If someone contacts you claiming to be from CodeSeed and asks for this information, it's a scam.

WHAT HAPPENS NEXT?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Once you verify your email:
✓ Your account will be fully activated
✓ You'll have access to all CodeSeed features
✓ You'll receive important account notifications
✓ Your account security will be enhanced

NEED HELP?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
If you're having trouble verifying your email or didn't request this code, please contact our support team immediately.

Best regards,
The CodeSeed Team

---
This is an automated message. Please do not reply to this email.
For support, visit our help center or contact support@codeseed.com`,
    });
    if (sent) console.log("[sendVerificationOtp] email sent");

    return res.json({ success: true, message: "OTP sent successfully" });
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
    await sendEmailSafe({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "CodeSeed: Email Verified Successfully",
      text: `Dear ${user.username},

Congratulations! Your email address has been successfully verified.

ACCOUNT STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Email Verified
✓ Account Fully Activated
✓ All Features Unlocked

Your CodeSeed account is now fully activated and ready to use. You now have access to all features and can start creating amazing solutions with AI assistance.

WHAT'S NEXT?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Start a new chat session
2. Ask questions about code, technologies, or best practices
3. Get intelligent code suggestions and solutions
4. Explore different programming languages and frameworks
5. Build amazing projects with AI-powered assistance

IMPORTANT REMINDERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Keep your account secure with a strong password
• Never share your login credentials
• Review your account settings regularly
• Enable two-factor authentication when available

NEED HELP?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
If you have any questions or need assistance, our support team is here to help. Don't hesitate to reach out!

Thank you for verifying your email and welcome to CodeSeed!

Best regards,
The CodeSeed Team

---
This is an automated message. Please do not reply to this email.
For support, visit our help center or contact support@codeseed.com`,
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

    await sendEmailSafe({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "CodeSeed: Password Reset Verification Code",
      text: `Dear ${user.username},

We received a request to reset the password for your CodeSeed account. If you made this request, please use the verification code below to proceed.

PASSWORD RESET CODE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${otp}

IMPORTANT INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• This code is valid for 10 minutes only
• Enter this code on the password reset page along with your new password
• Do not share this code with anyone
• If you didn't request a password reset, please ignore this email and your password will remain unchanged

SECURITY ALERT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
If you didn't request this password reset:
• Your account may be at risk
• Please change your password immediately
• Review your account activity
• Contact our support team if you notice any suspicious activity

HOW TO RESET YOUR PASSWORD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Go to the password reset page
2. Enter your email address: ${user.email}
3. Enter the verification code above
4. Create a strong new password
5. Confirm your new password

PASSWORD REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Your new password must:
• Be at least 8 characters long
• Contain at least one uppercase letter
• Contain at least one lowercase letter
• Contain at least one number
• Contain at least one special character

NEED HELP?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
If you're having trouble resetting your password or have security concerns, please contact our support team immediately.

Best regards,
The CodeSeed Security Team

---
This is an automated message. Please do not reply to this email.
For support, visit our help center or contact support@codeseed.com`,
    });
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
  const { email, otp, newPassword, confirmPassword } = req.body;
  if (!email || !otp || !newPassword || !confirmPassword) {
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

  // Validate password match
  if (newPassword !== confirmPassword) {
    return res
      .status(400)
      .json({ success: false, message: "Passwords do not match" });
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
    await sendEmailSafe({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "CodeSeed: Password Reset Successful",
      text: `Dear ${user.username},

Your password has been successfully reset.

ACCOUNT SECURITY UPDATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Password Changed Successfully
✓ Old Password No Longer Valid
✓ Account Security Enhanced

Your CodeSeed account password was changed on ${new Date().toLocaleString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        timeZoneName: 'short'
      })}.

IMPORTANT SECURITY INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
If you did NOT make this change:
• Your account may have been compromised
• Please change your password immediately
• Review your recent account activity
• Contact our support team right away
• Consider enabling additional security measures

If you DID make this change:
• You can now log in with your new password
• Make sure to use a strong, unique password
• Consider using a password manager
• Never share your password with anyone

SECURITY BEST PRACTICES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Use a unique password for CodeSeed (different from other accounts)
• Enable two-factor authentication when available
• Never share your password via email, phone, or chat
• Log out from shared or public computers
• Regularly review your account activity

NEED HELP?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
If you have any security concerns or need assistance, please contact our support team immediately. We're here to help keep your account secure.

Stay secure,
The CodeSeed Security Team

---
This is an automated message. Please do not reply to this email.
For support, visit our help center or contact support@codeseed.com`,
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
      await sendEmailSafe({
        from: process.env.SENDER_EMAIL,
        to: user.email,
        subject: "Welcome to CodeSeed - Your AI Partner for Problem Solving",
        text: `Dear ${user.username},

Welcome to CodeSeed! We're thrilled to have you join our community of problem solvers and innovators.

YOUR ACCOUNT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Username: ${user.username}
Email: ${user.email}
Account Status: Verified ✓
Login Method: Google OAuth

Your account has been successfully created and verified using Google authentication. You can start using CodeSeed immediately!

GETTING STARTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Log in to your CodeSeed account using your Google credentials
2. Explore the chat interface to interact with our AI assistant
3. Start asking questions, getting code suggestions, or solving problems
4. Create and manage multiple chat sessions for different projects

WHAT IS CODESEED?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CodeSeed is your AI partner for:
• Understanding complex codebases and documentation
• Shipping features faster with intelligent code suggestions
• Exploring new ideas and technologies safely
• Debugging and troubleshooting code issues
• Learning best practices and coding patterns

FEATURES YOU'LL LOVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Intelligent code generation and suggestions
✓ Multi-language support for various programming languages
✓ Code preview and syntax highlighting
✓ Chat history and conversation management
✓ Secure and private conversations

SECURITY & PRIVACY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Your conversations are encrypted and secure
• We never share your code or data with third parties
• You can delete your chat history at any time
• Your account is protected with Google's secure authentication

NEED HELP?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
If you have any questions or need assistance getting started, please don't hesitate to reach out to our support team. We're here to help you succeed.

Thank you for choosing CodeSeed. We're excited to see what you'll build!

Best regards,
The CodeSeed Team

---
This is an automated message. Please do not reply to this email.
For support, visit our help center or contact support@codeseed.com`,
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

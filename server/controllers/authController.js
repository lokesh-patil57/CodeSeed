// ...existing code...
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import transporter from "../config/nodemailer.js";

export const register = async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ success: false, message: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });
        await newUser.save();

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        //sending welcome email
        const welcomeEmail = { 
            from:process.env.SENDER_EMAIL,
            to: newUser.email,
            subject: `Welcome to CodeSeed ! `,
            text: `Hello ${newUser.username},\n\nThank you for registering at CodeSeed. We're excited to have you on board!\n\nBest regards,\nThe CodeSeed Team \n\n You account has been successfully created with the email: ${newUser.email}`,
        };

        await transporter.sendMail(welcomeEmail);

        return res.status(201).json({ success: true, message: "User registered successfully" });
    } catch (error) {
        console.error("Error during registration:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required" });
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.json({ success: true, message: "User logged in successfully" });
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export const logout = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });
    return res.json({ success: true, message: "Logged out successfully" });
};

//Send verification OTP to user email
export const sendVerificationOtp = async (req, res) => {
    try {
        const userId = req.body.userId;  // added safety
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.isAccountVerified) {
            return res.status(400).json({ success: false, message: "Account already verified" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        user.verifyOtp = otp;
        user.otpExpiry = Date.now() + 10 * 60 * 1000;
        await user.save();

        await transporter.sendMail({
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "CodeSeed: Account Verification OTP",
            text: `Your OTP is: ${otp}. Valid for 5 minutes.`,
        });

        return res.json({ success: true, message: "OTP sent" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

//Verify user email with OTP
export const verifyEmail = async (req, res) => {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
        return res.status(400).json({ success: false, message: "UserId and OTP are required" });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if(user.verifyOtp===''|| user.verifyOtp!==otp){
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        if (Date.now() > user.verifyOtpExpiryAt) {
            return res.status(400).json({ success: false, message: "OTP expired" });
        }

        // Success
        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.otpExpiry = 0;
        await user.save();

        return res.json({ success: true, message: "Email verified successfully" });

    } catch (error) {
        console.error("Error during email verification:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// Check if user is authenticated
export const isAuthenticated = async (req, res) => {
    try {
    return res.json({ success: true, message: "User is authenticated", user: req.user });
    } catch (error) {
        console.error("Error checking authentication:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}

// Send reset password OTP to user email
export const sendResetPasswordOtp = async (req, res) => {
    // Implementation for sending reset password OTP
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }   
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        user.resetOtp = otp;
        user.resetOtpExpiry = Date.now() + 10 * 60 * 1000;
        await user.save();

        await transporter.sendMail({
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "CodeSeed: Password Reset OTP",
            text: `Your password reset OTP is: ${otp}. Valid for 10 minutes.`,
        });
        return res.json({ success: true, message: "Password reset OTP sent" });
    } catch (error) {
        console.error("Error sending reset password OTP:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

//reset password using OTP
export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
        return res.status(400).json({ success: false, message: "Email, OTP and new password are required" });
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        if (user.resetOtp === '' || user.resetOtp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }
        if (Date.now() > user.resetOtpExpiry) {
            return res.status(400).json({ success: false, message: "OTP expired" });
        }   
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExpiry = 0;
        await user.save();
        return res.json({ success: true, message: "Password reset successfully" });
    } catch (error) {
        console.error("Error resetting password:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}
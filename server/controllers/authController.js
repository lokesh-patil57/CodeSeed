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
        const {userId, email} = req.body;
        const user = await User.findById(userId);
        if(user.isAccountVerified){
            return res.status(400).json({success:false, message:"Account is already verified"});
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.verifyOtp = otp;
        user.otpExpiry = Date.now() + 5 * 60 * 1000; // OTP valid for 5 minutes
        await user.save();

        const verificationMail = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "CodeSeed : Account Verification OTP",
            text: `Your OTP for account verification is: ${otp}. It is valid for 10 minutes.`,
        };
        await transporter.sendMail(verificationMail);
        return res.json({success:true, message:"Verification OTP sent to email"});

    } catch (error) {
        
    }
};
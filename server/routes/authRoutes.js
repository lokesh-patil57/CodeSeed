import express from "express";
import { register, login, logout,sendVerificationOtp, verifyEmail, isAuthenticated } from "../controllers/authController.js";
import userAuth from "../middleware/userAuth.js";

const authRoutes = express.Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.post("/logout", logout);
authRoutes.post("/send-verify-otp", userAuth, sendVerificationOtp);
authRoutes.post("/verify-account", userAuth, verifyEmail);
authRoutes.post("/is-auth", userAuth, isAuthenticated);


export default authRoutes;
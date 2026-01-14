import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import { apiLimiter } from "./middleware/rateLimiter.js";

const app = express();
const port = process.env.PORT || 3000;

// Allowed frontend origins (local + deployed)
const allowedOrigins = [
  process.env.CLIENT_URL, // preferred: set on Render
  "http://localhost:5173", // local dev (Vite default)
  "https://codeseed-cebl.onrender.com", // deployed frontend on Render
].filter(Boolean);

connectDB();

// Trust proxy for correct IP detection (important for audit logging)
// Set to true if behind a reverse proxy (nginx, load balancer, etc.)
app.set('trust proxy', process.env.TRUST_PROXY === 'true' || false);

app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (no origin) and known frontend origins
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(cookieParser());

// Apply general rate limiting to all API routes
app.use("/api/", apiLimiter);

// Security headers for iframe and preview functionality
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  // Add security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

//API endpoints
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRouter);
app.use("/api/chat", chatRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`http://localhost:3000/`);
});
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

const isProdLike =
  process.env.NODE_ENV === "production" || process.env.RENDER === "true";

const normalizeOrigin = (origin) =>
  typeof origin === "string" ? origin.trim().replace(/\/+$/, "") : "";

const allowedOriginsFromEnv = [
  normalizeOrigin(process.env.CLIENT_URL),
  ...(process.env.CLIENT_URLS || "")
    .split(",")
    .map((origin) => normalizeOrigin(origin))
    .filter(Boolean),
];

const allowedOrigins = [
  ...allowedOriginsFromEnv,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

const allowedOriginSet = new Set(allowedOrigins.map((origin) => normalizeOrigin(origin)));

const isLocalDevOrigin = (origin) => {
  if (typeof origin !== "string") return false;
  return /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
};

connectDB();

// Trust proxy for correct IP detection (Render/production deployments run behind proxy)
app.set("trust proxy", process.env.TRUST_PROXY === "true" || isProdLike);

app.use(express.json());
const corsOptions = {
  origin: (origin, callback) => {
    const normalizedOrigin = normalizeOrigin(origin);
    // Allow non-browser requests (no origin), known frontend origins,
    // and any localhost origin in development.
    if (
      !origin ||
      allowedOriginSet.has(normalizedOrigin) ||
      (!isProdLike && isLocalDevOrigin(normalizedOrigin))
    ) {
      return callback(null, true);
    }

    console.warn(`[CORS] Blocked origin: ${origin}`);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
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
  console.log(`http://localhost:${port}/`);
  const hasSenderEmail = Boolean(process.env.BREVO_SENDER_EMAIL);
  const hasApiKey = Boolean(process.env.BREVO_API_KEY);

  if (!hasSenderEmail || !hasApiKey) {
    console.warn("[Email] Brevo config incomplete. Set BREVO_SENDER_EMAIL and BREVO_API_KEY to enable transactional emails.");
  }
});
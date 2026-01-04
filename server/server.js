import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

const app = express();
const port = process.env.PORT || 3000;
const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";
connectDB();

app.use(express.json());
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);
app.use(cookieParser());

// Security headers for iframe and preview functionality
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
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
import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser"; 
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();
const port = process.env.PORT || 3000;
connectDB();

app.use(express.json());
app.use(cors({credentials:true}));
app.use(cookieParser());


//API endpoints
app.get("/", (req, res) => {
  res.send("Hello World!");

});

app.use("/api/auth", authRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`http://localhost:3000/`);

});
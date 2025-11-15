import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser"; 


const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({credentials:true}));
app.use(cookieParser());

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
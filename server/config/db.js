import mongoose from "mongoose";

const connectDB = async () => {
        const dbName = process.env.DB_NAME || "CodeSeed";
        const mongoUrl = process.env.MONGO_URL;
        const mongoUri = process.env.MONGODB_URI;

        const connectionString = mongoUri ||
            (mongoUrl
                ? `${mongoUrl}${mongoUrl.endsWith("/") ? "" : "/"}${dbName}`
                : null);

        if (!connectionString) {
            throw new Error("Missing MongoDB connection string. Set MONGODB_URI or MONGO_URL.");
        }

        await mongoose.connect(connectionString);
        console.log("MongoDB connected successfully");
};

export default connectDB;
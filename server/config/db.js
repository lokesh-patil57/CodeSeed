import mongoose from "mongoose";

const connectDB = async () => {

    await mongoose.connect(`${process.env.MONGO_URL}/CodeSeed`);
    console.log("MongoDB connected successfully");
};

export default connectDB;
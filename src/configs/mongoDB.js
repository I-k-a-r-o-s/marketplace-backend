import mongoose from "mongoose";

const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Successfully Connected to MongoDB!");
  } catch (error) {
    console.log("Error in connectMongoDB!:", error);
    process.exit(1);
  }
};

export default connectMongoDB
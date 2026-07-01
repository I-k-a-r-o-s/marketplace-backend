import dotenv from "dotenv";
dotenv.config();
// to fix a mongodb connection error. Not sure why it happens
import dns from "node:dns/promises";
dns.setServers(["8.8.8.8", "1.1.1.1"]);
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectMongoDB from "./configs/mongoDB.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";

const server = express();

server.use(express.json());
server.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);
server.use(cookieParser());

server.use("/api/auth", authRouter);
server.use("/api/user", userRouter);

const port = process.env.PORT;
const startServer = async () => {
  try {
    await connectMongoDB();
    server.listen(port, () => {
      console.log(`Server is Running on PORT: ${port}`);
    });
  } catch (error) {
    console.log("Error in startServer!:", error);
    process.exit(1);
  }
};

startServer();

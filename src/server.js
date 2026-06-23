import dotenv from "dotenv";
dotenv.config();
// to fix a mongodb connection error. Not sure why it happens
import dns from "node:dns/promises";
dns.setServers(["8.8.8.8", "1.1.1.1"]);
import express from "express";

const server = express();

const port = process.env.PORT;

const startServer = async () => {
  try {
    server.listen(port, () => {
      console.log(`Server is Running on PORT: ${PORT}`);
    });
  } catch (error) {
    console.log("Error in startServer!:", error);
    process.exit(1);
  }
};

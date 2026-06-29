import express from "express";
import {
  getAuthorizedUser,
  signIn,
  signUp,
} from "../controllers/authController.js";
import { protectedRoute } from "../middlweware/authMiddleware.js";

const authRouter = express.Router();

authRouter.post("/signup", signUp);
authRouter.post("/signin", signIn);
authRouter.get("/validate", protectedRoute, getAuthorizedUser);

export default authRouter;

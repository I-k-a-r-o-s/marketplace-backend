import express from "express";
import {
  getAuthorizedUser,
  signIn,
  signOut,
  signUp,
} from "../controllers/authController.js";
import { protectedRoute } from "../middlweware/authMiddleware.js";

const authRouter = express.Router();

authRouter.post("/signup", signUp);
authRouter.post("/signin", signIn);
authRouter.get("/validate", protectedRoute, getAuthorizedUser);
authRouter.post("/signout", protectedRoute, signOut);

export default authRouter;

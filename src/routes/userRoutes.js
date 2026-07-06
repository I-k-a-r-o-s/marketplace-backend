import express from "express";
import {
  deleteUser,
  getUserListings,
  updateUserInfo,
} from "../controllers/userController.js";
import { protectedRoute } from "../middlweware/authMiddleware.js";

const userRouter = express.Router();

userRouter.patch("/", protectedRoute, updateUserInfo);
userRouter.delete("/", protectedRoute, deleteUser);
userRouter.get("/", protectedRoute, getUserListings);

export default userRouter;

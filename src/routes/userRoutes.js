import express from "express";
import { deleteUser, updateUserInfo } from "../controllers/userController.js";
import { protectedRoute } from "../middlweware/authMiddleware.js";

const userRouter = express.Router();

userRouter.patch("/:id", protectedRoute, updateUserInfo);
userRouter.delete("/", protectedRoute, deleteUser);

export default userRouter;

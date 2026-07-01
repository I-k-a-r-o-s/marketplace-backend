import express from "express";
import { updateUserInfo } from "../controllers/userController.js";
import { protectedRoute } from "../middlweware/authMiddleware.js";

const userRouter = express.Router();

userRouter.patch("/:id", protectedRoute, updateUserInfo);

export default userRouter;

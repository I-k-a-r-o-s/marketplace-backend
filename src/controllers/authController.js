import { errorResponse } from "../helpers/responses.js";
import UserModel from "../models/userModel.js";
import validator from "validator";
import bcrypt from "bcryptjs";

export const signUp = async (req, res) => {
  try {
    const { userName, email, password } = req.body;

    if (!userName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please Enter a Valid Email!",
      });
    }

    const checkExistingUser = await UserModel.findOne({ email });
    if (checkExistingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await UserModel.create({
      userName,
      email,
      password: hashedPassword,
    });
    return res.status(201).json({
      success: true,
      message: "User Registered successfully!",
    });
  } catch (error) {
    errorResponse(res, "signup", error);
  }
};

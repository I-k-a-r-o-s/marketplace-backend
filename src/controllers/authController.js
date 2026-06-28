import { errorResponse } from "../helpers/responses.js";
import UserModel from "../models/userModel.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const oneHour = 60 * 60 * 1000;

const cookiesOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: oneHour,
};

const setCookie = (res, token) => {
  res.cookie("auth-token", token, cookiesOptions);
};

const generateToken = (res, payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
  setCookie(res, token);
};

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

    const newUser = await UserModel.create({
      userName,
      email,
      password: hashedPassword,
    });

    // Auto login after signup
    generateToken(res, { id: newUser._id });

    const { password: notSent, ...userData } = newUser.toObject(); //remove password from the response object
    return res.status(201).json({
      success: true,
      message: "User Registered successfully!",
      userData,
    });
  } catch (error) {
    errorResponse(res, "signup", error);
  }
};

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please Provide All Fields!",
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(409).json({
        success: false,
        message: "Invalid Email Format!",
      });
    }

    const isValidUser = await UserModel.findOne({ email });
    if (!isValidUser) {
      return res.status(404).json({
        success: false,
        message: "Invalid Credentials!",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      isValidUser.password,
    );
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid Credentials!",
      });
    }

    generateToken(res, { id: isValidUser._id });

    const { password: notSent, ...userData } = isValidUser.toObject(); //remove password from the response object
    return res.status(200).json({
      success: true,
      message: "Login successful!",
      userData,
    });
  } catch (error) {
    errorResponse(res, "signin", error);
  }
};

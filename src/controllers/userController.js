import { errorResponse } from "../helpers/responses.js";
import bcrypt from "bcryptjs";
import validator from "validator";
import UserModel from "../models/userModel.js";

export const updateUserInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const { userName, email, password } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required!",
      });
    }

    const existingUser = await UserModel.findById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    if (req.user.id !== id) {
      return res.status(401).json({
        success: false,
        message: "You can only update your own account!",
      });
    }

    if (!userName && !email && !password) {
      return res.status(400).json({
        success: false,
        message:
          "At least one field (userName, email, or password) is required to update!",
      });
    }

    const updateData = {};

    if (userName) {
      updateData.userName = userName.trim();
    }

    if (email) {
      if (!validator.isEmail(email)) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid email!",
        });
      }

      const emailExists = await UserModel.findOne({
        email,
        _id: { $ne: id }, // Exclude current user
      });
      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: "Email already in use!",
        });
      }
      updateData.email = email;
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const updatedUser = await UserModel.findByIdAndUpdate(id, updateData, {
      returnDocument: "after",
    });

    const { password: notSent, ...userData } = updatedUser.toObject();

    return res.status(200).json({
      success: true,
      message: "Information updated successfully",
      userData,
    });
  } catch (error) {
    errorResponse(res, "updateUserInfo", error);
  }
};

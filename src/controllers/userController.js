import { errorResponse } from "../helpers/responses.js";
import bcrypt from "bcryptjs";
import validator from "validator";
import UserModel from "../models/userModel.js";
import { cookiesOptions } from "../utils/authTokenCookies.js";
import ListingModel from "../models/listingModel.js";

export const updateUserInfo = async (req, res) => {
  try {
    const { userName, email, password } = req.body;
    const id = req.user.id;

    const existingUser = await UserModel.findById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
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

export const deleteUser = async (req, res) => {
  try {
    const user = await UserModel.findByIdAndDelete(req.user.id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User doesn't exist!",
      });
    }

    res.clearCookie("auth-token", cookiesOptions);
    return res.status(200).json({
      success: true,
      message: "User deleted successfully!",
    });
  } catch (error) {
    errorResponse(res, "deleteUser", error);
  }
};

export const getUserListings = async (req, res) => {
  try {
    const listings = await ListingModel.find({ userRef: req.user.id })
      .select(
        "name address description typeOfPlace price discountedPrice offer bedrooms bathrooms images cloudinaryImagePublicIds createdAt",
      )
      .sort({
        createdAt: -1,
      });
    if (!listings) {
      return res.status(404).json({
        success: false,
        message: "No listings found!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Listings fetched successfully!",
      listings,
    });
  } catch (error) {
    errorResponse(res, "getUserListings", error);
  }
};

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await UserModel.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User doesn't exist!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User fetched successfully!",
      user,
    });
  } catch (error) {
    errorResponse(res, "getUser", error);
  }
};

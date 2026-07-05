import { errorResponse } from "../helpers/responses.js";
import ListingModel from "../models/listingModel.js";
import { v2 as cloudinary } from "cloudinary";

export const createListing = async (req, res) => {
  try {
    const id = req.user.id;
    const data = JSON.parse(req.body.data);
    const imageFiles = req.files;

    const {
      name,
      description,
      address,
      price,
      discountedPrice,
      bathrooms,
      bedrooms,
      furnished,
      parking,
      typeOfPlace,
      offer,
    } = data;

    if (
      !name ||
      !description ||
      !address ||
      !typeOfPlace ||
      price == null ||
      bathrooms == null ||
      bedrooms == null ||
      furnished == null ||
      parking == null ||
      offer == null
    ) {
      return res.status(400).json({
        success: false,
        message: "Required Fields are Not Provided!",
      });
    }

    const finalDiscountedPrice = offer ? discountedPrice : undefined;

    if (
      offer &&
      (finalDiscountedPrice == null || finalDiscountedPrice >= price)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid discount price",
      });
    }

    if (!imageFiles || imageFiles.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one image is required",
      });
    }

    if (imageFiles.length > 6) {
      return res.status(400).json({
        success: false,
        message: "Maximum 6 images allowed",
      });
    }

    const imageURLs = await Promise.all(
      imageFiles.map(async (file) => {
        const uploadResult = await cloudinary.uploader.upload(file.path, {
          folder: "marketplace",
        });
        return uploadResult.secure_url;
      }),
    );

    const listing = await ListingModel.create({
      name,
      description,
      address,
      price,
      discountedPrice: finalDiscountedPrice,
      bathrooms,
      bedrooms,
      furnished,
      parking,
      typeOfPlace,
      offer,
      images: imageURLs,
      userRef: id,
    });
    res.status(201).json({
      success: true,
      message: "Listing created successfully",
    });
  } catch (error) {
    errorResponse(res, "createListing", error);
  }
};

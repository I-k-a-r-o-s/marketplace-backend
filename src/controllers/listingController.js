import { errorResponse } from "../helpers/responses.js";
import ListingModel from "../models/listingModel.js";

export const createListing = async (req, res) => {
  try {
    const id = req.user.id;
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
      image,
    } = req.body;

    if (
      !name ||
      !description ||
      !address ||
      !typeOfPlace ||
      price == null ||
      discountedPrice == null ||
      bathrooms == null ||
      bedrooms == null ||
      furnished == null ||
      parking == null ||
      offer == null ||
      !Array.isArray(image) ||
      image.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const listing = await ListingModel.create({
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
      image,
      userRef: id,
    });
    res.status(201).json({
      success: true,
      message: "Listing created successfully",
      listingData: listing,
    });
  } catch (error) {
    errorResponse(res, "createListing", error);
  }
};

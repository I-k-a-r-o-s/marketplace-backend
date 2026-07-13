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

    const numericPrice = Number(price);
    const numericDiscountedPrice = Number(discountedPrice);
    const numericBathrooms = Number(bathrooms);
    const numericBedrooms = Number(bedrooms);

    if (
      !name ||
      !description ||
      !address ||
      !typeOfPlace ||
      price == null ||
      price === "" ||
      Number.isNaN(numericPrice) ||
      (offer &&
        (discountedPrice == null || Number.isNaN(numericDiscountedPrice))) ||
      bathrooms == null ||
      bathrooms === "" ||
      bedrooms == null ||
      bedrooms === "" ||
      Number.isNaN(numericBathrooms) ||
      Number.isNaN(numericBedrooms) ||
      furnished == null ||
      parking == null ||
      offer == null
    ) {
      return res.status(400).json({
        success: false,
        message: "Required Fields are Not Provided!",
      });
    }

    const finalDiscountedPrice = offer ? numericDiscountedPrice : undefined;

    if (
      offer &&
      (finalDiscountedPrice == null || finalDiscountedPrice >= numericPrice)
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

    const uploadResults = await Promise.all(
      imageFiles.map(async (file) => {
        const uploadResult = await cloudinary.uploader.upload(file.path, {
          folder: "marketplace",
        });
        return uploadResult;
      }),
    );

    const imageURLs = uploadResults.map((result) => result.secure_url);
    const cloudinaryImagePublicIds = uploadResults.map(
      (result) => result.public_id,
    );

    const listing = await ListingModel.create({
      name,
      description,
      address,
      price: numericPrice,
      discountedPrice: finalDiscountedPrice,
      bathrooms: numericBathrooms,
      bedrooms: numericBedrooms,
      furnished,
      parking,
      typeOfPlace,
      offer,
      images: imageURLs,
      cloudinaryImagePublicIds,
      userRef: id,
    });
    res.status(201).json({
      success: true,
      message: "Listing created successfully",
      listing,
    });
  } catch (error) {
    errorResponse(res, "createListing", error);
  }
};

export const deleteListing = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedListing = await ListingModel.findOneAndDelete({
      _id: id,
      userRef: req.user.id,
    });
    if (!deletedListing) {
      return res.status(404).json({
        success: false,
        message: "Listing doesn't exist or unauthorized!",
      });
    }

    const publicIds = deletedListing.cloudinaryImagePublicIds || [];
    if (publicIds.length > 0) {
      await Promise.all(
        publicIds.map(async (publicId) => {
          await cloudinary.uploader.destroy(publicId);
        }),
      );
    }

    return res.status(200).json({
      success: true,
      message: "Listing Deleted Successfully!",
    });
  } catch (error) {
    errorResponse(res, "deleteListing", error);
  }
};

export const updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const existingListing = await ListingModel.findOne({
      _id: id,
      userRef: req.user.id,
    });

    if (!existingListing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found or unauthorized!",
      });
    }

    const data = req.body?.data ? JSON.parse(req.body.data) : {};
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
      existingImagePublicIds,
    } = data;

    const updateFields = {};

    if (name !== undefined) updateFields.name = name;
    if (description !== undefined) updateFields.description = description;
    if (address !== undefined) updateFields.address = address;
    if (typeOfPlace !== undefined) updateFields.typeOfPlace = typeOfPlace;
    if (furnished !== undefined) updateFields.furnished = furnished;
    if (parking !== undefined) updateFields.parking = parking;
    if (offer !== undefined) updateFields.offer = offer;

    if (price !== undefined) {
      const numericPrice = Number(price);
      if (Number.isNaN(numericPrice)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid price" });
      }
      updateFields.price = numericPrice;
    }

    if (discountedPrice !== undefined) {
      const numericDiscountedPrice = Number(discountedPrice);
      if (Number.isNaN(numericDiscountedPrice)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid discounted price" });
      }
      updateFields.discountedPrice = numericDiscountedPrice;
    }

    if (bathrooms !== undefined) {
      const numericBathrooms = Number(bathrooms);
      if (Number.isNaN(numericBathrooms)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid bathrooms value" });
      }
      updateFields.bathrooms = numericBathrooms;
    }

    if (bedrooms !== undefined) {
      const numericBedrooms = Number(bedrooms);
      if (Number.isNaN(numericBedrooms)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid bedrooms value" });
      }
      updateFields.bedrooms = numericBedrooms;
    }

    const willHaveOffer = offer !== undefined ? offer : existingListing.offer;
    const priceToCheck =
      updateFields.price !== undefined
        ? updateFields.price
        : existingListing.price;
    const discountedToCheck =
      updateFields.discountedPrice !== undefined
        ? updateFields.discountedPrice
        : existingListing.discountedPrice;

    if (
      willHaveOffer &&
      (discountedToCheck == null || discountedToCheck >= priceToCheck)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid discount price" });
    }

    if (offer === false) {
      updateFields.discountedPrice = undefined;
    }

    let finalImages = [...(existingListing.images || [])];
    let finalPublicIds = [...(existingListing.cloudinaryImagePublicIds || [])];
    let newlyUploadedPublicIds = [];

    if (existingImagePublicIds === undefined) {
      finalImages = [...(existingListing.images || [])];
      finalPublicIds = [...(existingListing.cloudinaryImagePublicIds || [])];
    } else if (Array.isArray(existingImagePublicIds)) {
      const keptImages = [];
      const keptPublicIds = [];

      existingImagePublicIds.forEach((publicId) => {
        const index = (existingListing.cloudinaryImagePublicIds || []).indexOf(
          publicId,
        );
        if (index !== -1) {
          keptImages.push(existingListing.images[index]);
          keptPublicIds.push(existingListing.cloudinaryImagePublicIds[index]);
        }
      });

      finalImages = keptImages;
      finalPublicIds = keptPublicIds;
    }

    if (imageFiles && imageFiles.length > 0) {
      if (finalImages.length + imageFiles.length > 6) {
        return res
          .status(400)
          .json({ success: false, message: "Maximum 6 images allowed!" });
      }

      const uploadResults = await Promise.all(
        imageFiles.map(async (file) => {
          const uploadResult = await cloudinary.uploader.upload(file.path, {
            folder: "marketplace",
          });
          return uploadResult;
        }),
      );

      const newImageURLs = uploadResults.map((result) => result.secure_url);
      const newPublicIds = uploadResults.map((result) => result.public_id);

      finalImages = finalImages.concat(newImageURLs);
      finalPublicIds = finalPublicIds.concat(newPublicIds);
      newlyUploadedPublicIds = newPublicIds;
    }

    if (!finalImages || finalImages.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "At least one image is required" });
    }

    const toDeletePublicIds = (
      existingListing.cloudinaryImagePublicIds || []
    ).filter((publicId) => !finalPublicIds.includes(publicId));

    updateFields.images = finalImages;
    updateFields.cloudinaryImagePublicIds = finalPublicIds;

    let listing;

    const cleanupUploadedImages = async () => {
      if (newlyUploadedPublicIds.length > 0) {
        await Promise.all(
          newlyUploadedPublicIds.map(async (publicId) => {
            try {
              await cloudinary.uploader.destroy(publicId);
            } catch (error) {
              console.log(
                `Failed to rollback Cloudinary image ${publicId}:`,
                error,
              );
            }
          }),
        );
      }
    };

    try {
      listing = await ListingModel.findOneAndUpdate(
        {
          _id: id,
          userRef: req.user.id,
        },
        updateFields,
        {
          returnDocument: "after",
        },
      );
    } catch (error) {
      await cleanupUploadedImages();
      console.log("Failed to update database!:", error);
    }

    if (!listing) {
      await cleanupUploadedImages();

      return res.status(404).json({
        success: false,
        message: "Listing not found or unauthorized!",
      });
    }

    if (toDeletePublicIds.length > 0) {
      await Promise.all(
        toDeletePublicIds.map(async (publicId) => {
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (error) {
            console.log(
              `Failed to delete removed Cloudinary image ${publicId}:`,
              error,
            );
          }
        }),
      );
    }

    return res.status(200).json({
      success: true,
      message: "Listing updated successfully.",
      listing,
    });
  } catch (error) {
    errorResponse(res, "updateListing", error);
  }
};

export const getListing = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await ListingModel.findById(id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found!.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Listing fetched successfully.",
      listing,
    });
  } catch (error) {
    errorResponse(res, "getListing", error);
  }
};

export const findListings = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 9;
    const startIndex = Number(req.query.startIndex) || 0;

    const searchTerm = req.query.searchTerm || "";
    const sort = req.query.sort || "createdAt";
    const order = req.query.order || "desc";

    const { offer, furnished, parking, typeOfPlace } = req.query;

    const query = {
      name: {
        $regex: searchTerm, //mongodb built in search
        $options: "i", //means case insensitive for mongodb
      },
    };

    if (offer !== undefined) {
      query.offer = offer === "true";
    }

    if (furnished !== undefined) {
      query.furnished = furnished === "true";
    }

    if (parking !== undefined) {
      query.parking = parking === "true";
    }

    if (typeOfPlace && typeOfPlace !== "all") {
      query.typeOfPlace = typeOfPlace;
    }

    const allowedSortFields = ["createdAt", "price", "updatedAt"];

    const sortField = allowedSortFields.includes(sort) ? sort : "createdAt";

    const sortOrder = order === "asc" ? 1 : -1;

    const foundListings = await ListingModel.find(query)
      .sort({
        [sortField]: sortOrder,
      })
      .select("-cloudinaryImagePublicIds")
      .limit(limit)//maximum amount of results
      .skip(startIndex);//skip the first (this many):-for show more functionality

    return res.status(200).json({
      success: true,
      message: "Search complete",
      foundListings,
    });
  } catch (error) {
    errorResponse(res, "findListings", error);
  }
};

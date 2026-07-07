import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    address: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    discountedPrice: { type: Number, required: false, min: 0 },
    bathrooms: { type: Number, required: true, min: 0 },
    bedrooms: { type: Number, required: true, min: 0 },
    furnished: { type: Boolean, required: true },
    parking: { type: Boolean, required: true },
    typeOfPlace: { type: String, enum: ["rent", "sell"], required: true },
    offer: { type: Boolean, required: true, default: false },
    images: { type: [String], required: true },
    cloudinaryImagePublicIds: { type: [String], required: true, default: [] },
    userRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      required: true,
    },
  },
  { timestamps: true },
);

const ListingModel =
  mongoose.models.ListingModel || mongoose.model("ListingModel", listingSchema);

export default ListingModel;

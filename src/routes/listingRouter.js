import express from "express";
import { protectedRoute } from "../middlweware/authMiddleware.js";
import upload from "../middlweware/multer.js";
import { createListing } from "../controllers/listingController.js";

const listingRouter = express.Router();

listingRouter.post(
  "/",
  protectedRoute,
  upload.array("images", 6),
  createListing,
);

export default listingRouter;

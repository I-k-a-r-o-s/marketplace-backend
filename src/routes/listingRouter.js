import express from "express";
import { protectedRoute } from "../middlweware/authMiddleware.js";
import upload from "../middlweware/multer.js";
import {
  createListing,
  deleteListing,
} from "../controllers/listingController.js";

const listingRouter = express.Router();

listingRouter.post(
  "/",
  protectedRoute,
  upload.array("images", 6),
  createListing,
);
listingRouter.delete("/:id", protectedRoute, deleteListing);

export default listingRouter;

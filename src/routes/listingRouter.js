import express from "express";
import { protectedRoute } from "../middlweware/authMiddleware.js";
import upload from "../middlweware/multer.js";
import {
  createListing,
  deleteListing,
  getListing,
  updateListing,
} from "../controllers/listingController.js";

const listingRouter = express.Router();

listingRouter.post(
  "/",
  protectedRoute,
  upload.array("images", 6),
  createListing,
);
listingRouter.delete("/:id", protectedRoute, deleteListing);
listingRouter.patch(
  "/:id",
  protectedRoute,
  upload.array("images", 6),
  updateListing,
);
listingRouter.get("/:id", getListing);

export default listingRouter;

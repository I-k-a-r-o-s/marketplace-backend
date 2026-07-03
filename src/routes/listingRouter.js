import express from "express";
import { protectedRoute } from "../middlweware/authMiddleware.js";
import { createListing } from "../controllers/listingController.js";

const listingRouter = express.Router();

listingRouter.post("/", protectedRoute, createListing);

export default listingRouter
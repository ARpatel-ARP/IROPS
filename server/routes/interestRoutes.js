import express from "express";
import { createInterest } from "../controllers/interestController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorizeRoles("EMPLOYEE"),
  createInterest
);

export default router;
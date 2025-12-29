// routes/dashboard.routes.js
import express from "express";
import { getMonthlyDashboard } from "../controllers/dashboard.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET /api/v1/dashboard/get-data?month=YYYY-MM
 */
router.get("/get-data", protect, getMonthlyDashboard);

export default router;

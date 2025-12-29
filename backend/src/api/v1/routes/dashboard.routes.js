// routes/dashboard.routes.js
import express from "express";
import { getMonthlyDashboard, getMonthEntryDates } from "../controllers/dashboard.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET /api/v1/dashboard/get-data?month=YYYY-MM
 */
router.get("/get-data", protect, getMonthlyDashboard);
router.get("/month-entries", protect, getMonthEntryDates);

export default router;

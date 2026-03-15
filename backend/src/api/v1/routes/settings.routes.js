import express from "express";
import { getSettings, upsertSettings, addDuration } from "../controllers/settings.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/get", protect, getSettings);
router.post("/save", protect, upsertSettings);
router.post("/save-duration", protect, addDuration);

export default router;
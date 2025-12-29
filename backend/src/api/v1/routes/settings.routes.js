import express from "express";
import { getSettings, upsertSettings } from "../controllers/settings.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/get", protect, getSettings);
router.post("/save", protect, upsertSettings);

export default router;
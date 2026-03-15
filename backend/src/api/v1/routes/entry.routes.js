import express from "express";
import { saveEntry, getEntryByDate } from "../controllers/entry.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/save", protect, saveEntry);
router.get("/get", protect, getEntryByDate);

export default router;

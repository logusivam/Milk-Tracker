import express from "express";
import { getUserHistory } from "../controllers/history.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/get", protect, getUserHistory);

export default router;

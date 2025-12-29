import express from "express";
import authRoutes from "./authRoutes.js";
import settingsRoutes from "./settings.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/settings", settingsRoutes);

export default router;

import express from "express";
import authRoutes from "./authRoutes.js";
import settingsRoutes from "./settings.routes.js";
import entryRoutes from "./entry.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/settings", settingsRoutes);
router.use("/entry", entryRoutes);

export default router;

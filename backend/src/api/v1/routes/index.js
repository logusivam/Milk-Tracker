import express from "express";
import authRoutes from "./authRoutes.js";
import settingsRoutes from "./settings.routes.js";
import entryRoutes from "./entry.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import historyRoutes from "./history.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/settings", settingsRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/entry", entryRoutes);
router.use("/history", historyRoutes);

export default router;

// controllers/dashboard.controller.js
import Dashboard from "../../../models/dashboard.model.js";
import cache, { dashboardCacheKey } from "../../../utils/cache.js";

export const getMonthlyDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // default: current month (YYYY-MM)
    const month =
      req.query.month ||
      new Date().toISOString().slice(0, 7);

    const cacheKey = dashboardCacheKey(userId, month);

    // 1. CACHE HIT
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json({
        source: "cache",
        data: cached
      });
    }

    // 2. DB QUERY
    const dashboard = await Dashboard.findOne({
      user_id: userId,
      month
    }).lean();

    // if no data yet, return empty structure (UI-safe)
    const response = dashboard || {
      user_id: userId,
      month,
      total_quantity: 0,
      total_cost: 0,
      history: []
    };

    // 3. STORE IN CACHE
    cache.set(cacheKey, response);

    res.json({
      source: "db",
      data: response
    });
  } catch (err) {
    next(err);
  }
};

export const getMonthEntryDates = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month } = req.query; // YYYY-MM

    if (!month) {
      return res.status(400).json({ message: "Month required" });
    }

    const cacheKey = dashboardCacheKey(userId, month);
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const dashboard = await Dashboard.findOne(
      { user_id: userId, month },
      { history: 1, _id: 0 }
    ).lean();

    const dates = dashboard
      ? dashboard.history.map((h) => h.date)
      : [];

    const response = { dates };

    cache.set(cacheKey, response);
    res.json(response);
  } catch {
    res.status(500).json({ message: "Failed to load month entries" });
  }
};
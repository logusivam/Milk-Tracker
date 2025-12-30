import Dashboard from "../../../models/dashboard.model.js";
import cache, { dashboardCacheKey } from "../../../utils/cache.js";

function monthToDateRange(month) {
  return {
    start: `${month}-01`,
    end: `${month}-31`
  };
}

// GET dashboard data for selected calendar month
export const getMonthlyDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const month =
      req.query.month || new Date().toISOString().slice(0, 7);

    const { start, end } = monthToDateRange(month);

    // 1️⃣ Find the ACTIVE duration dashboard
    const dashboard = await Dashboard.findOne({
      user_id: userId,
      start_date: { $lte: end },
      $or: [
        { end_date: null },
        { end_date: { $gte: start } }
      ]
    })
      .sort({ start_date: -1 }) // latest matching duration wins
      .lean();

    if (!dashboard) {
      return res.json({
        source: "db",
        data: {
          user_id: userId,
          total_quantity: 0,
          total_cost: 0,
          history: []
        }
      });
    }

    const cacheKey = dashboardCacheKey(
      userId,
      `duration_${dashboard.duration_index}`
    );

    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json({ source: "cache", data: cached });
    }

    const response = {
      user_id: userId,
      duration_index: dashboard.duration_index,
      start_date: dashboard.start_date,
      end_date: dashboard.end_date,
      total_quantity: dashboard.total_quantity,
      total_cost: dashboard.total_cost,
      history: dashboard.history
    };

    cache.set(cacheKey, response);

    res.json({ source: "db", data: response });
  } catch (err) {
    next(err);
  }
};

// GET entry dates for calendar ticks (still month-based, correct)
export const getMonthEntryDates = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month } = req.query;

    if (!month) {
      return res.status(400).json({ message: "Month required" });
    }

    const { start, end } = monthToDateRange(month);

    const dashboards = await Dashboard.find({
      user_id: userId,
      start_date: { $lte: end },
      $or: [
        { end_date: null },
        { end_date: { $gte: start } }
      ]
    }).lean();

    const dates = [];

    for (const dash of dashboards) {
      for (const h of dash.history) {
        if (h.date >= start && h.date <= end) {
          dates.push(h.date);
        }
      }
    }

    res.json({ dates: [...new Set(dates)] });
  } catch {
    res.status(500).json({ message: "Failed to load month entries" });
  }
};

import History from "../../../models/history.model.js";
import cache, { historyCacheKey } from "../../../utils/cache.js";

export const getUserHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const cacheKey = historyCacheKey(userId);

    // 1️⃣ cache first
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json({
        source: "cache",
        data: cached
      });
    }
    // 2️⃣ fallback to DB
    const histories = await History.find({ user_id: userId })
      .sort({ duration_index: 1 })
      .lean();

    // 3️⃣ populate cache (even empty array)
    cache.set(cacheKey, histories);

    res.json({
      source: "db",
      data: histories
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch history" });
  }
};

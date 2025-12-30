// settings.controller.js
import Settings from "../../../models/settings.model.js";
import cache, { settingsCacheKey } from "../../../utils/cache.js";

export const getSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const cacheKey = settingsCacheKey(userId);

    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const settings = await Settings.findOne({ user_id: userId }).lean();
    if (!settings) {
      return res.status(404).json({ message: "Settings not found" });
    }

    cache.set(cacheKey, settings);
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch settings" });
  }
};

export const upsertSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { price_per_litre, default_milk_value } = req.body;

    const settings = await Settings.findOneAndUpdate(
      { user_id: userId },
      { price_per_litre, default_milk_value },
      { new: true, upsert: true }
    ).lean();

    // update cache
    cache.set(settingsCacheKey(userId), settings);

    // ⚠️ optional but correct: invalidate dependent entry caches
    // cache.flushAll(); // or targeted invalidation later

    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: "Failed to save settings" });
  }
};

export const addDuration = async (req, res) => {
  try {
    const userId = req.user.id;
    const { start_date, end_date } = req.body;

    if (!start_date || !end_date) {
      return res.status(400).json({ message: "Invalid duration" });
    }

    const settings = await Settings.findOneAndUpdate(
      { user_id: userId },
      {
        $push: {
          duration: { start_date, end_date }
        }
      },
      { new: true, upsert: true }
    ).lean();

    cache.set(settingsCacheKey(userId), settings);
    res.json(settings);
  } catch {
    res.status(500).json({ message: "Failed to save duration" });
  }
};

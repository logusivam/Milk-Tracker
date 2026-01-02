// settings.controller.js
import Settings from "../../../models/settings.model.js";
import cache, { settingsCacheKey } from "../../../utils/cache.js";

// GET settings
export const getSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const cacheKey = settingsCacheKey(userId);

    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json({ source: "cache", data: cached });
    }

    const settings = await Settings.findOne({ user_id: userId }).lean();
    if (!settings) {
      return res.status(404).json({ message: "Settings not found" });
    }

    cache.set(cacheKey, settings);
    res.json({ source: "db", data: settings });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch settings" });
  }
};

// UPSERT settings
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

// ADD duration start and end dates
export const addDuration = async (req, res) => {
  try {
    const userId = req.user.id;
    const { start_date, end_date } = req.body;

    if (!start_date) {
      return res.status(400).json({ message: "Start date is required" });
    }

    // check if duration with same start_date exists
    const existing = await Settings.findOne({
      user_id: userId,
      "duration.start_date": start_date
    });

    let settings;

    if (existing) {
      // update end_date of the matched start_date
      settings = await Settings.findOneAndUpdate(
        {
          user_id: userId,
          "duration.start_date": start_date
        },
        {
          $set: {
            "duration.$.end_date": end_date
          }
        },
        { new: true }
      ).lean();
    } else {
      // push new duration
      settings = await Settings.findOneAndUpdate(
        { user_id: userId },
        {
          $push: {
            duration: { start_date, end_date }
          }
        },
        { new: true, upsert: true }
      ).lean();
    }

    cache.set(settingsCacheKey(userId), settings);
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: "Failed to save duration" });
  }
};

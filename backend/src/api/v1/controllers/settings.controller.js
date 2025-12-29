import Settings from "../../../models/settings.model.js";
import settingsCache from "../../../utils/cache.js";

const CACHE_KEY_PREFIX = "settings_";

export const getSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const cacheKey = `${CACHE_KEY_PREFIX}${userId}`;

    const cachedData = settingsCache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    const settings = await Settings.findOne({ user_id: userId }).lean();
    if (!settings) {
      return res.status(404).json({ message: "Settings not found" });
    }

    settingsCache.set(cacheKey, settings);
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

    const cacheKey = `${CACHE_KEY_PREFIX}${userId}`;
    settingsCache.set(cacheKey, settings);

    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: "Failed to save settings" });
  }
};

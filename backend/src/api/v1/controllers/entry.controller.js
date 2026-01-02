// entry.controller.js
import Entry from "../../../models/entry.model.js";
import Settings from "../../../models/settings.model.js";
import cache, {
  settingsCacheKey,
  entryCacheKey
} from "../../../utils/cache.js";

export const saveEntry = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.query;
    const { quantity_ml } = req.body;

    if (!date || !quantity_ml) {
      return res.status(400).json({ message: "Missing data" });
    }

    // 1️⃣ get settings (cache → db)
    const settingsKey = settingsCacheKey(userId);
    let settings = cache.get(settingsKey);

    if (!settings) {
      settings = await Settings.findOne({ user_id: userId }).lean();
      if (!settings) {
        return res.status(404).json({ message: "Settings not found" });
      }
      cache.set(settingsKey, settings);
    }

    // 2️⃣ calculate cost
    const cost = (quantity_ml / 1000) * settings.price_per_litre;

    // 3️⃣ UPSERT entry (update if exists, else create)
    const entry = await Entry.findOneAndUpdate(
      { user_id: userId, date },
      {
        quantity: quantity_ml,
        cost
      },
      { upsert: true, new: true }
    );


    // 4️⃣ cache entry
    cache.set(entryCacheKey(userId, date), entry);

    res.json(entry);
  } catch (err) {
    res.status(500).json({ message: "Failed to save entry" });
  }
};

export const getEntryByDate = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.query;

    const cacheKey = entryCacheKey(userId, date);
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ source: "cache", data: cached });

    const entry = await Entry.findOne({ user_id: userId, date }).lean();
    if (!entry) return res.sendStatus(404);

    cache.set(cacheKey, entry);
    res.json({ source: "db", data: entry });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch entry" });
  }
};

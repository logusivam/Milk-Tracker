import Entry from "../models/entry.model.js";
import Settings from "../models/settings.model.js";
import History from "../models/history.model.js";

function isDateInRange(date, start, end) {
  if (date < start) return false;
  if (end && date > end) return false;
  return true;
}

export async function rebuildAllHistoryForUser(userId) {
  const settings = await Settings.findOne({ user_id: userId }).lean();
  if (!settings) return;

  const entries = await Entry.find({ user_id: userId }).lean();

  for (let i = 0; i < settings.duration.length; i++) {
    const { start_date, end_date } = settings.duration[i];

    let overall_quantity = 0;
    let overall_cost = 0;
    const history = [];

    for (const e of entries) {
      if (isDateInRange(e.date, start_date, end_date)) {
        overall_quantity += e.quantity;
        overall_cost += e.cost;

        history.push({
          date: e.date,
          quantity: e.quantity,
          price: e.cost
        });
      }
    }

    await History.findOneAndUpdate(
      { user_id: userId, duration_index: i },
      {
        user_id: userId,
        start_date,
        end_date: end_date || null,
        overall_quantity,
        overall_cost,
        history
      },
      { upsert: true }
    );
  }
}

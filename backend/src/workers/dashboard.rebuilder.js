import Entry from "../models/entry.model.js";
import Settings from "../models/settings.model.js";
import Dashboard from "../models/dashboard.model.js";

function isDateInRange(date, start, end) {
  if (date < start) return false;
  if (end && date > end) return false;
  return true;
}

export async function rebuildAllDashboardsForUser(userId) {
  const settings = await Settings.findOne({ user_id: userId }).lean();
  if (!settings) return;

  const entries = await Entry.find({ user_id: userId }).lean();

  for (let i = 0; i < settings.duration.length; i++) {
    const { start_date, end_date } = settings.duration[i];

    let total_quantity = 0;
    let total_cost = 0;
    const history = [];

    for (const e of entries) {
      if (isDateInRange(e.date, start_date, end_date)) {
        total_quantity += e.quantity;
        total_cost += e.cost;
        history.push({
          date: e.date,
          quantity: e.quantity,
          price: e.cost
        });
      }
    }

    await Dashboard.findOneAndUpdate(
      { user_id: userId, duration_index: i },
      {
        start_date,
        end_date: end_date || null,
        total_quantity,
        total_cost,
        history
      },
      { upsert: true }
    );
  }
}

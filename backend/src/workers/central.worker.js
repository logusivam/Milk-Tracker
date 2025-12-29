import Entry from "../models/entry.model.js";
import Dashboard from "../models/dashboard.model.js";

function getMonth(dateStr) {
  // YYYY-MM-DD → YYYY-MM
  return dateStr.slice(0, 7);
}

export function startDashboardWorker() {
  const changeStream = Entry.watch([], { fullDocument: "updateLookup" });

  changeStream.on("change", async (change) => {
    try {
      const entry =
        change.fullDocument ||
        (change.documentKey &&
          await Entry.findById(change.documentKey._id).lean());

      if (!entry) return;

      const { user_id, date, quantity, cost } = entry;
      const month = getMonth(date);

      // Recalculate safely for the month
      await rebuildMonthlyDashboard(user_id, month);
    } catch (err) {
      console.error("Dashboard worker error:", err);
    }
  });
}

export async function rebuildMonthlyDashboard(userId, month) {
  // 1️⃣ get all entries for that month
  const entries = await Entry.find({
    user_id: userId,
    date: { $regex: `^${month}` }
  }).lean();

  if (!entries.length) return;

  // 2️⃣ aggregate totals
  let totalML = 0;
  let totalCost = 0;

  const history = entries.map((e) => {
    totalML += e.quantity;
    totalCost += e.cost;

    return {
      date: e.date,
      quantity: e.quantity,
      price: e.cost
    };
  });

  // 3️⃣ upsert dashboard doc
  await Dashboard.findOneAndUpdate(
    { user_id: userId, month },
    {
      total_quantity: totalML,
      total_cost: totalCost,
      history
    },
    { upsert: true, new: true }
  );
}
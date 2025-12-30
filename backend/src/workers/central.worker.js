import Settings from "../models/settings.model.js";
import Entry from "../models/entry.model.js";
import { rebuildAllDashboardsForUser } from "./dashboard.rebuilder.js";
 
export function startDashboardWorker() {
  const changeStream = Entry.watch([], { fullDocument: "updateLookup" });

  changeStream.on("change", async (change) => {
    try {
      const entry =
        change.fullDocument ||
        (change.documentKey &&
          await Entry.findById(change.documentKey._id).lean());

      if (!entry) return;

      await rebuildAllDashboardsForUser(entry.user_id);
    } catch (err) {
      console.error("Dashboard worker error:", err);
    }
  });
}

export function startSettingsWorker() {
  const changeStream = Settings.watch([], { fullDocument: "updateLookup" });

  changeStream.on("change", async (change) => {
    try {
      const settings = change.fullDocument;
      if (!settings) return;

      await rebuildAllDashboardsForUser(settings.user_id);
    } catch (err) {
      console.error("Settings worker error:", err);
    }
  });
}
 
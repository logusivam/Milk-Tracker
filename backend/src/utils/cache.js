import NodeCache from "node-cache";

const cache = new NodeCache({
  stdTTL: 3600,       // default TTL: 1 hour
  checkperiod: 120,
  useClones: false   // IMPORTANT: avoid deep clone overhead
});

/* ==========================
   CACHE KEY HELPERS
========================== */

// Settings
export const settingsCacheKey = (userId) =>
  `settings:${userId}`;

// Single entry by date
export const entryCacheKey = (userId, date) =>
  `entry:${userId}:${date}`;

// Optional: month-level cache (future)
export const monthEntriesCacheKey = (userId, month) =>
  `entries:${userId}:${month}`;

/* ==========================
   EXPORT CACHE INSTANCE
========================== */
export default cache;

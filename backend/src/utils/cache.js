import NodeCache from "node-cache";

const cache = new NodeCache({
  stdTTL: 36,       // default TTL: 1 hour  // TODO: need to update to 3600 (in production)
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

// cache/dashboard.cache.js
export const dashboardCacheKey = (userId, month) =>
  `dashboard:${userId}:${month}`;

/* ==========================
   EXPORT CACHE INSTANCE
========================== */
export default cache;

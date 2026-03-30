import NodeCache from "node-cache";

const cache = new NodeCache({
  stdTTL: 3600,       // default TTL: 1 hour  
  checkperiod: 120,
  useClones: false   // IMPORTANT: avoid deep clone overhead
});

/* ==========================
   CACHE KEY HELPERS
========================== */

export const settingsCacheKey = (userId) => `settings:${userId}`;

export const entryCacheKey = (userId, date) => `entry:${userId}:${date}`;

export const monthEntriesCacheKey = (userId, month) => `entries:${userId}:${month}`;

export const dashboardCacheKey = (userId, monthOrDuration) => `dashboard:${userId}:${monthOrDuration}`;

export const historyCacheKey = (userId) => `history:${userId}`;

/* ==========================
   INVALIDATION HELPERS (NEW)
========================== */

// ✅ Helper to clear all dashboard-related caches for a specific user
export const invalidateUserDashboards = (userId) => {
  const allKeys = cache.keys();
  // Find all keys starting with this user's dashboard prefix
  const keysToDelete = allKeys.filter(key => key.startsWith(`dashboard:${userId}:`));
  
  if (keysToDelete.length > 0) {
    cache.del(keysToDelete);
    console.log(`[Cache] Invalidated ${keysToDelete.length} dashboard caches for user ${userId}`);
  }
};

// ✅ NEW: Helper to clear the specific history cache for a user
export const invalidateUserHistory = (userId) => {
  const key = historyCacheKey(userId);
  if (cache.has(key)) {
    cache.del(key);
    console.log(`[Cache] Invalidated history cache for user ${userId}`);
  }
};
/* ==========================
   EXPORT CACHE INSTANCE
========================== */
export default cache;

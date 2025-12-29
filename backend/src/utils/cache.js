import NodeCache from "node-cache";

const settingsCache = new NodeCache({
  stdTTL: 3600, // 1 hour
  checkperiod: 120
});

export default settingsCache;
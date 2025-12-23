// config.js
const isProd = window.location.protocol === 'https:';
 
export const API_BASE_URL = isProd ? 
        "" : 
        "http://localhost:5000";
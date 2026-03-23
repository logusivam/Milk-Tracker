// config.js
const isProd = window.location.protocol === 'https:';
 
export const API_BASE_URL = isProd ? 
        "https://milk-tracker-api.onrender.com" : //https://milk-tracker-be.onrender.com
        "http://localhost:5000";
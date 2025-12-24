import { API_BASE_URL } from "../../../utils/config.js";

const AUTH_API = `${API_BASE_URL}/api/v1/auth`;

let accessToken = null;

/* ==========================
   REFRESH ACCESS TOKEN
========================== */
async function refreshAccessToken() {
  const res = await fetch(`${AUTH_API}/refresh`, {
    method: "POST",
    credentials: "include" // send httpOnly cookie
  });

  if (!res.ok) {
    accessToken = null;
    return null;
  } 

  const data = await res.json();
  accessToken = data.accessToken;
  return accessToken;
}

/* ==========================
   VERIFY USER SESSION
========================== */
export async function verifyAuth() {
  try {
    // Attempt silent refresh
    const token = await refreshAccessToken();

    if (!token) {
      window.location.replace("loginregister.html");
      return;
    }

    // Optional: verify token with backend protected route
    const res = await fetch(`${AUTH_API}/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      credentials: "include"
    });

    if (!res.ok) {
      window.location.replace("loginregister.html");
    }
  } catch {
    window.location.replace("loginregister.html");
  }
}

/* ==========================
   AUTH FETCH WRAPPER
========================== */
export async function authFetch(url, options = {}) {
  if (!accessToken) {
    await refreshAccessToken();
  }

  options.headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${accessToken}`
  };

  options.credentials = "include";

  let res = await fetch(url, options);

  // If token expired, refresh & retry once
  if (res.status === 401) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      window.location.replace("loginregister.html");
      return;
    }

    options.headers.Authorization = `Bearer ${accessToken}`;
    res = await fetch(url, options);
  }

  return res;
}

export async function logout() {
  try {
    await fetch(`${AUTH_API}/logout`, {
      method: "POST",
      credentials: "include"
    });
  } catch (e) {
    // ignore errors
  } finally {
    window.location.replace("loginregister.html");
  }
}

// Attach logout handler if present on page
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("logoutBtn");
  if (btn) {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  }
});
verifyAuth(); 
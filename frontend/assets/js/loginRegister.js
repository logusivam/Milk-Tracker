import { API_BASE_URL } from "../../utils/config.js";

const API_URL = `${API_BASE_URL}/api/v1/auth`;

const loginForm = document.querySelector(".login-form form");
const signupForm = document.querySelector(".signup-form form");

// 🔐 In-memory access token (lost on refresh – by design)
//let accessToken = null;

/* ======================
   LOGIN
====================== */
loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = loginForm.querySelector('input[type="text"]').value;
  const password = loginForm.querySelector('input[type="password"]').value;

  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // ✅ REQUIRED for httpOnly cookie
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Login failed");
      return;
    }

    // ✅ Store access token ONLY in memory
    //accessToken = data.accessToken;

    window.location.href = "index.html";
  } catch {
    alert("Network error. Please try again.");
  }
});

/* ======================
   REGISTER
====================== */
signupForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = signupForm.querySelector('input[type="text"]').value;
  const email = signupForm.querySelectorAll('input[type="text"]')[1].value;
  const password = signupForm.querySelector('input[type="password"]').value;

  try {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Registration failed");
      return;
    }

    alert("Registration successful. Please login.");
    document.getElementById("flip").checked = false;
  } catch {
    alert("Network error. Please try again.");
  }
});

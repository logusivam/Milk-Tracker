import { API_BASE_URL } from "../../utils/config.js";

const API_URL = `${API_BASE_URL}/api/v1/auth`;

const loginForm = document.querySelector(".login-form form");
const signupForm = document.querySelector(".signup-form form");

loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = loginForm.querySelector('input[type="text"]').value;
  const password = loginForm.querySelector('input[type="password"]').value;

  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (res.ok) {
    localStorage.setItem("token", data.token);
    window.location.href = "index.html";
  } else {
    alert(data.message);
  }
});

signupForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = signupForm.querySelector('input[type="text"]').value;
  const email = signupForm.querySelectorAll('input[type="text"]')[1].value;
  const password = signupForm.querySelector('input[type="password"]').value;

  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password })
  });

  const data = await res.json();

  if (res.ok) {
    alert("Registration successful. Please login.");
    document.getElementById("flip").checked = false;
  } else {
    alert(data.message);
  }
});

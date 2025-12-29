import { API_BASE_URL } from "../../utils/config.js";
import { authFetch } from "./auth/auth-guard.js";

const priceInput = document.getElementById("priceInput");
const milkValueInput = document.getElementById("milkValue");
const milkUnitSelect = document.getElementById("milkUnit");

const API_URL = `${API_BASE_URL}/api/v1/settings`;

const fetchSettings = async () => {
  const res = await authFetch(`${API_URL}/get`, {
    method: "GET"
  });

  if (!res || !res.ok) return;

  const data = await res.json();
  priceInput.value = `Rs. ${data.price_per_litre}`;
  milkValueInput.value = data.default_milk_value;
};

const saveSettings = async () => {
  const price = parseFloat(priceInput.value.replace("Rs.", "").trim());
  const milkValue = parseInt(milkValueInput.value, 10);

  await authFetch(`${API_URL}/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      price_per_litre: price,
      default_milk_value: milkValue
    })
  });
};

priceInput.addEventListener("blur", saveSettings);
milkValueInput.addEventListener("blur", saveSettings);
milkUnitSelect.addEventListener("change", saveSettings);

fetchSettings();

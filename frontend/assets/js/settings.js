import { API_BASE_URL } from "../../utils/config.js";
import { authFetch } from "./auth/auth-guard.js";

// DOM elements
const priceInput = document.getElementById("priceInput");
const milkValueInput = document.getElementById("milkValue");
const milkUnitSelect = document.getElementById("milkUnit");
const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");
const saveBtn = document.getElementById("saveSettingsBtn");

// initial state snapshot
let initialState = {};

// set initial state for change detection for save button
const setInitialState = (data) => {
  initialState = {
    price: priceInput.value,
    milkValue: milkValueInput.value,
    milkUnit: milkUnitSelect.value,
    startDate: startDateInput.value,
    endDate: endDateInput.value
  };
};

// check if there are changes
const hasChanges = () => {
  return (
    priceInput.value !== initialState.price ||
    milkValueInput.value !== initialState.milkValue ||
    milkUnitSelect.value !== initialState.milkUnit ||
    startDateInput.value !== initialState.startDate ||
    endDateInput.value !== initialState.endDate
  );
};

// enable/disable save button based on changes
const toggleSaveButton = () => {
  saveBtn.disabled = !hasChanges();
  saveBtn.style.cursor = "pointer";
  saveBtn.style.backgroundColor = "black";
};

const API_URL = `${API_BASE_URL}/api/v1/settings`;

const fetchSettings = async () => {
  const res = await authFetch(`${API_URL}/get`, {
    method: "GET"
  });

  if (!res || !res.ok) return;

  const data = await res.json();
  priceInput.value = `Rs. ${data.price_per_litre}`;
  milkValueInput.value = data.default_milk_value;
  
  // load latest duration
  if (data.duration?.length) {
    const latest = data.duration[data.duration.length - 1];
    startDateInput.value = latest.start_date;
    endDateInput.value = latest.end_date;
  }

  // set initial state for change detection for save button
  setInitialState();
  saveBtn.disabled = true;
  saveBtn.style.cursor = "not-allowed";
  saveBtn.style.backgroundColor = "#888";
  saveBtn.style.color = "#000000ff";
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

const saveDuration = async () => {
  if (!startDateInput.value || !endDateInput.value) return;

  await authFetch(`${API_URL}/save-duration`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      start_date: startDateInput.value,
      end_date: endDateInput.value
    })
  });
};

// handle save click
const handleSaveClick = async () => {
  saveBtn.disabled = true;
  saveBtn.style.cursor = "not-allowed";
  saveBtn.style.backgroundColor = "#888";
  saveBtn.style.color = "#000000ff";

  await saveSettings();
  await saveDuration();

  setInitialState();
};

// change detection
[
  priceInput,
  milkValueInput,
  milkUnitSelect,
  startDateInput,
  endDateInput
].forEach((el) => {
  el.addEventListener("input", toggleSaveButton);
  el.addEventListener("change", toggleSaveButton);
});

// button click
saveBtn.addEventListener("click", handleSaveClick);

// existing autosave listeners remain untouched 

fetchSettings();

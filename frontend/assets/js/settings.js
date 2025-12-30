import { API_BASE_URL } from "../../utils/config.js";
import { authFetch } from "./auth/auth-guard.js";

// DOM elements
const priceInput = document.getElementById("priceInput");
const milkValueInput = document.getElementById("milkValue");
const milkUnitSelect = document.getElementById("milkUnit");
const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");
const saveBtn = document.getElementById("saveSettingsBtn");

// ongoing message for end date
const ongoingMsg = document.createElement("p");
ongoingMsg.textContent = "ongoing.......";
ongoingMsg.className = "text-yellow-400 text-xs mt-1 text-right hidden";

const endDateWrapper = document.getElementById("endDateWrapper");
endDateWrapper.appendChild(ongoingMsg);

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

// granular change checks
const settingsChanged = () =>
  priceInput.value !== initialState.price ||
  milkValueInput.value !== initialState.milkValue ||
  milkUnitSelect.value !== initialState.milkUnit;

const durationChanged = () =>
  startDateInput.value !== initialState.startDate ||
  endDateInput.value !== initialState.endDate;
 
// overall change detection
const hasChanges = () => settingsChanged() || durationChanged();

// enable/disable save button
const toggleSaveButton = () => {
  const changed = hasChanges();
  saveBtn.disabled = !changed;
  saveBtn.style.cursor = changed ? "pointer" : "not-allowed";
  saveBtn.style.backgroundColor = changed ? "black" : "#888";
  saveBtn.style.color = changed ? "#ffffff" : "#000000ff";
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
    startDateInput.value = latest.start_date || "";
    endDateInput.value = latest.end_date || "";

    // show ongoing message if end_date is empty
    if (!latest.end_date) {
      ongoingMsg.classList.remove("hidden");
    } else {
      ongoingMsg.classList.add("hidden");
    }
  }

  // set initial state for change detection for save button
  setInitialState();
  toggleSaveButton();
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
  if (!startDateInput.value) return;

  ongoingMsg.classList.add("hidden");

  await authFetch(`${API_URL}/save-duration`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      start_date: startDateInput.value,
      end_date: endDateInput.value || null
    })
  });

  // show ongoing message if end date is empty
  if (!endDateInput.value) {
    ongoingMsg.classList.remove("hidden");
  }
};

// handle save click
const handleSaveClick = async () => {
  saveBtn.disabled = true;
  saveBtn.style.cursor = "not-allowed";
  saveBtn.style.backgroundColor = "#888";
  saveBtn.style.color = "#000000ff";

  if (settingsChanged()) {
    await saveSettings();
  }

  if (durationChanged()) {
    await saveDuration();
  }

  setInitialState();
  toggleSaveButton();
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

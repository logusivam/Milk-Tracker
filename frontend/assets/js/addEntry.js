import { API_BASE_URL } from "../../utils/config.js";
import { authFetch } from "./auth/auth-guard.js";
import { showToast } from "./utils/toast.js";

/* ==========================
   DOM ELEMENTS (SAFE)
========================== */
const qtyInput = document.getElementById("quantityInput");
const unitSelect = document.getElementById("unitSelect");
const costInput = document.getElementById("costInput");
const defaultToggle = document.getElementById("defaultToggle");
const defaultLabel = document.getElementById("defaultMilkLabel");
const saveBtn = document.getElementById("saveEntryBtn");
const backBtn = document.getElementById("back-btn");

/* ==========================
   API
========================== */
const API_ENTRY = `${API_BASE_URL}/api/v1/entry`;
const API_SETTINGS = `${API_BASE_URL}/api/v1/settings`;

const params = new URLSearchParams(window.location.search);
const date = params.get("date");

let pricePerLitre = 0;
let defaultMilkML = 0;

/* ==========================
   LOAD SETTINGS
========================== */
async function loadSettings() {
  const res = await authFetch(`${API_SETTINGS}/get`);
  if (!res || !res.ok) return;

  const { data: data } = await res.json();
  pricePerLitre = data.price_per_litre;
  defaultMilkML = data.default_milk_value;

  // show the default milk value
  const defaultText = `${defaultMilkML / 1000}`;
  defaultLabel.textContent = defaultText < 1000 ?
    `${defaultMilkML} ML` :
    `${defaultText} Litres`;
}

/* ==========================
   LOAD EXISTING ENTRY (NEW)
========================== */
async function loadExistingEntry() {
  if (!date) return;

  try {
    const res = await authFetch(`${API_ENTRY}/get?date=${date}`);

    // Entry does not exist (valid case)
    if (res.status === 404) {
      showToast("No entry found for this date");
      return;
    }

    if (!res.ok) {
      showToast("Failed to load entry");
      return;
    }

    if (res.ok) {
      showToast("Loaded existing entry for this date");
    }

    const {data: entry} = await res.json();

    qtyInput.value = entry.quantity;
    unitSelect.value = "ml";
    calculateCost();
  } catch (err) {
    //console.error(err);
    showToast("Network error while loading entry");
  }
}

/* ==========================
   COST CALCULATION
========================== */
function calculateCost() {
  const qty = parseFloat(qtyInput.value);
  if (!qty || !pricePerLitre) {
    costInput.value = "";
    return;
  }

  const quantityML =
    unitSelect.value === "litres" ? qty * 1000 : qty;

  const cost = (quantityML / 1000) * pricePerLitre;
  costInput.value = cost.toFixed(2);
}

/* ==========================
   DEFAULT TOGGLE
========================== */
defaultToggle.addEventListener("change", () => {
  if (!defaultToggle.checked) return;

  qtyInput.value = defaultMilkML;
  unitSelect.value = "ml";
  defaultLabel.textContent = `${defaultMilkML} ML`;
  calculateCost();
});

/* ==========================
   EVENTS
========================== */
qtyInput.addEventListener("input", calculateCost);
unitSelect.addEventListener("change", calculateCost);

saveBtn.addEventListener("click", async () => {
  const qty = parseFloat(qtyInput.value);
  
  if (!qty) {
    showToast("Please enter a valid quantity.");
    return;
  }

  const quantityML =
    unitSelect.value === "litres" ? qty * 1000 : qty;

  await authFetch(`${API_ENTRY}/save?date=${date}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity_ml: quantityML })
  });

  window.location.href = "index.html";
});

backBtn.addEventListener("click", () => {
  window.location.href = "index.html";
});

/* ==========================
   INIT
========================== */
(async () => {
  await loadSettings();
  await loadExistingEntry();
})();
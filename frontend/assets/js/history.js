import { API_BASE_URL } from "../../utils/config.js";
import { authFetch } from "./auth/auth-guard.js";

const API_HISTORY = `${API_BASE_URL}/api/v1/history/get`;

/* DOM */
const dropdown = document.getElementById("durationSelect");
const totalLitresEl = document.getElementById("totalLitres");
const totalCostEl = document.getElementById("totalCost");
const dailyList = document.getElementById("dailyBreakdown");

/* utils */
function formatLitres(ml) {
  return `${(ml / 1000).toFixed(3)} L`;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

/* render */
function renderHistory(doc) {
  totalLitresEl.textContent = formatLitres(doc.overall_quantity);
  totalCostEl.textContent = `₹ ${doc.overall_cost.toFixed(2)}`;

  dailyList.innerHTML = "";

  doc.history
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .forEach((h) => {
    const row = document.createElement("div");
    row.className =
      "flex items-center gap-4 bg-[#1a1a1a] px-4 min-h-[72px] py-2 justify-between";

    row.innerHTML = `
      <div class="flex flex-col justify-center">
        <p class="text-white text-base font-medium">${formatDate(h.date)}</p>
        <p class="text-[#adadad] text-sm">${formatLitres(h.quantity)}</p>
      </div>
      <div class="shrink-0">
        <p class="text-white text-base">₹ ${h.price.toFixed(2)}</p>
      </div>
    `;

    dailyList.appendChild(row);
  });
}

/* load */
async function loadHistory() {
  const res = await authFetch(API_HISTORY);
  if (!res.ok) return;

  const histories = await res.json();
  if (!histories.length) return;

  dropdown.innerHTML = "";

  histories.forEach((h, index) => {
    const opt = document.createElement("option");
    opt.value = index;
    opt.textContent = `${h.start_date} → ${h.end_date || "Present"}`;
    dropdown.appendChild(opt);
  });

  renderHistory(histories[0]);

  dropdown.addEventListener("change", (e) => {
    renderHistory(histories[e.target.value]);
  });
}

loadHistory();

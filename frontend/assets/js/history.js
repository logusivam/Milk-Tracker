import { API_BASE_URL } from "../../utils/config.js";
import { authFetch } from "./auth/auth-guard.js";

const API_HISTORY = `${API_BASE_URL}/api/v1/history/get`;

/* DOM */
const dropdown = document.getElementById("durationSelect");
const totalLitresEl = document.getElementById("totalLitres");
const totalCostEl = document.getElementById("totalCost");
const dailyList = document.getElementById("dailyBreakdown");
const graphEl = document.getElementById("dailyConsumptionGraph");

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
  // 🔥 graph render
  renderDailyConsumptionGraph(doc);
}

/* load */
async function loadHistory() {
  const res = await authFetch(API_HISTORY);
  if (!res.ok) return;

  const { data: histories } = await res.json();
  if (!histories || !histories.length) return;

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

// global tooltip for graph
const graphTooltip = document.createElement("div");
graphTooltip.className =
  "fixed hidden pointer-events-none z-[9999] rounded bg-black px-2 py-1 text-xs text-white shadow-lg";
document.body.appendChild(graphTooltip);

// Daily consumption graph render
function renderDailyConsumptionGraph(historyDoc) {
  graphEl.innerHTML = "";

  if (!historyDoc.history || !historyDoc.history.length) return;

  const days = [...historyDoc.history].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const maxQty = Math.max(...days.map(d => d.quantity));

  days.forEach((day) => {
    const heightPercent = maxQty
      ? Math.max((day.quantity / maxQty) * 100, 4)
      : 0;

    /* BAR WRAPPER */
    const wrapper = document.createElement("div");
    wrapper.className =
      "flex flex-col items-center justify-end h-full w-full";

    /* BAR */
    const bar = document.createElement("div");
    bar.className =
      "border-[#adadad] bg-[#363636] border-t-2 w-full rounded-sm cursor-pointer";
    bar.style.height = `${heightPercent}%`;

    /* LABEL */
    const label = document.createElement("p");
    label.className =
      "text-[#adadad] text-[12px] font-bold leading-normal mt-2";
    label.textContent = new Date(day.date).getDate();

    /* milk quantity display */
    const milkDisplay = `${(day.quantity / 1000).toFixed(2)} L`;

    /* TOOLTIP EVENTS */
    bar.addEventListener("mouseenter", () => {
      graphTooltip.textContent =
        `${formatDate(day.date)} • ${day.quantity < 1000 ? `${day.quantity} ml` : milkDisplay}`;
      graphTooltip.style.display = "block";
    });

    bar.addEventListener("mousemove", (e) => {
      graphTooltip.style.left = `${e.clientX + 10}px`;
      graphTooltip.style.top = `${e.clientY - 30}px`;
    });

    bar.addEventListener("mouseleave", () => {
      graphTooltip.style.display = "none";
    });

    wrapper.appendChild(bar);
    graphEl.appendChild(wrapper);
    graphEl.appendChild(label);
  });
}

loadHistory();

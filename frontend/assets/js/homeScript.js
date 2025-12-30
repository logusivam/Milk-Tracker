// assets/js/homeScript.js
import { API_BASE_URL } from "../../utils/config.js";
import { authFetch } from "./auth/auth-guard.js";

const API_URL = `${API_BASE_URL}/api/v1/dashboard/get-data`;

const totalLitresCard = document.querySelector(
  "#totalLitresCard p:nth-child(2)"
);
const totalCostCard = document.querySelector(
  "#totalCostCard p:nth-child(2)"
);

const historyTemplate = document.querySelector('[id="purchase-history"]');


// helper
const mlToLitres = (ml) => (ml / 1000).toFixed(3);

// clear existing static HTML rows
const clearHistory = () => {
  document.querySelectorAll(".dynamic-history-row").forEach((el) => el.remove());
};


const renderHistoryItem = ({ date, quantity, price }) => {
  const wrapper = document.createElement("div");
  wrapper.className =
    "dynamic-history-row flex items-center gap-4 bg-[#1a1a1a] px-4 min-h-[72px] py-2 justify-between";

  wrapper.innerHTML = `
    <div class="flex flex-col justify-center">
      <p class="text-white text-base font-medium leading-normal line-clamp-1">
        ${new Date(date).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric"
        })}
      </p>
      <p class="text-[#adadad] text-sm font-normal leading-normal line-clamp-2">
        ${mlToLitres(quantity)} L
      </p>
    </div>
    <div class="shrink-0">
      <p class="text-white text-base font-normal leading-normal">
        ₹ ${price.toFixed(2)}
      </p>
    </div>
  `;

  return wrapper;
};

const loadDashboard = async (date = new Date()) => {
  try {
    const month = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    const res = await authFetch(`${API_URL}?month=${month}`);

    if (!res.ok) throw new Error("Dashboard fetch failed");

    const { data } = await res.json();

    // totals cards
    const totalQty = Number(data?.total_quantity || 0);
    const totalCost = Number(data?.total_cost || 0);

    totalLitresCard.textContent = `${mlToLitres(totalQty)} L`;
    totalCostCard.textContent = `₹ ${totalCost.toFixed(2)}`;

    // history
    clearHistory();

    // ❌ duration-blocked month → stop here
    if (!data.history || data.history.length === 0) {
      return;
    }

    let lastNode = historyTemplate;

    data.history
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .forEach((item) => {
        const node = renderHistoryItem(item);
        lastNode.after(node);
        lastNode = node;
      });
  } catch (err) {
    console.error(err);
  }
};


/* ==========================
   CALENDAR LOGIC (UNCHANGED)
========================== */

const monthLabel = document.getElementById("monthLabel");
const calendarGrid = document.getElementById("calendarGrid");
const prevBtn = document.getElementById("prevMonth");
const nextBtn = document.getElementById("nextMonth");

const ENTRY_API = `${API_BASE_URL}/api/v1/dashboard/month-entries`;

let currentDate = new Date();
let entryDates = new Set();

/* ==========================
   LOAD MONTH ENTRY DATES
========================== */
async function loadMonthEntries(date) {
  const month = `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;

  const res = await authFetch(`${ENTRY_API}?month=${month}`);
  if (!res.ok) return;

  const { dates } = await res.json();
  entryDates = new Set(dates);
  console.log("Loaded entry dates:", entryDates);
}

/* ==========================
   RENDER CALENDAR
========================== */
async function renderCalendar(date) {
  await loadMonthEntries(date);

  calendarGrid.innerHTML = `
    <p class="text-white text-[13px] font-bold flex h-12 items-center justify-center">S</p>
    <p class="text-white text-[13px] font-bold flex h-12 items-center justify-center">M</p>
    <p class="text-white text-[13px] font-bold flex h-12 items-center justify-center">T</p>
    <p class="text-white text-[13px] font-bold flex h-12 items-center justify-center">W</p>
    <p class="text-white text-[13px] font-bold flex h-12 items-center justify-center">T</p>
    <p class="text-white text-[13px] font-bold flex h-12 items-center justify-center">F</p>
    <p class="text-white text-[13px] font-bold flex h-12 items-center justify-center">S</p>
  `;

  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  monthLabel.textContent = date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  });

  for (let i = 0; i < firstDay; i++) {
    calendarGrid.innerHTML += `<div></div>`;
  }

  for (let day = 1; day <= daysInMonth; day++) {
   const selectedDate = `${year}-${String(month + 1).padStart(
  2,
  "0"
)}-${String(day).padStart(2, "0")}`;

const isToday =
  day === today.getDate() &&
  month === today.getMonth() &&
  year === today.getFullYear();

const hasEntry = entryDates.has(selectedDate);

// tick logic
let tick = `
  <span class="absolute bottom-1 right-1 text-yellow-400 text-xs">✓</span>
`;

if (hasEntry) {
  tick = `
    <span class="absolute bottom-1 right-1 text-green-500 text-xs">✓</span>
  `;
}

// today override
const bgClass = isToday ? "bg-black" : "";

calendarGrid.innerHTML += `
  <button
    class="relative h-12 w-full text-white text-sm font-medium leading-normal date-btn"
    data-date="${selectedDate}"
  >
    <div class="flex size-full items-center justify-center rounded-full ${bgClass}">
      ${day}
      ${tick}
    </div>
  </button>
`;

  }
}

/* ==========================
   NAVIGATION
========================== */
function openAddEntry(date) {
  window.location.href = `addEntry.html?date=${date}`;
}

prevBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar(currentDate);
    loadDashboard(currentDate);
});

nextBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar(currentDate);
    loadDashboard(currentDate);
});

calendarGrid.addEventListener("click", (e) => {
  const btn = e.target.closest(".date-btn");
  if (!btn) return;
  openAddEntry(btn.dataset.date);
});

document.addEventListener("DOMContentLoaded", () => loadDashboard(currentDate));
renderCalendar(currentDate);

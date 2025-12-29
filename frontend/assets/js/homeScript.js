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
const mlToLitres = (ml) => (ml / 1000).toFixed(2);

// clear existing static HTML rows
const clearHistory = () => {
  document
    .querySelectorAll('[id="purchase-history"]')
    .forEach((el, index) => {
      if (index !== 0) el.remove();
    });
};


const renderHistoryItem = ({ date, quantity, price }) => {
  const wrapper = document.createElement("div");
  wrapper.className =
    "flex items-center gap-4 bg-[#1a1a1a] px-4 min-h-[72px] py-2 justify-between";

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

const loadDashboard = async () => {
  try {
    const res = await authFetch(API_URL);

    if (!res.ok) throw new Error("Dashboard fetch failed");

    const { data } = await res.json();

    // totals
    totalLitresCard.textContent = `${mlToLitres(
      data.total_quantity
    )} L`;

    totalCostCard.textContent = `₹ ${data.total_cost.toFixed(2)}`;

    // history
    clearHistory();

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

let currentDate = new Date();

function renderCalendar(date) {
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
    const isToday =
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear();

    const selectedDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    calendarGrid.innerHTML += `
      <button
        class="h-12 w-full text-white text-sm font-medium leading-normal date-btn"
        data-date="${selectedDate}"
      >
        <div class="flex size-full items-center justify-center rounded-full ${
          isToday ? "bg-black" : ""
        }">
          ${day}
        </div>
      </button>
    `;
  }
}

function openAddEntry(date) {
  window.location.href = `addEntry.html?date=${date}`;
}

prevBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar(currentDate);
});

nextBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar(currentDate);
});

renderCalendar(currentDate);

calendarGrid.addEventListener("click", (e) => {
  const btn = e.target.closest(".date-btn");
  if (!btn) return;

  const date = btn.dataset.date;
  openAddEntry(date);
});

document.addEventListener("DOMContentLoaded", loadDashboard);


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

    // Empty cells before first day
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
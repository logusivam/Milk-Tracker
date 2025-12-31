let toastEl = null;
let hideTimer = null;

function createToast() {
  toastEl = document.createElement("div");
  toastEl.className = `
    fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999]
    hidden rounded-lg bg-black px-4 py-2
    text-sm text-white shadow-lg
    transition-opacity duration-200
  `;
  document.body.appendChild(toastEl);
}

export function showToast(message, duration = 2000) {
  if (!toastEl) createToast();

  toastEl.textContent = message;
  toastEl.style.display = "block";
  toastEl.style.opacity = "1";

  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    toastEl.style.opacity = "0";
    setTimeout(() => {
      toastEl.style.display = "none";
    }, 200);
  }, duration);
}

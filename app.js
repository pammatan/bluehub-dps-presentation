const slides = [...document.querySelectorAll(".slide")];
const nav = document.getElementById("nav");
const bar = document.getElementById("bar");
const pageTitle = document.getElementById("pageTitle");
const pageNum = document.getElementById("pageNum");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const app = document.getElementById("app");
const sidebar = document.getElementById("sidebar");
const sidebarLogoToggle = document.getElementById("sidebarLogoToggle");
const sidebarOpenHint = document.getElementById("sidebarOpenHint");
const sidebarBackdrop = document.getElementById("sidebarBackdrop");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const fullscreenBtns = [fullscreenBtn].filter(Boolean);
const slidesEl = document.getElementById("slides");
const zoomInBtn = document.getElementById("zoomIn");
const zoomOutBtn = document.getElementById("zoomOut");
const zoomResetBtn = document.getElementById("zoomReset");
const zoomLabel = document.getElementById("zoomLabel");
const settingsMenu = document.getElementById("settingsMenu");
const settingsMenuBtn = document.getElementById("settingsMenuBtn");
const settingsMenuPanel = document.getElementById("settingsMenuPanel");

const mobileMq = window.matchMedia("(max-width: 980px)");
const ZOOM_LEVELS = [0.85, 0.9, 0.95, 1, 1.05, 1.1, 1.15, 1.2, 1.3, 1.4, 1.5];
const DEFAULT_ZOOM_INDEX = ZOOM_LEVELS.indexOf(1);

let index = 0;
let markTimer = null;
let zoomIndex = DEFAULT_ZOOM_INDEX;

slides.forEach((slide, i) => {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.innerHTML = `<em>${String(i + 1).padStart(2, "0")}</em><span>${slide.dataset.title}</span>`;
  btn.addEventListener("click", () => go(i));
  nav.appendChild(btn);

  slide.querySelectorAll(".card, .entity, .person, tbody tr, .note, .key").forEach((el, n) => {
    el.style.setProperty("--d", `${80 + n * 70}ms`);
  });
});

document.querySelectorAll(".mark").forEach((mark) => {
  mark.addEventListener("click", () => {
    mark.parentElement.querySelectorAll(".mark").forEach((x) => x.classList.remove("on"));
    mark.classList.add("on");
  });
});

function play(slide) {
  slide.classList.remove("play");
  void slide.offsetWidth;
  slide.classList.add("play");
}

function cycleMarks(on) {
  clearInterval(markTimer);
  markTimer = null;
  if (!on) return;
  const marks = [...document.querySelectorAll(".slide.is-on .mark")];
  if (!marks.length) return;
  let i = marks.findIndex((m) => m.classList.contains("on"));
  markTimer = setInterval(() => {
    marks.forEach((m) => m.classList.remove("on"));
    i = (i + 1) % marks.length;
    marks[i].classList.add("on");
  }, 1400);
}

function go(next) {
  index = Math.max(0, Math.min(slides.length - 1, next));
  slides.forEach((s, i) => {
    const on = i === index;
    s.classList.toggle("is-on", on);
    s.toggleAttribute("hidden", !on);
    s.setAttribute("aria-hidden", on ? "false" : "true");
  });
  [...nav.children].forEach((b, i) => b.classList.toggle("is-active", i === index));
  pageTitle.textContent = slides[index].dataset.title;
  pageNum.textContent = `${index + 1} / ${slides.length}`;
  bar.style.width = `${((index + 1) / slides.length) * 100}%`;
  prevBtn.disabled = index === 0;
  nextBtn.disabled = index === slides.length - 1;
  history.replaceState(null, "", `#${index + 1}`);
  slidesEl.scrollTop = 0;
  if (isMobileSidebar()) closeSidebar();
  play(slides[index]);
  cycleMarks(slides[index].dataset.fx === "wire");
}

function isMobileSidebar() {
  return mobileMq.matches;
}

function isSidebarOpen() {
  return isMobileSidebar() ? sidebar.classList.contains("open") : !app.classList.contains("is-sidebar-collapsed");
}

function syncSidebarUi() {
  const open = isSidebarOpen();
  const closeLabel = "คลิกเพื่อปิดเมนู";
  const openLabel = "คลิกเพื่อเปิดเมนู";

  if (sidebarLogoToggle) {
    sidebarLogoToggle.setAttribute("aria-expanded", open ? "true" : "false");
    sidebarLogoToggle.setAttribute("aria-label", open ? "ปิดเมนูด้านข้าง" : "เปิดเมนูด้านข้าง");
    sidebarLogoToggle.title = open ? closeLabel : openLabel;
  }
  if (sidebarOpenHint) {
    sidebarOpenHint.hidden = open;
    sidebarOpenHint.title = openLabel;
  }

  if (isMobileSidebar()) {
    sidebarBackdrop.classList.toggle("is-visible", sidebar.classList.contains("open"));
    sidebarBackdrop.hidden = !sidebar.classList.contains("open");
  } else {
    sidebarBackdrop.classList.remove("is-visible");
    sidebarBackdrop.hidden = true;
  }
}

function closeSidebar() {
  if (isMobileSidebar()) {
    sidebar.classList.remove("open");
  } else {
    app.classList.add("is-sidebar-collapsed");
  }
  syncSidebarUi();
}

function toggleSidebar() {
  if (isMobileSidebar()) {
    sidebar.classList.toggle("open");
  } else {
    app.classList.toggle("is-sidebar-collapsed");
  }
  syncSidebarUi();
}

function syncZoomUi() {
  const level = ZOOM_LEVELS[zoomIndex];
  slidesEl.style.setProperty("--slide-zoom", String(level));
  const pct = `${Math.round(level * 100)}%`;
  zoomLabel.textContent = pct;
  zoomInBtn.disabled = zoomIndex >= ZOOM_LEVELS.length - 1;
  zoomOutBtn.disabled = zoomIndex <= 0;
}

function setZoom(nextIndex) {
  zoomIndex = Math.max(0, Math.min(ZOOM_LEVELS.length - 1, nextIndex));
  syncZoomUi();
}

function zoomIn() {
  setZoom(zoomIndex + 1);
}

function zoomOut() {
  setZoom(zoomIndex - 1);
}

function resetZoom() {
  setZoom(DEFAULT_ZOOM_INDEX);
}

function syncFullscreenUi() {
  const on = Boolean(document.fullscreenElement);
  const label = on ? "ออกจากเต็มจอ" : "เต็มจอ";
  fullscreenBtns.forEach((btn) => {
    btn.setAttribute("aria-label", on ? "ออกจากโหมดเต็มจอ" : "ขยายเต็มจอ");
    btn.title = label;
    const text = btn.querySelector("[data-fs-label]");
    if (text) text.textContent = label;
    else btn.textContent = on ? "⛶ ออกจากเต็มจอ" : "⛶ เต็มจอ";
  });
}

async function toggleFullscreen() {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  } catch {
    /* บางเบราว์เซอร์ไม่อนุญาตเต็มจอจาก script */
  }
}

function isSettingsMenuOpen() {
  return settingsMenu?.classList.contains("is-open");
}

function setSettingsMenuOpen(open) {
  if (!settingsMenu || !settingsMenuBtn || !settingsMenuPanel) return;
  settingsMenu.classList.toggle("is-open", open);
  settingsMenuBtn.setAttribute("aria-expanded", open ? "true" : "false");
  settingsMenuPanel.hidden = !open;
}

function toggleSettingsMenu() {
  setSettingsMenuOpen(!isSettingsMenuOpen());
}

function closeSettingsMenu() {
  setSettingsMenuOpen(false);
}

prevBtn.addEventListener("click", () => go(index - 1));
nextBtn.addEventListener("click", () => go(index + 1));
sidebarLogoToggle?.addEventListener("click", toggleSidebar);
sidebarOpenHint?.addEventListener("click", toggleSidebar);
sidebarBackdrop.addEventListener("click", closeSidebar);
fullscreenBtns.forEach((btn) => btn.addEventListener("click", toggleFullscreen));
settingsMenuBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleSettingsMenu();
});
settingsMenuPanel?.addEventListener("click", (e) => e.stopPropagation());
document.addEventListener("click", () => {
  if (isSettingsMenuOpen()) closeSettingsMenu();
});
zoomInBtn?.addEventListener("click", zoomIn);
zoomOutBtn?.addEventListener("click", zoomOut);
zoomResetBtn?.addEventListener("click", resetZoom);
document.addEventListener("fullscreenchange", syncFullscreenUi);

document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && (e.key === "=" || e.key === "+" || e.key === "Add")) {
    e.preventDefault();
    zoomIn();
    return;
  }
  if ((e.ctrlKey || e.metaKey) && (e.key === "-" || e.key === "_" || e.key === "Subtract")) {
    e.preventDefault();
    zoomOut();
    return;
  }
  if ((e.ctrlKey || e.metaKey) && e.key === "0") {
    e.preventDefault();
    resetZoom();
    return;
  }
  if (e.key === "f" || e.key === "F") {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    e.preventDefault();
    toggleFullscreen();
    return;
  }
  if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
    if (e.target.tagName === "BUTTON") return;
    e.preventDefault();
    go(index + 1);
  }
  if (e.key === "ArrowLeft" || e.key === "PageUp") {
    e.preventDefault();
    go(index - 1);
  }
  if (e.key === "Escape" && isSettingsMenuOpen()) {
    closeSettingsMenu();
    return;
  }
  if (e.key === "Escape" && isMobileSidebar() && sidebar.classList.contains("open")) {
    closeSidebar();
  }
});

mobileMq.addEventListener("change", () => {
  sidebar.classList.remove("open");
  syncSidebarUi();
});

function pageFromHash() {
  const n = Number((location.hash || "#1").slice(1));
  return Number.isFinite(n) ? n - 1 : 0;
}

window.addEventListener("hashchange", () => go(pageFromHash()));
closeSettingsMenu();
syncSidebarUi();
syncFullscreenUi();
syncZoomUi();
go(pageFromHash());

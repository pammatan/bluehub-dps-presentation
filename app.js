const slides = [...document.querySelectorAll(".slide")];
const nav = document.getElementById("nav");
const bar = document.getElementById("bar");
const pageTitle = document.getElementById("pageTitle");
const pageNum = document.getElementById("pageNum");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const sidebar = document.getElementById("sidebar");
const menuBtn = document.getElementById("menuBtn");

let index = 0;
let markTimer = null;

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
  const marks = [...document.querySelectorAll('.slide.is-on .mark')];
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
  document.getElementById("slides").scrollTop = 0;
  sidebar.classList.remove("open");
  play(slides[index]);
  cycleMarks(slides[index].dataset.fx === "wire");
}

prevBtn.addEventListener("click", () => go(index - 1));
nextBtn.addEventListener("click", () => go(index + 1));
menuBtn.addEventListener("click", () => sidebar.classList.toggle("open"));

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
    if (e.target.tagName === "BUTTON") return;
    e.preventDefault();
    go(index + 1);
  }
  if (e.key === "ArrowLeft" || e.key === "PageUp") {
    e.preventDefault();
    go(index - 1);
  }
});

function pageFromHash() {
  const n = Number((location.hash || "#1").slice(1));
  return Number.isFinite(n) ? n - 1 : 0;
}

window.addEventListener("hashchange", () => go(pageFromHash()));
go(pageFromHash());

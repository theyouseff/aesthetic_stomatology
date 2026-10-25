/* ---------- oldin / keyin ---------- (namunaviy 3D tasvirlar; haqiqiy bemor fotolari qo'yilganda faqat yo'llarni almashtiring) */
const BA_CASES = [
  { cap: "Professional oqartirish: tishlar rangining farqi.",
    before: "assets/ba-yellow.webp", after: "assets/ba-white.webp" },
  { cap: "Tishlarni tekislash: notekis tishlar to'g'rilangan holat.",
    before: "assets/ba-crooked.webp", after: "assets/ba-white.webp" },
  { cap: "Breketlar: notekis tishlarni tekislash jarayoni.",
    before: "assets/ba-crooked.webp", after: "assets/ba-braces.webp" },
];

const baBefore = document.getElementById("baBefore");
const baAfter = document.getElementById("baAfter");
const baWrap = document.getElementById("baBeforeWrap");
const baHandle = document.getElementById("baHandle");
const baRange = document.getElementById("baRange");
const baCap = document.getElementById("baCap");

function setCase(i) {
  baBefore.src = BA_CASES[i].before;
  baAfter.src = BA_CASES[i].after;
  baCap.textContent = BA_CASES[i].cap;
}
function setSlide(v) {
  baWrap.style.clipPath = `inset(0 ${100 - v}% 0 0)`;
  baHandle.style.left = v + "%";
}
baRange.addEventListener("input", (e) => setSlide(e.target.value));
document.querySelectorAll(".ba-tab").forEach((b) =>
  b.addEventListener("click", () => {
    document.querySelectorAll(".ba-tab").forEach((x) => x.classList.toggle("is-on", x === b));
    setCase(+b.dataset.case);
  })
);
setCase(0);
setSlide(50);

/* ---------- portfolio (namunaviy 3D tasvirlar; haqiqiy ishlar qo'yilganda BA_CASES yo'llarini almashtiring) ---------- */
const WORKS = [
  { t: "oqartirish", title: "Professional oqartirish", d: "Tishlar rangining farqi", c: 0 },
  { t: "tekislash", title: "Tishlarni tekislash", d: "Notekis tishlar to'g'rilangan holat", c: 1 },
  { t: "tekislash", title: "Breketlar", d: "Tekislash jarayoni", c: 2 },
];
const LABELS = { oqartirish: "Oqartirish", tekislash: "Tekislash" };
const workCard = (w) => {
  const c = BA_CASES[w.c];
  return `<article class="work reveal" data-t="${w.t}">
    <div class="work__img">
      <img src="${c.after}" alt="${w.title}: keyin" loading="lazy" decoding="async">
      <img src="${c.before}" alt="${w.title}: oldin" loading="lazy" decoding="async" style="clip-path:inset(0 50% 0 0)">
      <i class="work__line"></i>
    </div>
    <div class="work__body"><small>${LABELS[w.t]}</small>
      <h3>${w.title}</h3><p>${w.d}</p></div>
  </article>`;
};
const grid = document.getElementById("grid");
grid.innerHTML = WORKS.map(workCard).join("");
// "Natijalar" bo'limida ham xuddi shu kartalar ko'rsatiladi
const resultsGrid = document.getElementById("resultsGrid");
if (resultsGrid) resultsGrid.innerHTML = WORKS.map(workCard).join("");

document.querySelectorAll(".f").forEach((b) =>
  b.addEventListener("click", () => {
    document.querySelectorAll(".f").forEach((x) => x.classList.toggle("is-on", x === b));
    grid.querySelectorAll(".work").forEach((w) =>
      w.classList.toggle("is-hidden", b.dataset.f !== "all" && w.dataset.t !== b.dataset.f)
    );
  })
);

/* ---------- reveal + counters ---------- */
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in");
    const n = e.target.querySelector("[data-count]");
    if (n) count(n);
    io.unobserve(e.target);
  }),
  { threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

function count(el) {
  const end = +el.dataset.count, suf = el.dataset.suffix || "", t0 = performance.now(), dur = 1600;
  const tick = (t) => {
    const p = Math.min((t - t0) / dur, 1);
    el.textContent = Math.round(end * (1 - (1 - p) ** 3)).toLocaleString("ru-RU").replace(/ /g, " ") + suf;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ---------- menyu ---------- */
const burger = document.getElementById("burger");
const menu = document.getElementById("menu");
burger.addEventListener("click", () => {
  const open = menu.classList.toggle("open");
  burger.setAttribute("aria-expanded", open);
});
menu.addEventListener("click", (e) => {
  if (e.target.tagName === "A") {
    menu.classList.remove("open");
    burger.setAttribute("aria-expanded", false);
  }
});

/* ---------- yozilish tugmalari: [data-cta] bosilganda anketa oynasi lead.js orqali ochiladi ---------- */

// telefonda pastda doimiy "Qabulga yozilish" tugmasi (sahifa biroz aylantirilgach chiqadi)
const sticky = document.getElementById("stickyCta");
let overModel = false; // 3D bo'limi ko'ringanda tugma o'sha bo'limdagi "Og'izni ochish" tugmasini yopmasligi uchun yashiriladi
const toggleSticky = () => sticky.classList.toggle("show", scrollY > 600 && !overModel);
addEventListener("scroll", toggleSticky, { passive: true });
const stage3d = document.querySelector(".mv__stage");
if (stage3d) new IntersectionObserver((e) => { overModel = e[0].isIntersecting; toggleSticky(); }, { threshold: 0.2 }).observe(stage3d);
toggleSticky();

document.getElementById("yr").textContent = new Date().getFullYear();
